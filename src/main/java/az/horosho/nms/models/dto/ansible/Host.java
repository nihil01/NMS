package az.horosho.nms.models.dto.ansible;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Host {
    private String location;
    private String type;
    private String ipAddress;

    private String ansible_network_os;
    private String ansible_connection;
    private String ansible_user;
    private String ansible_password;
}
