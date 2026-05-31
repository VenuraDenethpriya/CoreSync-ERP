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
import { updateInventoryItem } from "@/api/inventoryApi";
import { useAuth } from "@clerk/clerk-react";

export function ChangeStatusDropdownMenu(props) {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState(props.item.status);

    const handleStatusChange = async (status) => {
        try {
            const token = await getToken();
            setStatus(status);
            const response = await updateInventoryItem(token, {
                item_id: props.item.id,
                item_code: props.item.itemCode,
                item_name: props.item.itemName,
                quantity_in_stock: props.item.quantity,
                unit_cost: props.item.unitPrice,
                threshold: props.item.threshold,
                status: status
            }


            );
            if (response.message === "success") {
                toast.success("Iten Name: " + props.item.itemName + " status updated successfully!", { position: "bottom-right" });
                // setTimeout(() => {
                //     window.location.reload();
                // }, 2500);

            }
            console.log(status);
        } catch (error) {
            console.error("Error updating item status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative" asChild>
                {
                    status === "Appiled" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">{status}</Badge></Button>
                    ) : status == "Rejected" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : status === "Interview Stage" ? (
                        <Button variant="ghost"><Badge className="bg-gray-400 rounded-full w-24 justify-center hover:bg-gray-600">{status}</Badge></Button>
                    ) : status === "Hold for Future" ? (
                        <Button variant="ghost"><Badge className="bg-red-200 text-red-800 rounded-full w-24 justify-center hover:bg-red-400">{status}</Badge></Button>
                    ) : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 absolute right-[60px] top-[-40px] z-50">
                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Appiled") }}
                >
                    <Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">Appiled</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Rejected") }}
                >
                    <Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">Rejected</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Interview Stage") }}
                >
                    <Badge className="bg-gray-400 rounded-full w-24 justify-center hover:bg-gray-600">Interview Stage</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Hold for Future") }}
                >
                    <Badge className="bg-red-200 text-red-800 rounded-full w-24 justify-center hover:bg-red-400">Hold for Future</Badge>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
