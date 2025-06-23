'use client'

import { LoginForm } from '@/components/forms/LoginForm'
import { SignupForm } from '@/components/forms/SignupForm'
import { Provider } from '@supabase/supabase-js'
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useEffect, useState } from 'react'
import { getUserEmail, isPatientRegistered, getProfileRoleIfCreated, isDoctorRegistered } from '@/lib/actions/user.actions'
import { useRouter } from 'next/navigation'
import { profile } from 'console'
import FadeLoader from 'react-spinners/FadeLoader'
import { ProfileCreationForm } from '@/components/forms/ProfileCreationForm'
import { PatientRegisterForm } from '@/components/forms/PatientRegisterForm'
import { getUserProfileInfo } from '@/lib/actions/user.actions'
import { DoctorRegisterForm } from '@/components/forms/DoctorRegisterForm'

interface profileDataInterface {
    email: string;
    first_name: string | any;
    last_name: string | any;
    gender: 'Male' | 'Female' | 'Other' | undefined
}

export default function DoctorRegisterPage() {
    const router = useRouter()
    const [pageLoaded, setPageLoaded] = useState(false)
    const [profileData, setProfileData] = useState<profileDataInterface>({
        email: '',
        first_name: '',
        last_name: '',
        gender: undefined
    })

    useEffect(() => {
        async function loadData() {
            const profile = await getProfileRoleIfCreated()
            const doctor = await isDoctorRegistered()

            if (profile === 'Doctor') {
                if (doctor)
                    router.push('/rooms')
                else {
                    const data = await getUserProfileInfo()
                    if (data) setProfileData(data)
                }
            } else {
                router.push('/login')
            }
            setPageLoaded(true)
        }

        loadData()
        // setPageLoaded(true)
    }, [])

    return (
        <section className="w-screen h-dvh p-6 flex justify-center">
            <div className="space-y-10 w-[600px] flex flex-col justify-center">
                {/* <h1 className="font-bold text-xl text-center">
                    Complete Your Profile
                </h1> */}
                {
                    pageLoaded ? (
                        <Card >
                            <CardHeader>
                                <CardTitle>Technical Information</CardTitle>
                                <CardDescription>Fill in the form to complete your registration process.</CardDescription>
                            </CardHeader>
                            <CardContent className='max-h-[600px] overflow-auto remove-scrollbar'>
                                <DoctorRegisterForm profileData={profileData} />
                            </CardContent>
                            <CardContent>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='flex w-full items-center justify-center'>
                            <FadeLoader
                                color='white'
                                // loading={}
                                // cssOverride={}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                    )
                }
            </div>
        </section>
    )
}