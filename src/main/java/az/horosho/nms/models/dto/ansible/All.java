package az.horosho.nms.models.dto.ansible;

import lombok.Data;

import java.util.Map;

@Data
public class All {
    Map<String, Group> children;
}
