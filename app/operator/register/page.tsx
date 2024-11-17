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
import { getUserEmail, isPatientRegistered, getProfileRoleIfCreated } from '@/lib/actions/user.actions'
import { useRouter } from 'next/navigation'
import FadeLoader from 'react-spinners/FadeLoader'
import { ProfileCreationForm } from '@/components/forms/ProfileCreationForm'
import { PatientRegisterForm } from '@/components/forms/PatientRegisterForm'
import { getUserProfileInfo } from '@/lib/actions/user.actions'
import { isOperatorRegistered } from '@/lib/actions/operator.actions'
import { OperatorRegisterForm } from '@/components/forms/OperatorRegisterForm'

interface profileDataInterface {
    email: string;
    first_name: string | any;
    last_name: string | any;
    gender: 'Male' | 'Female' | 'Other' | undefined
}

export default function OperatorRegisterPage() {
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
            if (!profile)
                router.push('/profile/create')
            const operator = await isOperatorRegistered()
            console.log(profile, operator)

            if (profile === 'Operator') {
                if (operator)
                    router.push('/operator/dashboard')
                else {
                    const data = await getUserProfileInfo()
                    if (data) setProfileData(data)

                    setPageLoaded(true)
                }
            } else {
                router.push('/login')
            }
        }

        loadData()

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
                                <CardTitle>Medical Information</CardTitle>
                                <CardDescription>Fill in the form to complete your medical registration process.</CardDescription>
                            </CardHeader>
                            <CardContent className='max-h-[600px] overflow-auto remove-scrollbar'>
                                <OperatorRegisterForm profileData={profileData} />
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