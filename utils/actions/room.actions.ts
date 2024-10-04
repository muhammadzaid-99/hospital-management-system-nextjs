'use server'
import { createClient } from '@/utils/supabase/server'
import { parseStringify } from '../utils';

export const getRooms = async () => {
  const supabase = createClient();
  const {data: rooms} = await supabase.from("rooms").select();

  return parseStringify(rooms)
}