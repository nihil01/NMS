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

    private List<DeviceNetworkInterfaces> deviceNetworkInterfaces;
    private VendorData vendorData;
}
