package az.horosho.nms.models.dto;

public record DateDTO(
    Integer day,
    Integer hour,
    Integer minute,
    String jobName
) {
}
