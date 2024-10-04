"use client"

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
import DatePicker from "react-datepicker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

import ClipLoader from 'react-spinners/ClipLoader'
import { Input } from "@/components/ui/input"
import { registerPatient, createUserProfile, emailLogin } from "@/lib/actions/user.actions"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { getUserEmail } from "@/lib/actions/user.actions"
import { getUserProfileInfo } from "@/lib/actions/user.actions"

const profileCreateFormSchema = z.object({
    email: z.string()
        .email("Invalid email format"),

    role: z.enum(["Patient", "Doctor", "Staff"]),

    first_name: z.string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters"),

    last_name: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters"),

    gender: z.enum(["Male", "Female", "Other"]),
    date_of_birth: z.date(),
    address: z.string(),
    emergency_contact: z.string(),
    disability: z.string(),
    medical_history: z.string(),
    family_history: z.string(),
    allergies: z.string()


});

interface profileDataInterface {
    email: string;
    first_name: string;
    last_name: string;
    gender: 'Male' | 'Female' | 'Other' | undefined
}


export function PatientRegisterForm({ profileData }: { profileData: profileDataInterface }) {
    const router = useRouter()
    console.log(profileData)

    // 1. Define your form.
    const form = useForm<z.infer<typeof profileCreateFormSchema>>({
        resolver: zodResolver(profileCreateFormSchema),
        defaultValues: {
            email: profileData.email,
            role: 'Patient',
            gender: profileData.gender,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            address: '',
            emergency_contact: '',
            allergies: '',
            disability: '',
            family_history: '',
            medical_history: '',

        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof profileCreateFormSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        data.append('email', values.email)
        // data.append('role', values.role)
        // data.append('first_name', values.first_name)
        // data.append('last_name', values.last_name)
        // data.append('gender', values.gender)
        data.append('date_of_birth', values.date_of_birth.toISOString())
        data.append('address', values.address)
        data.append('emergency_contact', values.emergency_contact)
        data.append('disability', values.disability)
        data.append('medical_history', values.medical_history)
        data.append('family_history', values.family_history)
        data.append('allergies', values.allergies)

        const patientReg = await registerPatient(data)
        if (patientReg)
            router.push('/rooms')
        setIsSubmitting(false)
    }
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="abc@example.com" {...field} disabled />
                                </FormControl>
                                {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Account Type</FormLabel>
                                <FormControl>
                                    <Input placeholder="Manager" {...field} disabled />
                                </FormControl>
                                {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} disabled />
                                </FormControl>
                                {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} disabled />
                                </FormControl>
                                {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="ABC Street, New York" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Please enter your complete current address.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                            <FormItem className="flex flex-col w-full">
                                <FormLabel>Date of birth</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            // captionLayout="dropdown-buttons"
                                            // fromYear={1900}
                                            // toYear={new Date().getFullYear()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    Your DOB is used to calculate your age.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="emergency_contact"
                        render={({ field }) => (
                            <FormItem className="w-full flex flex-col">
                                <FormLabel >Emergency Contact</FormLabel>
                                <FormControl>
                                    <Input placeholder="0300-1234567" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This will be used in case of emergency.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="medical_history"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Medical History</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Malaria, COVID-19..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    This can include your previous ailments.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="family_history"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Family History</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Hair-fall, diabetes..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    This can include family-inherited diseases.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="disability"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Disability</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Malaria, COVID-19..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    This will be considered by hospital management.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Allergies</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Hair-fall, diabetes..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    This will be considered by doctors while prescribing medication.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className='w-full' disabled={isSubmitting}>
                    <span>Submit</span>
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