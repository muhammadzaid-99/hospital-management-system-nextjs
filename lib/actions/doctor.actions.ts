'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'

export async function getDoctorSchedules() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: schedules, error } = await supabase
            .from('doctor_schedules')
            .select(`
                expected_patients,
                from_time,
                to_time,
                doctors ( profiles ( auth_uid ) )
            `)
            .eq('doctors.profiles.auth_uid', userData.user.id);

        if (schedules) {
            // Create a new array with the 'doctors' field removed
            const cleanedSchedules = schedules.map(({ doctors, ...rest }) => rest);

            console.log(cleanedSchedules)

            if (!error && cleanedSchedules)
                return cleanedSchedules
        }
    }
    return []
}

export async function createSchedule(formData: FormData) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()


    if (userData.user) {
        // Fetch the doctor ID based on the user ID
        const { data: doctor, error: doctorError } = await supabase
            .from('doctors')
            .select('id, profiles ( auth_uid )')
            .eq('profiles.auth_uid', userData.user.id)
            .single(); // Assuming user_id is unique in the doctors table

        if (doctorError) {
            console.error('Error fetching doctor ID:', doctorError);
            return;
        }

        if (!doctor) {
            console.error('No doctor found for the given user ID');
            return;
        }

        const doctor_id = doctor.id; // This is the correct doctor ID to use

        const data = {
            expected_patients: parseInt(formData.get('expected_patients') as string),
            from_time: formData.get('from_time') as string,
            to_time: formData.get('to_time') as string,
            doctor_id
        }
        console.log(data)

        const { data: schedules, error } = await supabase
            .from('doctor_schedules')
            .insert([data]);

        if (error) {
            console.log(error)
            return false
        }
    }
    revalidatePath('/doctor/dashboard');
    return true
}