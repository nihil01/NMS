export interface DeviceResponseDTO extends Device {

  sysName: string;          // OID: 1.3.6.1.2.1.1.5.0
  sysDescr: string;         // OID: 1.3.6.1.2.1.1.1.0
  uptime: string;           // OID: 1.3.6.1.2.1.1.3.0

  vendor: string;           // Обычно берётся из sysDescr или entPhysicalDescr
  model: string;            // OID: 1.3.6.1.2.1.47.1.1.1.1.13 или entPhysicalDescr
  serialNumber: string;     // OID: 1.3.6.1.2.1.47.1.1.1.1.11
  osVersion: string;        // OID: 1.3.6.1.2.1.47.1.1.1.1.10
  macAddress: string;       // Обычно собирается с интерфейсов (не по одному OID)

  reachable: boolean;       // Проверка TCP/ICMP
  latency: number;            // Пинг
  packetLoss: number;       // Потери пакетов

  cpuLoad: number;        // Cisco: 1.3.6.1.4.1.9.9.109.1.1.1.1.3

  memoryUsed: number;         // Cisco: 1.3.6.1.4.1.9.9.48.1.1.1.5
  memoryFree: number;         // Cisco: 1.3.6.1.4.1.9.9.48.1.1.1.6
  memoryTotal: number;        // Вычисляется: memoryUsed + memoryFree

  temperature: number;      // Cisco: 1.3.6.1.4.1.9.9.13.1.3.1.3
  imageUrl: string; 

  deviceNetworkInterfaces: DeviceNetworkInterfaces[];

}

export interface DeviceNetworkInterfaces {
  name: string;
  state: boolean;
  in: number;
  out: number;
  macAddress: string;
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
