package az.horosho.nms.models.db;

import org.springframework.data.domain.Sort;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface DeviceRepository extends ReactiveCrudRepository<Device, Long> {
    Flux<Device> findAllBy(Sort sort);
}

