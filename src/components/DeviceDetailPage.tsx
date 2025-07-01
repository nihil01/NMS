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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ButtonGroup,
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
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import { HttpClient } from '../net/HttpClient';
import type { DeviceResponseDTO } from '../data/dtoInterfaces';
import LoaderScreen from './LoaderScreen';

interface DeviceDetailPageProps {
  deviceId: number;
  onBack: () => void;
}

// Utility function to convert bytes to human readable format
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility function to convert packet counts to human readable format
const formatPackets = (packets: number): string => {
  if (packets === 0) return '0';
  
  const k = 1000;
  const sizes = ['', 'K', 'M', 'B'];
  const i = Math.floor(Math.log(packets) / Math.log(k));
  
  if (i === 0) return packets.toString();
  
  return parseFloat((packets / Math.pow(k, i)).toFixed(2)) + sizes[i];
};

const DeviceDetailPage: React.FC<DeviceDetailPageProps> = ({ deviceId, onBack }) => {
  const [device, setDevice] = useState<DeviceResponseDTO>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [backupEndpoint] = useState<string>("http://localhost:8080/proceedBackup");
  // Modal states
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [isTcpModalOpen, setIsTcpModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  
  // Test results
  const [pingResult, setPingResult] = useState<string>('');
  const [tcpResult, setTcpResult] = useState<string>('');
  
  // TCP test input
  const [tcpPort, setTcpPort] = useState<string>('');
  const [portError, setPortError] = useState<string>('');

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

  // Ping test handler
  const handlePingTest = async () => {
    if (!device) return;
    
    setIsPingModalOpen(true);
    setIsTestLoading(true);    
    try {
      const result = await new HttpClient().pingDevice(device.ipAddress);
      
      setPingResult(result);
    } catch (error) {
      console.error('Ping test failed:', error);
      setPingResult("Ping testi uğursuz oldu");
    } finally {
      setIsTestLoading(false);
    }
  };

  // TCP test handler
  const handleTcpTest = async () => {
    if (!device) return;
    
    // Validate port
    const port = parseInt(tcpPort);
    if (isNaN(port) || port <= 0 || port > 65535) {
      setPortError('Port 1-65535 aralığında olmalıdır');
      return;
    }
    
    setPortError('');
    setIsTcpModalOpen(true);
    setIsTestLoading(true);
    
    try {
      const result = await new HttpClient().testTcpConnection(device.ipAddress, port);
      
      setTcpResult(result);
    } catch (error) {
      console.error('TCP test failed:', error);
      setTcpResult("TCP testi uğursuz oldu");
    } finally {
      setIsTestLoading(false);
    }
  };

  // Validate port input
  const validatePort = (value: string) => {
    setTcpPort(value);
    const port = parseInt(value);
    if (value === '') {
      setPortError('');
    } else if (isNaN(port) || port <= 0 || port > 65535) {
      setPortError('Port 1-65535 aralığında olmalıdır');
    } else {
      setPortError('');
    }
  };

  const handleDeleteDevice = async () => {
    if (!device || !device.id) return;

    const result = await new HttpClient().deleteDevice(device.id);

    if (result) {
      alert("Cihaz silindi");
      window.location.reload();
    }
    
  };

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

                <Divider />

                {/* Delete Device */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cihazı Sil</h3>
                  <Button color="danger" className="w-full hover:bg-red-600 bg-red-500" onPress={handleDeleteDevice}>
                    Cihazı Sil
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bu emeliyyat geri qaytarıla bilməz!</p>
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
                  <span className="text-xs text-gray-500">Paket sayı (K=1000, M=1M, B=1B)</span>
                </div>
                <Table aria-label="İnterfeyslər cədvəli">
                  <TableHeader>
                    <TableColumn>İnterfeys</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>MAC Ünvanı</TableColumn>
                    <TableColumn>Giriş paketləri</TableColumn>
                    <TableColumn>Çıxış paketləri</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {device.deviceNetworkInterfaces && device.deviceNetworkInterfaces.length > 0 ? 
                      device.deviceNetworkInterfaces.map((iface, index) => (
                        <TableRow key={index}>
                          <TableCell>{iface.name}</TableCell>
                          <TableCell>{iface.state ? "Aktiv" : "Deaktiv"}</TableCell>
                          <TableCell>{iface.macAddress ? iface.macAddress : "Məlum deyil"}</TableCell>
                          <TableCell>{formatPackets(iface.in)}</TableCell>
                          <TableCell>{formatPackets(iface.out)}</TableCell>
                        </TableRow>
                      )) : 
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          İnterfeys məlumatları mövcud deyil
                        </TableCell>
                      </TableRow>
                    }
                  </TableBody>
                </Table>
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
              <h3 className="font-semibold text-gray-900 dark:text-white">Avadanlıq üzrə emeliyyatlari</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button variant="bordered" startContent={<CloudArrowDownIcon className="w-4 h-4" />} onPress={() => setIsBackupModalOpen(true)}>
                Backup'in yüklənməsi
              </Button>
              <ButtonGroup>
                <Button 
                  variant="bordered" 
                  startContent={<ChartBarIcon className="w-4 h-4" />}
                  className="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onPress={handlePingTest}
                >
                  Ping Testi
                </Button>
                <Button 
                  variant="bordered" 
                  startContent={<WifiIcon className="w-4 h-4" />}
                  className="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onPress={() => setIsTcpModalOpen(true)}
                >
                  TCP Testi
                </Button>
              </ButtonGroup>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Ping Test Modal */}
      <Modal isOpen={isPingModalOpen} onClose={() => setIsPingModalOpen(false)} size="2xl">
        <ModalContent className="bg-gray-900 dark:bg-gray-800 text-white">
          <ModalHeader>
            <div className="flex items-center space-x-2 text-white">
              <ChartBarIcon className="w-5 h-5" />
              <span>Ping Testi - {device?.ipAddress}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {isTestLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Spinner size="lg" />
                <p className="text-gray-600">Ping testi icra olunur...</p>
              </div>
            ) : pingResult ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-blue-700 dark:text-blue-400">Test vaxtı</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Test nəticəsi:</h4>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {pingResult}
                  </pre>
                </div>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsPingModalOpen(false)}>
              Bağla
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* TCP Test Modal */}
      <Modal isOpen={isTcpModalOpen} onClose={() => setIsTcpModalOpen(false)} size="2xl">
        <ModalContent className="bg-gray-900 dark:bg-gray-800 text-white">
          <ModalHeader>
            <div className="flex items-center space-x-2 text-white">
              <WifiIcon className="w-5 h-5" />
              <span>TCP Testi - {device?.ipAddress}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {!isTestLoading && !tcpResult ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test ediləcək port:
                  </label>
                  <Input
                    type="number"
                    placeholder="80, 443, 22, 3389..."
                    value={tcpPort}
                    onChange={(e) => validatePort(e.target.value)}
                    isInvalid={!!portError}
                    errorMessage={portError}
                    min={1}
                    max={65535}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>• Port 1-65535 aralığında olmalıdır</p>
                  <p>• Ümumi portlar: 80 (HTTP), 443 (HTTPS), 22 (SSH), 3389 (RDP)</p>
                </div>
              </div>
            ) : isTestLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Spinner size="lg" />
                <p className="text-gray-600">TCP testi icra olunur...</p>
              </div>
            ) : tcpResult ? (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-blue-700 dark:text-blue-400">Test vaxtı</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Test nəticəsi:</h4>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {tcpResult}
                  </pre>
                </div>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            {!isTestLoading && !tcpResult ? (
              <>
                <Button variant="light" onPress={() => setIsTcpModalOpen(false)}>
                  Ləğv et
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleTcpTest}
                  isDisabled={!tcpPort || !!portError}
                >
                  Test Et
                </Button>
              </>
            ) : (
              <Button color="primary" onPress={() => setIsTcpModalOpen(false)}>
                Bağla
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Backup Download Modal */}
      <Modal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} size="lg">
        <ModalContent className="bg-gray-900 dark:bg-gray-800 text-white">
          <ModalHeader>
            <div className="flex items-center space-x-2 text-white">
              <CloudArrowDownIcon className="w-5 h-5" />
              <span>Backup Yüklənməsi - {device?.name}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {isBackupLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Spinner size="lg" />
                <p className="text-gray-300">Backup yüklənir...</p>
              </div>
            ) : (
              <div className="space-y-6">                  
                  <div className="bg-gray-800 dark:bg-gray-700 p-4 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer">
                    <a href={`${backupEndpoint}?ipAddress=${device.ipAddress}&location=${device.place}`} className="flex items-center space-x-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <CloudArrowDownIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Backup Arxivi</h4>
                        <p className="text-sm text-gray-300">Son 3 backup faylını ehtiva edən arxiv</p>
                      </div>
                    </a>
                  </div>
                </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsBackupModalOpen(false)}>
              Ləğv et
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DeviceDetailPage; 