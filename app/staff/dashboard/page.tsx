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
import LabTestRequests from './components/LabTestRequests'
import MyLabTests from './components/MyLabTests'



const StaffDashboard = () => {

  const [staffTabSelected, setStaffTabSelected] = useState(() => {
    const tab = localStorage.getItem('staffTabSelected')
    return tab ?? 'labtests'
  })
  const { toast } = useToast()

  return (
    <section className="w-screen h-dvh p-6 flex justify-center">
      <div className="space-y-10 w-full flex flex-col items-start">
        <div className="flex w-full justify-between">
          <h1 className="font-bold text-3xl text-center">
            Dashboard
          </h1>
          <p>Welcome, Mr. James</p>
        </div>
        <Tabs defaultValue={staffTabSelected} onValueChange={setStaffTabSelected} className='w-full h-[90%] flex flex-col'>
          <TabsList className="w-fit min-h-8 gap-4 justify-start group">
            <RectangleEllipsis className='h-7 font-bold text-neutral-500 group-hover:text-neutral-900 hover:bg-none bg-neutral-100 py-1 w-12 rounded-md' />
            <TabsTrigger value="labtests" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Lab Tests</TabsTrigger>
            <TabsTrigger value="labtestrequests" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Requests</TabsTrigger>
            <TabsTrigger value="settings" className="h-full px-6 data-[state=active]:text-white data-[state=active]:bg-neutral-900">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="labtests">
            <div className="m-2">
              <h1 className='font-bold text-xl'>My Lab Tests</h1>
              <p className='text-gray-600 text-sm'>Here you can see your lab test history.</p>
            </div>
            <div>
              <div className='lg:h-[30rem] rounded-sm p-2 flex flex-col gap-2'>
                <MyLabTests />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="labtestrequests">
            <div className="m-2">
              <h1 className='font-bold text-xl'>Lab Tests Requests</h1>
              <p className='text-gray-600 text-sm'>Here you can see lab tests requested by patients.</p>
            </div>
            <div>
              <div className='lg:h-[30rem] rounded-sm p-2 flex flex-col gap-2'>
                <LabTestRequests />
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

export default StaffDashboard