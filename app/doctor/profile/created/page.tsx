'use client'
import React, { useEffect } from 'react'
import { isDoctorRegistered } from '@/lib/actions/user.actions'
import { useRouter } from 'next/navigation'
// import { sendEmail } from '@/lib/utils'



const DoctorProfileCreated = () => {
    const router = useRouter()
    useEffect(() => {
        async function loadData() {
            const isDoctor = await isDoctorRegistered()

            

            if (isDoctor)
                router.push('/rooms')
        }
        
        router.push('/doctor/register')
        // loadData()

    }, [])

    return (
        <section className='w-screen h-dvh p-6 flex justify-center'>
            <div className='space-y-10 w-[600px] flex flex-col justify-center'>
                <h1 className="font-bold text-xl text-center">
                    Profile Created
                </h1>
                <p className="text-center">
                    Your profile has been successfully created.
                    <br />
                    <br />
                    Kindly wait for the admin to approve your profile.
                    <br />
                    <br />
                    Soon, if approved, you will receive an email to complete your registration.
                </p>
            </div>
        </section>
    )
}

export default DoctorProfileCreated