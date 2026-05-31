import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function DateTime({ control }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex gap-4">
            <div className="flex flex-col gap-3">
                <FormField
                    control={control}
                    name="Date"
                    defaultValue={new Date()}
                    render={({ field }) => (
                        <FormItem className="flex flex-col gap-3">
                            <FormLabel htmlFor="date-picker" className="px-1">
                                Date
                            </FormLabel>

                            <FormControl>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date-picker"
                                            className={`w-32 justify-between font-normal ${!field.value && "text-muted-foreground"}`}
                                        >
                                            {field.value
                                                ? new Date(field.value).toLocaleDateString()
                                                : "Select date"}
                                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            defaultMonth={field.value || new Date()}
                                            captionLayout="dropdown"
                                            onSelect={(selectedDate) => {
                                                field.onChange(selectedDate);
                                                setOpen(false);
                                            }}
                                            classNames={{
                                                head_cell: "w-8 font-normal text-[0.8rem]",
                                                cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex flex-col gap-3">
                <FormField
                    control={control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col gap-3">
                            <FormLabel htmlFor="start-time" className="px-1">
                                Start Time
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="time"
                                    id="start-time"
                                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-24" // Added width constraint
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex flex-col gap-3">
                <FormField
                    control={control}
                    name="endTime"
                    render={({ field }) => (
                        <FormItem className="flex flex-col gap-3">
                            <FormLabel htmlFor="end-time" className="px-1">
                                End Time
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="time"
                                    id="end-time"
                                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-24" // Added width constraint
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}