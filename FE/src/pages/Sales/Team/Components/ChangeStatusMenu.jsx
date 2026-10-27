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
import { useAuth } from "@clerk/clerk-react";
import { updateSalesperson } from "@/api/salespersonApi";

export function ChangeStatusDropdownMenu(props) {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState(props.team.status);

    const handleStatusChange = async (status) => {
        try {
            const token = await getToken();
            setStatus(status);
            const response = await updateSalesperson(token, {
                id: props.team.id,
                status: status
            }


            );
            if (response.message === "success") {
                toast.success("Salesperson's: " + props.team.firstName + " " + props.team.lastName + " status updated successfully!", { position: "bottom-right" });
                // setTimeout(() => {
                //     window.location.reload();
                // }, 2500);

            }
        } catch (error) {
            console.error("Error updating salesperson status:", error);

        }

    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative" asChild>
                {
                    status === "Active" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">{status}</Badge></Button>
                    ) : status == "Inactive" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : null
                }
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 absolute right-[60px] top-[-40px] z-50">
                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Active") }}
                >
                    <Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">Active</Badge>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    onClick={() => { handleStatusChange("Inactive") }}
                >
                    <Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">Inactive</Badge>
                </DropdownMenuCheckboxItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}
