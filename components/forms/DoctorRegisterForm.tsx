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
import { registerPatient, createUserProfile, emailLogin, registerDoctor } from "@/lib/actions/user.actions"
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
    specialization: z.string(),
    license_number: z.string(),
    department_id: z.string()


});

interface profileDataInterface {
    email: string;
    first_name: string;
    last_name: string;
    gender: 'Male' | 'Female' | 'Other' | undefined
}


export function DoctorRegisterForm({ profileData }: { profileData: profileDataInterface }) {
    const router = useRouter()
    console.log(profileData)

    // 1. Define your form.
    const form = useForm<z.infer<typeof profileCreateFormSchema>>({
        resolver: zodResolver(profileCreateFormSchema),
        defaultValues: {
            email: profileData.email,
            role: 'Doctor',
            gender: profileData.gender,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            specialization: '',
            department_id: 'DEFAULT',
            license_number: ''
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
        data.append('specialization', values.specialization)
        data.append('license_number', values.license_number)

        const doctorReg = await registerDoctor(data)
        if (doctorReg)
            router.push('/doctor/dashboard')
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
                        name="specialization"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Specialization</FormLabel>
                                <FormControl>
                                    <Input placeholder="Surgeon, Eye Specialist,..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    Please enter your specialization details.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="license_number"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >License Number</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="ABC123" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Please enter your issued license number.
                                </FormDescription>
                                <FormMessage className="text-pink-600" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="department_id"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel >Department</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Hair-fall, diabetes..." {...field} disabled/>
                                </FormControl>
                                <FormDescription>
                                    Department in which you are going to work.
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