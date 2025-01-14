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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useState, useEffect } from 'react'
import { deleteSchedule, getDoctorAppointments, getDoctorSchedules, updateAppointmentStatus } from '@/lib/actions/doctor.actions'
import { ScheduleCreateForm } from '@/components/forms/ScheduleCreateForm'
import { ClipLoader } from 'react-spinners'
import { format, set } from 'date-fns'
import DoctorCheckupForm from '@/components/forms/DoctorCheckupForm'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



import { Badge } from "@/components/ui/badge"
import { DateTimePicker } from '@/components/custom/DateTimePicker'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Separator } from "@/components/ui/separator"
import { TrashIcon } from '@radix-ui/react-icons'
import { ChevronDown, ChevronsDown, ChevronUp } from 'lucide-react'
import { Filter } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'

// this is not working
// import { statusColors, AppointmentStatus } from '@/lib/constants/badge-colors'

export type AppointmentStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Postponed' | 'Confirmed';

export const statusColors: Record<AppointmentStatus, string> = {
    Pending: "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 hover:bg-opacity-70",
    Completed: "bg-green-100 hover:bg-green-100 text-green-800 hover:bg-opacity-70",
    Cancelled: "bg-red-100 hover:bg-red-100 text-red-800 hover:bg-opacity-70",
    Postponed: "bg-sky-100 hover:bg-sky-100 text-sky-800 hover:bg-opacity-70",
    Confirmed: "bg-blue-100 hover:bg-blue-100 text-blue-800 hover:bg-opacity-70",
};

interface scheduleInterface {
    id: string,
    expected_patients: any;
    from_time: any;
    to_time: any;
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
}


