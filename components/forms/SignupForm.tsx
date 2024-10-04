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
import { Input } from "@/components/ui/input"
import { emailLogin, isPatientRegistered, isDoctorRegistered, signup, getProfileRoleIfCreated } from "@/lib/actions/user.actions"
import { useState } from "react"
import { truncate } from "node:fs"
import { useRouter } from "next/navigation"

const signupFormSchema = z.object({
    // name: z.string()
    //   .min(2, "Name must be at least 2 characters long")
    //   .max(50, "Name must be at most 50 characters long"),

    email: z.string()
        .min(5, "Email must be at least 5 characters long")
        .max(50, "Email must be at most 50 characters long")
        .email("Invalid email format"),

    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(50, "Password must be at most 50 characters long"),
    // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    // .regex(/[0-9]/, "Password must contain at least one number")
    // .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

    confirmPassword: z.string()
    // .min(8, "Confirm password must be at least 8 characters long")
    // .max(50, "Confirm password must be at most 50 characters long")
    // .regex(/[A-Z]/, "Confirm password must contain at least one uppercase letter")
    // .regex(/[a-z]/, "Confirm password must contain at least one lowercase letter")
    // .regex(/[0-9]/, "Confirm password must contain at least one number")
    // .regex(/[^A-Za-z0-9]/, "Confirm password must contain at least one special character"),
    // .refine((val, ctx) => val === ctx.parent.password, {
    //     message: "Passwords do not match",
    // }),

    // age: z.number()
    //   .min(18, "You must be at least 18 years old to sign up")
    //   .max(120, "Please enter a valid age"),

    // phoneNumber: z.string()
    //   .min(10, "Phone number must be at least 10 digits long")
    //   .max(15, "Phone number must be at most 15 digits long")
    //   .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format"),

    // termsAccepted: z.boolean().refine(val => val === true, {
    //         message: "You must accept the terms and conditions",
    //     })
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
})

export function SignupForm() {
    const router = useRouter()
    // 1. Define your form.
    const form = useForm<z.infer<typeof signupFormSchema>>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            // termsAccepted: false
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof signupFormSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        data.append('email', values.email)
        data.append('password', values.password)
        const signupRes = await signup(data)
        if (signupRes) {
            const profileRole = await getProfileRoleIfCreated()

            if (profileRole === 'Patient') {
                const patient = await isPatientRegistered()
                if (patient)
                    router.push('/rooms')
                else
                    router.push('/patient/register')
            } else if (profileRole === 'Doctor') {
                const doctor = await isDoctorRegistered()
                if (doctor)
                    router.push('/rooms')
                else
                    router.push('/doctor/profile/created')
            } else {
            router.push('/profile/create')
            }
        }
        setIsSubmitting(false)
    }
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel>Email</FormLabel> */}
                            <FormControl>
                                <Input placeholder="Email" {...field} />
                            </FormControl>
                            {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel>Password</FormLabel> */}
                            <FormControl>
                                <Input placeholder="Password" type="password" {...field} />
                            </FormControl>
                            {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            {/* <FormLabel>Password</FormLabel> */}
                            <FormControl>
                                <Input placeholder="Confirm Password" type="password" {...field} />
                            </FormControl>
                            {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className='w-full' disabled={isSubmitting}>Signup</Button>
            </form>
        </Form>
    )
}