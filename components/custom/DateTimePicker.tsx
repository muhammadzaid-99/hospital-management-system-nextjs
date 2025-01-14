"use client";

import { useState } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { ClockIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
    initialDate?: Date | null;
    initialTime?: string;
    onDateTimeChange: (selectedDateTime: Date) => void;
}

export function DateTimePicker({
    initialDate = null,
    initialTime = "14:30",
    onDateTimeChange,
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [time, setTime] = useState<string>(initialTime);
    const [date, setDate] = useState<Date | null>(initialDate);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const [hours, minutes] = time.split(":");
            selectedDate.setHours(parseInt(hours), parseInt(minutes));
            setDate(selectedDate);
            onDateTimeChange(selectedDate); // Pass the selected datetime to the parent
        }
    };

    const handleTimeSelect = (selectedTime: string) => {
        setTime(selectedTime);
        if (date) {
            const [hours, minutes] = selectedTime.split(":");
            const newDate = new Date(date.getTime());
            newDate.setHours(parseInt(hours), parseInt(minutes));
            setDate(newDate);
            onDateTimeChange(newDate); // Pass the updated datetime to the parent
        }
    };

    return (
        <div className="flex gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen} modal={false} >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn("w-full font-normal", !date && "text-muted-foreground")}
                    >
                        {date ? (
                            `${format(date, "PPP")}, ${time} hrs`
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flex items-start" align="start">
                    <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={date ?? undefined}
                        onSelect={(day) => handleDateSelect(day)}
                        // onDayClick={() => setIsOpen(false)}
                        fromYear={2000}
                        toYear={new Date().getFullYear()}
                    // disabled={(date) =>
                    //     Number(date) < Date.now() - 1000 * 60 * 60 * 24 ||
                    //     Number(date) > Date.now() + 1000 * 60 * 60 * 24 * 30
                    // }
                    />
                    <Select
                        defaultValue={time}
                        onValueChange={handleTimeSelect}
                    >
                        <SelectTrigger className="font-normal focus:ring-0 w-[120px] my-4 mr-2">
                            <SelectValue />
                            <ClockIcon className="ml-auto h-4 w-4 opacity-50" />
                        </SelectTrigger>

                        <SelectContent>
                            <ScrollArea className="h-[15rem]" >
                                {Array.from({ length: 96 }).map((_, i) => {
                                    const hour = Math.floor(i / 4).toString().padStart(2, "0");
                                    const minute = ((i % 4) * 15).toString().padStart(2, "0");
                                    return (
                                        <SelectItem key={i} value={`${hour}:${minute}`}>
                                            {hour}:{minute}
                                        </SelectItem>
                                    );
                                })}
                            </ScrollArea>
                        </SelectContent>
                    </Select>

                </PopoverContent>
            </Popover>

        </div>
    );
}