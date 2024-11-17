import React from 'react'
import { CopyIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import Image from "next/image"
import { getPrescriptionInfo } from "@/lib/actions/patient.actions"
import ClipLoader from "react-spinners/ClipLoader"
import { MedicineColumns } from './columns'
import { DataTable } from './data-table'

const PrescriptionData = ({ prescription_id }: { prescription_id: string }) => {

    const [prescriptionData, setPrescriptionData] = useState<any>(null);
    const [viewPrescriptionClicked, setViewPrescriptionClicked] = useState(false);
    // const prescription_id: string = row.getValue('prescription_id');
    console.log(prescription_id)

    useEffect(() => {
        async function loadPrescription() {
            const prescription = await getPrescriptionInfo(prescription_id);
            setPrescriptionData(prescription);
        }

        if (viewPrescriptionClicked)
            loadPrescription();
    }, [viewPrescriptionClicked])

    useEffect(() => {
        console.log(prescriptionData)
    }, [prescriptionData])

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setViewPrescriptionClicked(true)}>View Prescription</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl flex flex-col">
                <DialogHeader>
                    <DialogTitle>Prescription Information</DialogTitle>
                    <DialogDescription>
                        Details of prescription provided by the doctor.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 w-full">
                    {prescriptionData ? (
                        <div className="w-full">
                            <p>Status: {prescriptionData.status}</p>
                            <p>Prescription Date: {new Date(prescriptionData.prescription_date).toDateString()}</p>
                            <p>Other Medication: {prescriptionData.other_medication}</p>
                            <p>Validity: {new Date(prescriptionData.validity).toDateString()}</p>

                            <h3 className='mt-4 mb-2 font-medium uppercase text-sm'>Medications</h3>
                            <div className="overflow-x-auto" style={{ maxWidth: '100%', whiteSpace: 'nowrap' }}>
                                <DataTable data={prescriptionData.medication} columns={MedicineColumns} />
                            </div>
                        </div>
                    ) : (
                        <ClipLoader
                            color='black'
                            aria-label="Loading Spinner"
                            data-testid="loader"
                            className="m-3"
                        />
                    )}
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}

export default PrescriptionData