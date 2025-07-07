package az.horosho.nms.controllers;

import az.horosho.nms.models.dto.DateDTO;
import az.horosho.nms.services.SchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/scheduler")

public class SchedulerController {

    private final SchedulerService schedulerService;

    @PostMapping("/create")
    public Mono<String> createJob(@RequestBody DateDTO dateDTO) {
        System.out.println(dateDTO);
        return schedulerService.scheduleBackupJob(dateDTO.jobName(), dateDTO)
                .thenReturn("Job created with name: " + dateDTO.jobName());
    }

    @DeleteMapping("/delete")
    public Mono<String> deleteJob(@RequestParam String jobName) {
        return schedulerService.deleteJob(jobName)
                .thenReturn("Job deleted: " + jobName);
    }

    @GetMapping("/exists")
    public Mono<String> checkJob(@RequestParam String jobName) {
        return schedulerService.checkJobExists(jobName);
    }
}

