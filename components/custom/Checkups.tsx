import React, { useEffect, useState } from 'react'
import { CheckupsColumns, CheckupType } from './columns'
import { getCheckups } from '@/lib/actions/patient.actions'
import { DataTable } from './data-table'
import { ClipLoader } from 'react-spinners'
import { Skeleton } from '../ui/skeleton'

const Checkups = ({ patientId }: { patientId?: string }) => {
    const [checkups, setCheckups] = useState<CheckupType[]>([])

    useEffect(() => {
        async function loadCheckups() {
            console.log('loading checkups', patientId)
            const __checkups = await getCheckups(patientId)
            setCheckups(__checkups || [])
        }

        loadCheckups()
    }, [])

    return (
        checkups.length ? (
            <DataTable data={checkups} columns={CheckupsColumns} />
        ) : (
            <div className="space-y-3">
                <Skeleton className={`h-8 rounded-md w-[40%]`} />
                <Skeleton className={`h-8 rounded-md w-[28%]`} />
                <Skeleton className={`h-6 rounded-md w-[55%]`} />
                <Skeleton className={`h-8 rounded-md w-[16%]`} />
            </div>






            // <ClipLoader
            //     color='black'
            //     aria-label="Loading Spinner"
            //     data-testid="loader"
            //     className="m-3"
            // />
        )
    )
}

export default Checkups