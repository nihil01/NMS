package az.horosho.nms.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class BackupService {

    @Value("${spring.backup_path}")
    private String backupPath;

    public Mono<Resource> downloadBackup(String ipAddress, String location){

        // Add null check for backup folder location
        String BACKUP_FOLDER_LOCATION = getClass().getResource(backupPath) != null ?
            getClass().getResource(backupPath).getPath().replaceFirst("^/(.:/)", "$1") :
            null;

        if (BACKUP_FOLDER_LOCATION == null) {
            return Mono.error(new RuntimeException("Backup folder not found in classpath"));
        }

        String decodedLocation = java.net.URLDecoder.decode(location, java.nio.charset.StandardCharsets.UTF_8);

        System.out.println(decodedLocation);
        System.out.println(BACKUP_FOLDER_LOCATION);

        return readSpecifiedLocation(Path.of(BACKUP_FOLDER_LOCATION, decodedLocation).toString(), ipAddress)
            .collectList()
            .publishOn(Schedulers.boundedElastic())
            .flatMap(paths -> {
                if (paths.isEmpty()) {
                    return Mono.error(new RuntimeException("No backup found"));
                }

                try {
                    String zipPath = BACKUP_FOLDER_LOCATION + "/compressed.zip";
                    try(final FileOutputStream fos = new FileOutputStream(zipPath)) {
                        final ZipOutputStream zipOut = getZipOutputStream(paths, fos);
                        zipOut.close();
                    }

                    ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(Paths.get(zipPath))) {
                        @Override
                        public String getFilename() {
                            return "compressed.zip";
                        }
                    };
                    return Mono.just(resource);
                } catch (IOException e) {
                    return Mono.error(new RuntimeException(e));
                }

            });
    }

    private static ZipOutputStream getZipOutputStream(List<Path> paths, FileOutputStream fos) throws IOException {

        try(ZipOutputStream zipOut = new ZipOutputStream(fos)){
            for (Path path : paths) {
                File fileToZip = new File(path.toString());
                try(FileInputStream fis = new FileInputStream(fileToZip)) {
                    ZipEntry zipEntry = new ZipEntry(fileToZip.getName());
                    zipOut.putNextEntry(zipEntry);

                    byte[] bytes = new byte[1024];
                    int length;
                    while ((length = fis.read(bytes)) >= 0) {
                        zipOut.write(bytes, 0, length);
                    }
                }
            }
            return zipOut;
        }


    }

    public Flux<Path> readSpecifiedLocation(String location, String ipAddress) {
        System.out.println("Reading location " + location);
        return Flux.defer(() -> {
            try {
                return Flux.fromStream(Files.list(Paths.get(location)))
                    .subscribeOn(Schedulers.boundedElastic())
                    .filter(Files::isRegularFile)
                    .sort((p1, p2) -> {
                        try {
                            long t1 = Files.readAttributes(p1, BasicFileAttributes.class).lastModifiedTime().toMillis();
                            long t2 = Files.readAttributes(p2, BasicFileAttributes.class).lastModifiedTime().toMillis();
                            return Long.compare(t2, t1); // Reversed order
                        } catch (IOException e) {
                            return 0;
                        }
                    })
                    .filter(path -> path.getFileName().toString().contains(ipAddress) &&
                            path.getFileName().toString().endsWith(".txt"))
                    .onErrorResume(e -> {
                        System.err.println("Error reading files: " + e.getMessage());
                        return Flux.empty();
                    });
            } catch (IOException e) {
                System.err.println("Error accessing directory: " + e.getMessage());
                return Flux.error(new RuntimeException("Unable to access backup directory", e));
            }
        });
    }
}
