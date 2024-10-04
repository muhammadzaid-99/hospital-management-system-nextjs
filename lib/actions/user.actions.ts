'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { nullable } from 'zod'
// import { sendEmail } from '../utils'
import { send } from 'process'

export async function emailLogin(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Login failed')
  }

  revalidatePath('/', 'layout')
  // redirect('/rooms')
  return true
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const form_data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data, error } = await supabase.auth.signUp(form_data)

  // console.log(data)

  if (!data.user?.user_metadata.email) {
    console.log(error)
    redirect('/login?message=Signup failed')
  }

  await emailLogin(formData)

  revalidatePath('/', 'layout')
  // redirect('/profile/create')
  return true
}

export async function logout() {
  const supabase = createClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function oAuthSignIn(provider: Provider) {
  if (!provider) return redirect('/login?message=Invalid provider')
  const supabase = createClient()
  // const redirectUrl = getURL()
  const redirectUrl = 'http://localhost:3000/auth/callback'


  const { data, error } = await supabase.auth.signInWithOAuth({
    provider, options: {
      redirectTo: redirectUrl
    }
  })

  if (error) {
    console.log(error)
    redirect('/login?message=Google login failed')
  }

  console.log("data.url", data.url)
  return redirect(data.url)
}

export async function getProfileRoleIfCreated() {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData) {
    return redirect('/login')
  }

  const { data, error } = await supabase.from('profiles').select('role').eq('auth_uid', userData.user?.id)

  if (data && data.length) {
    return data[0].role
  }
  return null
}

export async function getUserEmail() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  return data.user?.email ?? ""
}

export async function getUserProfileInfo() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  if (data.user) {
    const email = data.user.email

    const { data: pdata, error } = await supabase.from('profiles').select('first_name, last_name, gender')

    if (!error && pdata && email) {
      const profileData = { ...pdata[0], email }
      return profileData
    }

    return null
  }

}

export async function createUserProfile(formData: FormData) {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  if (data.user?.email != formData.get('email'))
    return false;

  const form_data = [{
    role: formData.get('role') as string,
    gender: formData.get('gender') as string,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    auth_uid: data.user?.id
  }]

  const { data: profileData, error } = await supabase.from('profiles').insert(form_data).select()

  console.log(profileData, error)



  if (!error && profileData) {

    // if (form_data[0].role === 'Doctor') {
    //   const registerToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    //   const updateToken = await supabase.from('profiles').update({ register_token: registerToken }).eq('auth_uid', data.user?.id);
    //   console.log(updateToken)

    //   if (data.user?.email)
    //     await sendEmail({ to: data.user?.email, subject: "Register Doctor", text: `Click this link: http://loaclhost:3000/doctor/register/${registerToken}` })
    // }

    return profileData[0]
  }
  return false
}

export async function registerPatient(formData: FormData) {

  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user || data.user?.email != formData.get('email'))
    return false;

  const { data: user_data } = await supabase.from('profiles').select('id').eq('auth_uid', data.user.id)


  if (user_data) {
    const user_id = user_data[0].id

    const form_data = [{
      date_of_birth: formData.get('date_of_birth') as string,
      address: formData.get('address') as string,
      emergency_contact: formData.get('emergency_contact') as string,
      disability: formData.get('disability') as string,
      family_history: formData.get('family_history') as string,
      medical_history: formData.get('medical_history') as string,
      allergies: formData.get('allergies') as string,
      user_id: user_id
    }]

    console.log('about ot register')

    const { data: registerData, error } = await supabase.from('patients').insert(form_data).select()

    console.log(registerData, error)

    if (!error)
      return true
  }

  return false
}

export async function registerDoctor(formData: FormData) {

  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user || data.user?.email != formData.get('email'))
    return false;

  const { data: user_data } = await supabase.from('profiles').select('id').eq('auth_uid', data.user.id)


  if (user_data) {
    const user_id = user_data[0].id

    const form_data = [{
      specialization: formData.get('specialization') as string,
      license_number: formData.get('license_number') as string,
      join_date: new Date().toISOString(),
      user_id: user_id
    }]

    console.log('about ot register')

    const { data: registerData, error } = await supabase.from('doctors').insert(form_data).select()

    console.log(registerData, error)

    if (!error)
      return true
  }

  return false
}

export async function isPatientRegistered() {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData) {
    return redirect('/login')
  }

  const { data, error } = await supabase.from('profiles').select(`
      id,
      patients (id)
    `).eq('auth_uid', userData.user?.id)

  console.log(data?.at(0)?.patients)

  return data?.length === 1 && data?.at(0)?.patients ? true : false
}

export async function isDoctorRegistered() {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData) {
    return redirect('/login')
  }

  const { data, error } = await supabase.from('profiles').select(`
    id,
    doctors (id)
    `).eq('auth_uid', userData.user?.id)

  console.log(data?.at(0)?.doctors)

  return data?.length === 1 && data?.at(0)?.doctors ? true : false
}


export async function redirectToRequiredPath() {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData) {
    return redirect('/login')
  }

  const { data: profileData } = await supabase.from('profiles').select('role').eq('auth_uid', userData.user?.id)

  if (profileData && profileData.length) {
    if (profileData[0].role === 'Patient') {
      const patient = await supabase.from('patients').select('id').eq('user_id', userData.user?.id)
      if (!patient)
        redirect('/patient/register')
    } else if (profileData[0].role === 'Doctor') {
      const doctor = await supabase.from('doctors').select('id').eq('user_id', userData.user?.id)
      if (doctor)
        redirect('/doctor/profile/created')
    }
  } else {
    redirect('/profile/create')
  }
}