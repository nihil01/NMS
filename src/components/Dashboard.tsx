import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Chip,
  Progress,
  Avatar
} from '@heroui/react';
import { 
  ChartBarIcon, 
  ServerIcon, 
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  PaperClipIcon,
  CheckCircleIcon,
  PowerIcon,
  ClockIcon,
  CloudArrowDownIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

import { HttpClient } from '../net/HttpClient';
import { DeviceComponent } from './DeviceComponent';
import { ScheduleComponent } from './ScheduleComponent';
import AnsibleLogsComponent from './AnsibleLogsComponent';
import GoogleMapsComponent from './GoogleMapsComponent';

const Dashboard: React.FC<{ authenticated: (isAuthenticated: boolean) => void }> = ({ authenticated }) => {

  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'devices' | 'networkMap' | 'schedule' | 'ansibleLogs'>('dashboard');
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [networkUptime, setNetworkUptime] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    const fetchDeviceCount = async () => {
      const count = await new HttpClient().getDeviceCount();
      setDeviceCount(count);
    };
    fetchDeviceCount();


    const fetchNetworkUptime = async () => {
      const uptime = await new HttpClient().getNetworkUptime();
      setNetworkUptime(uptime);
    };
    fetchNetworkUptime();
    
  }, []);


  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Key Metrics */}
            <Card className="metric-card">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ümumi Cihazlarin sayi</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{deviceCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <ServerIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

              </CardBody>
            </Card>

            <Card className="metric-card">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Servisin İşləmə Müddəti</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {`${Math.floor(networkUptime / 1000 / 60 / 60 / 24)} Gün; ${Math.floor(networkUptime / 1000 / 60 / 60) % 24} Saat; ${Math.floor(networkUptime / 1000 / 60) % 60} Dəqiqə; ${networkUptime % 1000 % 60} Saniye`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={networkUptime} 
                    color="success" 
                    size="sm" 
                    className="w-full"
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        );
      case 'devices':
        return <DeviceComponent deviceCount={deviceCount} />;

      case 'networkMap':
        return (
            <GoogleMapsComponent />
        );

      case 'ansibleLogs':
        return <AnsibleLogsComponent />

      case 'schedule':
        return <ScheduleComponent />
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`w-64 bg-white dark:bg-gray-800 shadow-lg ${isSidebarOpen ? 'block' : 'hidden'} transition-all duration-300`}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Avatar size='lg' src={"http://localhost:8080/logo.jpg"} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">NMS İdarə Paneli</h1>
          </div>
        </div>
        
        <nav className={`mt-6 `}>
          <div className="px-4 space-y-2">
            <Button
              onClick={() => setSelectedTab('dashboard')}
              variant={selectedTab === 'dashboard' ? 'flat' : 'light'}
              className={`w-full justify-start ${
                selectedTab === 'dashboard' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              startContent={<ChartBarIcon className="w-5 h-5" />}
            >
              İdarə Paneli
            </Button>
            <Button
              onClick={() => setSelectedTab('devices')}
              variant={selectedTab === 'devices' ? 'flat' : 'light'}
              className={`w-full justify-start ${
                selectedTab === 'devices' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              startContent={<ServerIcon className="w-5 h-5" />}
            >
              Cihazlar
            </Button>
            <Button
              onClick={() => setSelectedTab('networkMap')}
              variant={selectedTab === 'networkMap' ? 'flat' : 'light'}
              className={`w-full justify-start ${
                selectedTab === 'networkMap' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              startContent={<MapPinIcon className="w-5 h-5" />}
            >
              Xəritə
            </Button>
            <Button
              onClick={() => setSelectedTab('schedule')}
              variant={selectedTab === 'schedule' ? 'flat' : 'light'}
              className={`w-full justify-start ${
                selectedTab === 'schedule' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              startContent={<CloudArrowDownIcon className="w-5 h-5" />}
            >
              Backupların Planlaması
            </Button>
            <Button
              onClick={() => setSelectedTab('ansibleLogs')}
              variant={selectedTab === 'ansibleLogs' ? 'flat' : 'light'}
              className={`w-full justify-start ${
                selectedTab === 'ansibleLogs' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              startContent={<PaperClipIcon className="w-5 h-5" />}
            >
              Ansible Logs
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTab === 'dashboard' && 'Şəbəkə Baxışı'}
                  {selectedTab === 'devices' && 'Cihaz İdarəetməsi'}
                  {selectedTab === 'networkMap' && 'Şəbəkə Xəritəsi'}
                  {selectedTab === 'schedule' && 'Backupların Planlaması'}
                  {selectedTab === 'ansibleLogs' && 'Ansible Logs'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Şəbəkə infrastrukturunuzu real-time olaraq izləyin</p>
              </div>
              <div className="flex items-center space-x-4">
                <Chip variant="flat" color="success" startContent={<CheckCircleIcon className="w-4 h-4" />}>
                  Sistem Sağlamdır
                </Chip>
                <Button variant="flat" color="danger" onClick={() => {
                  new HttpClient().logout();
                  authenticated(false);
                }} startContent={<PowerIcon className="w-4 h-4" color="red"/>}>
                  <span className="text-red-500">Çıxış</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Rendered Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>

        <div className="flex justify-center mt-6 font-bold text-gray-600 dark:text-gray-400 absolute bottom-0 left-0">
            <Button title='Paneli gizletmek' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? <ArrowLeftCircleIcon className="w-5 h-5" /> : <ArrowRightCircleIcon className="w-5 h-5" />}</Button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard; 