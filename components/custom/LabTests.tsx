import React, { useEffect, useState } from 'react'
import { CheckupsColumns, CheckupType } from './columns'
import { getCheckups, getLabTests, requestLabTest } from '@/lib/actions/patient.actions'
import { DataTable } from './data-table'
import { ClipLoader } from 'react-spinners'
import { Skeleton } from '../ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { labTests } from '@/lib/constants/lab-tests'
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

const LabTests = ({ patientId }: { patientId?: string }) => {
    const [labTestsData, setLabTestsData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    async function handleRequestTest(labtestId: string) {
        setLoading(true)
        // console.log(labtestId)
        const req = await requestLabTest(labtestId)
        if (req) {
            alert('requested lab test')
        } else {
            alert('failed to request lab test')
        }
        setLoading(false)
    }

    useEffect(() => {
        async function loadLabTests() {
            console.log('loading labtests', patientId)
            const _labtests = await getLabTests(patientId)
            setLabTestsData(_labtests || [])
            // console.log(_labtests)
        }

        if (loading === false) loadLabTests()
    }, [loading])

    return (
        labTestsData.length ? (
            <div className="flex gap-4 flex-wrap">
                {labTestsData.map((labTest) => {
                    let displayDate;
                    let dateLabel;
                    switch (labTest.status) {
                        case "Completed":
                            displayDate = labTest.completion_date ? new Date(labTest.completion_date).toDateString() : "N/A";
                            dateLabel = "Completion Date";
                            break;
                        case "Processing":
                        case "Ready for Sampling":
                            displayDate = labTest.approval_date ? new Date(labTest.approval_date).toDateString() : "N/A";
                            dateLabel = "Approval Date";
                            break;
                        case "Requested":
                            displayDate = labTest.request_date ? new Date(labTest.request_date).toDateString() : "N/A";
                            dateLabel = "Request Date";
                            break;
                        case "Prescribed":
                            displayDate = labTest.prescribed_date ? new Date(labTest.prescribed_date).toDateString() : "N/A";
                            dateLabel = "Prescription Date";
                            break;
                        default:
                            displayDate = "N/A";
                            dateLabel = "Date";
                    }

                    const testName = labTests.find((test) => test.value === labTest.test_name)?.label || labTest.test_name;

                    return (
                        <Card className="border rounded-2xl shadow-lg p-1 max-w-sm min-w-32" key={labTest.id}>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">{testName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Status: <span className="font-medium text-gray-800">{labTest.status}</span></p>
                                <p className="text-gray-600">{dateLabel}: <span className="font-medium text-gray-800">{displayDate}</span></p>
                                {patientId === undefined && (
                                    <Dialog>
                                        <DialogTrigger className="mt-2">
                                            View Details
                                        </DialogTrigger>
                                        <DialogContent className="p-4">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {testName}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Details of the lab test
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex gap-2">
                                                <p className="text-gray-600">Status: <span className="font-medium text-gray-800">{labTest.status}</span></p>
                                                <p className="text-gray-600">{dateLabel}: <span className="font-medium text-gray-800">{displayDate}</span></p>
                                            </div>
                                            <p className="text-gray-600">Description: <span className="font-medium text-gray-800">{labTest.description}</span></p>
                                            <p className="text-gray-600">Result: <span className="font-medium text-gray-800">{labTest.result}</span></p>

                                            {labTest.status === "Prescribed" && (
                                                <Button disabled={loading} className="mt-4" onClick={() => handleRequestTest(labTest.id)}>Request Test</Button>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        ) : (
            <div className="space-y-3">
                <Skeleton className={`h-8 rounded-md w-[40%]`} />
                <Skeleton className={`h-6 rounded-md w-[55%]`} />
                <Skeleton className={`h-8 rounded-md w-[28%]`} />
                <Skeleton className={`h-8 rounded-md w-[16%]`} />
            </div>
        )
    )
}
export default LabTests


