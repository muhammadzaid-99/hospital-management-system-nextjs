'use client'
import React, { useState, useEffect } from 'react'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { ScheduleCreateForm } from '@/components/forms/ScheduleCreateForm'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Schedules from './components/Schedules'
import Appointments from './components/Appointments'
import { Separator } from '@/components/ui/separator'

export type AppointmentStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Postponed' | 'Confirmed';

export const statusColors: Record<AppointmentStatus, string> = {
    Pending: "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 hover:bg-opacity-70",
    Completed: "bg-green-100 hover:bg-green-100 text-green-800 hover:bg-opacity-70",
    Cancelled: "bg-red-100 hover:bg-red-100 text-red-800 hover:bg-opacity-70",
    Postponed: "bg-sky-100 hover:bg-sky-100 text-sky-800 hover:bg-opacity-70",
    Confirmed: "bg-blue-100 hover:bg-blue-100 text-blue-800 hover:bg-opacity-70",
};

export interface scheduleInterface {
    id: string,
    expected_patients: any;
    from_time: any;
    to_time: any;
    booked_slots_count: any;
}

export interface DoctorAppointmentInterface {
    appointment_id: string;     // Appointment ID
    appointment_date: string;   // Appointment date (could be Date if you're using Date objects)
    status: string;             // Appointment status (e.g., 'Pending', 'Confirmed')
    reason: string;             // Reason for the appointment
    patient_full_name: string;   // Full name of the doctor (concatenated first_name and last_name)
    allergies: string;          // Allergies of the patient
    medical_history: string;    // Medical history of the patient
    family_history: string;     // Family history of the patient
    disability: string;         // Disability of the patient
    date_of_birth: string;      // Date of birth of the patient
    start_time: string;         // Start time of the appointment
    end_time: string;           // End time of the appointment
    appointment_slot_id: string;
}

export function getDatesForFilter(filter: string) {
    const fromDateStart = new Date();
    const fromDateEnd = new Date();

    switch (filter) {
        case 'all':
            fromDateStart.setDate(fromDateStart.getDate() - 100); // Last 30 days
            fromDateEnd.setFullYear(fromDateEnd.getFullYear() + 1); // Extend far into the future (arbitrary)
            break;

        case 'past':
            fromDateStart.setDate(fromDateStart.getDate() - 30); // Last 30 days
            fromDateEnd.setDate(fromDateEnd.getDate() - 1); // Up until yesterday
            break;

        case 'yesterday':
            fromDateStart.setDate(fromDateStart.getDate() - 1); // Yesterday
            fromDateEnd.setDate(fromDateEnd.getDate() - 1);
            break;

        case 'tomorrow':
            fromDateStart.setDate(fromDateStart.getDate() + 1); // Tomorrow
            fromDateEnd.setDate(fromDateEnd.getDate() + 1);
            break;

        case 'upcoming':
            fromDateStart.setDate(fromDateStart.getDate() + 1); // Start from tomorrow
            fromDateEnd.setFullYear(fromDateEnd.getFullYear() + 1); // Extend far into the future (arbitrary)
            break;

        case 'date':
            // Assume you handle custom date ranges elsewhere or pass `fromDateStart` and `fromDateEnd` as inputs
            throw new Error('Custom date range requires input dates');

        default: // today
            // Both fromDateStart and fromDateEnd are today by default
            break;
    }
    fromDateStart.setHours(0, 0, 0, 0);
    fromDateEnd.setHours(23, 59, 59, 999);

    return { fromDateStart, fromDateEnd }
}


