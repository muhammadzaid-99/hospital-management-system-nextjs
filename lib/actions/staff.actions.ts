'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function getLabTestRequests() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: staff, error: staffError } = await supabase
            .from('profiles')
            .select('auth_uid, staff ( id )')
            .eq('auth_uid', userData.user.id)
            .single();


        if (staffError) {
            console.error('Error fetching staff ID:', staffError);
            return;
        }

        if (!staff) {
            console.error('No staff found for the given user ID');
            return;
        }

        const { data: labTests, error } = await supabase
            .from('lab_tests')
            .select('*')
            .eq('status', 'Requested');

        if (!error && labTests) {
            // console.log(labTests)
            const assertedLabTests = labTests as {
                id: any;
                test_name: any;
                approval_date: any,
                completion_date: any,
                prescribed_date: any,
                report_link: any,
                request_date: any,
                results: any,
                service_id: any,
                status: any,
                technician_id: any,
            }[] | [];

            const labTestCleaned = assertedLabTests.map(labTest => {
                return {
                    ...labTest,
                }
            });
            return labTestCleaned
        }
        console.log(error)
        return []
    }
}

export async function acceptLabTest(labtestId: string) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (labtestId && userData.user) {
        const { data: staff, error: staffError } = await supabase
            .from('profiles')
            .select('auth_uid, staff ( id )')
            .eq('auth_uid', userData.user.id)
            .single(); // Assuming user_id is unique in the patients table


        if (staffError) {
            console.error('Error fetching staff ID:', staffError);
            return;
        }

        if (!staff) {
            console.error('No staff found for the given user ID');
            return;
        }

        // @ts-ignore
        const staff_id = staff.staff.id; // This is the correct patient ID to use

        const { data: labTest, error } = await supabase
            .from('lab_tests')
            .update({ status: 'Ready for Sampling', approval_date: new Date().toISOString(), technician_id: staff_id })
            .eq('id', labtestId)
            .eq('status', 'Requested');

        if (!error) {
            return true
        }
        console.log(error)
        return false
    }
}

export async function startLabTestProcessing(labtestId: string) {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (labtestId && userData.user) {
        const { data: staff, error: staffError } = await supabase
            .from('profiles')
            .select('auth_uid, staff ( id )')
            .eq('auth_uid', userData.user.id)
            .single(); // Assuming user_id is unique in the patients table


        if (staffError) {
            console.error('Error fetching staff ID:', staffError);
            return;
        }

        if (!staff) {
            console.error('No staff found for the given user ID');
            return;
        }

        // @ts-ignore
        const staff_id = staff.staff.id; // This is the correct patient ID to use

        const { data: labTest, error } = await supabase
            .from('lab_tests')
            .update({ status: 'Processing' })
            .eq('id', labtestId)
            .eq('status', 'Ready for Sampling')
            .eq('technician_id', staff_id);

        if (!error) {
            return true
        }
        console.log(error)
        return false
    }
}



export async function getMyLabTests() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (userData.user) {
        const { data: staff, error: staffError } = await supabase
            .from('profiles')
            .select('auth_uid, staff ( id )')
            .eq('auth_uid', userData.user.id)
            .single(); // Assuming user_id is unique in the patients table


        if (staffError) {
            console.error('Error fetching staff ID:', staffError);
            return;
        }

        if (!staff) {
            console.error('No staff found for the given user ID');
            return;
        }

        // @ts-ignore
        const staff_id = staff.staff.id; // This is the correct patient ID to use

        const { data: labTests, error } = await supabase
            .from('lab_tests')
            .select('*')
            .eq('technician_id', staff_id);

        if (!error && labTests) {
            // console.log(labTests)
            const assertedLabTests = labTests as {
                id: any;
                test_name: any;
                approval_date: any,
                completion_date: any,
                prescribed_date: any,
                report_link: any,
                request_date: any,
                results: any,
                service_id: any,
                status: any,
                technician_id: any,
            }[] | [];

            const labTestCleaned = assertedLabTests.map(labTest => {
                return {
                    ...labTest,
                }
            });
            return labTestCleaned
        }
        console.log(error)
        return []
    }
}
