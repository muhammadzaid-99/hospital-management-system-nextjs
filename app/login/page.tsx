'use client'

import { LoginForm } from '@/components/forms/LoginForm'
import { SignupForm } from '@/components/forms/SignupForm'
import { emailLogin, oAuthSignIn, signup } from '../../lib/actions/user.actions'
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
import { logout } from '../../lib/actions/user.actions'
import { useEffect } from 'react'


type OAuthProvider = {
    name: Provider,
    displayName: string,
    icon?: JSX.Element
}

export function OAuthButtons() {
    const providers: OAuthProvider[] = [{
        name: "google",
        displayName: "Google",
    }];

    return <>
        {providers.map(provider => (
            <Button key={provider.name} variant="outline" className='w-full' onClick={async () => {
                await oAuthSignIn(provider.name)
            }}>
                Continue with {provider.displayName}
            </Button>
        ))}
    </>
}

const logoutFirst = async () => {
    // const lg = await logout() 
}


export default function LoginPage() {
    useEffect(() => {
        logoutFirst()
    }, [])

    return (
        <section className="w-screen h-dvh p-6 flex justify-center">
            <div className="space-y-10 w-full max-w-80 mt-40">
                <h1 className="font-bold text-xl text-center">
                    Hospital Management System
                </h1>
                <Card className="w-[400px]">
                    <Tabs defaultValue="login" >
                        <TabsList className="grid w-full grid-cols-2 h-10 rounded-b-none">
                            <TabsTrigger value="login" className="h-full data-[state=active]:bg-transparent data-[state=active]:font-bold">Login</TabsTrigger>
                            <TabsTrigger value="signup" className="h-full data-[state=active]:bg-transparent data-[state=active]:font-bold">Signup</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <CardHeader>
                                <CardTitle>Login</CardTitle>
                                {/* <CardDescription>Card Description</CardDescription> */}
                            </CardHeader>
                            <CardContent>
                                <LoginForm />
                            </CardContent>
                            <CardContent>
                                <OAuthButtons />
                            </CardContent>
                        </TabsContent>
                        <TabsContent value="signup">
                            <CardHeader>
                                <CardTitle>Sign Up</CardTitle>
                                {/* <CardDescription>Card Description</CardDescription> */}
                            </CardHeader>
                            <CardContent>
                                <SignupForm />
                            </CardContent>
                            <CardContent>
                                <OAuthButtons />
                            </CardContent>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </section>
    )
}