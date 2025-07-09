package az.horosho.nms.models.dto;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import java.io.*;

public class SchedulerBackupJob implements Job {

@Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        // Get configuration from JobDataMap
        String venvPath = jobExecutionContext.getMergedJobDataMap().getString("venvPath");
        String inventoryPath = jobExecutionContext.getMergedJobDataMap().getString("inventoryPath");
        String playbookPath = jobExecutionContext.getMergedJobDataMap().getString("playbookPath");
        String logPath = jobExecutionContext.getMergedJobDataMap().getString("logPath");

        //run python ansible script

        String activation = "source \"%s/bin/activate\"".formatted(venvPath);
        String ansible = "ANSIBLE_FORCE_COLOR=true ansible-playbook -i \"%s\" \"%s\" | tee \"%s\"".formatted(
                inventoryPath, playbookPath, logPath
        );

        try {

            ProcessBuilder pb = new ProcessBuilder();
            pb.command("bash", "-c", "%s ; %s".formatted(activation, ansible));

            System.out.println("process started!");

            int exitCode = pb.start().waitFor();
            if (exitCode != 0) {
                throw new JobExecutionException("Ansible process failed with exit code: " + exitCode);
            }else{
                System.out.println("Ansible execution successful !");
            }

        } catch (IOException e) {
            System.out.println(e.getMessage());
            throw new JobExecutionException("Failed to start ansible process", e);
        } catch (InterruptedException e) {
            System.out.println(e.getMessage());
            Thread.currentThread().interrupt();
            throw new JobExecutionException("Ansible process was interrupted", e);
        }

    }
}