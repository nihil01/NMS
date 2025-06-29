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
  WifiIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SignalIcon,
  PowerIcon
} from '@heroicons/react/24/outline';

import { HttpClient } from '../net/HttpClient';
import { DeviceComponent } from './DeviceComponent';

const Dashboard: React.FC<{ authenticated: (isAuthenticated: boolean) => void }> = ({ authenticated }) => {

  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'devices' | 'network' | 'alerts'>('dashboard');
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [networkUptime, setNetworkUptime] = useState<number>(0);

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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ümumi Cihazlar</p>
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
                    <WifiIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
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
      case 'network':
        return (
          <Card className="dashboard-card">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Şəbəkə Baxışı</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 dark:text-gray-400">Şəbəkə monitorinqi funksiyaları tezliklə...</p>
            </CardBody>
          </Card>
        );
      case 'alerts':
        return (
          <Card className="dashboard-card">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sistem Xəbərdarlıqları</h3>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 dark:text-gray-400">Xəbərdarlıq idarəetməsi funksiyaları tezliklə...</p>
            </CardBody>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Avatar size='lg' src={"http://localhost:8080/logo.jpg"} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">NMS İdarə Paneli</h1>
          </div>
        </div>
        
        <nav className="mt-6">
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
              onClick={() => setSelectedTab('network')}
              variant={selectedTab === 'network' ? 'flat' : 'light'}
              className={`w-full justify-start ${
                selectedTab === 'network' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              startContent={<WifiIcon className="w-5 h-5" />}
            >
              Şəbəkə
            </Button>
            <Button
              onClick={() => setSelectedTab('alerts')}
              variant={selectedTab === 'alerts' ? 'flat' : 'light'}
              className={`w-full justify-start ${
                selectedTab === 'alerts' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              startContent={<ExclamationTriangleIcon className="w-5 h-5" />}
            >
              Xəbərdarlıqlar
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
                  {selectedTab === 'network' && 'Şəbəkə Monitorinqi'}
                  {selectedTab === 'alerts' && 'Sistem Xəbərdarlıqları'}
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
      </div>
    </div>
  );
};

export default Dashboard; 