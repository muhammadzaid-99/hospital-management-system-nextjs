import React, { useEffect, useState } from 'react'
import { CheckupsColumns, CheckupType } from '../../../../components/custom/columns'
import { getCheckups, getLabTests, requestLabTest } from '@/lib/actions/patient.actions'
import { DataTable } from '../../../../components/custom/data-table'
import { ClipLoader } from 'react-spinners'
import { Skeleton } from '../../../../components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card'
import { labTests } from '@/lib/constants/lab-tests'
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogTitle } from '../../../../components/ui/dialog'
import { Button } from '../../../../components/ui/button'
import { acceptLabTest, getLabTestRequests } from '@/lib/actions/staff.actions'

const LabTestRequests = () => {
    const [labTestsData, setLabTestsData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    async function handleAcceptTest(labtestId: string) {
        setLoading(true)
        const accept = await acceptLabTest(labtestId)
        if (accept) {
            alert("Done")
        } else {
            alert("Failed")
        }
        setLoading(false)
    }

    useEffect(() => {
        async function loadLabTests() {
            const _labtests = await getLabTestRequests()
            setLabTestsData(_labtests || [])
            // console.log(_labtests)
        }

        if (loading === false) loadLabTests()
    }, [loading])

    return (
        labTestsData.length ? (
            <div className="flex gap-4 flex-wrap">
                {labTestsData.map((labTest) => {
                    const testName = labTests.find((test) => test.value === labTest.test_name)?.label || labTest.test_name;
                    const displayDate = labTest.request_date ? new Date(labTest.request_date).toDateString() : "N/A";
                    const dateLabel = "Request Date";

                    return (
                        <Card className="border rounded-2xl shadow-lg p-1 max-w-sm min-w-72" key={labTest.id}>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">{testName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Status: <span className="font-medium text-gray-800">{labTest.status}</span></p>
                                <p className="text-gray-600">{dateLabel} <span className="font-medium text-gray-800">{displayDate}</span></p>

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
                                            <p className="text-gray-600">{dateLabel} <span className="font-medium text-gray-800">{displayDate}</span></p>
                                        </div>
                                        <p className="text-gray-600">Description: <span className="font-medium text-gray-800">{labTest.description}</span></p>
                                        <p className="text-gray-600">Result: <span className="font-medium text-gray-800">{labTest.result}</span></p>

                                        {labTest.status === "Requested" && (
                                            <Button disabled={loading} className="mt-4" onClick={() => handleAcceptTest(labTest.id)}>Accept Test</Button>
                                        )}
                                    </DialogContent>
                                </Dialog>
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
export default LabTestRequests


