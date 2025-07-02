package az.horosho.nms.controllers;

import az.horosho.nms.models.dto.DeviceData;
import az.horosho.nms.services.ApplicationUptimeService;
import az.horosho.nms.services.BackupService;
import az.horosho.nms.services.DeviceService;
import az.horosho.nms.services.SnmpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/device")
public class DeviceController {

    private final DeviceService deviceService;
    private final ApplicationUptimeService applicationUptimeService;
    private final BackupService backupService;
    private final SnmpService snmpService;

        @PostMapping("/uploadDevice")
        Mono<ResponseEntity<Object>> upload(
            @RequestBody DeviceData deviceData
        ) {

            if (deviceData == null || deviceData.getIpAddress() == null || deviceData.getVendor() == null ||
                    deviceData.getPlace() == null || deviceData.getName() == null || deviceData.getType() == null ){
                return Mono.just(ResponseEntity.badRequest().build());
            }

            return deviceService.addDevice(deviceData)
                .map(device -> {
                    if (!(device instanceof DeviceData)) {
                        return ResponseEntity.badRequest().build();
                    }
                    return ResponseEntity.ok().body((Object)device);
                })
                .onErrorResume(error ->
                    Mono.just(ResponseEntity.badRequest().body(error.getMessage()))
                );

        }

        @GetMapping("/getDevices")
        Mono<ResponseEntity<?>> update(
                @RequestParam(required = false) Long id,
                @RequestParam(required = false) Long page
        ) {
            return deviceService.getDevices(id, page)
                .map(device -> {
                    if (device == null) {
                        return ResponseEntity.badRequest().build();
                    }
                    return ResponseEntity.ok().body(device);
                })
                .onErrorResume(error ->
                        Mono.just(ResponseEntity.badRequest().body(error.getMessage()))
                );

        }

        @DeleteMapping("/deleteDevice")
        Mono<?> deleteDevice(
                @RequestParam Long id,
                @RequestParam String ipAddress,
                @RequestParam String type
            ) {
            return deviceService.deleteDevice(id, ipAddress, type);
        }

        @GetMapping("/getDataSize")
        Mono<?> getDataSize() {
            return deviceService.getDevicesSize();
        };

        @GetMapping("/getUptimeSystem")
        Mono<?> getUptime() {
            return applicationUptimeService.getUptimeMillis();
        }

        @GetMapping("/checkDeviceConnectivity/{device}")
        Mono<String> checkDeviceConnectivity(
                @PathVariable String device,
                @RequestParam(required = false) String type, @RequestParam(required = false) Integer port
        ) {
            if (device == null || type == null) {
                return Mono.error(new IllegalArgumentException("Invalid parameters!"));
            }
            return deviceService.checkDeviceConnectivity(device, type, port);
        }

    @GetMapping("/proceedBackup")
        Mono<ResponseEntity<?>> proceedBackup(
                @RequestParam String ipAddress,
                @RequestParam String location
        ) {
            if (ipAddress == null || location == null) {
                return Mono.error(new IllegalArgumentException("Invalid parameters!"));
            }

            return backupService.downloadBackup(ipAddress, location)
                .handle((resource, sink) -> {

                    String fileName = "backup_" + LocalDateTime.now(ZoneId.systemDefault())
                            .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss")) + "_" +
                            resource.getFilename()  ;

                    HttpHeaders headers = new HttpHeaders();
                    headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
                    headers.add("Pragma", "no-cache");
                    headers.add("Expires", "0");
                    headers.add("Content-Disposition", "attachment; filename=" + fileName);

                    System.out.println("Resource awaiting: " + resource.getDescription());

                    try {
                        sink.next(ResponseEntity.ok()
                            .headers(headers)
                            .contentType(MediaType.APPLICATION_OCTET_STREAM)
                            .contentLength(resource.contentLength())
                            .body(resource));
                    } catch (IOException e) {
                        sink.error(new RuntimeException(e));
                    }
                });
        }

        @GetMapping("/getVendorByIp")
        Mono<String> getVendorByIP(@RequestParam String ip){
            if (ip == null || ip.isBlank()){
                return Mono.error(new IllegalArgumentException("Invalid parameters!"));
            }

            return snmpService.getVendorByInterfaceMac(ip);
        }

}
