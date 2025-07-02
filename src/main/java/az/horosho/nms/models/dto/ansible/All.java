package az.horosho.nms.models.dto.ansible;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class All {
    Map<String, Group> children;
}
