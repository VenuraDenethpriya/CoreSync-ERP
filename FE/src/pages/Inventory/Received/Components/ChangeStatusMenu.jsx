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
import { updateInventoryItem, updateInventoryOrder } from "@/api/inventoryApi";
import { useAuth } from "@clerk/clerk-react";

export function ChangeOrderStatusDropdownMenu(props) {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState(props.item.status);

    const handleStatusChange = async (status) => {
        try {
            const token = await getToken();
            setStatus(status);
            const response = await updateInventoryOrder(token, {
                id: props.item.id,
                status: status
            }


            );
            if (response.message === "success") {
                toast.success("Order No: " + props.item.orderNo + " status updated successfully!", { position: "bottom-right" });
                // setTimeout(() => {
                //     window.location.reload();
                // }, 2500);

            }
        } catch (error) {
            console.error("Error updating item status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative" asChild>
                {
                    status == "Checked" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : status === "Action Needed" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : status === "Received" ? (
                        <Button variant="ghost"><Badge className="bg-green-600  rounded-full w-24 justify-center hover:bg-green-800">{status}</Badge></Button>
                    ) : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 absolute right-[60px] top-[-40px] z-50">
                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Checked") }}
                >
                    <Badge className="bg-blue-600 rounded-full w-30 justify-center hover:bg-blue-800">Checked</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Action Needed") }}
                >
                    <Badge className="bg-red-600 rounded-full w-30 justify-center hover:bg-red-800">Action Needed</Badge>
                </DropdownMenuCheckboxItem>

                 <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Received") }}
                >
                    <Badge className="bg-green-600 rounded-full w-30 justify-center hover:bg-green-800">Received</Badge>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
