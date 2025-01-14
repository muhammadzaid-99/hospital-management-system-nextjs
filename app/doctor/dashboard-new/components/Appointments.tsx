import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button'
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
    Card
} from "@/components/ui/card"
import { ClipLoader } from 'react-spinners'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState, useEffect } from 'react'
import { AppointmentStatus, getDatesForFilter, statusColors } from "../page"
import DoctorCheckupForm from "@/components/forms/DoctorCheckupForm"
import { DoctorAppointmentInterface } from "../page"
import { useToast } from "@/hooks/use-toast"
import { getAppointmentSlotsForDoctor, getDoctorAppointments, getDoctorAppointmentsInSlot, updateAppointmentStatus } from "@/lib/actions/doctor.actions"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronsDown, ChevronUp } from 'lucide-react'
import { DateTimePicker } from '@/components/custom/DateTimePicker'
import { newDate } from "react-datepicker/dist/date_utils"
import { Separator } from "@/components/ui/separator"
import DatePicker from "@/components/custom/DatePicker"
import { DatePickerSimple } from "@/components/custom/DatePickerSimple"
import { Label } from "@/components/ui/label"

interface AppointmentSlot {
    id: any;
    schedule_id: any;
    start_time: Date;
    end_time: Date;
}

const Appointments = ({ appointmentsFilter }: { appointmentsFilter: string }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appointments, setAppointments] = useState<DoctorAppointmentInterface[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointmentInterface>();
    const [appointmentActionDate, setAppointmentActionDate] = useState<Date | undefined>(undefined);
    const [selectedSlotId, setSelectedSlotId] = useState<Number>();
    const [patientDetailsOpen, setPatientDetailsOpen] = useState(true);
    const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([])
    const { toast } = useToast();

    useEffect(() => {
        async function loadAppointments() {
            if (isSubmitting) return;
            setIsSearching(true)
            setAppointments([])
            const { fromDateStart, fromDateEnd } = getDatesForFilter(appointmentsFilter)
            const __appointments = await getDoctorAppointmentsInSlot(fromDateStart, fromDateEnd)
            console.log(__appointments)
            setAppointments(__appointments)
            setIsSearching(false)
        }

        loadAppointments()
        localStorage.setItem('appointmentsFilter', appointmentsFilter.toString())
    }, [isSubmitting, appointmentsFilter])

    useEffect(() => {
        async function loadAvailableSlots() {
            setIsSearching(true)
            setAppointmentSlots([])
            setSelectedSlotId(undefined)
            const __appointmentSlots = await getAppointmentSlotsForDoctor(appointmentActionDate || new Date())
            // console.log(__appointmentSlots)
            setAppointmentSlots(__appointmentSlots)
            setIsSearching(false)
        }

        loadAvailableSlots()
    }, [appointmentActionDate])

    useEffect(() => {
        console.log(selectedSlotId)
    }, [selectedSlotId])

    async function handleConfirmAppointmentClick() {
        setIsSubmitting(true);
        console.log('Confirming appointment...')
        toast({
            title: "Confirming Appointment",
            description: "Please wait while we confirm the appointment.",
        })
        if (selectedSlotId && selectedAppointment) {
            const updatedAppointment = { id: selectedAppointment.appointment_id, status: 'Confirmed', appointment_date: appointmentSlots.find((slot) => slot.id == selectedSlotId)?.start_time.toISOString() || new Date(selectedAppointment.appointment_date).toISOString(), appointment_slot_id: selectedSlotId }
            const res = await updateAppointmentStatus(updatedAppointment)
            if (res) {
                toast({
                    title: "Confirmed",
                    description: `The appointment has been confirmed for ${new Date(updatedAppointment.appointment_date).toDateString()}.`,
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
        setAppointmentActionDate(new Date())
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
        setAppointmentActionDate(new Date())
        setIsSubmitting(false);
    }

    function handleAppointmentClick(appointment: DoctorAppointmentInterface) {
        setSelectedAppointment(appointment)
        setSelectedSlotId(Number(appointment.appointment_slot_id))
    }

    const groupedAppointments = appointments.reduce<Record<string, DoctorAppointmentInterface[]>>((acc, app) => {
        if (!acc[app.status]) acc[app.status] = [];
        acc[app.status].push(app);
        return acc;
    }, {});

    // since they are already sorted, no need to change ordering
    const groupedSlots = appointmentSlots.reduce<Record<string, AppointmentSlot[]>>((groups, slot) => {
        const date = new Date(slot.start_time).toLocaleDateString(); // Get date string
        if (!groups[date]) {
            groups[date] = []; // Initialize group if not already present
        }
        groups[date].push(slot); // Add slot to the respective date group
        return groups;
    }, {});


    return (
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
                                        {status === 'Pending' && (
                                            <Button variant='outline' className="h-8">
                                                Confirm All
                                            </Button>
                                        )}
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className='flex gap-4 m-2 p-2'>
                                    {apps.map((app) => {
                                        const fullDate = new Date(app.appointment_date);
                                        const startTime = new Date(app.start_time)
                                        const endTime = new Date(app.end_time)


                                        return (
                                            <Dialog key={app.appointment_id} open={selectedAppointment === app} onOpenChange={(open) => !open && setSelectedAppointment(undefined)} modal={false}>
                                                <DialogTrigger asChild>
                                                    <Card
                                                        className="flex gap-4 cursor-pointer hover:opacity-50 p-3 rounded-md"
                                                        onClick={() => { handleAppointmentClick(app); }}
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
                                                                <span>{fullDate.toDateString()}{['Confirmed', 'Completed', 'Pending'].includes(selectedAppointment.status) && ' @ ' + startTime.toLocaleTimeString()} </span>
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
                                                                {selectedAppointment.status === 'Cancelled' && (
                                                                    <div>

                                                                        <p>This appointment has been cancelled. Please contact support for assistance.</p>
                                                                    </div>
                                                                )}

                                                                {['Pending', 'Postponed'].includes(selectedAppointment.status) && (
                                                                    <div>
                                                                        {/* Content for pending appointments */}
                                                                        <div className="flex flex-col gap-4">

                                                                            <p className="font-bold">Appointment Actions</p>

                                                                            <div className='flex gap-2'>
                                                                                {/* // todo: add date and time picker */}
                                                                                <div className='w-full grid grid-cols-2 gap-2'>
                                                                                    {/* <DateTimePicker onDateTimeChange={setAppointmentActionDate} /> */}
                                                                                    <div className="space-y-2">
                                                                                        <Label>Search Initial Date</Label>
                                                                                        <DatePickerSimple date={appointmentActionDate || new Date()} setDate={setAppointmentActionDate} />
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <Label>Select Slots</Label>
                                                                                        <DropdownMenu modal={false}>
                                                                                            {appointmentSlots && appointmentSlots.length ? (
                                                                                                <DropdownMenuTrigger asChild className="w-full">
                                                                                                    <Button variant="outline">
                                                                                                        {appointmentSlots.find(slot => slot.id === selectedSlotId)?.start_time.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || (selectedAppointment.appointment_slot_id === selectedSlotId?.toString() && (new Date(selectedAppointment.start_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + " (Patient Selected)"))
                                                                                                            || "Not Selected"}
                                                                                                    </Button>
                                                                                                </DropdownMenuTrigger>

                                                                                            ) : (isSearching ? (
                                                                                                <div className="w-full ml-2">
                                                                                                    <ClipLoader color="black" aria-label="Loading Spinner" data-testid="loader" size={24} />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <p className="text-xs bg-orange-50 py-2.5 px-4 rounded-md text-orange-900">
                                                                                                    No slots found for {appointmentActionDate?.toDateString()} and beyond.
                                                                                                </p>
                                                                                            )
                                                                                            )}
                                                                                            <DropdownMenuContent className="w-56 h-80 overflow-auto">
                                                                                                <DropdownMenuLabel>Appointment Slots</DropdownMenuLabel>
                                                                                                <DropdownMenuSeparator />
                                                                                                <DropdownMenuRadioGroup
                                                                                                    value={selectedSlotId?.toString()}
                                                                                                    onValueChange={(value) => setSelectedSlotId(Number(value))}
                                                                                                >
                                                                                                    {selectedAppointment.appointment_slot_id !== null && (
                                                                                                        <DropdownMenuRadioItem key={selectedAppointment.appointment_slot_id.toString()} value={selectedAppointment.appointment_slot_id.toString()}>
                                                                                                            {new Date(selectedAppointment.start_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} (Patient Selected)
                                                                                                        </DropdownMenuRadioItem>
                                                                                                    )}
                                                                                                    {Object.entries(groupedSlots).map(([date, slots]) => (
                                                                                                        <DropdownMenuGroup key={date}>
                                                                                                            <DropdownMenuLabel>{new Date(date).toDateString()}</DropdownMenuLabel>
                                                                                                            {slots.map((slot) => (
                                                                                                                <DropdownMenuRadioItem key={slot.id} value={slot.id.toString()}>
                                                                                                                    {new Date(slot.start_time).toLocaleTimeString([], {
                                                                                                                        hour: '2-digit',
                                                                                                                        minute: '2-digit',
                                                                                                                    })}
                                                                                                                </DropdownMenuRadioItem>
                                                                                                            ))}

                                                                                                        </DropdownMenuGroup>
                                                                                                    ))}
                                                                                                </DropdownMenuRadioGroup>
                                                                                            </DropdownMenuContent>
                                                                                        </DropdownMenu>
                                                                                    </div>
                                                                                    {/* ) : (
                                                                                        <ClipLoader color="black" aria-label="Loading Spinner" data-testid="loader" className="m-0" />
                                                                                    )} */}
                                                                                </div>

                                                                            </div>
                                                                            <div className='flex justify-between w-full'>
                                                                                <Button className={`${statusColors.Confirmed}`} onClick={handleConfirmAppointmentClick} disabled={isSubmitting || isSearching || !selectedSlotId}>
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
                                                    </DialogContent>
                                                )}
                                            </Dialog>
                                        );
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    isSearching ? (
                        <ClipLoader color="black" aria-label="Loading Spinner" data-testid="loader" className="m-3" />
                    ) : (
                        <p>No appointments found against this filter.</p>
                    )
                )
                }
            </div >
            <ScrollBar orientation="horizontal" className="bg-neutral-950" />
        </ScrollArea >
    )
}

export default Appointments