package az.horosho.nms.services;

import az.horosho.nms.models.SchedulerBackupJob;
import lombok.RequiredArgsConstructor;
import org.quartz.*;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.quartz.JobBuilder.newJob;

@Service
@RequiredArgsConstructor
public class SchedulerService {
    private final Scheduler getScheduler;

    public String dateToCronExpression(String date) {
        System.out.println(date);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime localDateTime = LocalDateTime.parse(date.replace("T", " "), formatter);

        int second = localDateTime.getSecond();
        int minute = localDateTime.getMinute();
        int hour = localDateTime.getHour();
        int dayOfWeek = localDateTime.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday

        // Quartz считает Sunday = 1, а Java Sunday = 7
        dayOfWeek = (dayOfWeek == 7) ? 1 : dayOfWeek + 1;

        // Формируем cron
        return String.format("%d %d %d ? * %d", second, minute, hour, dayOfWeek);
    }


    public Mono<Void> scheduleBackupJob(String jobName, String cronExpression) {
        return Mono.fromRunnable(() -> {
            try {
                String cron = dateToCronExpression(cronExpression);
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
