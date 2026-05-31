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
                    status === "Screening" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">{status}</Badge></Button>
                    ) : status == "Rejected" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : status === "Shortlisted" ? (
                        <Button variant="ghost"><Badge className="bg-gray-400 rounded-full w-24 justify-center hover:bg-gray-600">{status}</Badge></Button>
                    )  : status == "Selected" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">{status}</Badge></Button>
                    ) : status == "Offer sent " ? (
                        <Button variant="ghost"><Badge className="bg-yellow-500 rounded-full w-24 justify-center hover:bg-yellow-600">{status}</Badge></Button>
                    ) : status == "On-boarding" ? (
                        <Button variant="ghost"><Badge className="bg-purple-600 rounded-full w-24 justify-center hover:bg-purple-800">{status}</Badge></Button>
                    ) : status == "Joined" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">{status}</Badge></Button>
                    ) : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 absolute right-[60px] top-[-40px] z-50">
                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Screening") }}
                >
                    <Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">Screening</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Rejected") }}
                >
                    <Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">Rejected</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Shortlisted") }}
                >
                    <Badge className="bg-gray-400 rounded-full w-24 justify-center hover:bg-gray-600">Shortlisted</Badge>
                </DropdownMenuCheckboxItem>


                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Selected") }}
                >
                    <Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">Selected</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Offer sent ") }}
                >
                    <Badge className="bg-yellow-500 rounded-full w-24 justify-center hover:bg-yellow-600">Offer sent </Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("On-boarding") }}
                >
                    <Badge className="bg-purple-600 rounded-full w-24 justify-center hover:bg-purple-800">On-boarding</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Joined") }}
                >
                    <Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">Joined</Badge>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
