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
import { DateTimePicker } from "../custom/DateTimePicker"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect } from "react"
import { DateTimePickerLingua } from "../custom/linguatime/datetime-picker"

const schema = z.object({
    from_time: z.date().min(new Date(), "From time must be in the future"),
    slot_duration: z.number().min(3, "Slot duration must be at least 3 minutes").optional(),
    expected_patients: z.number().min(1, "Expected patients must be at least 1").max(100, "Cannot be more than 100").optional(),
    to_time: z.date().optional(),
    slot_calculation_method: z.enum(['patients', 'duration', 'both'])
}).refine((data) => {   
    switch (data.slot_calculation_method) {
        case "both": {
            if (!data.expected_patients || !data.slot_duration) return false;
            const to_time_calculated = new Date(
                data.from_time.getTime() + data.expected_patients * data.slot_duration * 60000
            );
            return data.from_time < to_time_calculated;
        }

        case "patients": {
            if (!data.to_time || !data.expected_patients) return false;
            // Validate `expected_patients` when using `to_time`
            return data.expected_patients >= 1 && data.to_time > data.from_time;
        }

        case "duration": {
            if (!data.to_time || !data.slot_duration || data.to_time <= data.from_time) return false;
            // Calculate expected patients based on `slot_duration` and ensure it is valid
            const durationInMinutes = (data.to_time.getTime() - data.from_time.getTime()) / 60000;
            const expPatients = Math.floor(durationInMinutes / data.slot_duration);

            return expPatients >= 1 && expPatients <= 100;
        }

        default:
            return false; // If an invalid slot_calculation_method is provided
    }
}, {
    message: "Select a valid End Time or Duration",
    path: ["to_time"], // This specifies where the error will appear
});

export function ScheduleCreateForm({ alertNewSchedule }: { alertNewSchedule: () => void }) {
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            // expected_patients: '',
            from_time: new Date(),
            to_time: new Date(new Date().getTime() + 60 * 60 * 1000), // One hour later
            slot_calculation_method: 'both'
        }
    })

    const onSubmit = async (values: z.infer<typeof schema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        // data.append('expected_patients', values.expected_patients.toString())
        data.append('from_time', values.from_time.toISOString())


        switch (values.slot_calculation_method) {
            case 'both':
                data.append('expected_patients', values.expected_patients.toString())
                const to_time_calculated = new Date(values.from_time.getTime() + values.expected_patients * values.slot_duration * 60000); // Calculate to_time based on slot_duration
                data.append('to_time', to_time_calculated.toISOString())
                break;
            case 'patients':
                data.append('expected_patients', values.expected_patients.toString())
                data.append('to_time', values.to_time.toISOString())
                break;
            case 'duration':
                data.append('to_time', values.to_time.toISOString())
                const durationInMinutes = (values.to_time.getTime() - values.from_time.getTime()) / 60000;
                const expPatients = Math.floor(durationInMinutes / values.slot_duration);
                data.append('expected_patients', expPatients.toString())
                break;
            default:
                toast({
                    title: "Schedule Creation Failed",
                    description: "Please check whether the form is complete.",
                })
                return;
        }

        const schCreate = await createSchedule(data)
        if (schCreate) {
            alertNewSchedule()
            // alert('created')
        } else {
            toast({
                title: "Schedule Creation Failed",
                description: "Please try again.",
            })
        }

        setIsSubmitting(false)
    }

    // useEffect(() => {
    //     const fromTime = form.getValues('from_time');
    //     const toTime = form.getValues('to_time');

    //     // Only update if to_time is null or earlier than from_time
    //     if (!toTime || new Date(toTime) <= new Date(fromTime)) {
    //         form.setValue('to_time', fromTime);
    //     }
    // }, [form.watch('from_time'), form]);
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="from_time"
                    render={({ field }) => (
                        <FormItem >
                            <FormLabel htmlFor="from_time">Select Appointment Date</FormLabel>
                            <FormControl>
                                {/* <DateTimePicker onDateTimeChange={field.onChange} /> */}
                                <DateTimePickerLingua dateTime={new Date()} setDateTime={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="slot_calculation_method"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Schedule Creation Preference</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-6"
                                >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="both" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            Default
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="patients" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                            Expected Patients
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="duration" />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">Slot Duration</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-2 items-center w-full">
                    {['both', 'patients'].includes(form.watch('slot_calculation_method')) &&
                        <FormField
                            control={form.control}
                            name="expected_patients"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel htmlFor="expected_patients">Expected Patients</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            id="expected_patients"
                                            className="p-2 rounded-sm"
                                            placeholder="10, 20, 30, etc."
                                            value={field.value ?? ""} // Ensure it handles undefined/null
                                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))} // Convert to number
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                    {['both', 'duration'].includes(form.watch('slot_calculation_method')) &&
                        <FormField
                            control={form.control}
                            name="slot_duration"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel htmlFor="slot_duration">Slot Duration Each (minutes)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            id="slot_duration"
                                            className="p-2 rounded-sm"
                                            placeholder="15, 30, 45, etc."
                                            value={field.value ?? ""} // Ensure it handles undefined/null
                                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))} // Convert to number
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                    {['duration', 'patients'].includes(form.watch('slot_calculation_method')) &&
                        <FormField
                            control={form.control}
                            name="to_time"
                            render={({ field }) => (
                                <FormItem className="w-full" >
                                    <FormLabel htmlFor="to_time">Closing Time & Date</FormLabel>
                                    <FormControl>
                                        <DateTimePicker onDateTimeChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }
                </div>


                <Button type="submit" variant="default" className='w-fit h-10 '>
                    <span>Create Schedule</span>
                    <span className={`ml-6 mt-1 ${isSubmitting || 'hidden'}`}>
                        <ClipLoader
                            color='white'
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