const DoctorDashboardNew = () => {
    const [newScheduleCreated, setNewScheduleCreated] = useState(0);
    const [schedules, setSchedules] = useState<scheduleInterface[]>([]);

    const [doctorTabSelected, setDoctorTabSelected] = useState(() => {
        // return 'schedules'
        const tab = localStorage.getItem('doctorTabSelected')
        return tab ?? 'schedules'
    })

    const [appointmentsFilter, setAppointmentsFilter] = useState<string>(() => {
        // return 'today'
        const appointmentsFilterLS = localStorage.getItem('appointmentsFilter');
        return appointmentsFilterLS ?? 'today';
    });

    const { toast } = useToast();

    function alertNewSchedule() {
        toast({
            title: "Created",
            description: "The schedule has been created successfully.",
        })

        setNewScheduleCreated((newScheduleCreated) => newScheduleCreated + 1)
    }


    useEffect(() => {
        localStorage.setItem('doctorTabSelected', doctorTabSelected)
    }, [doctorTabSelected])


    return (
        <section className="w-screen h-dvh p-6 flex justify-center  ">
            <div className="space-y-4 w-full flex flex-col items-start">
                <div className="flex w-full justify-between">
                    <h1 className="font-bold text-3xl text-center">
                        Dashboard
                    </h1>
                    <p>Welcome, Dr. John Doe</p>
                </div>
                <Tabs defaultValue={doctorTabSelected} onValueChange={setDoctorTabSelected} className='w-full  flex flex-col '>
                    <TabsList className="w-fit min-h-8 gap-4 justify-start">
                        <TabsTrigger value="analytics" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900" disabled>Analytics</TabsTrigger>
                        <TabsTrigger value="schedules" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Schedules</TabsTrigger>
                        <TabsTrigger value="appointments" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Appointments</TabsTrigger>
                        <TabsTrigger value="profile" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900" disabled>Profile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedules" className='min-h-0 flex-1'>
                        <div className="m-2">
                            <h1 className='font-bold text-xl'>Schedules</h1>
                            <p className='text-gray-600 text-sm'>Here you can see your created schedules and make new schedules.</p>
                        </div>
                        <div className='lg:h-[30rem] grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-md mt-4'>

                            {/* Schedule List Section */}
                            <Schedules schedules={schedules} setSchedules={setSchedules} newScheduleCreated={newScheduleCreated} setNewScheduleCreated={setNewScheduleCreated} />

                            {/* Schedule Creation Form Section */}
                            <div className='ring-1 ring-neutral-200 to-transparent p-4 rounded-md shadow-sm'>
                                <h3 className='text-black uppercase font-semibold select-none'>Create New Schedule</h3>
                                <Separator className='my-4' orientation='horizontal' />
                                <ScheduleCreateForm alertNewSchedule={alertNewSchedule} />
                            </div>
                        </div>

                        {/* </Card> */}
                    </TabsContent>
                    <TabsContent value="appointments" className='min-h-0 flex-1'>
                        <div className="m-2 flex w-full justify-between">
                            <div>
                                <h1 className='font-bold text-xl'>Appointments</h1>
                                <p className='text-gray-600 text-sm'>Click on an appointment to offer a service.</p>

                            </div>
                            <div className='mr-4'>
                                <Select defaultValue={appointmentsFilter} onValueChange={(val) => setAppointmentsFilter(val)} >
                                    <SelectTrigger className="w-fit hover:text-black">
                                        <SelectValue placeholder="Filter" />
                                        <Filter className='ml-2 h-4' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All </SelectItem>
                                        <SelectItem value="past">Last 30 days</SelectItem>
                                        <SelectItem value="yesterday">Yesterday</SelectItem>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                        <SelectItem value="upcoming">Upcoming</SelectItem>
                                        {/* <SelectItem value="date">Custom Date</SelectItem> */}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='flex gap-4 flex-1 min-h-0'>
                            <Appointments appointmentsFilter={appointmentsFilter} />
                        </div>

                    </TabsContent>
                    <TabsContent value="profile" className='min-h-0 flex-1'>
                        <div className="m-2">
                            <h1 className='font-bold text-xl'>Profile</h1>
                            <p className='text-gray-600 text-sm'>Here you can manage your profile.</p>
                        </div>
                        <div className='h-[28rem] grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-md mt-4'>

                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    )
}

export default DoctorDashboardNew