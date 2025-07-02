package az.horosho.nms.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class VendorData {
    private Double cpuLoad;
    private Double temperature;
    private Long memoryUsed;
}
