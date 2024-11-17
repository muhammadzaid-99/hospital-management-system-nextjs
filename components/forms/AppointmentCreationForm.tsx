import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ClipLoader from "react-spinners/ClipLoader"
import { createSchedule } from "@/lib/actions/doctor.actions"
import { useEffect, useState } from "react"
import { doctorInterface } from "@/app/patient/dashboard/page"
import { createAppointment, getDoctors } from "@/lib/actions/patient.actions"

const schema = z.object({
    doctor_id: z.number().int().min(1, "Doctor ID must be a positive integer"),
    appointment_date: z.date().min(new Date(), "Appointment date must be in the future"),
    status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed", "Postponed"]),
    reason: z.string().min(1, "Reason is required"),
});

export function AppointmentCreateForm({ alertNewAppointment }: { alertNewAppointment: () => void }) {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            doctor_id: Number(-1), // default doctor ID, can be dynamically set based on your data
            appointment_date: new Date(), // current date
            status: "Pending", // initial status
            reason: "", // leave empty initially
        }
    });


    const onSubmit = async (values: z.infer<typeof schema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        data.append('doctor_id', values.doctor_id.toString())
        data.append('appointment_date', values.appointment_date.toISOString())
        data.append('status', values.status)
        data.append('reason', values.reason)

        const appCreate = await createAppointment(data)
        if (appCreate) {
            // alert('created')
            alertNewAppointment()
        } else {
            alert('failed')
        }

        setIsSubmitting(false)
    }
    const [isSubmitting, setIsSubmitting] = useState(false)
    // const [selectedDoctorId, setSelectedDoctorId] = useState<number>(-1)
    const [appDateChange, setAppDateChange] = useState(0)
    const [doctorSelectChange, setDoctorSelectChange] = useState(0)
    const [doctors, setDoctors] = useState<doctorInterface[]>([])
    const [isSearchingDoctors, setIsSearchingDoctors] = useState(false)

    useEffect(() => {
        async function loadDoctors() {
            setDoctors([])
            setIsSearchingDoctors(true)
            const date = new Date(form.getValues('appointment_date'))
            const __doctors = await getDoctors(date)
            setDoctors(__doctors)
            setIsSearchingDoctors(false)
        }

        loadDoctors()
    }, [appDateChange])

    // useEffect(() => {
    //     async function checkDocAvailable() {
    //         const doc_id = form.getValues('doctor_id')


    //     }

    //     checkDocAvailable()
    // }, [doctorSelectChange])


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="appointment_date"
                    render={({ field }) => (
                        <FormItem className="flex gap-2 items-center">
                            <FormLabel htmlFor="appointment_date">Appointment Date</FormLabel>
                            <FormControl>
                                <DatePicker
                                    selected={field.value} // Pass the current Date value
                                    onChange={(date) => { field.onChange(date); setAppDateChange(prev => prev + 1) }} // Update the field with the new Date
                                    minDate={new Date()} // Ensure date is in the future
                                    className="p-1 mb-2 rounded-sm focus:outline-none focus:bg-neutral-100 cursor-pointer hover:bg-neutral-100" // Tailwind styling for input
                                    placeholderText="Select appointment date" // Placeholder text
                                    dateFormat={"dd MMMM yyyy"} // Date format
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-auto items-start">
                            <FormLabel>Select Doctor</FormLabel>
                            <FormControl>
                                <DropdownMenu {...field}>
                                    <DropdownMenuTrigger asChild className="w-56">
                                        <Button variant="outline">{doctors.find(doctor => doctor.id === field.value)?.full_name || "Not Selected"}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Doctors</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={field.value?.toString()} onValueChange={(value) => {field.onChange(Number(value)); setDoctorSelectChange(prev => prev + 1)}}>
                                            {doctors.length ? (
                                                doctors.map((doctor) => (
                                                    <DropdownMenuRadioItem value={doctor.id}>{doctor.full_name}</DropdownMenuRadioItem>
                                                ))
                                            ) : (
                                                isSearchingDoctors ? (
                                                    <div className="m-3">
                                                        <ClipLoader
                                                            color='black'
                                                            // loading={}
                                                            // cssOverride={}
                                                            aria-label="Loading Spinner"
                                                            data-testid="loader"
                                                            size={16}
                                                        />
                                                        <p className="text-xs mt-4">Searching for available doctors</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs m-3">No doctors available on this date.</p>
                                                )
                                            )}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </FormControl>
                            <FormMessage className="text-pink-600" />
                        </FormItem>
                    )}
                />


                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="status">Status</FormLabel>
                            <FormControl>
                                <Input
                                    id="status"
                                    className="p-2 rounded-sm"
                                    value={field.value ?? ""}
                                    onChange={field.onChange} // Directly set the status
                                    disabled
                                />
                                {/* <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Postponed">Postponed</option> */}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="reason">Reason</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    id="reason"
                                    className="p-2 rounded-sm"
                                    value={field.value ?? ""} // Ensure it handles undefined/null
                                    onChange={field.onChange} // Update the reason
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" variant='default' className='w-full'>
                    <span>Create Appointment</span>
                    <span className={`ml-6 mt-1 ${form.formState.isSubmitting || 'hidden'}`}>
                        <ClipLoader
                            color='black'
                            aria-label="Loading Spinner"
                            data-testid="loader"
                            size={16}
                        />
                    </span>
                </Button>
            </form>
        </Form>
    )
}

