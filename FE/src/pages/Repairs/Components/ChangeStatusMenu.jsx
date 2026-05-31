
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
import { updateRepair } from "@/api/repair";

export function ChangeStatusDropdownMenu(props) {
    const { getToken } = useAuth();

    const [status, setStatus] = useState(props.status);
    const handleStatusChange = async (status) => {
        try {
            const token = await getToken();
            const repairId = props.repairId
            setStatus(status);
            const response = await updateRepair(token, repairId, {
                repair_id: repairId,
                status: status
            });
            if (response.message === "success") {
                toast.success(`Job NO: ${props.jobNo} updated!`);

                if (onUpdate) {
                    onUpdate();
                }
            } else {
                setStatus(props.status);
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {
                    status === "Pending" ? (
                        <Button variant="ghost"><Badge className="bg-red-300 rounded-full w-24 justify-center hover:bg-red-500">{status}</Badge></Button>
                    ) : status === "In Progress" ? (
                        <Button variant="ghost"><Badge className="bg-gray-600 rounded-full w-24 justify-center">{status}</Badge></Button>
                    ) : status === "Completed" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">{status}</Badge></Button>
                    ) : status === "Drafted" ? (
                        <Button variant="ghost"><Badge className="bg-amber-500 rounded-full w-24 justify-center hover:bg-amber-700">{status}</Badge></Button>
                    ) : status === "Cancelled" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-amber-800">{status}</Badge></Button>
                    ) : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" align="start" className="w-40">

                <div>
                    <DropdownMenuCheckboxItem
                        onClick={() => { handleStatusChange("Cancelled") }}
                    >
                        <Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">Cancelled</Badge>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        onClick={() => { handleStatusChange("Pending") }}
                    >
                        <Badge className="bg-red-300 rounded-full w-24 justify-center hover:bg-red-500">Pending</Badge>
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                        onClick={() => {
                            handleStatusChange("In Progress");
                        }}
                    >
                        <Badge className="bg-gray-600 rounded-full w-24 justify-center">In Progress</Badge>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        onClick={() => {
                            handleStatusChange("Completed");
                        }}
                    >
                        <Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">Completed</Badge>
                    </DropdownMenuCheckboxItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}