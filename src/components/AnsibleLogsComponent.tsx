import { useEffect, useState } from "react";
import { HttpClient } from "../net/HttpClient";
import Ansi from "ansi-to-react";


export default function AnsibleLogsComponent() {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const httpClient = new HttpClient();
        httpClient.getAnsibleLogs().then((logs) => {
            setLogs(logs);
        });
    }, []);


    return (
        <div>
            <h1 className="text-2xl font-bold text-center items-center italic mb-4">Ansible Logs</h1>
            {logs.length > 0 ? logs.map((log, idx) => (
                <div key={idx}>
                    <Ansi>{log}</Ansi>
                </div>
            )) : <div>No logs found</div>}
        </div>
    )
}