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
import { emailLogin, getProfileRoleIfCreated, isDoctorRegistered, isPatientRegistered } from "@/lib/actions/user.actions"
import { useState } from "react"
import { truncate } from "node:fs"
import { useRouter } from 'next/navigation'
import { setTimeout } from "node:timers/promises"
import { isDynamicMetadataRoute } from "next/dist/build/analysis/get-page-static-info"

const loginFormSchema = z.object({
    email: z.string()
        .min(5, "Email must be at least 5 characters long")
        .max(50, "Email must be at most 50 characters long")
        .email("Invalid email format"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(50, "Password must be at most 50 characters long")
    //   .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    //   .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    //   .regex(/[0-9]/, "Password must contain at least one number")
    //   .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export function LoginForm() {
    const router = useRouter()
    // 1. Define your form.
    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof loginFormSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        data.append('email', values.email)
        data.append('password', values.password)
        const loginRes = await emailLogin(data)

        if (loginRes) {
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
                    router.push('/doctor/dashboard')
                else
                    router.push('/doctor/profile/created')
            } else {
                router.push('/profile/create')
            }
        }
        setInterval(() => {
            setIsSubmitting(false)
        }, 3000)
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
                            <FormMessage className="text-pink-600" />
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
                <Button type="submit" className='w-full' disabled={isSubmitting}>Login</Button>
            </form>
        </Form>
    )
}