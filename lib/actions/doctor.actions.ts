'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { DoctorAppointmentInterface } from '@/app/doctor/dashboard/page'
import { create } from 'domain'
import { log } from 'console'

export async function getDoctorSchedules(fromDateStart: Date, fromDateEnd: Date) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    console.log(fromDateStart, fromDateEnd)

    // assuming hours for fromDateStart and fromDateEnd are correct from calling section
    if (userData.user) {
        const { data: schedules, error } = await supabase
            .from('profiles')
            .select(`
            auth_uid,
            doctors ( doctor_schedules (id, expected_patients, from_time, to_time) )
        `)
            .eq('auth_uid', userData.user.id)
            .gte('doctors.doctor_schedules.from_time', fromDateStart.toISOString())
            .lte('doctors.doctor_schedules.from_time', fromDateEnd.toISOString())

        console.log(schedules)

        if (schedules) {
            // Create a new array with the 'doctors' field removed
            // @ts-ignore
            const cleanedSchedules = schedules.map(({ auth_uid, doctors }) => doctors.doctor_schedules)[0];
            cleanedSchedules.sort((a:any, b:any) => new Date(b.from_time).getTime() - new Date(a.from_time).getTime());
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
            .from('profiles')
            .select('auth_uid, doctors ( id )')
            .eq('auth_uid', userData.user.id)
            .single(); // Assuming user_id is unique in the doctors table

        console.log(doctor)

        if (doctorError) {
            console.error('Error fetching doctor ID:', doctorError);
            return;
        }

        if (!doctor) {
            console.error('No doctor found for the given user ID');
            return;
        }

        // @ts-ignore
        const doctor_id = doctor.doctors.id; // This is the correct doctor ID to use

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


export async function deleteSchedule(schedule_id: string) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data, error } = await supabase
            .from('doctor_schedules')
            .delete()
            .eq('id', schedule_id)

        if (error) {
            console.log(error)
            return false
        }
    }
    return true
}

export async function getDoctorAppointments(fromDateStart: Date, fromDateEnd: Date) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: appointments, error } = await supabase
            .from('doctors_appointments_with_patients')
            .select('*')
            .eq('auth_uid', userData.user.id)
            .gte('appointment_date', fromDateStart.toISOString())
            .lte('appointment_date', fromDateEnd.toISOString())

        // console.log(appointments)

        if (appointments) {
            // Create a new array with the 'doctors' field removed
            // @ts-ignore
            const cleanedAppointments = appointments.map(({ auth_uid, ...rest }) => rest);
            console.log(cleanedAppointments)

            if (!error && cleanedAppointments)
                return cleanedAppointments
        }
    }
    return []
}

export async function getMedications(query: string) {
    const supabase = createClient()

    const { data: meds, error } = await supabase
        .from('drugs_inventory')
        .select('*')
        .ilike('drug_name', `%${query}%`)
        .limit(6)

    if (error) {
        console.log(error)
        return []
    }

    return meds
}

export async function submitCheckup(formData: FormData) {

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const data = {
            appointment_id: parseInt(formData.get('appointment_id') as string),
            diagnosis: formData.get('diagnosis') as string,
            treatment: formData.get('treatment') as string,
            notes: formData.get('notes') as string,
            prescription_validity: formData.get('prescription_validity') as string,
            other_medication: formData.get('other_medication') as string,
            medication: formData.getAll('medication')
                .map(med => JSON.parse(med as string))[0]
        }

        console.log("data:  ", data)

        const service = {
            service_type: "checkup",
            created_at: new Date().toISOString(),
            description: "Checkup",
            status: "completed",
        }

        const { data: serviceData, error: serviceError } = await supabase
            .from('service')
            .insert([service])
            .select('id')
            .single()

        console.log(serviceData)

        if (serviceError) {
            console.log(serviceError)
            return false
        }

        const { data: appointment_ids, error: idsError } = await supabase
            .from('appointments')
            .update({ status: 'Completed' })
            .eq('id', data.appointment_id)
            .select('id')
            .single()

        if (idsError) {
            console.log(idsError)
            return false
        }

        const prescriptionData = {
            prescription_date: new Date().toISOString(),
            status: "Active",
            other_medication: data.other_medication,
            validity: data.prescription_validity,
        }

        const { data: prescription, error: prescriptionError } = await supabase
            .from('prescriptions')
            .insert([prescriptionData])
            .select('id')
            .single()

        if (prescriptionError) {
            console.log(prescriptionError)
            return false
        }

        console.log('prescription created with id:', prescription.id)

        const medicationData = data.medication.map((med: any) => {
            console.log(med)
            return {
                prescription_id: prescription.id,
                drug_id: med.drug_id,
                dosage: med.dosage,
                duration_in_days: med.duration_in_days,
                guidelines: med.guidelines
            }
        })
        console.log(medicationData[0])
        const { data: medication, error: medicationError } = await supabase
            .from('medication')
            .insert(medicationData)


        if (medicationError) {
            console.log(medicationError)
            return false
        }
        console.log('medication done')

        const checkup_data = {
            diagnosis: data.diagnosis,
            treatment: data.treatment,
            notes: data.notes,
            visit_date: new Date().toISOString(),
            service_id: serviceData.id,
            appointment_id: appointment_ids.id,
            prescription_id: prescription.id
        }

        const { data: checkupData, error: checkupError } = await supabase
            .from('checkups')
            .insert([checkup_data])

        if (checkupError) {
            console.log(checkupError)
            return false
        }

        console.log('checkup done')
    }

    return true
}

export async function updateAppointmentStatus(appointment: any) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: appointment.status, appointment_date: appointment.appointment_date })
            .eq('id', appointment.id)

        if (error) {
            console.log(error)
            return false
        }
    }
    return true
}

// export async function checkDoctorsAvailability(doctor_id: any, date: Date) {
//     const supabase = createClient()
//     const { data: userData } = await supabase.auth.getUser()

//     if (userData.user) {
//         const { data, error } = await supabase
//             .from('doctor_schedules')
//             .select(`from_time, to_time`)
//             .eq('doctor_id', doctor_id)
//             .lte()

//         if (data)
            
//     }
// }


// export async function getPatientDetails(appointment_id: string) {
//     const supabase = createClient()

//     const { data: patient, error } = await supabase
//         .from('patients')
//         .select('date_of_birth, allergies, medical_history, family_history, disability')
//         .eq('id', patient_id)
//         .single()

//     if (error) {
//         console.log(error)
//         return {}
//     }

//     return patient
// }