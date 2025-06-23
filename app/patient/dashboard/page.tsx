'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useState, useEffect } from 'react'
import { getDoctorSchedules } from '@/lib/actions/doctor.actions'
import { getAppointments, getCheckups, getDoctors } from '@/lib/actions/patient.actions'
import { ScheduleCreateForm } from '@/components/forms/ScheduleCreateForm'
import { AppointmentCreateForm } from '@/components/forms/AppointmentCreationForm'
import { ClipLoader } from 'react-spinners'
import { CheckupType } from '@/components/custom/columns'
import { DataTable } from "@/components/custom/data-table"
import { CheckupsColumns } from '@/components/custom/columns'
import { PatientAppointmentColumns } from '@/components/custom/columns'
import { RectangleEllipsis } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import Checkups from '@/components/custom/Checkups'
import LabTests from '@/components/custom/LabTests'

export interface doctorInterface {
    id: any;
    full_name: string;
}

export interface PatientAppointmentInterface {
    appointment_date: string;   // Appointment date (could be Date if you're using Date objects)
    status: string;             // Appointment status (e.g., 'Pending', 'Confirmed')
    reason: string;             // Reason for the appointment
    doctor_full_name: string;   // Full name of the doctor (concatenated first_name and last_name)
    start_time: string;         // Start time of the appointment (could be Date if you're using Date objects)
    end_time: string;           // End time of the appointment (
}


const PatientDashboard = () => {
    const [appointments, setAppointments] = useState<PatientAppointmentInterface[]>([])
    const [checkups, setCheckups] = useState<CheckupType[]>([])
    const [newAppointmentCreated, setNewAppointmentCreated] = useState(0)
    const [patientTabSelected, setPatientTabSelected] = useState(() => {
        const tab = localStorage.getItem('patientTabSelected')
        return tab ?? 'appointments'
    })
    const { toast } = useToast()

    function alertNewAppointment() {
        toast({
            title: "Created",
            description: "The new appointment has been created successfully.",
        })
        setNewAppointmentCreated((newAppointmentCreated) => newAppointmentCreated + 1)
    }

    // useEffect(() => {
    //     async function loadCheckups() {
    //         console.log('loading checkups')
    //         const __checkups = await getCheckups(undefined)
    //         setCheckups(__checkups || [])
    //     }

    //     loadCheckups()
    // }, [])

    useEffect(() => {
        async function loadAppointments() {
            console.log('loading appointments')
            setAppointments([])
            const __appointments = await getAppointments()
            setAppointments(__appointments)
        }

        loadAppointments()
    }, [newAppointmentCreated])

    useEffect(() => {
        localStorage.setItem('patientTabSelected', patientTabSelected)
    }, [patientTabSelected])

    return (
        <section className="w-screen h-dvh p-6 flex justify-center">
            <div className="space-y-10 w-full flex flex-col items-start">
                <div className="flex w-full justify-between">
                    <h1 className="font-bold text-3xl text-center">
                        Dashboard
                    </h1>
                    <p>Welcome, Mr. Patient</p>
                </div>
                <Tabs defaultValue={patientTabSelected} onValueChange={setPatientTabSelected} className='w-full h-[90%] flex flex-col'>
                    <TabsList className="w-fit min-h-8 gap-4 justify-start group">
                        <RectangleEllipsis className='h-7 font-bold text-neutral-500 group-hover:text-neutral-900 hover:bg-none bg-neutral-100 py-1 w-12 rounded-md' />
                        <TabsTrigger value="appointments" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Appointments</TabsTrigger>
                        <TabsTrigger value="checkups" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Checkups</TabsTrigger>
                        <TabsTrigger value="labtests" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Lab Tests</TabsTrigger>
                        <TabsTrigger value="settings" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="appointments">
                        <div className="m-2">
                            <h1 className='font-bold text-xl'>Appointments</h1>
                            <p className='text-gray-600 text-sm'>Here you can view existing and create new appointments. <span className='underline cursor-pointer' onClick={() => setNewAppointmentCreated(prev => prev + 1)}>Refresh</span></p>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <ScrollArea className='lg:h-[30rem] rounded-sm p-2 pr-3 flex flex-col gap-2 select-none'>
                                {appointments.length ? (
                                    <DataTable data={appointments} columns={PatientAppointmentColumns} />
                                ) : (
                                    <ClipLoader
                                        color='black'
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                        className="m-3"
                                    />
                                )}
                                {/* <Button variant='default' className='w-full'>View Schedules</Button> */}
                            </ScrollArea>
                            <div>
                                <AppointmentCreateForm alertNewAppointment={alertNewAppointment} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="checkups">
                        <div className="m-2">
                            <h1 className='font-bold text-xl'>Checkups</h1>
                            <p className='text-gray-600 text-sm'>Here you can see your checkup history.</p>
                        </div>
                        <div>
                            <div className='lg:h-[30rem] rounded-sm p-2 flex flex-col gap-2'>
                                {/* {checkups.length ? (
                                    <DataTable data={checkups} columns={CheckupsColumns} />
                                ) : (
                                    <ClipLoader
                                        color='black'
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                        className="m-3"
                                    />
                                )} */}
                                <Checkups />
                                {/* <Button variant='default' className='w-full'>View Schedules</Button> */}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="labtests">
                        <div className="m-2">
                            <h1 className='font-bold text-xl'>Lab Tests</h1>
                            <p className='text-gray-600 text-sm'>Here you can see your lab test history.</p>
                        </div>
                        <div>
                            <div className='lg:h-[30rem] rounded-sm p-2 flex flex-col gap-2'>
                                {/* {checkups.length ? (
                                    <DataTable data={checkups} columns={CheckupsColumns} />
                                ) : (
                                    <ClipLoader
                                        color='black'
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                        className="m-3"
                                    />
                                )} */}
                                <LabTests />
                                {/* <Button variant='default' className='w-full'>View Schedules</Button> */}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="settings">

                    </TabsContent>
                </Tabs>

            </div>
        </section>
    )
}

export default PatientDashboard