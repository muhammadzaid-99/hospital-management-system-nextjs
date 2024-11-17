'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'


export async function isOperatorRegistered() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
  
    if (!userData) {
      return redirect('/login')
    }
  
    const { data, error } = await supabase.from('profiles').select(`
        id,
        operators (id)
      `).eq('auth_uid', userData.user?.id)
  
    console.log(data?.at(0)?.operators)
  
    return data?.length === 1 && data?.at(0)?.operators ? true : false
  }

  export async function registerOperator(formData: FormData) {

    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
  
    if (!data.user || data.user?.email != formData.get('email'))
      return false;
  
    const { data: user_data } = await supabase.from('profiles').select('id').eq('auth_uid', data.user.id)
  
  
    if (user_data) {
      const user_id = user_data[0].id
  
      const form_data = [{
        specialization: formData.get('specialization') as string,
        role: formData.get('role') as string,
        join_date: new Date().toISOString(),
        user_id: user_id
      }]
  
      console.log('about to register')
  
      const { data: registerData, error } = await supabase.from('operators').insert(form_data).select()
  
      console.log(registerData, error)
  
      if (!error)
        return true
    }
  
    return false
  }
  