'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { scheduler } from 'timers/promises'


export async function getDoctors(date: Date) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    console.log("Searching available doctors on ", (new Date(date.setHours(23, 59, 59, 999))).toISOString())

    if (userData.user) {
        const { data: doctors, error } = await supabase
            .from('doctor_schedules')
            .select(`
                from_time, to_time,
                doctors(id, profiles(
                    first_name, last_name
                ))
                `)
            .eq('doctors.profiles.role', 'Doctor')
            .lte("from_time", (new Date(date.setHours(23, 59, 59, 999))).toISOString())
            .gte("to_time", (new Date(date.setHours(0, 0, 0, 1))).toISOString())
        // console.log(doctors)
        // if (doctors && doctors.length)
        //     console.log(doctors[0].doctors.profiles)
        // const { data: appointedPatients, error: perror } = await supabase
        //     .from('appointments')
        //     .select(`
        //         appointment_date, doctor_id
        //         `)
        //     .eq('doctor_id', )

        if (!error) {
            if (!doctors.length) return []
            const formattedDoctors = doctors.map(doctor => ({
                // @ts-ignore
                id: doctor.doctors.id,
                // @ts-ignore
                full_name: `${doctor.doctors.profiles.first_name} ${doctor.doctors.profiles.last_name}`
            }));
            const uniqueDoctors = formattedDoctors.filter((doctor, index, self) =>
                index === self.findIndex((d) => d.id === doctor.id)
            );

            console.log(uniqueDoctors)
            return uniqueDoctors
        }
        console.log(error)
    }

    return []
}

export async function getAppointmentSlots(doctor_id: string, date: Date) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: slots, error } = await supabase
            .from('doctor_schedules')
            .select('from_time, to_time, doctor_id, appointment_slots(start_time, end_time, schedule_id, id, appointments(id))')
            .eq('doctor_id', doctor_id)
            // .eq('appointment_slots.is_booked', false)
            .gte('from_time', (new Date(date.setHours(0, 0, 0, 1))).toISOString())
            .lte('to_time', (new Date(date.setHours(23, 59, 59, 999))).toISOString())

        if (!error) {
            if (!slots.length) return []
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

            console.log(availableSlotsWithTime)
            return availableSlotsWithTime.slice(0, 10) // first 10 only
        }
        console.log(error)
    }

    return []
}

export async function getAppointments() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: appointments, error } = await supabase
            .from('patient_appointments_with_doctors_inslot')
            .select('*')
            .eq('auth_uid', userData.user.id);


        if (!error && appointments) {
            const cleanedAppointments = appointments.map(({ auth_uid, ...rest }) => rest);
            // console.log(cleanedAppointments)
            cleanedAppointments.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
            return cleanedAppointments
        }
        console.log(error)
    }

    return []
}

export async function createAppointment(formData: FormData) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: patient, error: patientError } = await supabase
            .from('profiles')
            .select('auth_uid, patients ( id )')
            .eq('auth_uid', userData.user.id)
            .single(); // Assuming user_id is unique in the patients table


        if (patientError) {
            console.error('Error fetching patient ID:', patientError);
            return;
        }

        if (!patient) {
            console.error('No patient found for the given user ID');
            return;
        }

        // @ts-ignore
        const patient_id = patient.patients.id; // This is the correct patient ID to use

        const data = {
            doctor_id: parseInt(formData.get('doctor_id') as string),
            appointment_date: formData.get('appointment_date') as string,
            status: formData.get('status') as string,
            reason: formData.get('reason') as string,
            patient_id
        }

        console.log(data)

        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert([data]);

        if (error) {
            console.log(error)
            return false
        }

        revalidatePath('/patient/dashboard')
        return true
    }
}

