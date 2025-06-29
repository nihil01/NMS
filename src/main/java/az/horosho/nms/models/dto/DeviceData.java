package az.horosho.nms.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DeviceData{

    private Long id;
    private String name;
    private String type;
    private String ipAddress;
    private String place;
    private Boolean reachable;
    private String mask;

}