import type { Device, DeviceResponseDTO } from "../data/dtoInterfaces";

export class HttpClient {
    private baseUrl: string = 'http://localhost:8080';


    async checkAuth() {
        const response = await fetch(`${this.baseUrl}/check`, {
            credentials: 'include'
        });
        return response.ok;
    }

    async logout() {
        const response = await fetch(`${this.baseUrl}/logout`, {
            credentials: 'include'
        });
       
        return response.ok;
    }

    
    async authenticate(username: string, password: string) {
        
        const response = await fetch(`${this.baseUrl}/login`, {
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
    // ================================




    async uploadDevice(device: Device) {
        const response = await fetch(`${this.baseUrl}/uploadDevice`, {
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

    async getDevices(id?: number, page: number = 1) {

        const endpoint = id ? `${this.baseUrl}/getDevices?id=${id}`
         : page ? `${this.baseUrl}/getDevices?page=${page}` : `${this.baseUrl}/getDevices`;

        const response = await fetch(endpoint, {
            credentials: 'include'
        });
        if (response.ok) {
            return await response.json();
        } else {
            return await response.text();
        }
    }

    async getDeviceCount(): Promise<number> {
        const response = await fetch(`${this.baseUrl}/getDataSize`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch device count');
        }

        const data = await response.json();
        return data.size;
        
    }

    async getNetworkUptime(): Promise<number> {
        const response = await fetch(`${this.baseUrl}/getUptimeSystem`, {
            credentials: 'include'
        });

        return parseInt(await response.text());
    }

}