export async function createAppointmentInSlot(formData: FormData) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: patient, error: patientError } = await supabase
            .from('profiles')
            .select('auth_uid, patients ( id )')
            .eq('auth_uid', userData.user.id)
            .single(); // Assuming user_id is unique in the patients table


        if (patientError) {
            console.error('Error fetching patient ID:', patientError);
            return;
        }

        if (!patient) {
            console.error('No patient found for the given user ID');
            return;
        }

        // @ts-ignore
        const patient_id = patient.patients.id; // This is the correct patient ID to use

        const data = {
            doctor_id: parseInt(formData.get('doctor_id') as string),
            appointment_date: formData.get('appointment_date') as string,
            status: formData.get('status') as string,
            reason: formData.get('reason') as string,
            appointment_slot_id: parseInt(formData.get('appointment_slot_id') as string),
            patient_id
        }

        console.log(data)

        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert([data]);

        if (error) {
            console.log(error)
            return false
        }

        revalidatePath('/patient/dashboard')
        return true
    }
}

export async function getCheckups(patientId: string | undefined) { 
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        let patient_id;

        if (patientId) {
            // here doctor is fetching the checkups of a patient
            // doctor authorization is not implemented yet
            patient_id = patientId;
        } else {
            const { data: patient, error: patientError } = await supabase
                .from('profiles')
                .select('auth_uid, patients ( id )')
                .eq('auth_uid', userData.user.id)
                .single(); // Assuming user_id is unique in the patients table
    
    
            if (patientError) {
                console.error('Error fetching patient ID:', patientError);
                return;
            }
    
            if (!patient) {
                console.error('No patient found for the given user ID');
                return;
            }

            // @ts-ignore
            patient_id = patient.patients.id; // This is the correct patient ID to use
        }


        const { data: checkups, error } = await supabase
            .from('checkups')
            .select('id, service_id, visit_date, diagnosis, treatment, notes, prescription_id, appointments (doctors (profiles (first_name, last_name)), patients (id))')
            .eq('appointments.patients.id', patient_id);

        // console.log(checkups[0].appointments.doctors)
        // console.log(checkups[0].appointments.patients)

        if (!error && checkups) {
            const assertedCheckups = checkups as {
                id: any;
                service_id: any;
                visit_date: any;
                diagnosis: any;
                treatment: any;
                notes: any;
                prescription_id: any;
                appointments: {
                    doctors: {
                        profiles: {
                            first_name: any;
                            last_name: any;
                        }
                    },
                    patients: {
                        id: any;
                    }
                };
            }[] | [];

            const updatedCheckups = assertedCheckups.map(checkup => {
                const { appointments: { doctors: { profiles: { first_name, last_name } } } } = checkup;

                return {
                    ...checkup,
                    doctor_full_name: `${first_name} ${last_name}`,
                    doctors: undefined // This effectively removes the 'doctors' field
                };
            });

            // console.log(updatedCheckups)
            return updatedCheckups
        }
    }

    return []
}
export async function getCheckupPaymentStatus() {

}

export async function getPrescriptionInfo(prescription_id: string) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: prescription, error } = await supabase
            .from('prescriptions')
            .select('*, medication (*, drugs_inventory (*))')
            .eq('id', prescription_id)
            .single()

        if (!error && prescription) {
            const prescriptionData = {
                status: prescription.status,
                prescription_date: prescription.prescription_date,
                other_medication: prescription.other_medication,
                validity: prescription.validity,
                medication: prescription.medication.map((med: any) => ({
                    dosage: med.dosage,
                    guidelines: med.guidelines,
                    duration_in_days: med.duration_in_days,
                    drug_name: med.drugs_inventory.drug_name,
                    strength: med.drugs_inventory.strength,
                    description: med.drugs_inventory.description,
                    dosage_form: med.drugs_inventory.dosage_form,
                    formula_name: med.drugs_inventory.formula_name,
                    chemical_formula: med.drugs_inventory.chemical_formula,
                    supplier: med.drugs_inventory.supplier
                }))
            };
            console.log(prescriptionData)
            return prescriptionData
        }
    }

    return null
}
