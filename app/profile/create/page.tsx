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
import { getUserEmail, getProfileRoleIfCreated } from '@/lib/actions/user.actions'
import { useRouter } from 'next/navigation'
import { profile } from 'console'
import FadeLoader from 'react-spinners/FadeLoader'
import { ProfileCreationForm } from '@/components/forms/ProfileCreationForm'

export default function ProfileCreationPage() {
    const router = useRouter()
    const [pageLoaded, setPageLoaded] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState("")
    useEffect(() => {
        async function loadData() {
            const profile = await getProfileRoleIfCreated()
            setRegisteredEmail(await getUserEmail())
            
            if (profile === 'Patient')
                router.push('/patient/register')
            else if (profile === 'Doctor') {
                router.push('/doctor/profile/created')
            } else if (profile === 'Operator') {
                router.push('/operator/register')
            } else {
                setPageLoaded(true)
            }
        }

        loadData()

    }, [])

    return (
        <section className="w-screen h-dvh p-6 flex justify-center">
            <div className="space-y-10 w-[480px] flex flex-col justify-center">
                {/* <h1 className="font-bold text-xl text-center">
                    Complete Your Profile
                </h1> */}
                {
                    pageLoaded ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Complete Your Profile</CardTitle>
                                <CardDescription>Let us know more about you.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfileCreationForm userEmail={registeredEmail} />
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