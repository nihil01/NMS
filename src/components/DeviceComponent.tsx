import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Pagination
} from '@heroui/react';

import { 
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

import { HttpClient } from '../net/HttpClient';
import type { Device } from '../data/dtoInterfaces';
import type { DeviceResponseDTO } from '../data/dtoInterfaces';
import LoaderScreen from './LoaderScreen';
import DeviceDetailPage from './DeviceDetailPage';


// Device Type Icons
const DeviceIcons = {
  switch: "http://localhost:8080/switch.png",
  server: "http://localhost:8080/server.png",
  firewall: "http://localhost:8080/firewall.png"
};

const getDeviceIcon = (deviceType: string) => {
  console.log(deviceType);
  return DeviceIcons[deviceType as keyof typeof DeviceIcons] || DeviceIcons.server;
};

export const DeviceComponent: React.FC<{ deviceCount: number }> = ({ deviceCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDevice, setNewDevice] = useState<Device>({
    name: '',
    type: '',
    ipAddress: '',
    place: '',
    vendor: ''
  });

  const [devices, setDevices] = useState<DeviceResponseDTO[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [isDetectingVendor, setIsDetectingVendor] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsInitialLoading(true);
        setLoadingProgress(0);

        // Simulate loading progress
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 80) {
              clearInterval(progressInterval);
              return 80;
            }
            return prev + 20;
          });
        }, 200);

        // Fetch devices and count in parallel
        const devicesData = await new HttpClient().getDevices();

        setDevices(devicesData);
        
        // Complete loading
        setLoadingProgress(100);
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 300);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      if (page === 1) return; // Skip for initial load
      
      try {
        setIsPaginationLoading(true);
        const data = await new HttpClient().getDevices(page);
        setDevices(data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setIsPaginationLoading(false);
      }
    };

    fetchDevices();
  }, [page]);

  const handleAddDevice = async () => {
    try {
      setIsAddingDevice(true);
      await new HttpClient().uploadDevice(newDevice);

      const updatedDevices = await new HttpClient().getDevices();
      setDevices(updatedDevices);

      setNewDevice({ name: '', type: '', ipAddress: '', place: '', vendor: '' });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add device:', error);
      alert('Cihaz əlavə edilərkən xəta baş verdi');
    } finally {
      setIsAddingDevice(false);
    }
  };

  const handleAutoDetectVendor = async () => {
    if (!newDevice.ipAddress) {
      alert('Zəhmət olmasa əvvəlcə IP ünvanını daxil edin');
      return;
    }

    try {
      setIsDetectingVendor(true);
      const vendor = await new HttpClient().getVendorByIp(newDevice.ipAddress);
      alert(vendor);
      setNewDevice({ ...newDevice, vendor: vendor });

    } catch (error) {
      console.error('Failed to get vendor:', error);
      alert('Vendor məlumatı alınarkən xəta baş verdi');
    } finally {
      setIsDetectingVendor(false);
    }
  };

  const deviceTypes = [
    { key: 'switch', label: 'Switch' },
    { key: 'server', label: 'Server' },
    { key: 'firewall', label: 'Firewall' },
  ];

  const statusOptions = [
    { key: 'all', label: 'Hamısı' },
    { key: 'online', label: 'Onlayn' },
    { key: 'offline', label: 'Oflayn' },
  ];

  const typeOptions = [
    { key: 'all', label: 'Hamısı' },
    ...deviceTypes
  ];

  // Filter and search logic
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           device.ipAddress.includes(searchQuery) ||
                           device.place.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || (device.reachable ? 'online' : 'offline') === statusFilter;
      const matchesType = typeFilter === 'all' || device.type.toLowerCase() === typeFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, searchQuery, statusFilter, typeFilter]);

  // Pagination logic
  const pages = Math.ceil(filteredDevices.length / rowsPerPage);
  const paginatedDevices = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDevices.slice(start, end);
  }, [filteredDevices, page]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  const handleDeviceRowClick = (deviceId: number) => {
    setSelectedDeviceId(deviceId);
  };

  const handleBackToDeviceList = () => {
    setSelectedDeviceId(null);
  };

  // If a device is selected, show the detail page
  if (selectedDeviceId !== null) {
    return (
      <DeviceDetailPage 
        deviceId={selectedDeviceId} 
        onBack={handleBackToDeviceList} 
      />
    );
  }

  return (
    <>
      {/* Loading Screen for Initial Load */}
      <LoaderScreen
        isVisible={isInitialLoading}
        message="Cihaz məlumatları yüklənir..."
        progress={loadingProgress}
        showProgress={true}
        showSpinner={true}
        showLogo={true}
        size="md"
        variant="default"
      />

      <Card className="dashboard-card">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cihaz Statusu</h3>
            <Button 
              color="primary" 
              startContent={<PlusIcon className="w-4 h-4" aria-hidden="true" />}
              onPress={() => setIsOpen(true)}
              aria-label="Yeni cihazi əlavə et"
            >
              Cihazi Əlavə Et
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* Filters Section */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cihaz adı, IP ünvanı və ya məkan axtarın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="sm"
                />
              </div>
              <Select
                placeholder="Status"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setStatusFilter(selectedKey);
                  setPage(1);
                }}
                variant="bordered"
                size="sm"
                className="w-40"
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.key}>
                    {status.label}
                  </SelectItem>
                ))}
              </Select>
              <Select
                placeholder="Cihaz növü"
                selectedKeys={typeFilter ? [typeFilter] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setTypeFilter(selectedKey);
                  setPage(1);
                }}
                variant="bordered"
                size="sm"
                className="w-48"
              >
                {typeOptions.map((type) => (
                  <SelectItem key={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </Select>
              <Button
                variant="light"
                onPress={clearFilters}
                startContent={<FunnelIcon className="w-4 h-4" />}
                size="sm"
              >
                Filtrləri Təmizlə
              </Button>
            </div>
            
            {/* Results count */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredDevices.length} cihaz tapıldı
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 
                  ` (${deviceCount} ümumi)` : ''
                }
              </p>
            </div>
          </div>

          {/* Loading overlay for pagination */}
          {isPaginationLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <LoaderScreen
                isVisible={true}
                message="Səhifə yüklənir..."
                showProgress={false}
                showSpinner={true}
                showLogo={false}
                size="sm"
                variant="minimal"
              />
            </div>
          )}

          <div className="relative">
            <Table aria-label="Cihaz statusu cədvəli">
              <TableHeader>
                <TableColumn>Cihazın adı</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>IP Ünvanı</TableColumn>
                <TableColumn>Subnet mask</TableColumn>
                <TableColumn>Cihazın tipi</TableColumn>
                <TableColumn>Məkan</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedDevices.map((device) => (
                  <TableRow 
                    className='hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors'
                    onClick={() => handleDeviceRowClick(device.id!)}
                    key={device.id}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={getDeviceIcon(device.type)}
                          size="md"
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          name={device.name}
                          aria-label={`${device.name} avatar`}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{device.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${device.reachable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${device.reachable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {device.reachable ? 'Əlaqə var' : 'Əlaqə yoxdur'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {device.ipAddress}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {device.mask}
                      </code>
                    </TableCell>
                    <TableCell>
                      {device.type}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4" aria-hidden="true" />
                        <span>{device.place || 'Məlum deyil'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={pages}
                page={page}
                onChange={setPage}
                showControls
                color="primary"
                size="sm"
                isDisabled={isPaginationLoading}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Device Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
        backdrop="blur" 
        isDismissable={!isAddingDevice}
        aria-label="Yeni cihaz əlavə etmə modalı"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yeni Cihaz Əlavə Et</h3>
          </ModalHeader>
          <ModalBody>
            <form className="w-full space-y-4">
              <Input
                aria-label="Cihaz Adı"
                placeholder="Cihaz adını daxil edin"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                variant="bordered"
                isRequired
                isDisabled={isAddingDevice}
              />
              
              <Select
                aria-label="Cihaz Növü"
                placeholder="Cihaz növünü seçin"
                selectedKeys={newDevice.type ? [newDevice.type] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setNewDevice({ ...newDevice, type: selectedKey });
                }}
                variant="bordered"
                isRequired
                isDisabled={isAddingDevice}
              >
                {deviceTypes.map((device) => (
                  <SelectItem key={device.key} aria-label={`Cihaz növü ${device.label}`}>
                    {device.label}
                  </SelectItem>
                ))}
              </Select>
              
              <Input
                aria-label="IP Ünvanı"
                placeholder="IP ünvanı (192.168.1.100/24)"
                value={newDevice.ipAddress}
                onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                variant="bordered"
                isRequired
                isDisabled={isAddingDevice}
              />
              
              <div className="flex gap-2">
                <Input
                  aria-label="Vendor"
                  placeholder="Vendor məlumatı"
                  value={newDevice.vendor || ''}
                  onChange={(e) => setNewDevice({ ...newDevice, vendor: e.target.value })}
                  variant="bordered"
                  className="flex-1"
                  isDisabled={isAddingDevice}
                />
                <Button
                  aria-label="Vendor məlumatını avtomatik al"
                  variant="bordered"
                  size="sm"
                  onPress={handleAutoDetectVendor}
                  isDisabled={!newDevice.ipAddress || isAddingDevice || isDetectingVendor}
                  isLoading={isDetectingVendor}
                  className="px-3"
                >
                  {isDetectingVendor ? '' : 'Auto'}
                </Button>
              </div>
              
              <Input
                aria-label="Məkan"
                placeholder="Məkan məlumatı"
                value={newDevice.place}
                onChange={(e) => setNewDevice({ ...newDevice, place: e.target.value })}
                variant="bordered"
                isRequired
                isDisabled={isAddingDevice}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={() => setIsOpen(false)}
              isDisabled={isAddingDevice}
              aria-label="Cihaz əlavə etməni ləğv et"
            >
              Ləğv Et
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddDevice}
              isDisabled={!newDevice.name || !newDevice.type || !newDevice.ipAddress || !newDevice.place || isAddingDevice}
              isLoading={isAddingDevice}
              aria-label="Cihaz əlavə etməni təsdiqlə"
            >
              {isAddingDevice ? 'Əlavə edilir...' : 'Cihaz Əlavə Et'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
