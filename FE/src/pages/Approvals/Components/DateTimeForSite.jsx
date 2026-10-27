import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DateTimeSite({ date, setDate, startTime, setStartTime, endTime, setEndTime }) {
    const [open, setOpen] = useState(false);

    const parsedDate = date ? new Date(date) : undefined;

    return (
        <div className="flex flex-wrap gap-4 col-span-3">
            {/* Date Picker */}
            <div className="flex flex-col gap-3">
                <Label className="px-1">Date</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-32 justify-between font-normal ${!date && "text-muted-foreground"}`}
                        >
                            {date ? parsedDate.toLocaleDateString("en-GB") : "Select date"}
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={parsedDate}
                            defaultMonth={parsedDate || new Date()}
                            onSelect={(selectedDate) => {
                                setDate(selectedDate);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-3">
                <Label className="px-1">Start Time</Label>
                <Input
                    type="time"
                    value={startTime || ""}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-background w-32 px-3"
                />
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-3">
                <Label className="px-1">End Time</Label>
                <Input
                    type="time"
                    value={endTime || ""}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-background w-32 px-3"
                />
            </div>
        </div>
    );
}