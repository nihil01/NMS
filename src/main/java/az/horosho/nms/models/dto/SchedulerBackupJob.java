package az.horosho.nms.models.dto;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.*;

@Component
public class SchedulerBackupJob implements Job {

    @Value("${spring.python_venv_path}")
    private String venvPath;

    @Value("${spring.inventory_path}")
    private String inventoryPath;

    @Value("${spring.playbook_path}")
    private String playbookPath;

    @Value("${spring.inventory_log_path}")
    private String logPath;


    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {

        //run python ansible script

        String venvActivationScript = "source %s/bin/activate".formatted(venvPath);
        String ansibleStartScript =
            "ANSIBLE_FORCE_COLOR=true ansible-playbook -i %s %s | tee %s"
                    .formatted(inventoryPath, playbookPath, logPath);

        ProcessBuilder pb = new ProcessBuilder();
        pb.command("bash", "-c", venvActivationScript + " && " + ansibleStartScript);
        pb.inheritIO();

        try {
            Process process = pb.start();

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new JobExecutionException("Ansible process failed with exit code: " + exitCode);
            }else{
                System.out.println("Ansible execution successful !");
            }

        } catch (IOException e) {
            throw new JobExecutionException("Failed to start ansible process", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new JobExecutionException("Ansible process was interrupted", e);
        }

    }
}