import React, { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; 

export function TaskSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [tasks, setTasks] = useState(["Casing Manufacturing", "Casing Installing", "Other Installasions", "Cell Charge", "Folklift", "E-Bike", "E-Vehicle", "Others"]);

  
  const filteredTasks = tasks.filter((task) =>
    task.toLowerCase().includes(inputValue.toLowerCase())
  );

  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim() === "") return;
      const newValue = inputValue.trim();
      if (!tasks.includes(newValue)) {
        setTasks((prev) => [...prev, newValue]);
      }
      onChange(newValue);
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* <Label>Task</Label> */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
            onClick={() => setOpen(true)}
          >
            {value || "Select or type task"}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[490px] p-2 space-y-2">
          <Input
            placeholder="Type or select task..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="max-h-48 overflow-y-auto">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task}
                  className={cn(
                    "cursor-pointer rounded-md px-2 py-1 hover:bg-accent",
                    value === task && "bg-accent"
                  )}
                  onClick={() => {
                    onChange(task);
                    setInputValue(task);
                    setOpen(false);
                  }}
                >
                  {task}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground px-2">
                Press <b>Enter</b> to add “{inputValue}”
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
