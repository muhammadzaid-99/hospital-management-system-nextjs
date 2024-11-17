import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    FormControl,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";


const DatePicker = ({ field }: { field: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [date, setDate] = useState<Date | null>(null);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                    >
                        {field.value ? (
                            `${format(field.value, "PPP")}`
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={date || field.value}
                    onSelect={(selectedDate) => {
                        // const [hours, minutes] = time?.split(":")!;
                        // using international date below
                        selectedDate?.setUTCMinutes(selectedDate?.getUTCMinutes() - selectedDate?.getTimezoneOffset());
                        // console.log(new Date().getTimezoneOffset())
                        // console.log(selectedDate?.toLocaleString());
                        setDate(selectedDate!);
                        field.onChange(selectedDate);
                    }}
                    onDayClick={() => setIsOpen(false)}
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    disabled={(date) =>
                        // Number(date) < Date.now() - 1000 * 60 * 60 * 24 ||
                        Number(date) > Date.now()
                    }
                />
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker