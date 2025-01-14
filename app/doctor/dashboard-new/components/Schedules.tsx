import React, { useState, useEffect, useMemo } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteSchedule, getDoctorSchedules, getDoctorSchedules_v2 } from '@/lib/actions/doctor.actions'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { TrashIcon } from '@radix-ui/react-icons'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu"
import { Filter, RectangleEllipsis, Users, UserCheck } from 'lucide-react'
import { ClipLoader } from 'react-spinners'
import { getDatesForFilter } from '../page'
import { scheduleInterface } from '../page'


const Schedules = ({ newScheduleCreated, setNewScheduleCreated, schedules, setSchedules }: { newScheduleCreated: number, setNewScheduleCreated: React.Dispatch<React.SetStateAction<number>>, schedules: scheduleInterface[], setSchedules: React.Dispatch<React.SetStateAction<scheduleInterface[]>> }) => {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSearching, setIsSearching] = useState(false);
    const { toast } = useToast();
    // const [showEndTime, setShowEndTime] = useState(() => {
    //     // return false
    //     const showEndTimeLS = localStorage.getItem('showEndTime');
    //     return showEndTimeLS === 'true';
    // })
    const [scheduleFilter, setScheduleFilter] = useState<string>(() => {
        // return 'today'
        const scheduleFilterLS = localStorage.getItem('scheduleFilter');
        return scheduleFilterLS ?? 'today';
    });
    const [scheduleCardInfoOptions, setScheduleCardInfoOptions] = useState(() => {
        const userOptions = localStorage.getItem('scheduleCardInfoOptions');
        const defaults = {
            showExpectedPatients: true,
            showBookedPatients: true,
            showEachPatientTime: true,
            showStartTime: true,
            showEndTime: false
        }
        const userOptionsParsed = userOptions ? JSON.parse(userOptions) : {}
        userOptionsParsed.showStartTime = true
        return userOptions ? userOptionsParsed : defaults;
        // return userOptions ? JSON.parse(userOptions) : defaults;
    })

    useEffect(() => { localStorage.setItem('scheduleCardInfoOptions', JSON.stringify(scheduleCardInfoOptions)) }, [scheduleCardInfoOptions])

    useEffect(() => {
        async function loadData() {
            setSchedules([])
            setIsSearching(true)
            const { fromDateStart, fromDateEnd } = getDatesForFilter(scheduleFilter)
            console.log(fromDateStart, fromDateEnd)
            const __schedules = await getDoctorSchedules_v2(fromDateStart, fromDateEnd)
            setSchedules(__schedules)
            setIsSearching(false)
        }

        loadData()
        localStorage.setItem('scheduleFilter', scheduleFilter.toString())
    }, [newScheduleCreated, scheduleFilter])


    async function handleDeleteScheduleButtonClick(schedule_id: string) {
        setIsSubmitting(true)
        console.log('Deleting schedule...')
        const deletedSchedule = await deleteSchedule(schedule_id)

        if (deletedSchedule) {
            toast({
                title: "Deleted",
                description: "The schedule has been deleted successfully.",
            })

            setNewScheduleCreated((newScheduleCreated) => newScheduleCreated - 1)
        } else {
            toast({
                title: "Error",
                description: "An error occurred while deleting the schedule.",
            })
        }
        setIsSubmitting(false)
    }

    return (
        <ScrollArea className='pr-4'>
            <div className='flex flex-col gap-4'>
                <div className='flex w-full justify-between items-center text-neutral-600 p-2 text-sm'>
                    <Select defaultValue={scheduleFilter} onValueChange={(val) => setScheduleFilter(val)}>
                        <SelectTrigger className="w-fit hover:text-black">
                            <SelectValue placeholder="Filter" />
                            <Filter className='ml-2 h-4' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All (3 Months Recent)</SelectItem>
                            <SelectItem value="past">Last 30 days</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            {/* <SelectItem value="date">Custom Date</SelectItem> */}
                        </SelectContent>
                    </Select>
                    {/* <div className='flex items-center gap-2'>
                        <Label>Show End Time</Label>
                        <Switch
                            checked={showEndTime}
                            onCheckedChange={setShowEndTime}
                        />
                    </div> */}
                    <div className='flex items-center gap-2'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline"><RectangleEllipsis className='h-4' /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Schedule Display Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={scheduleCardInfoOptions.showExpectedPatients}
                                    onCheckedChange={(val) => setScheduleCardInfoOptions({ ...scheduleCardInfoOptions, showExpectedPatients: val })}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    Expected Patients
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={scheduleCardInfoOptions.showBookedPatients}
                                    onCheckedChange={(val) => setScheduleCardInfoOptions({ ...scheduleCardInfoOptions, showBookedPatients: val })}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    Booked Patients
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={scheduleCardInfoOptions.showEachPatientTime}
                                    onCheckedChange={(val) => setScheduleCardInfoOptions({ ...scheduleCardInfoOptions, showEachPatientTime: val })}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    Each Patient Time
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={scheduleCardInfoOptions.showStartTime}
                                    onCheckedChange={(val) => setScheduleCardInfoOptions({ ...scheduleCardInfoOptions, showStartTime: val })}
                                    onSelect={(e) => e.preventDefault()}
                                    disabled
                                >
                                    Start Time
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={scheduleCardInfoOptions.showEndTime}
                                    onCheckedChange={(val) => setScheduleCardInfoOptions({ ...scheduleCardInfoOptions, showEndTime: val })}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    End Time
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                </div>
                {schedules && schedules.length ? (
                    schedules.map((schedule, index) => {
                        const offset = new Date().getTimezoneOffset();  // minutes
                        const fullDate = new Date(schedule.from_time);
                        fullDate.setUTCMinutes(fullDate.getUTCMinutes() - offset);
                        const formattedDate = `${fullDate.getDate()}-${fullDate.getMonth() + 1}-${fullDate.getFullYear()}`;
                        const fromTimeFormatted = `${fullDate.getHours().toString().padStart(2, '0')}:${fullDate.getMinutes().toString().padStart(2, '0')}`;
                        const toDate = new Date(schedule.to_time);
                        toDate.setUTCMinutes(toDate.getUTCMinutes() - offset);
                        const toTimeFormatted = `${toDate.getHours().toString().padStart(2, '0')}:${toDate.getMinutes().toString().padStart(2, '0')}`;
                        const durationMs = toDate.getTime() - fullDate.getTime();
                        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

                        return (
                            <Card key={index} className='p-4 rounded-lg flex flex-col gap-2 shadow-sm hover:shadow-md group/schedule_card select-none'>
                                <div className='flex justify-between items-center'>
                                    <p className='font-semibold text-black'>{fullDate.toDateString()} </p>
                                    <div className='flex gap-2 items-center'>
                                        {/* <Badge variant='secondary' className='text-sm bg-neutral-100 text-neutral-900 hover:bg-neutral-200 select-none transition-colors'>
                                            {schedule.booked_slots_count / schedule.expected_patients * 100}% Booked
                                        </Badge> */}
                                        <Badge variant='secondary' className='text-sm bg-neutral-100 text-neutral-900 hover:bg-neutral-200 select-none transition-colors'>
                                            {durationHours != 0 ? durationHours + ' hr' : ''} {durationMinutes != 0 ? durationMinutes + ' min' : ''}
                                        </Badge>
                                    </div>
                                </div>
                                <Separator className='my-2 h-[1px]' />
                                <div className='flex w-full justify-between items-center'>
                                    <div className='text-black flex gap-0'>
                                        {scheduleCardInfoOptions.showExpectedPatients && (
                                            <p className='flex gap-3 items-start flex-col'>
                                                <span className='text-neutral-600 w-28 text-xs'>Patients Expected</span>
                                                <p className='font-medium text-xl flex gap-2 items-center'>
                                                    <Users className='' />
                                                    <span>{schedule.expected_patients < 10 && '0'}{schedule.expected_patients}</span>
                                                </p>
                                            </p>
                                        )}
                                        {scheduleCardInfoOptions.showBookedPatients && (
                                            <p className='flex gap-3 items-start flex-col'>
                                                <span className='text-neutral-600 w-28 text-xs'>Patients Booked</span>
                                                <p className='font-medium text-xl flex gap-2 items-center'>
                                                    <UserCheck className='' />
                                                    <span>{schedule.booked_slots_count < 10 && '0'}{schedule.booked_slots_count}</span>
                                                </p>
                                            </p>
                                        )}
                                        {scheduleCardInfoOptions.showEachPatientTime && (
                                            <p className='flex gap-3 items-start flex-col'>
                                                <span className='text-neutral-600 w-28 text-xs'>Each Patient Time</span>
                                                <span className='font-medium text-xl'>{Math.floor((durationMs / 60000) / schedule.expected_patients)} min</span>
                                            </p>
                                        )}
                                        {(scheduleCardInfoOptions.showExpectedPatients || scheduleCardInfoOptions.showBookedPatients || scheduleCardInfoOptions.showEachPatientTime) && (
                                            <div className="w-6">
                                                <Separator orientation='vertical' className='w-0.5' />
                                            </div>
                                        )}
                                        {scheduleCardInfoOptions.showStartTime && (
                                            <p className='flex gap-3 items-start flex-col'>
                                                <span className='text-neutral-600 text-xs w-28'>Start Time</span>
                                                <span className='font-medium text-lg'>{fullDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </p>
                                        )}
                                        {scheduleCardInfoOptions.showEndTime && (
                                            <p className='flex gap-3 items-start flex-col w-28'>
                                                <span className='text-neutral-600 text-xs'>End Time</span>
                                                {durationHours > 23 ? (
                                                    <span className='font-medium text-lg'> {toDate.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                ) : (
                                                    <span className='font-medium text-lg'> {toDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="secondary" className='hover:bg-red-200 hover:bg-opacity-20 hover:text-red-800 self-end disabled:opacity-0 opacity-0 group-hover/schedule_card:opacity-100 transition-all duration-300 group/button w-12 hover:w-20' disabled={isSubmitting}>
                                                <TrashIcon className='inline-block group-hover/button:hidden' />
                                                <span className='hidden group-hover/button:inline-block'>Delete</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Schedule Deletion?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this schedule for {fullDate.toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} and cancel all associated appointments.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className=' hover:bg-red-600' onClick={() => handleDeleteScheduleButtonClick(schedule.id)} disabled={isSubmitting}>Delete Schedule</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </Card>
                        );
                    })
                ) : (isSearching ? (
                    <ClipLoader color='black' aria-label='Loading Spinner' data-testid='loader' className='m-3' />
                ) : (
                    <p className='m-3'>
                        No schedules found for the selected filter.
                    </p>
                )
                )}
            </div>
        </ScrollArea>
    )
}

export default Schedules