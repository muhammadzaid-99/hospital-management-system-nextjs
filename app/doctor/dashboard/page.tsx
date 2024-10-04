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
import { ScheduleCreateForm } from '@/components/forms/ScheduleCreateForm'

interface scheduleInterface {
    expected_patients: any;
    from_time: any;
    to_time: any;
}

const DoctorDashboard = () => {

    const [schedules, setSchedules] = useState<scheduleInterface[]>([])

    useEffect(() => {
        async function loadData() {
            const __schedules = await getDoctorSchedules()
            setSchedules(__schedules)
        }

        loadData()
    }, [])

    return (
        <section className="w-screen h-dvh p-6 flex justify-center">
            <div className="space-y-10 w-full flex flex-col items-start">
                <h1 className="font-bold text-xl text-center">
                    Doctor's Dashboard
                </h1>
                <Card className="w-full h-full">
                    <Tabs defaultValue="schedules" >
                        <TabsList className="w-full h-12 rounded-b-none gap-4 bg-neutral-800 justify-start">
                            <TabsTrigger value="schedules" className="h-full data-[state=active]:bg-transparent data-[state=active]:font-bold">Schedules</TabsTrigger>
                            <TabsTrigger value="appointments" className="h-full data-[state=active]:bg-transparent data-[state=active]:font-bold">Appointments</TabsTrigger>
                        </TabsList>
                        <TabsContent value="schedules">
                            <CardHeader>
                                <CardTitle>Schedules</CardTitle>
                                <CardDescription>Here you can see your created schedules and make new schedules.</CardDescription>
                            </CardHeader>
                            <CardContent className='grid grid-cols-2 gap-4'>
                                <div className='bg-neutral-800 rounded-sm p-2 flex flex-col gap-2'>
                                    {schedules?.map((schedule, index) => {
                                        const fullDate = new Date(schedule.from_time)
                                        const formattedDate = fullDate.getDate().toString() + "-" + fullDate.getMonth().toString() + "-" + fullDate.getFullYear().toString()
                                        const fromTimeFormatted = fullDate.getHours().toString() + ":" + fullDate.getMinutes().toString()
                                        const toTime = new Date(schedule.to_time)
                                        const toTimeFormatted = toTime.getHours().toString() + ":" + toTime.getMinutes().toString()
                                        return (
                                            <div key={index} className='flex gap-6'>
                                                <p>{index + 1}</p>
                                                <p>Expected Patients: {schedule.expected_patients}</p>
                                                <p>Date: {formattedDate}</p>
                                                <p>Time: {fromTimeFormatted} to {toTimeFormatted}</p>
                                            </div>
                                        )
                                    })}
                                    {/* <Button variant='default' className='w-full'>View Schedules</Button> */}
                                </div>
                                <div>
                                    <ScheduleCreateForm />
                                </div>
                            </CardContent>
                        </TabsContent>
                        <TabsContent value="appointments">
                            <CardHeader>
                                <CardTitle>Appointments</CardTitle>
                                {/* <CardDescription>Card Description</CardDescription> */}
                            </CardHeader>
                            <CardContent>

                            </CardContent>
                            <CardContent>

                            </CardContent>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </section>
    )
}

export default DoctorDashboard