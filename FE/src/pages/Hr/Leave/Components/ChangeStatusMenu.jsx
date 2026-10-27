"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";
import { updateLeaveRequst, updateTalentPool } from "@/api/hrApi";

export function ChangeStatusDropdownMenu(props) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const navigate = useNavigate();
    const [status, setStatus] = useState(props.leave.status);

    const handleStatusChange = async (status) => {
        try {
            const token = await getToken();
            setStatus(status);
            const response = await updateLeaveRequst(token, {
                id: props.leave.id,
                status: status,
                accepted_by: user?.id, 
            }

            );
            if (response.message === "success") {
                toast.success("Leave reques of: " + props.leave.empName + " status updated successfully!", { position: "bottom-right" });
                // setTimeout(() => {
                //     window.location.reload();
                // }, 2500);

            }
        } catch (error) {
            console.error("Error updating leave request status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative" asChild>
                {
                    status === "Approved" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full  w-30 justify-center hover:bg-green-800">{status}</Badge></Button>
                    ) : status == "Rejected" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full  w-30 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : status === "Pending" ? (
                        <Button variant="ghost"><Badge className="bg-red-200 text-red-800 rounded-full  w-30 justify-center hover:bg-red-400">{status}</Badge></Button>
                    )  : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 absolute right-[60px] top-[-40px] z-50">
                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Approved") }}
                >
                    <Badge className="bg-green-600 rounded-full  w-30 justify-center hover:bg-green-800">Approved</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Rejected") }}
                >
                    <Badge className="bg-red-600 rounded-full  w-30 justify-center hover:bg-red-800">Rejected</Badge>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
