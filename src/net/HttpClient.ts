import type { Device, DeviceResponseDTO } from "../data/dtoInterfaces";

export class HttpClient {
    private baseUrl: string = 'http://localhost:8080/api';


    async checkAuth() {
        const response = await fetch(`${this.baseUrl}/auth/check`, {
            credentials: 'include'
        });
        return response.ok;
    }

    async logout() {
        const response = await fetch(`${this.baseUrl}/auth/logout`, {
            credentials: 'include'
        });
       
        return response.ok;
    }

    
    async authenticate(username: string, password: string) {
        
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.text();
            return data;
        } else {
            throw new Error('Authentication failed');
        }
    }

    // ================================
        
    async uploadDevice(device: Device) {
        const response = await fetch(`${this.baseUrl}/device/uploadDevice`, {
            method: 'POST',
            body: JSON.stringify(device),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            return await response.text();
        }
    }

    async deleteDevice(id: number, ipAddress: string, type:string) {
        const response = await fetch(`${this.baseUrl}/device/deleteDevice?id=${id}&ipAddress=${ipAddress}&type=${type}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    }

    async getDevices(id?: number, page: number = 1): Promise<DeviceResponseDTO[]> {

        const endpoint = id ? `${this.baseUrl}/device/getDevices?id=${id}`
         : page ? `${this.baseUrl}/device/getDevices?page=${page}` : `${this.baseUrl}/device/getDevices`;

        const response = await fetch(endpoint, {
            credentials: 'include'
        });
        if (response.ok) {
            return await response.json();
        } else {
            return [];
        }
    }

    async getDeviceCount(): Promise<number> {
        const response = await fetch(`${this.baseUrl}/device/getDataSize`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch device count');
        }

        const data = await response.json();
        return data.size;
        
    }

    async getNetworkUptime(): Promise<number> {
        const response = await fetch(`${this.baseUrl}/device/getUptimeSystem`, {
            credentials: 'include'
        });

        return parseInt(await response.text());
    }

//pinging and testing tcp connections

    async pingDevice(ipAddress: string) {
        const response = await fetch(`${this.baseUrl}/device/checkDeviceConnectivity/${ipAddress}?type=ping`, {
            credentials: 'include'
        });
        return await response.text();
    }

    async testTcpConnection(ipAddress: string, port: number) {
        const response = await fetch(`${this.baseUrl}/device/checkDeviceConnectivity/${ipAddress}?type=tcp&port=${port}`, {
            credentials: 'include'
        });
        return await response.text();
    }

    async getVendorByIp(ipAddress: string) {
    const response = await fetch(`${this.baseUrl}/device/getVendorByIp?ip=${encodeURIComponent(ipAddress)}`);
      
      if (response.ok) {
        const vendor = await response.text();
        if(vendor === 'UNDEFINED_VENDOR') {
            alert('Vendor məlumatı alına bilmədi');
            return;        
        }
        return vendor;
        
      } else {
        throw new Error('Failed to get vendor');
      }
    }


    //scheduling
    async scheduleBackup(date: {day: number, hour: number, minute: number}) {
        // Send date as ISO string but in local timezone        
        const response = await fetch(`${this.baseUrl}/scheduler/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                day: date.day,
                hour: date.hour,
                minute: date.minute,
                jobName: 'backup'
            }),
            credentials: 'include'
        });
        return response.ok;
    }

    async getScheduledBackups(jobName: string) {
        const response = await fetch(`${this.baseUrl}/scheduler/exists?jobName=${jobName}`, {
            credentials: 'include'
        });
        return await response.text();
    }

    async deleteScheduledBackup(jobName: string) {       
        const response = await fetch(`${this.baseUrl}/scheduler/delete?jobName=${jobName}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    }

    //ansible logs
    async getAnsibleLogs(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/device/obtainAnsibleLog`, {
            credentials: 'include'
        });

        return await response.json();
    }
}
