package az.horosho.nms.services;

import az.horosho.nms.models.dto.DeviceDetailedResponse;
import az.horosho.nms.models.dto.DeviceNetworkInterfaces;
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
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class SnmpService {

    @Value("${spring.snmp.community}")
    private String community;


    public Mono<DeviceDetailedResponse> resolveSnmpRequest(String ipAddress) {
        return Mono.defer(() -> {
            try (TransportMapping<?> transport = new DefaultUdpTransportMapping();
                 Snmp snmp = new Snmp(transport)) {
                System.out.println(community);
                transport.listen();

                CommunityTarget<Address> target = createTarget(ipAddress);

                PDU pdu = new PDU();
                pdu.setType(PDU.GET);

//                this.getAvailableOIDs(transport, target, "1.3.6.1.2.1.1").subscribe();

                pdu.addAll(List.of(
                        new VariableBinding(new OID(".1.3.6.1.2.1.1.1.0")),
                        new VariableBinding(new OID(".1.3.6.1.2.1.1.5.0")),
                        new VariableBinding(new OID(".1.3.6.1.2.1.1.3.0")),
                        new VariableBinding(new OID(".1.3.6.1.2.1.1.2.0")),
                        new VariableBinding(new OID(".1.3.6.1.2.1.17.1.10"))
                ));

                System.out.println("[INFO] Starting SNMP request to " + ipAddress);

                return getDetailedResponseBase(snmp, pdu, target)
                    .flatMap(deviceResponse ->
                        getDeviceInterfacesData(snmp, target)
                            .collectList()
                            .map(interfaces -> {
                                deviceResponse.setDeviceNetworkInterfaces(interfaces);
                                System.out.println("[INFO] Successfully fetched data for " + ipAddress);
                                return deviceResponse;
                            })
                        );
            } catch (IOException e) {
                System.err.println("[ERROR] Transport or SNMP creation failed: " + e.getMessage());
                return Mono.error(e);
            }
            }).subscribeOn(Schedulers.boundedElastic())
            .doOnError(error -> System.err.println("[ERROR] resolveSnmpRequest failed: " + error.getMessage()));
    }


    public Flux<DeviceNetworkInterfaces> getDeviceInterfacesData(Snmp snmp, CommunityTarget<Address> target) {
        return Flux.<DeviceNetworkInterfaces, Integer>generate(() -> 1, (state, sink) -> {
                try {
                    PDU pdu = new PDU();

                    pdu.addAll(List.of(
                            new VariableBinding(new OID(".1.3.6.1.2.1.2.2.1.2." + state)),
                            new VariableBinding(new OID(".1.3.6.1.2.1.2.2.1.8." + state)),
                            new VariableBinding(new OID(".1.3.6.1.2.1.2.2.1.10." + state)),
                            new VariableBinding(new OID(".1.3.6.1.2.1.2.2.1.16." + state))
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

                        if ("noSuchInstance".equals(value)) {
                            end = true;
                            break;
                        }

                        if (oid.startsWith(".1.3.6.1.2.1.2.2.1.2.")) {
                            iface.setName(value);
                        }
                        if (oid.startsWith(".1.3.6.1.2.1.2.2.1.8.")) {
                            iface.setState("1".equals(value));
                        }
                        if (oid.startsWith(".1.3.6.1.2.1.2.2.1.10.")) {
                            iface.setIn(Long.parseLong(value));
                        }
                        if (oid.startsWith(".1.3.6.1.2.1.2.2.1.16.")) {
                            iface.setOut(Long.parseLong(value));
                        }
                    }

                    if (iface.getName() == null) {
                        System.out.println("[INFO] No interface found for index " + state + ". Ending iteration.");
                        sink.complete();
                    } else if (end) {
                        System.out.println("[INFO] End of interfaces reached at index " + state);
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
                        case ".1.3.6.1.2.1.1.5.0" -> device.sysName(value);
                        case ".1.3.6.1.2.1.1.1.0" -> device.sysDescr(value);
                        case ".1.3.6.1.2.1.1.3.0" -> device.uptime(value);
                        case ".1.3.6.1.2.1.1.2.0" -> device.sysObjectID(value);
                        case ".1.3.6.1.2.1.17.1.10" -> device.macAddress(value);
                    }
                }

                return device.build();
            } catch (Exception e) {
                System.err.println("[ERROR] getDetailedResponseBase failed: " + e.getMessage());
                throw new RuntimeException(e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }


    private CommunityTarget<Address> createTarget(String ipAddress) {
        CommunityTarget<Address> target = new CommunityTarget<>(
                GenericAddress.parse("udp:%s/161".formatted(ipAddress)),
                new OctetString(community)
        );

        target.setRetries(2);
        target.setTimeout(1500);
        target.setVersion(SnmpConstants.version2c);

        return target;
    }

//        public Mono<Void> getAvailableOIDs(TransportMapping<?> transport, CommunityTarget<Address> target, String rootOid){
//
//        return Mono.fromRunnable(() -> {
//
//            Map<String, String> result = new TreeMap<>();
//            System.out.println("Starting iterating through values !!");
//
//            boolean finished = false;
//            OID root = new OID(rootOid);
//
//            try(Snmp snmp = new Snmp(transport)){
//
//                TreeUtils treeUtils = new TreeUtils(snmp, new DefaultPDUFactory());
//                List<TreeEvent> events = treeUtils.getSubtree(target, new OID(rootOid));
//
//                if (events == null || events.isEmpty()) {
//                    System.out.println("Error: Unable to read table...");
//                    return;
//                }
//
//                for(TreeEvent event: events){
//
//                    if (event == null) {
//                        continue;
//                    }
//
//                    if (event.isError()) {
//                        System.out.println("Error: table OID [" + rootOid + "] " + event.getErrorMessage());
//                        continue;
//                    }
//
//                    VariableBinding[] varBindings = event.getVariableBindings();
//                    if (varBindings == null) {
//                        continue;
//                    }
//
//                    for (VariableBinding varBinding : varBindings) {
//                        if (varBinding == null) {
//                            continue;
//                        }
//
//                        result.put("." + varBinding.getOid().toString(), varBinding.getVariable().toString());
//                    }
//
//                }
//
//                System.out.println("RETRIEVE OIDs FROM NETWORK DEVICE!!");
//                System.out.println(result);
//
//            } catch (IOException e) {
//                throw new RuntimeException(e);
//            }
//
//        });
//
//    }

}
