import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress,
  Divider,
  Avatar,
  Badge,
  Spinner,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  Cog6ToothIcon,
  WifiIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CpuChipIcon,

} from '@heroicons/react/24/outline';
import { HttpClient } from '../net/HttpClient';
import type { DeviceResponseDTO } from '../data/dtoInterfaces';
import LoaderScreen from './LoaderScreen';

interface DeviceDetailPageProps {
  deviceId: number;
  onBack: () => void;
}

const DeviceDetailPage: React.FC<DeviceDetailPageProps> = ({ deviceId, onBack }) => {
  const [device, setDevice] = useState<DeviceResponseDTO>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch device details by ID
        const deviceData = await new HttpClient().getDevices(deviceId);

        console.log('Device data:', deviceData);
        
        if (deviceData && deviceData.length > 0) {
          setDevice(deviceData[0]);
        } else {
          throw new Error('Device not found');
        }
      } catch (error) {
        console.error('Failed to fetch device details:', error);
        alert('Cihaz məlumatları yüklənərkən xəta baş verdi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceDetails();
  }, [deviceId]);

  const getDeviceIcon = (deviceType: string) => {
    const DeviceIcons = {
      switch: "http://localhost:8080/switch.png",
      server: "http://localhost:8080/server.png",
      firewall: "http://localhost:8080/firewall.png"
    };
    return DeviceIcons[deviceType as keyof typeof DeviceIcons] || DeviceIcons.server;
  };

  if (isLoading) {
    return (
      <LoaderScreen
        isVisible={true}
        message="Cihaz məlumatları yüklənir..."
        showProgress={false}
        showSpinner={true}
        showLogo={false}
        size="md"
        variant="default"
      />
    );
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardBody className="text-center space-y-4">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-semibold">Cihaz tapılmadı</h2>
            <p className="text-gray-600">Seçilən cihaz artıq mövcud deyil</p>
            <Button color="primary" onPress={onBack}>
              Geri qayıt
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="light"
            onPress={onBack}
            startContent={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Geri qayıt
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar
              src={device.imageUrl || getDeviceIcon(device.type)}
              size="lg"
              className="bg-blue-100 dark:bg-blue-900/30"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {device.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {device.type} • {device.ipAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Tabs 
              selectedKey={activeTab} 
              onSelectionChange={(key) => setActiveTab(key as string)}
              color="primary"
              variant="underlined"
            >
              <Tab key="overview" title="Ümumi baxış" />
              <Tab key="performance" title="Performans" />
              <Tab key="interfaces" title="İnterfeyslər" />
              <Tab key="logs" title="Loglar" />
            </Tabs>
          </CardHeader>
          <CardBody>
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Device Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Cihaz Məlumatları</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sistem adı:</span>
                        <span className="font-medium">{device.sysName || 'Məlum deyil'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vendor:</span>
                        <span className="font-medium">{device.vendor || 'Məlum deyil'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{device.model || 'Məlum deyil'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Serial Number:</span>
                        <span className="font-medium">{device.serialNumber || 'Məlum deyil'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Şəbəkə Məlumatları</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">IP Ünvanı:</span>
                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {device.ipAddress}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">MAC Ünvanı:</span>
                        <span className="font-medium">{device.macAddress || 'Məlum deyil'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latency:</span>
                        <span className="font-medium">{device.latency ? `${device.latency}ms` : 'Məlum deyil'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Packet Loss:</span>
                        <span className="font-medium">{device.packetLoss ? `${device.packetLoss}%` : 'Məlum deyil'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* System Description */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Sistem Təsviri</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {device.sysDescr || 'Sistem təsviri mövcud deyil'}
                  </p>
                </div>

                <Divider />

                {/* Uptime */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">İşləmə Müddəti</h3>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {device.uptime || 'Məlum deyil'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-6">
                {/* CPU Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">CPU İstifadəsi</h3>
                    <span className="text-sm text-gray-600">{device.cpuLoad || 0}%</span>
                  </div>
                  <Progress
                    value={device.cpuLoad || 0}
                    color={(device.cpuLoad || 0) > 80 ? 'danger' : (device.cpuLoad || 0) > 60 ? 'warning' : 'success'}
                    size="lg"
                  />
                </div>

                {/* Memory Usage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Yaddaş İstifadəsi</h3>
                    <span className="text-sm text-gray-600">
                      {device.memoryTotal > 0 ? Math.round((device.memoryUsed / device.memoryTotal) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={device.memoryTotal > 0 ? ((device.memoryUsed / device.memoryTotal) * 100) : 0}
                    color={device.memoryTotal > 0 && ((device.memoryUsed / device.memoryTotal) * 100) > 80 ? 'danger' : device.memoryTotal > 0 && ((device.memoryUsed / device.memoryTotal) * 100) > 60 ? 'warning' : 'success'}
                    size="lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>İstifadə olunan: {device.memoryUsed || 0} MB</span>
                    <span>Ümumi: {device.memoryTotal || 0} MB</span>
                  </div>
                </div>

                {/* Temperature */}
                {device.temperature && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Temperatur</h3>
                      <span className="text-sm text-gray-600">{device.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {Number(device.temperature) > 70 ? 'Yüksək' : Number(device.temperature) > 50 ? 'Normal' : 'Aşağı'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "interfaces" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Şəbəkə İnterfeysləri</h3>
                </div>
                <Table aria-label="İnterfeyslər cədvəli">
                  <TableHeader>
                    <TableColumn>İnterfeys</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>IP Ünvanı</TableColumn>
                    <TableColumn>MAC Ünvanı</TableColumn>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>GigabitEthernet0/0</TableCell>
                      <TableCell>
                        <Chip variant="flat" color="success" size="sm">Aktiv</Chip>
                      </TableCell>
                      <TableCell>192.168.1.1</TableCell>
                      <TableCell>00:1B:44:11:3A:B7</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>GigabitEthernet0/1</TableCell>
                      <TableCell>
                        <Chip variant="flat" color="success" size="sm">Aktiv</Chip>
                      </TableCell>
                      <TableCell>10.0.0.1</TableCell>
                      <TableCell>00:1B:44:11:3A:B8</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>GigabitEthernet0/2</TableCell>
                      <TableCell>
                        <Chip variant="flat" color="danger" size="sm">Deaktiv</Chip>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>00:1B:44:11:3A:B9</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Son Loglar</h3>
                <div className="space-y-2">
                  {[
                    { time: '2024-01-15 14:30:25', level: 'INFO', message: 'Interface GigabitEthernet0/0 is up' },
                    { time: '2024-01-15 14:29:18', level: 'WARNING', message: 'High CPU usage detected' },
                    { time: '2024-01-15 14:28:45', level: 'INFO', message: 'Configuration saved successfully' },
                    { time: '2024-01-15 14:27:32', level: 'ERROR', message: 'Connection timeout to 192.168.1.100' },
                  ].map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.level === 'ERROR' ? 'bg-red-500' : 
                        log.level === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{log.time}</span>
                          <Chip 
                            variant="flat" 
                            color={log.level === 'ERROR' ? 'danger' : log.level === 'WARNING' ? 'warning' : 'success'} 
                            size="sm"
                          >
                            {log.level}
                          </Chip>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">Tez Statistika</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU</span>
                <span className="font-semibold">{device.cpuLoad || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Yaddaş</span>
                <span className="font-semibold">
                  {device.memoryTotal > 0 ? Math.round((device.memoryUsed / device.memoryTotal) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Latency</span>
                <span className="font-semibold">{device.latency ? `${device.latency}ms` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Packet Loss</span>
                <span className="font-semibold">{device.packetLoss ? `${device.packetLoss}%` : 'N/A'}</span>
              </div>
            </CardBody>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">Məkan Məlumatı</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{device.place || 'Məlum deyil'}</span>
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">Əməliyyatlar</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button 
                variant="bordered" 
                startContent={<Cog6ToothIcon className="w-4 h-4" />}
                className="w-full"
              >
                Konfiqurasiya
              </Button>
              <Button 
                variant="bordered" 
                startContent={<ChartBarIcon className="w-4 h-4" />}
                className="w-full"
              >
                Monitorinq
              </Button>
              <Button 
                variant="bordered" 
                startContent={<WifiIcon className="w-4 h-4" />}
                className="w-full"
              >
                Şəbəkə Testi
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailPage; 