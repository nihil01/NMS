package az.horosho.nms.configuration;

import org.quartz.Scheduler;
import org.quartz.SchedulerFactory;
import org.quartz.SchedulerException;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SchedulerConfig {

    @Bean
    public Scheduler getScheduler() throws SchedulerException {
        // Create scheduler factory
        SchedulerFactory factory = new StdSchedulerFactory();
        // Get scheduler instance
        Scheduler scheduler = factory.getScheduler();
        scheduler.start();
        return scheduler;
    }
}