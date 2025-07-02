export interface DeviceResponseDTO extends Device {

  sysName: string;          // OID: 1.3.6.1.2.1.1.5.0
  sysDescr: string;         // OID: 1.3.6.1.2.1.1.1.0
  uptime: string;           // OID: 1.3.6.1.2.1.1.3.0
  sysObjectID: string;
  reachable: boolean;


  vendor: string;           // Обычно берётся из sysDescr или entPhysicalDescr
  model: string;            // OID: 1.3.6.1.2.1.47.1.1.1.1.13 или entPhysicalDescr
  serialNumber: string;     // OID: 1.3.6.1.2.1.47.1.1.1.1.11
  osVersion: string;        // OID: 1.3.6.1.2.1.47.1.1.1.1.10
  macAddress: string;       // Обычно собирается с интерфейсов (не по одному OID)

  imageUrl: string; 

  deviceNetworkInterfaces: DeviceNetworkInterfaces[];
  vendorData: VendorData;

}

export interface DeviceNetworkInterfaces {
  name: string;
  state: boolean;
  in: number;
  out: number;
  macAddress: string;
}

export interface VendorData {
  cpuLoad: number;
  temperature: number;
  memoryUsed: number;
}

export interface Device {

  id?: number;
  name: string;
  type: string;
  ipAddress: string;
  place: string;
  mask?: string;
  vendor?: string; // Auto-detected vendor information
}
