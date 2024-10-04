'use client'

import { getRooms } from '@/utils/actions/room.actions';

type Room = {
  id: string;
  room_number: number;
  room_type: string;
  capacity: number;
  status: string;
}

import { useEffect, useState } from 'react';

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  useEffect(() => {
    const loadRooms = async () => {

      const r = await getRooms();
      setRooms(r)
    }
    loadRooms()

  }, [])

  return (
    <div>
      {rooms.map(room => (
        <div key={room.id}>
          <h2>{room.room_number}</h2>
          <p className='text-green-500'>{room.status}</p>
        </div>
      ))}
    </div>
  )
}