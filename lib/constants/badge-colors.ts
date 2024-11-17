'use client'
export type AppointmentStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Postponed' | 'Confirmed';

export const statusColors: Record<AppointmentStatus, string> = {
    Pending: "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 hover:bg-opacity-70",
    Completed: "bg-green-100 hover:bg-green-100 text-green-800 hover:bg-opacity-70",
    Cancelled: "bg-red-100 hover:bg-red-100 text-red-800 hover:bg-opacity-70",
    Postponed: "bg-sky-100 hover:bg-sky-100 text-sky-800 hover:bg-opacity-70",
    Confirmed: "bg-blue-100 hover:bg-blue-100 text-blue-800 hover:bg-opacity-70",
};