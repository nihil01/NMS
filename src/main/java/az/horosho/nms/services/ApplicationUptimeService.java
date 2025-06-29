package az.horosho.nms.services;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ApplicationUptimeService {

    private final long startTime;

    public ApplicationUptimeService() {
        this.startTime = System.currentTimeMillis();
    }

    public Mono<Long> getApplicationStartTime() {
        return Mono.just(startTime);
    }

    public Mono<Long> getUptimeMillis() {
        return Mono.fromCallable(() -> System.currentTimeMillis() - startTime);
    }
}

