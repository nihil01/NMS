package az.horosho.nms.services;

import az.horosho.nms.models.dto.DeviceDetailedResponse;
import az.horosho.nms.models.dto.DeviceNetworkInterfaces;
import az.horosho.nms.models.dto.VendorData;
import lombok.RequiredArgsConstructor;
import org.snmp4j.*;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.*;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import org.snmp4j.util.DefaultPDUFactory;
import org.snmp4j.util.TreeEvent;
import org.snmp4j.util.TreeUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class SnmpService implements ServicesUtility{

    @Value("${spring.snmp.community}")
    private String community;

    public HashMap<Integer, Map<String, String>> getVendorOidMapping() {
        HashMap<Integer, Map<String, String>> vendorOidMap = new HashMap<>();

        // Cisco
        vendorOidMap.put(9, Map.of(
                "cpu", "1.3.6.1.4.1.9.2.1.57.0",              // cpmCPUTotal5min
                "memory", "1.3.6.1.4.1.9.9.48.1.1.1.5.1",     // ciscoMemoryPoolUsed
                "temperature", "1.3.6.1.4.1.9.9.13.1.3.1.3.1" // ciscoEnvMonTemperatureStatusValue
        ));

        // Juniper
        vendorOidMap.put(2636, Map.of(
                "cpu", "1.3.6.1.4.1.2636.3.1.13.1.8.0",       // jnxOperatingCPU
                "memory", "1.3.6.1.4.1.2636.3.1.13.1.11.0",   // jnxOperatingDRAMUsed
                "temperature", "1.3.6.1.4.1.2636.3.1.13.1.17.0" // jnxOperatingTemp
        ));

        // Huawei
        vendorOidMap.put(2011, Map.of(
                "cpu", "1.3.6.1.4.1.2011.5.25.31.1.1.1.1.5.1",  // hwEntityCpuUsage
                "memory", "1.3.6.1.4.1.2011.5.25.31.1.1.1.1.6.1", // hwEntityMemoryUsage
                "temperature", "1.3.6.1.4.1.2011.5.25.32.1.2.1.1.8.1" // hwEntityTempValue
        ));

        // MikroTik
        vendorOidMap.put(14988, Map.of(
                "cpu", "1.3.6.1.4.1.14988.1.1.3.10.0",         // cpuUsage
                "memory", "1.3.6.1.4.1.14988.1.1.3.11.0",      // memoryUsed
                "temperature", "1.3.6.1.4.1.14988.1.1.3.12.0"  // boardTemperature
        ));

        // Aruba (HPE)
        vendorOidMap.put(14179, Map.of(
                "cpu", "1.3.6.1.4.1.14179.1.1.5.1.1.0",        // sysCPUUtil
                "memory", "1.3.6.1.4.1.14179.1.1.5.2.1.0",     // sysMemoryUtil
                "temperature", "1.3.6.1.4.1.14179.2.2.13.1.3.1" // temperatureSensorValue
        ));

        // HP ProCurve
        vendorOidMap.put(11, Map.of(
                "cpu", "1.3.6.1.4.1.11.2.14.11.1.4.1.1.6.0",   // hpSwitchCpuUsage
                "memory", "1.3.6.1.4.1.11.2.14.11.1.4.1.1.5.0",// hpSwitchMemoryUsage
                "temperature", "1.3.6.1.4.1.11.2.14.11.1.4.1.1.7.0" // hpSwitchTemperature
        ));

        // Fortinet (FortiGate)
        vendorOidMap.put(12356, Map.of(
                "cpu", "1.3.6.1.4.1.12356.101.4.1.3.0",        // fgSysCpuUsage
                "memory", "1.3.6.1.4.1.12356.101.4.1.4.0",     // fgSysMemUsage
                "temperature", "1.3.6.1.4.1.12356.101.4.1.5.0" // fgSysTemp
        ));

        // Ubiquiti
        vendorOidMap.put(41112, Map.of(
                "cpu", "1.3.6.1.4.1.41112.1.3.1.1.0",          // ubntCpuUsage
                "memory", "1.3.6.1.4.1.41112.1.3.1.2.0",       // ubntMemoryUsage
                "temperature", "1.3.6.1.4.1.41112.1.3.1.3.0"   // ubntTemperature
        ));

        return vendorOidMap;
    }

public Mono<DeviceDetailedResponse> resolveSnmpRequest(String ipAddress) {
        return Mono.defer(() -> {
            try {
                TransportMapping<UdpAddress> transport = new DefaultUdpTransportMapping();
                CommunityTarget<Address> target = createTarget(ipAddress);
                Snmp snmp = new Snmp(transport);
                transport.listen();

                PDU pdu = new PDU();
                pdu.add(new VariableBinding(new OID("1.3.6.1.2.1.1.5.0"))); // sysName
                pdu.add(new VariableBinding(new OID("1.3.6.1.2.1.1.1.0"))); // sysDescr
                pdu.add(new VariableBinding(new OID("1.3.6.1.2.1.1.3.0"))); // uptime
                pdu.add(new VariableBinding(new OID("1.3.6.1.2.1.1.2.0"))); // sysObjectID
                pdu.add(new VariableBinding(new OID("1.3.6.1.2.1.17.1.10"))); // macAddress
                pdu.setType(PDU.GET);

                Mono<DeviceDetailedResponse> detailedResponseMono = getDetailedResponseBase(snmp, pdu, target);
                Flux<DeviceNetworkInterfaces> deviceNetworkInterfacesFlux = getDeviceInterfacesData(snmp, target);
                Mono<VendorData> deviceVendorData = getDeviceVendorProprietaryData(snmp, target);

                return Mono.zip(
                    detailedResponseMono,
                    deviceNetworkInterfacesFlux.collectList().onErrorReturn(List.of()),
                    deviceVendorData.onErrorReturn(new VendorData())
                ).map(tuple -> {
                    DeviceDetailedResponse response = tuple.getT1();
                    response.setDeviceNetworkInterfaces(tuple.getT2());
                    response.setVendorData(tuple.getT3());
                    return response;
                }).onErrorResume(e -> detailedResponseMono)
                .doFinally(signalType -> {
                    try {
                        snmp.close();
                        transport.close();
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            } catch (IOException e) {
                return Mono.error(e);
            }
        });
    }

    public Mono<String> getVendorByInterfaceMac(String ipAddress) {
        return Mono.defer(() -> calculateSubnetMask(ipAddress).flatMap(subnetMask -> {

            if (subnetMask == null || subnetMask[1].isBlank()) {
                return Mono.error(new IllegalArgumentException("Invalid parameters!"));
            }

            try {
                TransportMapping<UdpAddress> transport = new DefaultUdpTransportMapping();
                Snmp snmp = new Snmp(transport);
                transport.listen();

                CommunityTarget<Address> target = createTarget(subnetMask[1]);
                System.out.println("target's ip is " + target.getAddress().toString());
                return this.getDeviceInterfacesData(snmp, target).collectList().flatMap(list -> {
                    System.out.println(list);
                    String MAC_ADDRESS = "";
                    for (DeviceNetworkInterfaces deviceNetworkInterfaces : list) {
                        if (deviceNetworkInterfaces.getMacAddress() != null && !deviceNetworkInterfaces.getMacAddress().isBlank()) {
                            System.out.println(deviceNetworkInterfaces.getMacAddress());
                            MAC_ADDRESS = deviceNetworkInterfaces.getMacAddress();
                            break;
                        }
                    }

                    System.out.println("mac address here is " + MAC_ADDRESS);

                    if (MAC_ADDRESS.isBlank()) {
                        return Mono.just("UNDEFINED_VENDOR");
                    }

                    WebClient client = WebClient.create();
                    return client.get()
                            .uri("https://macvendors.com/query/{mac}", MAC_ADDRESS.replaceAll(":", ""))
                            .retrieve()
                            .bodyToMono(String.class)
                            .timeout(Duration.ofSeconds(5))
                            .onErrorReturn("UNDEFINED_VENDOR");
                }).doFinally(signalType -> {
                    try {
                        snmp.close();
                        transport.close();
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            } catch (IOException e) {
                return Mono.error(new RuntimeException(e));
            }
        }));
    }

    public Mono<VendorData> getDeviceVendorProprietaryData(Snmp snmp, CommunityTarget<Address> target) {
        return Mono.fromCallable(() -> {
            try {
                PDU pdu = new PDU();
                pdu.add(new VariableBinding(new OID("1.3.6.1.2.1.1.2.0")));

                ResponseEvent<Address> response = snmp.get(pdu, target);

                if (response == null || response.getResponse() == null) {
                    throw new RuntimeException("No response for interface");
                }

                List<VariableBinding> bindings = response.getResponse().getAll();

                for (VariableBinding binding : bindings) {
                    String oid = binding.getOid().toString();
                    String value = binding.getVariable().toString();

                    System.out.println("[DEBUG] OID: " + oid + " = " + value);

                    // Extract vendor ID from enterprise OID
                    String[] oidParts = value.split("\\.");
                    if (oidParts.length < 7) {
                        throw new RuntimeException("Invalid vendor OID format");
                    }
                    String vendorIndex = oidParts[6]; // Get enterprise ID

                    if (vendorIndex.isEmpty()) {
                        throw new RuntimeException("Vendor data not found!");
                    }

                    int vendorId = Integer.parseInt(vendorIndex);
                    PDU vendorPDU = new PDU();
                    vendorPDU.addAll(getVendorOidMapping()
                            .get(vendorId).values().stream().map(OID::new).map(VariableBinding::new).toList());

                    ResponseEvent<Address> vendorResponse = snmp.get(vendorPDU, target);

                    if (vendorResponse == null || vendorResponse.getResponse() == null) {
                        throw new RuntimeException("Bad vendor data received!");
                    }

                    List<VariableBinding> variableBindings = vendorResponse.getResponse().getAll();
                    VendorData vendorData = new VendorData();

                    for (VariableBinding variableBinding : variableBindings) {
                        String oid2 = variableBinding.getOid().toString();
                        String value2 = variableBinding.getVariable().toString();

                        System.out.println("[DEBUGx2] OID: " + oid2 + " = " + value2);

                        getVendorOidMapping().get(vendorId).forEach((s, s2) -> {
                            if (s2.equals(oid2)) {
                                if (s.equals("cpu") && value2 != null && !value2.isBlank() && !value2.equals("noSuchInstance")) {
                                    vendorData.setCpuLoad(Double.parseDouble(value2));
                                } else if (s.equals("memory") && value2 != null && !value2.isBlank() && !value2.equals("noSuchInstance")) {
                                    vendorData.setMemoryUsed(Long.parseLong(value2));
                                } else if (s.equals("temperature") && value2 != null && !value2.isBlank() && !value2.equals("noSuchInstance")) {
                                    vendorData.setTemperature(Double.parseDouble(value2));
                                }
                            }
                        });
                    }
                    return vendorData;
                }
                return null;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
    public Flux<DeviceNetworkInterfaces> getDeviceInterfacesData(Snmp snmp, CommunityTarget<Address> target) {
        return Flux.<DeviceNetworkInterfaces, Integer>generate(() -> 1, (state,
                 sink) -> {
                try {
                    PDU pdu = new PDU();

                    System.out.println("Current counter status: " + state);

                    pdu.addAll(List.of(
                            new VariableBinding(new OID("1.3.6.1.2.1.2.2.1.2." + state)),
                            new VariableBinding(new OID("1.3.6.1.2.1.2.2.1.8." + state)),
                            new VariableBinding(new OID("1.3.6.1.2.1.2.2.1.10." + state)),
                            new VariableBinding(new OID("1.3.6.1.2.1.2.2.1.16." + state)),
                            new VariableBinding(new OID("1.3.6.1.2.1.2.2.1.6." + (state)))
                    ));

                    ResponseEvent<Address> response = snmp.get(pdu, target);

                    if (response == null) {
                        System.err.println("[WARN] No response for interface " + state);
                        sink.complete();
                        return state;
                    }

                    if (response.getResponse() == null) {
                        System.err.println("[WARN] Empty response for interface " + state);
                        sink.complete();
                        return state;
                    }

                    List<VariableBinding> bindings = response.getResponse().getAll();

                    boolean end = false;
                    DeviceNetworkInterfaces iface = new DeviceNetworkInterfaces();

                    for (VariableBinding binding : bindings) {
                        String oid = binding.getOid().toString();
                        String value = binding.getVariable().toString();

                        System.out.println("[DEBUG] OID: " + oid + " = " + value);

                        //if network interface is undefined -> break the loop
                        if (oid.startsWith("1.3.6.1.2.1.2.2.1.2.") && value.equalsIgnoreCase("noSuchInstance")){
                            end = true;
                            break;
                        }

                        if (oid.startsWith("1.3.6.1.2.1.2.2.1.2.")) {
                            iface.setName(value);
                        }
                        if (oid.startsWith("1.3.6.1.2.1.2.2.1.8.")) {
                            iface.setState("1".equals(value));
                        }
                        if (oid.startsWith("1.3.6.1.2.1.2.2.1.10.")) {
                            if (!value.equals("noSuchInstance")) {
                                iface.setIn(Long.parseLong(value));
                            }
                        }
                        if (oid.startsWith("1.3.6.1.2.1.2.2.1.16.")) {
                            if (!value.equals("noSuchInstance")) {
                                iface.setOut(Long.parseLong(value));
                            }
                        }
                        if (oid.startsWith("1.3.6.1.2.1.2.2.1.6.")){
                            if (!value.equals("noSuchInstance")) {
                                iface.setMacAddress(value);
                            }
                        }
                    }

                    if (iface.getName() == null) {
                        System.out.println("[INFO] No interface found for index " + state + ". Ending iteration.");
                        sink.complete();
                    } else if (end) {
                        System.out.println("[INFO] End of interfaces reached at index " + state);
                        System.out.println("DeviceNetworkInterface flux succeeded!");
                        sink.complete();
                    } else {
                        sink.next(iface);
                    }

                    return state + 1;

                } catch (Exception e) {
                    System.err.println("[ERROR] Failed to fetch interface " + state + ": " + e.getMessage());
                    sink.error(e);
                    return state;
                }


            }).subscribeOn(Schedulers.boundedElastic())
            .doOnError(e -> System.err.println("[ERROR] getDeviceInterfacesData failed: " + e.getMessage()));
    }

    public Mono<DeviceDetailedResponse> getDetailedResponseBase(Snmp snmp, PDU pdu, CommunityTarget<Address> target) {
        return Mono.fromCallable(() -> {
            try {
                ResponseEvent<Address> response = snmp.get(pdu, target);
                System.out.println(response.getResponse());

                if (response == null || response.getResponse() == null) {
                    System.err.println("[WARN] No SNMP response for base device info.");
                    return new DeviceDetailedResponse();
                }

                List<VariableBinding> bindings = response.getResponse().getAll();

                DeviceDetailedResponse.DeviceDetailedResponseBuilder device = DeviceDetailedResponse.builder();

                for (VariableBinding binding : bindings) {
                    String oid = binding.getOid().toString();
                    String value = binding.getVariable().toString();

                    System.out.println("[DEBUG] Base OID: " + oid + " = " + value);

                    if ("noSuchInstance".equals(value)) {
                        continue;
                    }

                    switch (oid) {
                        case "1.3.6.1.2.1.1.5.0" -> device.sysName(value);
                        case "1.3.6.1.2.1.1.1.0" -> device.sysDescr(value);
                        case "1.3.6.1.2.1.1.3.0" -> device.uptime(value);
                        case "1.3.6.1.2.1.1.2.0" -> device.sysObjectID(value);
                        case "1.3.6.1.2.1.17.1.10" -> device.macAddress(value);
                    }
                }


                System.out.println("DetailedResponse mono succeeded!");
                return device.build();
            } catch (Exception e) {
                System.err.println("[ERROR] getDetailedResponseBase failed: " + e.getMessage());
                throw new RuntimeException(e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }



    private CommunityTarget<Address> createTarget(String ipAddress) {
        String address = "udp:" + ipAddress + "/161";

        CommunityTarget<Address> target = new CommunityTarget<>();

        target.setCommunity(new OctetString(community));
        target.setAddress(GenericAddress.parse(address));
        target.setRetries(2);
        target.setTimeout(3000);
        target.setVersion(SnmpConstants.version2c);

        System.out.println("Target data");
        System.out.println(target.getAddress().toString());
        System.out.println(target.getCommunity());

        return target;
    }

        public Mono<Void> getAvailableOIDs(TransportMapping<?> transport, CommunityTarget<Address> target, String rootOid){

        return Mono.fromRunnable(() -> {

            Map<String, String> result = new TreeMap<>();
            System.out.println("Starting iterating through values !!");


            try(Snmp snmp = new Snmp(transport)){

                TreeUtils treeUtils = new TreeUtils(snmp, new DefaultPDUFactory());
                List<TreeEvent> events = treeUtils.getSubtree(target, new OID(rootOid));

                if (events == null || events.isEmpty()) {
                    System.out.println("Error: Unable to read table...");
                    return;
                }

                for(TreeEvent event: events){

                    if (event == null) {
                        continue;
                    }

                    if (event.isError()) {
                        System.out.println("Error: table OID [" + rootOid + "] " + event.getErrorMessage());
                        continue;
                    }

                    VariableBinding[] varBindings = event.getVariableBindings();
                    if (varBindings == null) {
                        continue;
                    }

                    for (VariableBinding varBinding : varBindings) {
                        if (varBinding == null) {
                            continue;
                        }

                        result.put("." + varBinding.getOid().toString(), varBinding.getVariable().toString());
                    }

                }

                System.out.println("RETRIEVE OIDs FROM NETWORK DEVICE!!");
                System.out.println(result);

            } catch (IOException e) {
                throw new RuntimeException(e);
            }

        });

    }

}
