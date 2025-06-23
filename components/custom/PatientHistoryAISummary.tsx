import { getPatientHistoryAISummary } from '@/lib/actions/doctor.actions';
import React, { useEffect, useState } from 'react'
import { Pill, Stethoscope, FlaskConical } from "lucide-react";
import { Skeleton } from '../ui/skeleton';

const PatientHistoryAISummary = ({ patientId }: { patientId: string }) => {
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        async function loadSummary() {
            console.log('loading ai summary', patientId)
            const _summary = await getPatientHistoryAISummary(patientId)
            const jsonMatch = _summary.match(/```json\s*([\s\S]*?)\s*```/);
            if (!jsonMatch) throw new Error("Invalid JSON format");

            const cleanedJson = jsonMatch[1]; // Extract actual JSON content
            const parsedData = JSON.parse(cleanedJson); // Parse it
            console.log(parsedData)
            setSummary(parsedData || 'No summary available')
            console.log(_summary)
        }

        loadSummary()
    }, [])

    return (
        <div className="space-y-4 bg-white shadow-lg rounded-2xl">
            <h2 className="font-semibold text-xl text-gray-900">Federated Summary</h2>

            {summary ? (
                <div className="space-y-4 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50">
                    <p className="text-gray-800">{summary.summary}</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                            <Stethoscope className="w-8 h-8 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-900">Key Conditions</p>
                                <p className="text-gray-700">{summary.key_conditions.length ? summary.key_conditions.join(", ") : "None"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                            <Pill className="w-8 h-8 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-900">Recent Medications</p>
                                <p className="text-gray-700">{summary.recent_medications.length ? summary.recent_medications.join(", ") : "None"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                            <FlaskConical className="w-8 h-8 text-green-500 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-900">Important Lab Tests</p>
                                <p className="text-gray-700">{summary.important_lab_tests.length ? summary.important_lab_tests.join(", ") : "None"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <Skeleton className="h-32 rounded-xl w-full bg-gradient-to-r from-blue-100 to-pink-100" />
            )}
        </div>

    )
}

export default PatientHistoryAISummary