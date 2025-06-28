import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Chip,
  Progress,
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
  ClockIcon,
  PlusIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { mockData } from '../data/mockData';

// Device Type Icons
const DeviceIcons = {
  router: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 1.8l.8.8C13.1 4.6 14.5 4 16 4s2.9.6 4.2 1.9z"/>
      <path d="M16 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      <path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      <path d="M8 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
      <path d="M4 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  ),
  switch: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
      <line x1="4" y1="8" x2="20" y2="8"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="16" x2="20" y2="16"/>
    </svg>
  ),
  server: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="6" rx="1"/>
      <rect x="2" y="10" width="20" height="6" rx="1"/>
      <rect x="2" y="18" width="20" height="4" rx="1"/>
      <circle cx="6" cy="5" r="1"/>
      <circle cx="6" cy="13" r="1"/>
      <circle cx="6" cy="20" r="1"/>
    </svg>
  ),
  firewall: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
      <path d="M12 7l-3 3v4c0 2.21 1.79 4 4 4s4-1.79 4-4v-4l-3-3-2 2z"/>
    </svg>
  ),
  'access-point': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  'load-balancer': (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  storage: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
      <rect x="4" y="6" width="16" height="2"/>
      <rect x="4" y="10" width="16" height="2"/>
      <rect x="4" y="14" width="16" height="2"/>
    </svg>
  ),
  vpn: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4-4z"/>
    </svg>
  )
};

const getDeviceIcon = (deviceType: string) => {
  // Convert device type to lowercase and replace spaces with hyphens
  const type = deviceType.toLowerCase().replace(/\s+/g, '-');
  
  // Map specific device types to icon keys
  const typeMap: { [key: string]: string } = {
    'router': 'router',
    'switch': 'switch', 
    'server': 'server',
    'firewall': 'firewall',
    'access-point': 'access-point',
    'load-balancer': 'load-balancer',
    'storage': 'storage',
    'vpn': 'vpn'
  };
  
  const iconKey = typeMap[type] || 'server';
  return DeviceIcons[iconKey as keyof typeof DeviceIcons] || DeviceIcons.server;
};

export const Device: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: '',
    ipAddress: '',
    location: ''
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const handleAddDevice = () => {
    alert(JSON.stringify(newDevice));
    console.log('Adding device:', newDevice);
    setNewDevice({ name: '', type: '', ipAddress: '', location: '' });
    setIsOpen(false);
  };

  const deviceTypes = [
    { key: 'switch', label: 'Kommutator' },
    { key: 'router', label: 'Router' },
    { key: 'server', label: 'Server' },
    { key: 'firewall', label: 'Firewall' },
    { key: 'access-point', label: 'Giriş Nöqtəsi' },
    { key: 'load-balancer', label: 'Yük Balanslaşdırıcı' },
    { key: 'storage', label: 'Saxlama' },
    { key: 'vpn', label: 'VPN' }
  ];

  const statusOptions = [
    { key: 'all', label: 'Hamısı' },
    { key: 'online', label: 'Onlayn' },
    { key: 'offline', label: 'Oflayn' },
    { key: 'warning', label: 'Xəbərdarlıq' }
  ];

  const typeOptions = [
    { key: 'all', label: 'Hamısı' },
    ...deviceTypes
  ];

  // Filter and search logic
  const filteredDevices = useMemo(() => {
    return mockData.devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           device.ipAddress.includes(searchQuery) ||
                           device.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchesType = typeFilter === 'all' || device.type.toLowerCase() === typeFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

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

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cihaz Statusu</h3>
            <Button 
              color="primary" 
              startContent={<PlusIcon className="w-4 h-4" aria-hidden="true" />}
              onPress={() => setIsOpen(true)}
              aria-label="Yeni cihaz əlavə et"
            >
              Cihaz Əlavə Et
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
                  ` (${mockData.devices.length} ümumi)` : ''
                }
              </p>
            </div>
          </div>

          <Table aria-label="Cihaz statusu cədvəli">
            <TableHeader>
              <TableColumn>CIHAZ</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>IP ÜNVANI</TableColumn>
              <TableColumn>CPU</TableColumn>
              <TableColumn>YADDAŞ</TableColumn>
              <TableColumn>MƏKAN</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        size="sm"
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        name={device.name}
                        aria-label={`${device.name} avatar`}
                      >
                        {getDeviceIcon(device.type)}
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{device.name}</p>
                        <p className="text-sm text-gray-500">{device.type}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      variant="flat"
                      color={device.status === 'online' ? 'success' : device.status === 'warning' ? 'warning' : 'danger'}
                      startContent={device.status === 'online' ? <CheckCircleIcon className="w-4 h-4" aria-hidden="true" /> : <XCircleIcon className="w-4 h-4" aria-hidden="true" />}
                      aria-label={`Status: ${device.status}`}
                    >
                      {device.status === 'online' ? 'Onlayn' : device.status === 'warning' ? 'Xəbərdarlıq' : 'Oflayn'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {device.ipAddress}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={device.cpuUsage} 
                        color={device.cpuUsage > 80 ? 'danger' : device.cpuUsage > 60 ? 'warning' : 'success'} 
                        size="sm" 
                        className="w-16"
                        aria-label={`CPU istifadəsi ${device.cpuUsage}%`}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{device.cpuUsage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={device.memoryUsage} 
                        color={device.memoryUsage > 80 ? 'danger' : device.memoryUsage > 60 ? 'warning' : 'success'} 
                        size="sm" 
                        className="w-16"
                        aria-label={`Yaddaş istifadəsi ${device.memoryUsage}%`}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{device.memoryUsage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="w-4 h-4" aria-hidden="true" />
                      <span>{device.location || 'Məlum deyil'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
        isDismissable={true}
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
              >
                {deviceTypes.map((device) => (
                  <SelectItem key={device.key} aria-label={`Cihaz növü ${device.label}`}>
                    {device.label}
                  </SelectItem>
                ))}
              </Select>
              
              <Input
                aria-label="IP Ünvanı"
                placeholder="IP ünvanı (192.168.1.100)"
                value={newDevice.ipAddress}
                onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                variant="bordered"
                isRequired
              />
              
              <Input
                aria-label="Məkan"
                placeholder="Məkan məlumatı"
                value={newDevice.location}
                onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                variant="bordered"
                isRequired
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={() => setIsOpen(false)}
              aria-label="Cihaz əlavə etməni ləğv et"
            >
              Ləğv Et
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddDevice}
              isDisabled={!newDevice.name || !newDevice.type || !newDevice.ipAddress || !newDevice.location}
              aria-label="Cihaz əlavə etməni təsdiqlə"
            >
              Cihaz Əlavə Et
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
