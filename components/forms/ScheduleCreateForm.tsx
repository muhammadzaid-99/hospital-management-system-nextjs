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

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ClipLoader from "react-spinners/ClipLoader"
import { createSchedule } from "@/lib/actions/doctor.actions"
import { useState } from "react"


const schema = z.object({
    expected_patients: z.number().min(1, "Expected patients must be at least 1"),
    from_time: z.date().min(new Date(), "From time must be in the future"),
    to_time: z.date(),
}).refine((data) => data.to_time > data.from_time, {
    message: "To time must be after from time",
    path: ["to_time"], // This specifies where the error will appear
});

export function ScheduleCreateForm() {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            expected_patients: 1,
            from_time: new Date(),
            to_time: new Date(new Date().getTime() + 60 * 60 * 1000), // One hour later
        }
    })

    const onSubmit = async (values: z.infer<typeof schema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        data.append('expected_patients', values.expected_patients.toString())
        data.append('from_time', values.from_time.toISOString())
        data.append('to_time', values.to_time.toISOString())

        const schCreate = await createSchedule(data)
        if (schCreate) {
            alert('created')
        } else {
            alert('failed')
        }

        setIsSubmitting(false)
    }

    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="expected_patients"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="expected_patients">Expected Patients</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    id="expected_patients"
                                    className="p-2 rounded-sm"
                                    value={field.value ?? ""} // Ensure it handles undefined/null
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))} // Convert to number
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="from_time"
                    render={({ field }) => (
                        <FormItem className="flex gap-2 items-center ">
                            <FormLabel htmlFor="from_time">From Time</FormLabel>
                            <FormControl>
                                <DatePicker
                                    selected={field.value} // Pass the current Date value
                                    onChange={(date) => field.onChange(date)} // Update the field with the new Date
                                    showTimeSelect // Show time selection
                                    timeFormat="HH:mm" // Define the time format
                                    timeIntervals={15} // Time intervals (e.g., 15 minutes)
                                    dateFormat="MMMM d, yyyy h:mm aa" // Custom date-time format
                                    className="p-2 rounded-sm bg-transparent bg-neutral-700" // Tailwind styling for input// Custom styling
                                    placeholderText="Select date and time" // Placeholder text
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="to_time"
                    render={({ field }) => (
                        <FormItem className="flex gap-2 items-center ">
                            <FormLabel htmlFor="to_time">To Time</FormLabel>
                            <FormControl>
                                <DatePicker
                                    selected={field.value} // Pass the current Date value
                                    onChange={(date) => field.onChange(date)} // Update the field with the new Date
                                    showTimeSelect // Show time selection
                                    timeFormat="HH:mm" // Define the time format
                                    timeIntervals={15} // Time intervals (e.g., 15 minutes)
                                    dateFormat="MMMM d, yyyy h:mm aa" // Custom date-time format
                                    className="p-2 rounded-sm bg-transparent bg-neutral-700" // Tailwind styling for input// Custom styling
                                    placeholderText="Select date and time" // Placeholder text
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <Button type="submit" variant='default' className='w-full'>
                    <span>Create Schedule</span>
                    <span className={`ml-6 mt-1 ${isSubmitting || 'hidden'}`}>
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

