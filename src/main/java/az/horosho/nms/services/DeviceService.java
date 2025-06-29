package az.horosho.nms.services;

import az.horosho.nms.models.db.Device;
import az.horosho.nms.models.db.DeviceRepository;
import az.horosho.nms.models.dto.DeviceData;
import az.horosho.nms.models.dto.DeviceDetailedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final SnmpService snmpService;
    private final JSoupService jSoupService;

    public Mono<DeviceData> addDevice(DeviceData deviceData) {
        return calculateSubnetMask(deviceData.getIpAddress())
            .flatMap(strings -> checkDeviceReachability(strings[1])
                .flatMap(isReachable -> {
                    if (isReachable) {
                        return this.mapToDevice(deviceData, strings[0], strings[1])
                            .flatMap(deviceRepository::save)
                            .map(device -> {
                                deviceData.setId(device.getId());
                                return deviceData;
                            });
                    } else {
                        return Mono.error(new UnknownHostException("Device is not reachable!"));
                    }
                }
            )
        );
    }

    private Mono<String[]> calculateSubnetMask(String ipAddress){
        try {
            String[] ipParts = ipAddress.split("/");

            if (ipParts.length != 2) {
                return Mono.error(new IllegalArgumentException("Invalid IP address format"));
            }

            String ip = ipParts[0];
            short prefix = ipParts[1] != null ? Short.parseShort(ipParts[1]) : -1;

            if (prefix < 0 || prefix > 32) {
                return Mono.error(new IllegalArgumentException("Invalid prefix"));
            }

            int mask = 0xFFFFFFFF << (32 - prefix);
            int octet1 = (mask >> 24) & 0xFF;
            int octet2 = (mask >> 16) & 0xFF;
            int octet3 = (mask >> 8) & 0xFF;
            int octet4 = mask & 0xFF;

            return Mono.just(new String[]{
                String.format("%d.%d.%d.%d", (octet1), (octet2), (octet3), (octet4)), ip
            });
        } catch (NumberFormatException e) {
            return Mono.error(new RuntimeException(e));
        }
    }
    private Mono<Boolean> checkDeviceReachability(String ipAddress) {
        return Mono.fromCallable(() -> {
            InetAddress address = InetAddress.getByName(ipAddress);
            return address.isReachable(2000);
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
                    Mono<DeviceDetailedResponse> deviceDetailedResponse = snmpService.resolveSnmpRequest(deviceData.getIpAddress());

                    return Mono.zip(Mono.just(deviceData), deviceDetailedResponse)
                        .flatMap(tuple -> {
                            DeviceData device = tuple.getT1();
                            DeviceDetailedResponse snmp = tuple.getT2();

                            if (snmp.getModel() != null) {
                                //2) scrap image
                                return jSoupService.getImageSrcUrlByModelName(
                                        snmp.getModel() != null && !snmp.getModel().isBlank() ?
                                                snmp.getModel() : snmp.getSysDescr())
                                    .defaultIfEmpty("")
                                    .map(imgUrl -> {
                                        snmp.setImageUrl(imgUrl);
                                        copyBaseFields(device, snmp);
                                        return snmp;
                                    });
                            }

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
        return deviceData;
    }

    private Mono<Device> mapToDevice(DeviceData deviceData, String subnetMask, String ipAddress) {
        return Mono.just(Device.builder()
                .mask(subnetMask)
                .ipAddress(ipAddress)
                .name(deviceData.getName())
                .place(deviceData.getPlace())
                .type(deviceData.getType())
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
}
