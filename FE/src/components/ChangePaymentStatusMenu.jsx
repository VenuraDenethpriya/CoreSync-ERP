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
import { updateOrderStatus } from "@/api/orderApi";
import { useAuth } from "@clerk/clerk-react";

export function ChangePaymentStatusDropdownMenu(props) {
    const navigate = useNavigate();
    const [showPanel, setShowPanel] = useState(false);
    const [status, setStatus] = useState(props.status);
    const { getToken } = useAuth();

    const handleStatusChange = async(status) => {
        try {
            const token = await getToken();
            setStatus(status);
            const response = await updateOrderStatus(token, {
                id: props.orderId,
                PaymentStatus: status,
                OrderStatus: props.orderStatus
            });
            if (response.message === "success") {
                toast.success("Order NO: " + props.orderNo + " payment status updated successfully!", { position: "bottom-right" });
                setTimeout(() => {
                    window.location.reload();
                }, 2500);
            }
            console.log(status);
        } catch (error) {
            console.error("Error updating order payment status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {
                    props.status === "Awaiting" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-20 justify-center hover:bg-red-800">{props.status}</Badge></Button>
                    ) : props.status === "Paid" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full hover:bg-green-800 w-20 justify-center">{props.status}</Badge></Button>
                    ) : props.status === "Advanced" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full hover:bg-blue-800 w-20 justify-center">{props.status}</Badge></Button>
                    ) : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" align="start" className="w-40">
                <DropdownMenuCheckboxItem
                    onCheckedChange={setShowPanel}
                    onClick={() => { handleStatusChange("Awaiting") }}
                >
                    <Badge className="bg-red-600 rounded-full w-20 justify-center hover:bg-red-800">Awaiting</Badge>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    onCheckedChange={setShowPanel}
                    onClick={() => { handleStatusChange("Advanced") }}
                >
                    <Badge className="bg-blue-600 rounded-full hover:bg-blue-800 w-20 justify-center">Advanced</Badge>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    onCheckedChange={setShowPanel}
                    onClick={() => { handleStatusChange("Paid") }}
                >
                    <Badge className="bg-green-600 rounded-full hover:bg-green-800 w-20 justify-center">Paid</Badge>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}