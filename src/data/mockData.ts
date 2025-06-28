export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  ipAddress: string;
  cpuUsage: number;
  memoryUsage: number;
  lastSeen: string;
  location: string;
  icon?: string;
}

export interface MockData {
  totalDevices: number;
  deviceHealth: number;
  networkUptime: number;
  activeAlerts: number;
  alertSeverity: number;
  avgCpuUsage: number;
  devices: Device[];
}

export const mockData: MockData = {
  totalDevices: 24,
  deviceHealth: 87,
  networkUptime: 99.8,
  activeAlerts: 3,
  alertSeverity: 15,
  avgCpuUsage: 42,
  devices: [
    {
      id: '1',
      name: 'Əsas Router-01',
      type: 'Router',
      status: 'online',
      ipAddress: '192.168.1.1',
      cpuUsage: 35,
      memoryUsage: 28,
      lastSeen: '2 dəqiqə əvvəl',
      location: 'Server Otağı A'
    },
    {
      id: '2',
      name: 'Kommutator-Giriş-01',
      type: 'Switch',
      status: 'online',
      ipAddress: '192.168.1.10',
      cpuUsage: 15,
      memoryUsage: 45,
      lastSeen: '1 dəqiqə əvvəl',
      location: '1-ci Mərtəbə'
    },
    {
      id: '3',
      name: 'Firewall-Əsas',
      type: 'Firewall',
      status: 'warning',
      ipAddress: '192.168.1.5',
      cpuUsage: 78,
      memoryUsage: 82,
      lastSeen: '30 saniyə əvvəl',
      location: 'Server Otağı A'
    },
    {
      id: '4',
      name: 'Server-Veb-01',
      type: 'Server',
      status: 'online',
      ipAddress: '192.168.1.20',
      cpuUsage: 45,
      memoryUsage: 67,
      lastSeen: '1 dəqiqə əvvəl',
      location: 'Server Otağı B'
    },
    {
      id: '5',
      name: 'Server-VT-01',
      type: 'Server',
      status: 'online',
      ipAddress: '192.168.1.21',
      cpuUsage: 62,
      memoryUsage: 89,
      lastSeen: '45 saniyə əvvəl',
      location: 'Server Otağı B'
    },
    {
      id: '6',
      name: 'GN-1Mərtəbə',
      type: 'Access Point',
      status: 'offline',
      ipAddress: '192.168.1.30',
      cpuUsage: 0,
      memoryUsage: 0,
      lastSeen: '15 dəqiqə əvvəl',
      location: '1-ci Mərtəbə'
    },
    {
      id: '7',
      name: 'GN-2Mərtəbə',
      type: 'Access Point',
      status: 'online',
      ipAddress: '192.168.1.31',
      cpuUsage: 12,
      memoryUsage: 23,
      lastSeen: '2 dəqiqə əvvəl',
      location: '2-ci Mərtəbə'
    },
    {
      id: '8',
      name: 'Kommutator-Əsas-01',
      type: 'Switch',
      status: 'online',
      ipAddress: '192.168.1.15',
      cpuUsage: 8,
      memoryUsage: 34,
      lastSeen: '1 dəqiqə əvvəl',
      location: 'Server Otağı A'
    },
    {
      id: '9',
      name: 'YB-01',
      type: 'Load Balancer',
      status: 'online',
      ipAddress: '192.168.1.25',
      cpuUsage: 55,
      memoryUsage: 71,
      lastSeen: '30 saniyə əvvəl',
      location: 'Server Otağı A'
    },
    {
      id: '10',
      name: 'NAS-Saxlama-01',
      type: 'Storage',
      status: 'online',
      ipAddress: '192.168.1.40',
      cpuUsage: 23,
      memoryUsage: 56,
      lastSeen: '3 dəqiqə əvvəl',
      location: 'Server Otağı C'
    },
    {
      id: '11',
      name: 'Ehtiyat-Server-01',
      type: 'Server',
      status: 'warning',
      ipAddress: '192.168.1.50',
      cpuUsage: 88,
      memoryUsage: 92,
      lastSeen: '1 dəqiqə əvvəl',
      location: 'Server Otağı B'
    },
    {
      id: '12',
      name: 'VPN-Qapı',
      type: 'VPN',
      status: 'online',
      ipAddress: '192.168.1.60',
      cpuUsage: 18,
      memoryUsage: 39,
      lastSeen: '2 dəqiqə əvvəl',
      location: 'Server Otağı A'
    }
  ]
}; 