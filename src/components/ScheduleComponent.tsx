import React, { useEffect } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Select, SelectItem, TimeInput, TimeInputValue } from "@heroui/react";
import { now, getLocalTimeZone } from "@internationalized/date";
import { HttpClient } from "../net/HttpClient";

export const ScheduleComponent: React.FC = () => {
    let [selectedDay, setSelectedDay] = React.useState<number>(0);
    let [timeValue, setTimeValue] = React.useState<TimeInputValue | null>(now(getLocalTimeZone()));

    let [date, setDate] = React.useState<{
        day: number;
        hour: number;
        minute: number;
    }>();

    let [scheduledBackups, setScheduledBackups] = React.useState<string>("");

    // // Update date display whenever selectedDay or timeValue changes
    useEffect(() => {
        if (selectedDay && timeValue) {
            // Get the next occurrence of the selected day of week
            setDate({
                day: selectedDay,
                hour: timeValue.hour,
                minute: timeValue.minute
            });
        }
    }, [selectedDay, timeValue]);


    const getScheduledBackups = async () => {
        const scheduledBackup = await new HttpClient().getScheduledBackups('backup');
        setScheduledBackups(scheduledBackup);
    }

    useEffect(() => {
        getScheduledBackups();
    }, []);

    const deleteScheduledBackup = async (jobName: string) => {
        new HttpClient().deleteScheduledBackup(jobName).then(res => {
            if (res) {
                alert("Backup planı silindi");
            } else {
                alert("Backup planı silinmək mümkün deyil");
            }
        });
        setScheduledBackups("");
    }

        const handleSubmit = () => {
            if (date) {
                console.log(date);
                new HttpClient().scheduleBackup(date).then(res => {
                    if (res) {
                        alert("Backup planlandı");
                    } else {
                        alert("Backup planlaması mümkün deyil");
                    }
                });

            }
        }

        return (
            <div className="space-y-6 p-6">
                {/* Main Scheduling Card */}
                <Card className="dashboard-card shadow-lg border-2 border-blue-100 hover:border-blue-200 transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <h2 className="text-xl font-bold">Backup Planlaması</h2>
                        <p className="text-blue-100 text-sm">Tarix və vaxt seçin</p>
                    </CardHeader>
                    <CardBody className="flex flex-col lg:flex-row gap-6 justify-center items-start p-6">
                        <div className="flex-1">
                            <Select
                                placeholder="Gün seçin"
                                selectedKeys={[selectedDay]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as number;
                                    setSelectedDay(selected);
                                }}
                                classNames={{
                                    base: "w-full",
                                    trigger: "border-2 border-gray-200 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors",
                                    label: "text-gray-700 font-medium"
                                }}
                            >
                                <SelectItem key="1">Bazar günü</SelectItem>
                                <SelectItem key="2">Bazar ertəsi</SelectItem>
                                <SelectItem key="3">Çərşənbə axşamı</SelectItem>
                                <SelectItem key="4">Çərşənbə</SelectItem>
                                <SelectItem key="5">Cümə axşamı</SelectItem>
                                <SelectItem key="6">Cümə</SelectItem>
                                <SelectItem key="7">Şənbə</SelectItem>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <TimeInput 
                                isRequired 
                                label="Vaxt" 
                                value={timeValue}
                                onChange={setTimeValue} 
                                hourCycle={24}
                                classNames={{
                                    base: "w-full",
                                    input: "border-2 border-gray-200 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors text-lg py-3",
                                    label: "text-gray-700 font-medium"
                                }}
                            />
                        </div>
                    </CardBody>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gray-50">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm text-gray-600 font-medium">
                             
                            </p>
                        </div>
                        <Button 
                            onPress={handleSubmit}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            size="lg"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Təsdiq Et
                        </Button>
                    </CardFooter>
                </Card>

                <Divider className="my-8"/>

                {/* Active Plans Card */}
                <Card className="dashboard-card shadow-lg border-2 border-orange-100 hover:border-orange-200 transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                        <h2 className="text-xl font-bold">Aktiv Planlar</h2>
                        <p className="text-orange-100 text-sm">Mövcud backup planları</p>
                    </CardHeader>
                    {scheduledBackups !== "" ? (
                        <CardBody className="p-6">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-yellow-800 font-medium">Aktiv Backup Planı</p>
                                            <p className="text-yellow-700 text-sm">{scheduledBackups}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onPress={() => deleteScheduledBackup('backup')}
                                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                        size="sm"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Sil
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    ) : (
                        <CardBody className="p-6">
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500 text-lg font-medium">Aktiv plan yoxdur</p>
                                <p className="text-gray-400 text-sm">Yeni backup planı yaradın</p>
                            </div>
                        </CardBody>
                    )}
                </Card>
            </div> 
        )

    }