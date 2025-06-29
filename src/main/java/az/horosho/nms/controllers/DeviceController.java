package az.horosho.nms.controllers;

import az.horosho.nms.models.dto.DeviceData;
import az.horosho.nms.services.ApplicationUptimeService;
import az.horosho.nms.services.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final ApplicationUptimeService applicationUptimeService;


    @PostMapping("/uploadDevice")
        Mono<ResponseEntity<?>> upload(
            @RequestBody DeviceData deviceData
        ) {

            if (deviceData == null || deviceData.getIpAddress() == null ||
                    deviceData.getPlace() == null || deviceData.getName() == null || deviceData.getType() == null ){
                return Mono.just(ResponseEntity.badRequest().build());
            }

            return deviceService.addDevice(deviceData)
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

        @GetMapping("/getDataSize")
        Mono<?> getDataSize() {
            return deviceService.getDevicesSize();
        };

        @GetMapping("/getUptimeSystem")
        Mono<?> getUptime() {
            return applicationUptimeService.getUptimeMillis();
        }


}