const DoctorDashboard = () => {

    const [schedules, setSchedules] = useState<scheduleInterface[]>([]);
    const [appointments, setAppointments] = useState<DoctorAppointmentInterface[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentInterface>();
    const [newScheduleCreated, setNewScheduleCreated] = useState(0);
    const [appointmentActionDate, setAppointmentActionDate] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [scheduleFilter, setScheduleFilter] = useState<string>(() => {
        return 'today'
        const scheduleFilterLS = localStorage.getItem('scheduleFilter');
        return scheduleFilterLS ?? 'today';
    });
    const [appointmentsFilter, setAppointmentsFilter] = useState<string>(() => {
        return 'today'
        const appointmentsFilterLS = localStorage.getItem('appointmentsFilter');
        return appointmentsFilterLS ?? 'today';
    });
    const [showEndTime, setShowEndTime] = useState(() => {
        return false
        const showEndTimeLS = localStorage.getItem('showEndTime');
        return showEndTimeLS === 'true';
    })
    const [doctorTabSelected, setDoctorTabSelected] = useState(() => {
        return 'schedules'
        const tab = localStorage.getItem('doctorTabSelected')
        return tab ?? 'schedules'
    })
    // const [patientDetails, setPatientDetails] = useState<any>(undefined);
    const { toast } = useToast();

    async function handleConfirmAppointmentClick() {
        setIsSubmitting(true);
        console.log('Confirming appointment...')
        if (appointmentActionDate != undefined && selectedAppointment) {
            const updatedAppointment = { id: selectedAppointment.appointment_id, status: 'Confirmed', appointment_date: appointmentActionDate.toISOString() }
            const res = await updateAppointmentStatus(updatedAppointment)
            if (res) {
                toast({
                    title: "Confirmed",
                    description: `The appointment has been confirmed for ${appointmentActionDate.toLocaleString()}.`,
                })
                setSelectedAppointment(undefined)
            } else {
                toast({
                    title: "Error",
                    description: "An error occurred while confirming the appointment.",
                })
            }
        } else {
            toast({
                title: "Error",
                description: "Please select a date and time for the appointment.",
            })
        }
        setAppointmentActionDate(null)
        setIsSubmitting(false);
    }

    async function handleCancelAppoitmentClick() {
        setIsSubmitting(true);
        console.log('Cancelling appointment...')
        if (selectedAppointment) {
            const updatedAppointment = { id: selectedAppointment.appointment_id, status: 'Cancelled', appointment_date: selectedAppointment.appointment_date }
            const res = await updateAppointmentStatus(updatedAppointment)
            if (res) {
                toast({
                    title: "Cancelled",
                    description: "The appointment has been cancelled successfully.",
                })
                setSelectedAppointment(undefined)

            } else {
                toast({
                    title: "Error",
                    description: "An error occurred while cancelling the appointment.",
                })
            }
        }
        setIsSubmitting(false);
    }

    async function handlePostponeAppointmentClick() {
        setIsSubmitting(true)
        console.log("Postponing appointment...")
        if (selectedAppointment && selectedAppointment.status === 'Confirmed') {
            const updatedAppointment = { id: selectedAppointment.appointment_id, status: 'Postponed', appointment_date: selectedAppointment.appointment_date }
            const res = await updateAppointmentStatus(updatedAppointment)
            if (res) {
                toast({
                    title: "Postponed",
                    description: "The appointment has been postponed successfully.",
                })
                setSelectedAppointment(undefined)

            } else {
                toast({
                    title: "Error",
                    description: "An error occurred while postponing the appointment.",
                })
            }
        }
        setIsSubmitting(false);
    }

    async function handleDeleteScheduleButtonClick(schedule_id: string) {
        setIsSubmitting(true)
        console.log('Deleting schedule...')
        const deletedSchedule = await deleteSchedule(schedule_id)

        if (deletedSchedule) {
            toast({
                title: "Deleted",
                description: "The schedule has been deleted successfully.",
            })

            setNewScheduleCreated((newScheduleCreated) => newScheduleCreated - 1)
        } else {
            toast({
                title: "Error",
                description: "An error occurred while deleting the schedule.",
            })
        }
        setIsSubmitting(false)
    }

    function alertNewSchedule() {
        toast({
            title: "Created",
            description: "The schedule has been created successfully.",
        })

        setNewScheduleCreated((newScheduleCreated) => newScheduleCreated + 1)
    }

    function handleAppointmentClick(appointment: DoctorAppointmentInterface) {
        setSelectedAppointment(appointment)
    }

    function getDatesForFilter(filter: string) {
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

    useEffect(() => {
        localStorage.setItem('showEndTime', showEndTime.toString());
    }, [showEndTime]);

    useEffect(() => {
        localStorage.setItem('doctorTabSelected', doctorTabSelected)
    }, [doctorTabSelected])

    useEffect(() => {
        async function loadAppointments() {
            if (isSubmitting) return;
            setIsSearching(true)
            setAppointments([])
            const { fromDateStart, fromDateEnd } = getDatesForFilter(appointmentsFilter)
            const __appointments = await getDoctorAppointments(fromDateStart, fromDateEnd)
            console.log(__appointments)
            setAppointments(__appointments)
            setIsSearching(false)
        }

        loadAppointments()
        localStorage.setItem('appointmentsFilter', appointmentsFilter.toString())
    }, [isSubmitting, appointmentsFilter])

    useEffect(() => {
        async function loadData() {
            setSchedules([])
            setIsSearching(true)
            const { fromDateStart, fromDateEnd } = getDatesForFilter(scheduleFilter)
            console.log(fromDateStart, fromDateEnd)
            const __schedules = await getDoctorSchedules(fromDateStart, fromDateEnd)
            setSchedules(__schedules)
            setIsSearching(false)
        }

        loadData()
        localStorage.setItem('scheduleFilter', scheduleFilter.toString())
    }, [newScheduleCreated, scheduleFilter])


    const groupedAppointments = appointments.reduce<Record<string, DoctorAppointmentInterface[]>>((acc, app) => {
        if (!acc[app.status]) acc[app.status] = [];
        acc[app.status].push(app);
        return acc;
    }, {});


    return (
        <section className="w-screen h-dvh p-6 flex justify-center  ">
            <div className="space-y-10 w-full flex flex-col items-start">
                <div className="flex w-full justify-between">
                    <h1 className="font-bold text-3xl text-center">
                        Dashboard
                    </h1>
                    <p>Welcome, Dr. John Doe</p>
                </div>
                <Tabs defaultValue={doctorTabSelected} onValueChange={setDoctorTabSelected} className='w-full h-[90%] flex flex-col '>
                    <TabsList className="w-full min-h-12 gap-4 justify-start">
                        <TabsTrigger value="schedules" className="h-full px-6">Schedules</TabsTrigger>
                        <TabsTrigger value="appointments" className="h-full px-6">Appointments</TabsTrigger>
                        <TabsTrigger value="profile" className="h-full px-6">Profile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="schedules" className='min-h-0 flex-1'>
                        <div className="m-2">
                            <h1 className='font-bold text-xl'>Schedules</h1>
                            <p className='text-gray-600 text-sm'>Here you can see your created schedules and make new schedules.</p>
                        </div>
                        <div className='h-[28rem] grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-md mt-4'>
                            <ScrollArea className='pr-4'>
                                <div className='flex flex-col gap-4'>
                                    <div className='flex w-full justify-between items-center text-neutral-600 p-2 text-sm'>
                                        <Select defaultValue={scheduleFilter} onValueChange={(val) => setScheduleFilter(val)}>
                                            <SelectTrigger className="w-fit hover:text-black">
                                                <SelectValue placeholder="Filter" />
                                                <Filter className='ml-2 h-4' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All (3 Months Recent)</SelectItem>
                                                <SelectItem value="past">Last 30 days</SelectItem>
                                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                                <SelectItem value="today">Today</SelectItem>
                                                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                {/* <SelectItem value="date">Custom Date</SelectItem> */}
                                            </SelectContent>
                                        </Select>
                                        <div className='flex items-center gap-2'>
                                            <Label>Show End Time</Label>
                                            <Switch
                                                checked={showEndTime}
                                                onCheckedChange={setShowEndTime}
                                            />
                                        </div>
                                    </div>
                                    {schedules.length ? (
                                        schedules.map((schedule, index) => {
                                            const offset = new Date().getTimezoneOffset();  // minutes
                                            const fullDate = new Date(schedule.from_time);
                                            fullDate.setUTCMinutes(fullDate.getUTCMinutes() - offset);
                                            const formattedDate = `${fullDate.getDate()}-${fullDate.getMonth() + 1}-${fullDate.getFullYear()}`;
                                            const fromTimeFormatted = `${fullDate.getHours().toString().padStart(2, '0')}:${fullDate.getMinutes().toString().padStart(2, '0')}`;
                                            const toDate = new Date(schedule.to_time);
                                            toDate.setUTCMinutes(toDate.getUTCMinutes() - offset);
                                            const toTimeFormatted = `${toDate.getHours().toString().padStart(2, '0')}:${toDate.getMinutes().toString().padStart(2, '0')}`;
                                            const durationMs = toDate.getTime() - fullDate.getTime();
                                            const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                                            const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                                            return (
                                                <Card key={index} className='p-4 rounded-lg flex flex-col gap-2 shadow-sm group/schedule_card'>
                                                    <div className='flex justify-between items-center'>
                                                        <p className='font-semibold text-black'>{fullDate.toDateString()} </p>
                                                        <Badge variant='secondary' className='text-sm bg-neutral-100 text-neutral-900 hover:bg-neutral-200 select-none transition-colors'>
                                                            {durationHours != 0 ? durationHours + ' hr' : ''} {durationMinutes != 0 ? durationMinutes + ' min' : ''}
                                                        </Badge>

                                                    </div>
                                                    <Separator className='my-2' />
                                                    <div className='flex w-full justify-between items-center'>
                                                        <div className='text-black flex gap-6'>
                                                            <p className='flex gap-3 items-start flex-col'>
                                                                <span className='text-neutral-600 w-32 text-xs'>Patients Expected</span>
                                                                <span className='font-medium text-xl'>{schedule.expected_patients < 10 && '0'}{schedule.expected_patients}</span>
                                                            </p>

                                                            <p className='flex gap-3 items-start flex-col'>
                                                                <span className='text-neutral-600 text-xs w-32'>Start Time</span>
                                                                <span className='font-medium text-lg'>{fullDate.toLocaleTimeString()}</span>
                                                            </p>
                                                            {showEndTime && (
                                                                <p className='flex gap-3 items-start flex-col'>
                                                                    <span className='text-neutral-600 text-xs w-32'>End Time</span>
                                                                    {durationHours > 23 ? (
                                                                        <span className='font-medium text-lg'> {toDate.toLocaleString()}</span>
                                                                    ) : (
                                                                        <span className='font-medium text-lg'> {toDate.toLocaleTimeString()}</span>
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="secondary" className='hover:bg-red-200 hover:bg-opacity-20 hover:text-red-800 self-end disabled:opacity-0 opacity-0 group-hover/schedule_card:opacity-100 transition-all duration-300 group/button w-12 hover:w-24'  disabled={isSubmitting}>
                                                                    <TrashIcon className='inline-block group-hover/button:hidden' />
                                                                    <span className='ml-2 hidden group-hover/button:inline-block'>Delete</span>
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Confirm Schedule Deletion?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete this schedule for {fullDate.toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} and cancel all associated appointments. 
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction className=' hover:bg-red-600' onClick={() => handleDeleteScheduleButtonClick(schedule.id)} disabled={isSubmitting}>Continue</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </Card>
                                            );
                                        })
                                    ) : (isSearching ? (
                                        <ClipLoader color='black' aria-label='Loading Spinner' data-testid='loader' className='m-3' />
                                    ) : (
                                        <p className='m-3'>
                                            No schedules found for the selected filter.
                                        </p>
                                    )
                                    )}
                                </div>
                            </ScrollArea>
                            {/* Schedule List Section */}

                            {/* Schedule Creation Form Section */}
                            <div className=' ring-1 ring-neutral-200 to-transparent p-4 rounded-md shadow-sm'>
                                <h3 className='text-black uppercase font-semibold mb-4'>Create New Schedule</h3>
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
                            <ScrollArea className="w-full">
                                <div className="rounded-sm p-2 flex flex-col gap-4">
                                    {Object.keys(groupedAppointments).length ? (
                                        <Accordion type="single" collapsible>
                                            {Object.entries(groupedAppointments).map(([status, apps]) => (
                                                <AccordionItem key={status} value={`status-${status}`}>
                                                    <AccordionTrigger style={{ textDecoration: 'none' }} className="flex gap-4 items-center cursor-pointer hover:bg-neutral-100 rounded-sm p-2 no-underline ">
                                                        <div className='flex gap-10 items-center'>
                                                            <div className='w-12'>
                                                                <Badge className={`${statusColors[status as AppointmentStatus] || ''} text-md`}>
                                                                    {apps.length}
                                                                </Badge>
                                                            </div>
                                                            <span className="font-semibold capitalize text-lg">
                                                                {status}
                                                            </span>
                                                        </div>
                                                    </AccordionTrigger>

                                                    <AccordionContent className='flex gap-4 m-2 p-2'>
                                                        {apps.map((app) => {
                                                            const fullDate = new Date(app.appointment_date);
                                                            const formattedDate = `${fullDate.getDate()}-${fullDate.getMonth() + 1}-${fullDate.getFullYear()}`;
                                                            const formattedTime = `${fullDate.getHours()}:${fullDate.getMinutes()}`;

                                                            return (
                                                                <Dialog key={app.appointment_id} open={selectedAppointment === app} onOpenChange={(open) => !open && setSelectedAppointment(undefined)} modal={false}>
                                                                    <DialogTrigger asChild>
                                                                        <Card
                                                                            className="flex gap-4 cursor-pointer hover:opacity-50 p-3 rounded-md"
                                                                            onClick={() => { setPatientDetailsOpen(false); handleAppointmentClick(app); }}
                                                                        >
                                                                            <span>{app.patient_full_name}</span>
                                                                            <span>{fullDate.toDateString()}</span>
                                                                            {['Confirm', 'Completed'].includes(app.status) && fullDate.toLocaleTimeString()}
                                                                            {/* <span>{fullDate.toLocaleTimeString()}</span> */}
                                                                        </Card>
                                                                    </DialogTrigger>

                                                                    {selectedAppointment && (
                                                                        <DialogContent className="min-h-0 max-h-[36rem] min-w-[48rem] overflow-auto">
                                                                            <DialogHeader>
                                                                                <DialogTitle>Appointment Details</DialogTitle>
                                                                                <DialogDescription className="flex gap-2">
                                                                                    {/* <span>{selectedAppointment.patient_full_name}</span> */}
                                                                                    {/* <span>{formattedDate}</span> */}
                                                                                    {/* <span>{formattedTime}</span> */}
                                                                                    <span>{fullDate.toDateString()}{['Confirm', 'Completed'].includes(selectedAppointment.status) && ' @ ' + fullDate.toLocaleTimeString()} </span>
                                                                                    <span>{selectedAppointment.status}</span>
                                                                                </DialogDescription>
                                                                            </DialogHeader>

                                                                            <ScrollArea className='max-h-[28rem]'>
                                                                                <div className='flex flex-col gap-2'>
                                                                                    <Collapsible open={patientDetailsOpen} onOpenChange={setPatientDetailsOpen}>
                                                                                        <CollapsibleTrigger className='flex gap-2'>
                                                                                            <p className="font-bold">Patient Details </p>
                                                                                            {patientDetailsOpen ? <ChevronUp /> : <ChevronDown />}
                                                                                        </CollapsibleTrigger>
                                                                                        <CollapsibleContent className='bg-neutral-100 p-2 rounded-lg text-sm my-2'>
                                                                                            <p className="flex font-semibold"><span className="w-32  font-normal">Name</span> {selectedAppointment.patient_full_name}</p>
                                                                                            <p className="flex font-semibold"><span className="w-32  font-normal">Reason</span> {selectedAppointment.reason}</p>
                                                                                            <p className="flex mt-2"><span className="w-32  font-normal">Allergies</span> {selectedAppointment.allergies}</p>
                                                                                            <p className="flex"><span className="w-32  font-normal">Medical History</span> {selectedAppointment.medical_history}</p>
                                                                                            <p className="flex"><span className="w-32  font-normal">Family History</span> {selectedAppointment.family_history}</p>
                                                                                            <p className="flex"><span className="w-32  font-normal">Disability</span> {selectedAppointment.disability}</p>
                                                                                        </CollapsibleContent>
                                                                                    </Collapsible>

                                                                                    {selectedAppointment.status === 'Completed' && (
                                                                                        <div>
                                                                                            {/* Content for completed appointments */}
                                                                                            <p>Your appointment was completed successfully.</p>
                                                                                        </div>
                                                                                    )}
                                                                                    {['Pending', 'Postponed'].includes(selectedAppointment.status) && (
                                                                                        <div>
                                                                                            {/* Content for pending appointments */}
                                                                                            <div className="flex flex-col gap-4">

                                                                                                <p className="font-bold">Appointment Actions</p>

                                                                                                <div className='flex gap-2'>
                                                                                                    <div className='w-full'>
                                                                                                        <DateTimePicker onDateTimeChange={setAppointmentActionDate} />
                                                                                                    </div>

                                                                                                </div>
                                                                                                <div className='flex justify-between w-full'>
                                                                                                    <Button className={`${statusColors.Confirmed}`} onClick={handleConfirmAppointmentClick} disabled={isSubmitting}>
                                                                                                        Confirm Appointment
                                                                                                    </Button>
                                                                                                    {isSubmitting && (
                                                                                                        <ClipLoader color="white" aria-label="Loading Spinner" data-testid="loader" className="m-0" />
                                                                                                    )}
                                                                                                    <Button className={`${statusColors.Cancelled}`} onClick={handleCancelAppoitmentClick} disabled={isSubmitting}>
                                                                                                        Cancel Appointment
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    {selectedAppointment.status === 'Cancelled' && (
                                                                                        <div>

                                                                                            <p>This appointment has been cancelled. Please contact support for assistance.</p>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* {selectedAppointment.status === 'Postponed' && (
                                                                                            <div>
                                                                                            
                                                                                                <p>This appointment has been postponed. We will notify you of the new date and time.</p>
                                                                                            </div>
                                                                                        )} */}

                                                                                    {selectedAppointment.status === 'Confirmed' && (
                                                                                        <div className="flex flex-col gap-4">

                                                                                            <p className="font-bold">Appointment Actions</p>

                                                                                            <div className='flex gap-4'>
                                                                                                <Button className={`${statusColors.Postponed}`} onClick={handlePostponeAppointmentClick} disabled={isSubmitting}>
                                                                                                    Postpone Appointment
                                                                                                </Button>
                                                                                                {isSubmitting && (
                                                                                                    <ClipLoader color="white" aria-label="Loading Spinner" data-testid="loader" className="m-0" />
                                                                                                )}

                                                                                            </div>

                                                                                            {!isSubmitting && (
                                                                                                <>
                                                                                                    <p className="font-bold">Checkup Service</p>
                                                                                                    <div className="pr-6 pl-1">
                                                                                                        <DoctorCheckupForm appointmentId={selectedAppointment?.appointment_id} />
                                                                                                    </div>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </ScrollArea>
                                                                            {/* <ScrollArea className="max-h-full">
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <p className="font-bold">Checkup Service</p>
                                                                                        <div className="pr-6 pl-1">
                                                                                            <DoctorCheckupForm appointmentId={selectedAppointment?.id} />
                                                                                        </div>
                                                                                    </div>
                                                                                </ScrollArea> */}
                                                                        </DialogContent>
                                                                    )}
                                                                </Dialog>
                                                            );
                                                        })}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    ) : (isSearching ? (

                                        <ClipLoader color="black" aria-label="Loading Spinner" data-testid="loader" className="m-3" />
                                    ) : (
                                        <p>No appointments found against this filter.</p>
                                    )
                                    )}
                                </div>
                                <ScrollBar orientation="horizontal" className="bg-neutral-950" />
                            </ScrollArea>

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

export default DoctorDashboard