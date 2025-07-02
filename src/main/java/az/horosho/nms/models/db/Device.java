package az.horosho.nms.models.db;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("devices")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class Device {

    @Id
    private Long id;

    private String name;

    private String type;

    @Column("ip_address")
    private String ipAddress;

    private String place;

    private String mask;

    private String vendor;

}
