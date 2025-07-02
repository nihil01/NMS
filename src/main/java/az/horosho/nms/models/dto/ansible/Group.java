package az.horosho.nms.models.dto.ansible;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Group {
    private Map<String, Host> hosts;
}
