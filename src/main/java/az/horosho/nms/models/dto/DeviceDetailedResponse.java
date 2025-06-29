package az.horosho.nms.models.dto;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class DeviceDetailedResponse extends DeviceData{

    // ✅ Системная информация (sysName, sysDescr, uptime)
    private String sysName;          // OID: 1.3.6.1.2.1.1.5.0
    private String sysDescr;         // OID: 1.3.6.1.2.1.1.1.0
    private String uptime;           // OID: 1.3.6.1.2.1.1.3.0
    private String sysObjectID;

    // ✅ Инвентаризация (ENTITY-MIB)
    private String vendor;           // Обычно берётся из sysDescr или entPhysicalDescr
    private String model;            // OID: 1.3.6.1.2.1.47.1.1.1.1.13 или entPhysicalDescr
    private String serialNumber;     // OID: 1.3.6.1.2.1.47.1.1.1.1.11
    private String osVersion;        // OID: 1.3.6.1.2.1.47.1.1.1.1.10
    private String macAddress;       // Обычно собирается с интерфейсов (не по одному OID)

    // ✅ Состояние устройства
    private Long latency;            // Пинг
    private Double packetLoss;       // Потери пакетов

    // ✅ Загрузка CPU и память
    private Double cpuLoad;        // Cisco: 1.3.6.1.4.1.9.9.109.1.1.1.1.3

    private Long memoryUsed;         // Cisco: 1.3.6.1.4.1.9.9.48.1.1.1.5
    private Long memoryFree;         // Cisco: 1.3.6.1.4.1.9.9.48.1.1.1.6
    private Long memoryTotal;        // Вычисляется: memoryUsed + memoryFree

    private Double temperature;      // Cisco: 1.3.6.1.4.1.9.9.13.1.3.1.3

    // ✅ Картинка устройства
    private String imageUrl;

    private List<DeviceNetworkInterfaces> deviceNetworkInterfaces;
}
