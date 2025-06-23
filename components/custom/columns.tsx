'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import PrescriptionData from "./PrescriptionData";
import { PatientAppointmentInterface } from "@/app/patient/dashboard/page";
export type AppointmentStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Postponed' | 'Confirmed';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

export const statusColors: Record<AppointmentStatus, string> = {
    Pending: "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 hover:bg-opacity-70",
    Completed: "bg-green-100 hover:bg-green-100 text-green-800 hover:bg-opacity-70",
    Cancelled: "bg-red-100 hover:bg-red-100 text-red-800 hover:bg-opacity-70",
    Postponed: "bg-sky-100 hover:bg-sky-100 text-sky-800 hover:bg-opacity-70",
    Confirmed: "bg-blue-100 hover:bg-blue-100 text-blue-800 hover:bg-opacity-70",
};
import { Badge } from '@/components/ui/badge'
export type Medicine = {
    id: string;
    drug_name: string;
    formula_name: string;
    chemical_formula: string;
    strength: string;
    dosage_form: string;
    description: string;
    supplier: string;
    // quantity: Number;
    dosage: string;
    // frequency_daily: Number;
    duration_in_days: Number;
    // administer_route: string;
    guidelines: string;
}

export type CheckupType = {
    id: string;
    appointment_id: string;
    service_id: string;
    visit_date: Date;
    diagnosis: string;
    treatment: string;
    notes: string;
    prescription_id: string;
    doctor_full_name: string;
}


export const PatientAppointmentColumns: ColumnDef<PatientAppointmentInterface>[] = [
    {
        header: "Appointment Date",
        accessorKey: "appointment_date",
        cell: ({ row }) => {
            console.log(row.getValue('start_time'));
            if (row.original.start_time === null) {
                const offset = new Date().getTimezoneOffset();  // minutes
                const fullDate = new Date(row.getValue('appointment_date'));
                fullDate.setUTCMinutes(fullDate.getUTCMinutes() - offset);
                return <p className="min-w-20">{fullDate.toDateString()}</p>;
            } else {
                const offset = new Date().getTimezoneOffset();  // minutes
                const fullDate = new Date(row.original.start_time);
                fullDate.setUTCMinutes(fullDate.getUTCMinutes() - offset);
                // return <p className="min-w-20">{fullDate.toDateString()} @ {fullDate.getHours()}:{fullDate.getMinutes()}</p>;
                return <p className="min-w-20">{fullDate.toDateString()} @ {fullDate.toLocaleTimeString()}</p>;
            }
        }
    },
    {
        header: "Duration",
        accessorKey: "end_time",
        cell: ({ row }) => {
            if (row.original.start_time === null) {
                return <p className="min-w-20">-</p>;
            } else {
                const offset = new Date().getTimezoneOffset();  // minutes
                const fullDate = new Date(row.original.start_time);
                const toDate = new Date(row.original.end_time);
                const durationMs = toDate.getTime() - fullDate.getTime();
                const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                fullDate.setUTCMinutes(fullDate.getUTCMinutes() - offset);
                return <p className="min-w-20">{durationHours != 0 ? durationHours + ' hr' : ''} {durationMinutes != 0 ? durationMinutes + ' min' : ''}</p>;
            }
        }
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
            const statusVal = row.getValue('status') as string;
            return <Badge className={`${statusColors[statusVal as AppointmentStatus] || ''} w-20 flex justify-center`}>
                <span>
                    {statusVal}
                </span>
            </Badge>
        }
    },
    {
        header: "Reason",
        accessorKey: "reason",
        cell: ({ row }) => {
            return <p className="min-w-20">{row.getValue('reason')}</p>;
        }
    },
    {
        header: "Doctor",
        accessorKey: "doctor_full_name",
        cell: ({ row }) => {
            return <p className="min-w-20">{row.getValue('doctor_full_name')}</p>;
        }
    }
]

export const CheckupsColumns: ColumnDef<CheckupType>[] = [
    {
        header: "Visit Date",
        accessorKey: "visit_date",
        cell: ({ row }) => {
            const fullDate = new Date(row.getValue('visit_date'));
            return <p className="min-w-20">{fullDate.toDateString()}</p>;
        }
    },
    {
        header: "Diagnosis",
        accessorKey: "diagnosis",
        cell: ({ row }) => {
            return <p className="min-w-20">{row.getValue('diagnosis')}</p>;
        }
    },
    {
        header: "Treatment",
        accessorKey: "treatment",
        cell: ({ row }) => {
            return <p className="min-w-20">{row.getValue('treatment')}</p>;
        }
    },
    {
        header: "Notes",
        accessorKey: "notes",
        cell: ({ row }) => {
            return <p className="min-w-20">{row.getValue('notes')}</p>;
        }
    },
    {
        header: "Doctor",
        accessorKey: "doctor_full_name",
        cell: ({ row }) => {
            return <p className="min-w-20">{row.getValue('doctor_full_name')}</p>;
        }
    },
    {
        header: "Prescription",
        accessorKey: "prescription_id",
        cell: ({ row }) => {
            return <PrescriptionData prescription_id={row.getValue('prescription_id') as string} appointment_id={row.original.appointment_id as string} />
        }
    }
]

export const MedicineColumns: ColumnDef<Medicine>[] = [
    {
        header: "Drug Name",
        accessorKey: "drug_name",
        cell: ({ row }) => {
            return <p className="min-w-20">{row.getValue('drug_name')}</p>;
        }
    },

    {
        header: "Strength",
        accessorKey: "strength",
    },
    {
        header: "Dosage Form",
        accessorKey: "dosage_form",
        cell: ({ row }) => {
            return <p className="min-w-28">{row.getValue('dosage_form')}</p>;
        }
    },
    {
        header: "Daily Dosage",
        accessorKey: "dosage",

    },
    {
        header: "Duration in Days",
        accessorKey: "duration_in_days",

    },
    {
        header: "Guidelines",
        accessorKey: "guidelines",

    },
    {
        header: "Formula Name",
        accessorKey: "formula_name",
    },
    {
        header: "Chemical Formula",
        accessorKey: "chemical_formula",
    },
    {
        header: "Supplier",
        accessorKey: "supplier",
    },
    {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => {
            // const desc = (row.getValue('description') as string).slice(0, 50);
            // return <p className="min-w-60">{desc.length < 50 ? desc : `${desc}...`}</p>;

            const desc = (row.getValue('description') as string);
            return (
                <HoverCard>
                    <HoverCardTrigger asChild><p className="min-w-60">{desc.length < 50 ? desc : `${desc.slice(0, 50)}...`}</p></HoverCardTrigger>
                    <HoverCardContent>
                        <p className="break-words whitespace-normal">{desc}</p>
                    </HoverCardContent>
                </HoverCard>
            )
        }
    },
]