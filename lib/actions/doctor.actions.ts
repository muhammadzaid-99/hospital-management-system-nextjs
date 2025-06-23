'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { DoctorAppointmentInterface } from '@/app/doctor/dashboard/page'
import { create } from 'domain'
import { log } from 'console'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
            doctors ( doctor_schedules (id, expected_patients, from_time, to_time)))
        `)
            .eq('auth_uid', userData.user.id)
            .gte('doctors.doctor_schedules.from_time', fromDateStart.toISOString())
            .lte('doctors.doctor_schedules.from_time', fromDateEnd.toISOString())

        console.log(schedules)

        if (schedules) {
            // Create a new array with the 'doctors' field removed
            // @ts-ignore
            const cleanedSchedules = schedules.map(({ auth_uid, doctors }) => doctors.doctor_schedules)[0];
            cleanedSchedules.sort((a: any, b: any) => new Date(b.from_time).getTime() - new Date(a.from_time).getTime());
            console.log(cleanedSchedules[0])

            if (!error && cleanedSchedules)
                return cleanedSchedules
        }
    }
    return []
}

export async function getDoctorSchedules_v2(fromDateStart: Date, fromDateEnd: Date) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    console.log(fromDateStart, fromDateEnd)

    // assuming hours for fromDateStart and fromDateEnd are correct from calling section
    if (userData.user) {
        const { data: schedules, error } = await supabase
            .from('view_doctor_schedules')
            .select('*')
            .eq('auth_uid', userData.user.id)
            .gte('from_time', fromDateStart.toISOString())
            .lte('from_time', fromDateEnd.toISOString())

        // console.log(schedules)

        if (schedules) {
            // Create a new array with the 'doctors' field removed
            // @ts-ignore
            const cleanedSchedules = schedules.map(({ auth_uid, ...rest }) => rest);
            cleanedSchedules.sort((a: any, b: any) => new Date(b.from_time).getTime() - new Date(a.from_time).getTime());
            // console.log(cleanedSchedules[0])

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
            // console.log(cleanedAppointments)

            if (!error && cleanedAppointments)
                return cleanedAppointments
        }
    }
    return []
}

export async function getDoctorAppointmentsInSlot(fromDateStart: Date, fromDateEnd: Date) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: appointments, error } = await supabase
            .from('doctors_appointments_with_patients_inslot')
            .select('*')
            .eq('auth_uid', userData.user.id)
            .gte('appointment_date', fromDateStart.toISOString())
            .lte('appointment_date', fromDateEnd.toISOString())

        // console.log(appointments)

        if (appointments) {
            // Create a new array with the 'doctors' field removed
            // @ts-ignore
            const cleanedAppointments = appointments.map(({ auth_uid, ...rest }) => rest);
            // console.log(cleanedAppointments)

            if (!error && cleanedAppointments)
                return cleanedAppointments
        }
    }
    return []
}

export async function getAppointmentSlotsForDoctor(date: Date) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: slotsData, error } = await supabase
            .from('profiles')
            .select('doctors(doctor_schedules (from_time, to_time, appointment_slots(start_time, end_time, schedule_id, id, appointments(id))))')
            .eq('auth_uid', userData.user.id)
            .gte('doctors.doctor_schedules.from_time', (new Date(date.setHours(0, 0, 0, 1))).toISOString())
            // here we suppose date means all slots on and after date
            // .lte('doctors.doctor_schedules.from_time', (new Date(date.setHours(23, 59, 59, 999))).toISOString())
            .limit(1, { referencedTable: 'doctors' })
            .single()


        if (!error) {
            if (!slotsData.doctors) return []
            const slots = slotsData.doctors.doctor_schedules
            // const slots = slotsData.doctors.doctor_schedules
            const formattedSlots = slots.flatMap(slot => {
                return slot.appointment_slots;
            });

            const availableSlots = formattedSlots.filter(s => s.appointments === null)

            const availableSlotsWithTime = availableSlots.map(slot => {
                const { start_time, end_time, schedule_id, id } = slot;
                return {
                    schedule_id, id,
                    start_time: new Date(start_time),
                    end_time: new Date(end_time)
                };
            })
            availableSlotsWithTime.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());

            // console.log(availableSlotsWithTime)
            return availableSlotsWithTime.slice(0, 50) // first 50 only
        }
        console.log(error)
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
                .map(med => JSON.parse(med as string))[0],
            labtests: formData.getAll('lab_tests').map(labtest => JSON.parse(labtest as string))[0]
        }

        console.log("data:  ", data)

        const checkup_service = {
            service_type: "checkup",
            created_at: new Date().toISOString(),
            description: "Checkup",
            status: "completed",
        }

        const { data: checkup_service_data, error: chk_serror } = await supabase
            .from('service')
            .insert([checkup_service])
            .select('id')
            .single()

        console.log(checkup_service_data)

        if (chk_serror) {
            console.log(chk_serror)
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
            service_id: checkup_service_data.id,
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
        console.log(data.labtests)

        if (data.labtests.length !== 0) {
            // const labtest_service = {
            //     service_type: "labtest",
            //     created_at: new Date().toISOString(),
            //     description: "Lab Test",
            //     status: "_xyz_",
            // }

            // const { data: labtest_service_data, error: lt_serr } = await supabase
            //     .from('service')
            //     .insert([labtest_service])
            //     .select('id')
            //     .single()

            // if (lt_serr) {
            //     console.log(lt_serr)
            //     return false
            // }

            // removed service thing, it will be added when it moves to some approved state and technician is assigned

            const labtestData = data.labtests.map((labtest: string) => {
                return {
                    // service_id: labtest_service_data.id,
                    test_name: labtest,
                    prescribed_date: new Date().toISOString(),
                    status: 'Prescribed',
                    appointment_id: data.appointment_id
                }
            })

            const { data: labtests, error: labtestError } = await supabase
                .from('lab_tests')
                .insert(labtestData)

            if (labtestError) {
                console.log(labtestError)
                return false
            }

        }
    }

    return true
}

export async function updateAppointmentStatus(appointment: any) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()


    // here i expect a bug because appointment date can be sent different from respective slot id by client
    if (userData.user) {
        // another bug is here because i am not checking if the appointment is for this doctor or not
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: appointment.status, appointment_slot_id: appointment.appointment_slot_id })
            .eq('id', appointment.id)

        if (error) {
            console.log(error)
            return false
        }
    }
    return true
}

export async function getPatientIdFromAppointmentId(appointment_id: string) {
    const supabase = createClient()

    const { data: patient, error } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('id', appointment_id)
        .single()

    if (error) {
        console.log(error)
        return ''
    }

    // console.log("asd", patient.patient_id)
    return patient.patient_id
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

async function callGeminiAPI(prompt: any) {
    const key = process.env.GEMINI_API;
    if (!key) {
        console.error("API key not found");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // const prompt = "Write a story about a magic backpack."

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text)
    return text
}

export async function getPatientHistoryAISummary(patientId: string) {
    // return `Patient history reveals multiple appointments for various reasons including flu, fever (including one instance described as high-grade and critical at 103°F), headache, cough, and cold.  Treatment has ranged from bed rest and hydration to medications such as Panadol, Brufen, Ciproxin, Augmentin, Claritin, Surbex-Z, and Flagyl.  Several appointments lacked detailed diagnostic information or notes.  Two instances involved a blood test and x-ray being prescribed, while the majority of appointments did not include lab tests.  Many prescriptions were for 5 days duration.`
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: recordData, error } = await supabase
            .from('patient_historical_record')
            .select('*')
            .eq('patient_id', patientId)

        console.log("History Data is here")
        // console.log(recordData)

        if (recordData) {
            const prompt = `Summarize the following patient history in a concise and structured manner for a doctor to quickly review. Provide a JSON stringified/text response with the following fields:
            {
            "summary": "Brief summary of patient's medical history",
            "key_conditions": ["Diabetes", "Hypertension", "None"],  // etc
            "recent_medications": ["Aspirin", "Metformin"],  // etc
            "important_lab_tests": ["CBC", "Lipid Profile"] // etc
            }

            Ignore patient_id.

            Patient History:
            ${JSON.stringify(recordData, null, 2)}
            `;

            console.log("Prompt is here");
            // console.log(prompt)

            const aiSummary = await callGeminiAPI(prompt);


            if (!error && aiSummary) {
                return aiSummary
            }
        }
    }
    return {}
}