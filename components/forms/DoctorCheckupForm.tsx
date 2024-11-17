import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ClipLoader from "react-spinners/ClipLoader"
import { getMedications, submitCheckup } from "@/lib/actions/doctor.actions"
import { useEffect, useState } from "react"
import { FancyMultiSelect } from "@/components/custom/FancyMultiSelect"
import { MultiSelectItem } from '@/components/custom/FancyMultiSelect' // type
import { Medicine, MedicineColumns } from "@/components/custom/columns" // type
import { SelectedMedicines } from "@/components/custom/SelectedMedicines" // component
import { SelectedMedicineTableDataType } from "@/components/custom/SelectedMedicines"

const prescriptionSchema = z.object({
    diagnosis: z.string().min(1, "Diagnosis is required"),
    treatment: z.string().min(1, "Treatment is required"),
    notes: z.string().min(1, "Notes is required"),
    prescription_validity: z.date().min(new Date(), "Prescription validity must be in the future"),
    other_medication: z.string().min(1, "Other medication is required"),

    // medication: z.array(
    //     z.object({
    //         drug_id: z.string().min(1, "Prescription ID is required"),
    //         // quantity: z.number().min(1, "Quantity must be at least 1"),
    //         dosage: z.string().min(1, "Dosage is required"),
    //         // frequency_daily: z.number().min(1, "Frequency must be at least 1"),
    //         duration_in_days: z.number().min(1, "Duration must be at least 1 day"),
    //         // administer_route: z.string().min(1, "Administer route is required"),
    //         guidelines: z.string().min(1, "Guidelines are required"),
    //     })
    // ),
});



const DoctorCheckupForm = ({ appointmentId }: { appointmentId?: any }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [medicationsDetails, setMedicationsDetails] = useState<Medicine[]>([]);
    const [medicationsTableData, setMedicationsTableData] = useState<SelectedMedicineTableDataType[]>([]);
    const [medicationSearchQuery, setMedicationSearchQuery] = useState<string>("");
    const [availableMedsCount, setAvailableMedsCount] = useState(0);
    const [queriedMedications, setQueriedMedications] = useState<MultiSelectItem[]>([])
    const [selectedMedications, setSelectedMedications] = useState<MultiSelectItem[]>([]);

    async function searchMedications(query: string) {
        const meds = await getMedications(query)

        if (meds && meds.length) {
            setMedicationsDetails((prev) => {
                const combined = [...prev, ...meds];

                return combined.filter((med, index, self) => (
                    index === self.findIndex((t) => t.id === med.id)
                ))
            })

            const current = meds.map((m) => ({ label: m.drug_name + " " + m.strength + " " + m.dosage_form as string, value: m.id as string }))
            setQueriedMedications((prev) => {
                const combined = [...prev, ...current];
                // Remove duplicates based on value
                return combined.filter((med, index, self) =>
                    index === self.findIndex((t) => t.value === med.value)
                );
            });
        }
    }

    useEffect(() => {

        async function loadMeds() {

            if (availableMedsCount < queriedMedications.length || availableMedsCount == 0) {
                await searchMedications(medicationSearchQuery)
            }
        }

        loadMeds()

    }, [medicationSearchQuery])


    const form = useForm<z.infer<typeof prescriptionSchema>>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            diagnosis: "",
            treatment: "",
            notes: "",
            prescription_validity: new Date(),
            other_medication: "",
            // medication: []
        }
    });

    // useEffect(() => {
    //     form.setValue('medication', medicationsTableData.map(med => ({
    //         drug_id: med.id,
    //         dosage: med.dosage,
    //         duration_in_days: Number(med.duration_in_days),
    //         guidelines: med.guidelines
    //     })))

    //     console.log(form.getValues())
    // }, [medicationsTableData])

    const onSubmit = async (values: z.infer<typeof prescriptionSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsSubmitting(true)
        const data = new FormData()
        data.append('appointment_id', appointmentId)
        data.append('diagnosis', values.diagnosis)
        data.append('treatment', values.treatment)
        data.append('notes', values.notes)
        data.append('prescription_validity', values.prescription_validity.toISOString())
        data.append('other_medication', values.other_medication)
        const medicationsData = medicationsTableData.map(med => ({
            drug_id: med.drug_id,
            // quantity: med.quantity,
            dosage: med.dosage,
            duration_in_days: Number(med.duration_in_days),
            // administer_route: med.administer_route,
            guidelines: med.guidelines
        }))
        data.append('medication', JSON.stringify(medicationsData))
        // data.append('medication', JSON.stringify(values.medication))

        const appCreate = await submitCheckup(data)
        console.log('Form Data:', Object.fromEntries(data.entries()));
        if (appCreate) {
            alert('created')
            // alertNewAppointment()
        } else {
            alert('failed')
        }

        setIsSubmitting(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-2 w-full">
                    <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel htmlFor="diagnosis">Diagnosis</FormLabel>
                                <FormControl>
                                    <Input
                                        id="diagnosis"
                                        className="p-2 rounded-sm w-full"
                                        value={field.value ?? ""}
                                        onChange={field.onChange} // Directly set the status
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="treatment"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel htmlFor="treatment">Treatment</FormLabel>
                                <FormControl>
                                    <Input
                                        id="treatment"
                                        className="p-2 rounded-sm"
                                        value={field.value ?? ""}
                                        onChange={field.onChange} // Directly set the status
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel htmlFor="notes">Notes</FormLabel>
                                <FormControl>
                                    <Input
                                        id="notes"
                                        className="p-2 rounded-sm"
                                        value={field.value ?? ""}
                                        onChange={field.onChange} // Directly set the status
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>




                <FormItem>
                    <FormLabel htmlFor="medication_search">Select Medications</FormLabel>
                    <FormControl>
                        <div>
                            <FancyMultiSelect
                                selected={selectedMedications}
                                setSelected={setSelectedMedications}
                                inputValue={medicationSearchQuery}
                                setInputValue={setMedicationSearchQuery}
                                itemsList={queriedMedications}
                                setSelectablesLength={setAvailableMedsCount}
                                placeholder="Search..."
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>


                <FormField
                    control={form.control}
                    name="prescription_validity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="prescription_validity">Prescription Validity</FormLabel>
                            <FormControl>
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date: any) => form.setValue('prescription_validity', date)}
                                    minDate={new Date()} // Ensure date is in the future
                                    className="p-2 rounded-sm bg-transparent bg-neutral-700" // Tailwind styling for input
                                    placeholderText="Select appointment date" // Placeholder text
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="other_medication"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="other_medication">Other Medication</FormLabel>
                            <FormControl>
                                <Input
                                    id="other_medication"
                                    className="p-2 rounded-sm"
                                    value={field.value ?? ""}
                                    onChange={field.onChange} // Directly set the status
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <SelectedMedicines details={medicationsDetails} data={medicationsTableData ?? []} setData={setMedicationsTableData} selected={selectedMedications} />

                <Button type="submit" variant='default' className='w-full'>
                    <span>Submit Checkup</span>
                    <span className={`ml-6 mt-1 ${form.formState.isSubmitting || 'hidden'}`}>
                        <ClipLoader
                            color='black'
                            aria-label="Loading Spinner"
                            data-testid="loader"
                            size={16}
                        />
                    </span>
                </Button>
            </form>
        </Form>
    )
}

export default DoctorCheckupForm