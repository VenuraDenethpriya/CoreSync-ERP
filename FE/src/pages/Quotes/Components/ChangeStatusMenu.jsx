"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { updateQuoteStatus } from "@/api/quoteApi";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

export function ChangeStatusDropdownMenu({ onUpdate, ...props }) {
    const { getToken } = useAuth();
    const [status, setStatus] = useState(props.status);

    useEffect(() => {
        setStatus(props.status);
    }, [props.status]);

    const handleStatusChange = async (newStatus) => {
        try {
            const token = await getToken();
            console.log("Token:", token);
            setStatus(status);
            const response = await updateQuoteStatus(token, props.quoteId, newStatus);
            const isSuccess = 
                response.message === "success" || 
                (response.data && response.data.message === "success");

            if (isSuccess) {
                setStatus(newStatus);
                
                toast.success(`Quote NO: ${props.quoteNo} updated to ${newStatus}`, { position: "bottom-right" });
                if (onUpdate) {
                    onUpdate(newStatus);
                }
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating quote status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {
                    status === "Rejected" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-20 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : status === "Discarded" ? (
                        <Button variant="ghost"><Badge className="bg-gray-600 rounded-full">{status}</Badge></Button>
                    ) : status === "Confirmed" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full hover:bg-green-800">{status}</Badge></Button>
                    ) : status === "Submitted" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full hover:bg-blue-800">{status}</Badge></Button>
                    ) : status === "Drafted" ? (
                        <Button variant="ghost"><Badge className="bg-amber-500 rounded-full w-20 justify-center hover:bg-amber-700">{status}</Badge></Button>
                    ) : (
                        <Button variant="ghost"><Badge className="bg-gray-600 rounded-full">{status}</Badge></Button>
                    )
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" align="start" className="w-40">
                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Rejected") }}
                >
                    <Badge className="bg-red-600 rounded-full w-20 justify-center hover:bg-red-800">Rejected</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Discarded") }}
                >
                    <Badge className="bg-gray-600 rounded-full">Discarded</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Submitted") }}
                >
                    <Badge className="bg-blue-600 rounded-full hover:bg-blue-800">Submitted</Badge>
                </DropdownMenuCheckboxItem>
                 <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Confirmed") }}
                >
                    <Badge className="bg-green-600 rounded-full hover:bg-green-800">Confirmed</Badge>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
