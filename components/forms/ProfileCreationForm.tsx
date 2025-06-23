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

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import ClipLoader from 'react-spinners/ClipLoader'
import { Input } from "@/components/ui/input"
import { createUserProfile, emailLogin } from "@/lib/actions/user.actions"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { getUserEmail } from "@/lib/actions/user.actions"

const profileCreateFormSchema = z.object({
    email: z.string()
        .email("Invalid email format"),

    role: z.enum(["Patient", "Doctor", "Staff", "Operator"]),

    first_name: z.string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters"),

    last_name: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters"),

    gender: z.enum(["Male", "Female", "Other"]),
});

export function ProfileCreationForm({ userEmail }: { userEmail: string}) {
    const router = useRouter()
    console.log(userEmail)

    // 1. Define your form.
    const form = useForm<z.infer<typeof profileCreateFormSchema>>({
        resolver: zodResolver(profileCreateFormSchema),
        defaultValues: {
            email: userEmail,
            role: 'Patient'
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof profileCreateFormSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        data.append('email', values.email)
        data.append('role', values.role)
        data.append('first_name', values.first_name)
        data.append('last_name', values.last_name)
        data.append('gender', values.gender)
        const profileRes = await createUserProfile(data)
        console.log(profileRes)
        if (profileRes) {
            if (profileRes.role === 'Patient')
                router.push('/patient/register')
            else if (profileRes.role === 'Doctor') 
                router.push('/doctor/profile/created')
            else if (profileRes.role === 'Staff')
                router.push('/staff/register')
        }
        setIsSubmitting(false)
    }
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
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
                        <FormItem className="flex flex-col" >
                            <FormLabel>Account Type</FormLabel>
                            <FormControl>
                                <DropdownMenu {...field} >
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">{field.value}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuLabel>Account Types</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={field.value} onValueChange={field.onChange}>
                                            <DropdownMenuRadioItem value="Patient">Patient</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Doctor">Doctor</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Staff">Staff</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Operator">Operator</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
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
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
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
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <Button type="submit" className='w-full' disabled={isSubmitting}>
                    <span>Create Profile</span>
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