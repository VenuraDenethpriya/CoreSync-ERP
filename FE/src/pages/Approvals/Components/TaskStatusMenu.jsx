
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";
import { updateTask } from "@/api/taskApi";

export function ChangeTaskDropdownMenu({ onUpdate, ...props }) {
    const { getToken } = useAuth();

    const [status, setStatus] = useState(props.status);
    useEffect(() => {
        setStatus(props.status);
    }, [props.status]);

    const handleStatusChange = async (newStatus) => {
        try {
            const token = await getToken();
            setStatus(newStatus);
            const response = await updateTask(token, {
                id: props.taskId,
                status: newStatus,
            });
            if (response.message === "success") {
                toast.success("Task status updated successfully!", { position: "bottom-right" });
                if (onUpdate) {
                    onUpdate(newStatus);
                }
            } else {
                setStatus(props.status);
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating task status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {
                    status === "In Progress" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">{status}</Badge></Button>
                    ) : status === "Completed" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">{status}</Badge></Button>
                    ) : status === "Over Due" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-amber-800">{status}</Badge></Button>
                    ) : status === "To Do" ? (
                        <Button variant="ghost"><Badge className="bg-red-500 rounded-full w-24 justify-center hover:bg-red-300">{status}</Badge></Button>
                    ) : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" align="start" className="w-40">
                <div>
                    <DropdownMenuCheckboxItem
                        onClick={() => { handleStatusChange("In Progress") }}
                    >
                        <Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">In Progress</Badge>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        onClick={() => { handleStatusChange("Completed") }}
                    >
                        <Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">Completed</Badge>
                    </DropdownMenuCheckboxItem>
                </div>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}