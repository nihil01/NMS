package az.horosho.nms.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DeviceNetworkInterfaces {

    private String name;
    private boolean state;
    private long in;
    private long out;
    private long errors;
    private String macAddress;

}
