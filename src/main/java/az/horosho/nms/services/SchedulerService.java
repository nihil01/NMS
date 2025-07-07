package az.horosho.nms.services;

import az.horosho.nms.models.dto.SchedulerBackupJob;
import az.horosho.nms.models.dto.DateDTO;
import lombok.RequiredArgsConstructor;
import org.quartz.*;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.quartz.JobBuilder.newJob;

@Service
@RequiredArgsConstructor
public class SchedulerService {
    private final Scheduler getScheduler;

    public String dateToCronExpression(DateDTO dateData) {
        System.out.println(dateData);
        return String.format("%d %d %d ? * %d",
                0, dateData.minute(), dateData.hour(), dateData.day());
    }


    public Mono<Void> scheduleBackupJob(String jobName, DateDTO dateData) {
        return Mono.fromRunnable(() -> {
            try {
                String cron = dateToCronExpression(dateData);
                System.out.println("Cron expression is: " + cron);

                if (!jobName.equalsIgnoreCase("backup")) return;

                JobDetail jobDetail = newJob(SchedulerBackupJob.class)
                        .withIdentity(jobName, "backup-jobs")
                        .build();

                Trigger trigger = TriggerBuilder.newTrigger()
                        .withIdentity(jobName + "-trigger", "backup-triggers")
                        .withSchedule(CronScheduleBuilder.cronSchedule(cron))
                        .build();

                getScheduler.scheduleJob(jobDetail, trigger);

                System.out.println("Job scheduled!");
            } catch (SchedulerException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public Mono<Void> deleteJob(String jobName) {
        return Mono.fromRunnable(() -> {
            try {
                JobKey jobKey = new JobKey(jobName, "backup-jobs");
                getScheduler.deleteJob(jobKey);
            } catch (SchedulerException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public Mono<String> checkJobExists(String jobName) {
        return Mono.fromCallable(() -> {
            try {
                JobKey jobKey = new JobKey(jobName, "backup-jobs");
                if (getScheduler.checkExists(jobKey)) {
                    // Get trigger for this job
                    Trigger trigger = getScheduler.getTriggersOfJob(jobKey).getFirst();
                    // Get the cron expression if it's a CronTrigger
                    if (trigger instanceof CronTrigger) {
                        return jobKey.getName() + " " + ((CronTrigger) trigger).getCronExpression();
                    }
                    return jobKey.getName();
                }
            } catch (SchedulerException e) {
                throw new RuntimeException(e);
            }
            return null;
        });
    }
}
