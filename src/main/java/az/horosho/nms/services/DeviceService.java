package az.horosho.nms.services;

import az.horosho.nms.models.db.Device;
import az.horosho.nms.models.db.DeviceRepository;
import az.horosho.nms.models.dto.DeviceData;
import az.horosho.nms.models.dto.DeviceDetailedResponse;
import az.horosho.nms.models.dto.ansible.Group;
import az.horosho.nms.models.dto.ansible.Host;
import az.horosho.nms.models.dto.ansible.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;
import org.yaml.snakeyaml.nodes.Tag;
import org.yaml.snakeyaml.representer.Representer;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.UnknownHostException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DeviceService implements ServicesUtility{

    private final DeviceRepository deviceRepository;
    private final SnmpService snmpService;

    @Value("${spring.inventory_path}")
    private String inventoryPath;

    @Value("${spring.ansible.user}")
    private String ansibleUser;

    @Value("${spring.ansible.password}")
    private String ansiblePassword;

    @Value("${spring.inventory_log_path}")
    private String logPath;

    public Mono<?> addDevice(DeviceData deviceData) {
        String ip = deviceData.getIpAddress();

    return calculateSubnetMask(ip)
        .flatMap(subnet -> {
            String subnetMask = subnet[0];
            String gateway = subnet[1];

            return checkDeviceReachability(gateway)
                .filter(Boolean::booleanValue)
                .switchIfEmpty(Mono.error(new UnknownHostException("Device is not reachable!")))
                .then(deviceRepository.findByIpAddress(ip))
                .flatMap(existing -> Mono.error(new IllegalArgumentException("Device with this IP already exists")))
                .switchIfEmpty(
                    mapToDevice(deviceData, subnetMask, gateway)
                        .flatMap(saved -> {
                            deviceData.setId(saved.getId());
                            deviceData.setIpAddress(gateway);

                            return writeHostToInventoryFile(getHostForInventoryFile(deviceData))
                                .then(deviceRepository.save(saved))
                                .thenReturn(deviceData);
                        })

                );
        })
        .onErrorResume(e -> {
            System.err.println("[ERROR] addDevice failed: " + e.getMessage());
            return Mono.error(e);
        });
    }


    public Mono<Inventory> readInventoryFile() {
        return Mono.fromCallable(() -> {
            LoaderOptions options = new LoaderOptions();
            options.setAllowDuplicateKeys(false);
            Yaml yaml = new Yaml(new Constructor(Inventory.class, options));
            try (FileInputStream fis = new FileInputStream(inventoryPath)) {
                return yaml.load(fis);
            }
        });
    }

    public Mono<Void> writeHostToInventoryFile(Host host) {
        return readInventoryFile()
            .mapNotNull(inventory -> {
                System.out.println("Inventory read:");
                System.out.println(inventory);

                Map<String, Group> groupMap = inventory.getAll().getChildren();
                Group group = groupMap.getOrDefault(host.getType().toLowerCase(Locale.ROOT), null);

                if (group == null){
                    System.out.println("Group is null, create new ...");
                    Map<String, Host> newData = Map.of(host.getIpAddress(), host);
                    group = new Group(newData);
                    System.out.println("Group with new Data!");
                    System.out.println(group);

                    inventory.getAll().getChildren().put(host.getType(), group);
                } else {
                    System.out.println("Group already exists");
                    group.getHosts().put(host.getIpAddress(), host);
                }

                return inventory;
            })
            .flatMap(this::saveFile);
    }

    public Mono<Void> saveFile(Inventory inventory){
        return Mono.fromCallable(() -> {
            try (FileWriter writer = new FileWriter(inventoryPath)) {
                DumperOptions options = new DumperOptions();
                options.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
                options.setPrettyFlow(true);

                Representer representer = new Representer(options);
                representer.addClassTag(Inventory.class, Tag.MAP);

                Yaml yaml = new Yaml(representer, options);
                yaml.dump(inventory, writer);
                return null;
            }catch (IOException e){
                throw new RuntimeException(e);
            }
        });
    }


    private Host getHostForInventoryFile(DeviceData deviceData) throws IllegalArgumentException{

        String ansibleNetworkOs;

        if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("cisco")){
            ansibleNetworkOs = "ios";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("juniper")){
            ansibleNetworkOs = "junos";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("alcatel")){
            ansibleNetworkOs = "alcatel_aos";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("huawei")){
            ansibleNetworkOs = "huawei";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("mikrotik")){
            ansibleNetworkOs = "mikrotik";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("extreme")){
            ansibleNetworkOs = "extreme";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("palo")){
            ansibleNetworkOs = "paloalto";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("fortinet")){
            ansibleNetworkOs = "fortinet";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("dlink")){
            ansibleNetworkOs = "dlink";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("nokia")){
            ansibleNetworkOs = "nokia";
        }else if (deviceData.getVendor().toLowerCase(Locale.ROOT).contains("aruba")){
            ansibleNetworkOs = "aruba_os";
        } else {
            ansibleNetworkOs = "";
        }

        if (ansibleNetworkOs.isBlank()) throw new IllegalArgumentException("Bad model!");

        return Host.builder()
            .type(deviceData.getType())
            .location(deviceData.getPlace())
            .ipAddress(deviceData.getIpAddress())
            .ansible_connection("network_cli")
            .ansible_network_os(ansibleNetworkOs)
            .ansible_user(ansibleUser)
            .ansible_password(ansiblePassword)
            .build();
    }

    private Mono<Boolean> checkDeviceReachability(String ipAddress) {
        return Mono.fromCallable(() -> {
            InetAddress address = InetAddress.getByName(ipAddress);
            return address.isReachable(3000);
        }).subscribeOn(Schedulers.boundedElastic());
    }

    public Mono<String> checkDeviceConnectivity(String ipAddress, String checkType, Integer port){
        return Mono.fromCallable(() -> {
            if (checkType.equals("ping")){
                try{
                    int pingCount = 5;
                    InetAddress inetAddress = InetAddress.getByName(ipAddress);
                    int lost = 0, sent = 0;
                    StringBuilder builder = new StringBuilder();
                    builder.append("Pinging ").append(ipAddress).append(" with 32 bytes of data:\n");

                    while(pingCount > 0){
                        long currentTime = System.currentTimeMillis();
                        boolean isReachable = inetAddress.isReachable(2000);
                        if (isReachable){
                            builder.append("Reply from ").append(ipAddress)
                                    .append(":").append(" bytes=32").append(" time=")
                                    .append(System.currentTimeMillis() - currentTime).append("ms TTL=64\n");
                            sent ++;
                        }else{
                            builder.append("Destination host unreachable.\n");
                            lost ++;
                        }
                        pingCount --;
                    }

                    builder.append("\nPing statistics for ").append(ipAddress)
                            .append(":\n").append("Lost: ").append(lost).append(" Sent: ").append(sent);

                    System.out.println(builder);
                    return builder.toString();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }else {
                int segmentCount = 5;
                int timeout = 1500;

                StringBuilder sb = new StringBuilder();
                sb.append("Testing ").append(ipAddress).append(" with ").append("port ").append(port).append(" ")
                        .append(segmentCount).append(" TCP segments:\n");
                while (segmentCount > 0){
                    try(Socket socket = new Socket()){
                        long currentTime = System.currentTimeMillis();

                        socket.connect(new InetSocketAddress(ipAddress, port), timeout);
                        sb.append("TCP segment #").append(segmentCount).append(": ").append("OK | time=")
                                .append(System.currentTimeMillis() - currentTime).append("ms\n");

                    } catch (IOException e) {
                        sb.append("TCP segment #").append(segmentCount).append(": ").append("FAILED\n");
                    }

                    segmentCount --;
                }
                return sb.toString();
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    public Mono<List<DeviceData>> getDevices(Long id, Long page) {
        System.out.println(id + " " + page);
        if (id == null && page != null) {
            return this.getDevices(page.intValue() - 1)
                .map(this::mapEntityToDeviceData)
                .flatMap(deviceData -> this.checkDeviceReachability(deviceData.getIpAddress())
                .map(isReachable -> {
                    deviceData.setReachable(isReachable);
                    return deviceData;
                }))
                .collectList();

        } else if (id != null && page == null) {
            return deviceRepository.findById(id)
                .map(this::mapEntityToDeviceData)
                .flatMap(deviceData -> {
                    //1) retrieve device SNMPv2 data
                    Mono<DeviceDetailedResponse> deviceDetailedResponse = snmpService
                            .resolveSnmpRequest(deviceData.getIpAddress());

                    return Mono.zip(Mono.just(deviceData), deviceDetailedResponse)
                        .flatMap(tuple -> {
                            DeviceData device = tuple.getT1();
                            DeviceDetailedResponse snmp = tuple.getT2();

                            copyBaseFields(device, snmp);
                            return Mono.just(snmp);
                        });
                })
                .map(List::of);

        } else {
            return Mono.error(new IllegalArgumentException("Invalid parameters!"));
        }
    }

    private void copyBaseFields(DeviceData base, DeviceDetailedResponse detailed) {
        detailed.setId(base.getId());
        detailed.setName(base.getName());
        detailed.setType(base.getType());
        detailed.setIpAddress(base.getIpAddress());
        detailed.setPlace(base.getPlace());
    }

    private Flux<Device> getDevices(int page) {
        return deviceRepository.findAllBy(Sort.by(Sort.Direction.ASC, "id"))
            .skip((long)page * 10)
            .take(10);
    }

    private DeviceData mapEntityToDeviceData(Device device) {
        DeviceData deviceData = new DeviceData();
        deviceData.setId(device.getId());
        deviceData.setIpAddress(device.getIpAddress());
        deviceData.setName(device.getName());
        deviceData.setPlace(device.getPlace());
        deviceData.setType(device.getType());
        deviceData.setMask(device.getMask());
        deviceData.setVendor(device.getVendor());
        return deviceData;
    }

    private Mono<Device> mapToDevice(DeviceData deviceData, String subnetMask, String ipAddress) {
        return Mono.just(Device.builder()
            .mask(subnetMask)
            .ipAddress(ipAddress)
            .name(deviceData.getName())
            .place(deviceData.getPlace())
            .type(deviceData.getType())
            .vendor(deviceData.getVendor())
            .build());
    }

    public Mono<Map<String, Long>> getDevicesSize() {
        return deviceRepository.count()
            .map(count -> {
                Map<String, Long> data = new HashMap<>();
                data.put("size", count);
                return data;
        });
    }

    public Mono<?> deleteDevice(long id, String ipAddress, String type) {
        return deviceRepository.findById(id)
            .switchIfEmpty(Mono.error(new IllegalArgumentException("Device not found!")))
            .flatMap(deviceRepository::delete)
            .then(Mono.defer(() -> readInventoryFile()
                .flatMap(inventory -> {
                    if (inventory == null) {
                        return Mono.error(new IllegalArgumentException("Inventory not found!"));
                    }
                    System.out.println("Inventory itself:");
                    System.out.println(inventory);

                    Map<String, Group> groups = inventory.getAll().getChildren();
                    System.out.println("Readed groups:");
                    System.out.println(groups);
                    Group group = groups.get(type);

                    if (group == null || !group.getHosts().containsKey(ipAddress)) {
                        return Mono.error(new IllegalArgumentException("Device not found in inventory!"));
                    }

                    group.getHosts().remove(ipAddress);
                    return this.saveFile(inventory);
                })));
    }

    public Mono<List<String>> obtainAnsibleOutputLogFile(){
        return Mono.fromCallable(() -> {
            if (Files.exists(Path.of(logPath))){
                return Files.readAllLines(Path.of(logPath));
            }

            return Collections.<String>emptyList();


        }).subscribeOn(Schedulers.boundedElastic());
    }
}
