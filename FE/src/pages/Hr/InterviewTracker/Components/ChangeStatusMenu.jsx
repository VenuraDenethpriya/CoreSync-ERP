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
import { updateTalentPool } from "@/api/hrApi";

export function ChangeStatusDropdownMenu(props) {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState(props.member.status);

    const handleStatusChange = async (status) => {
        try {
            const token = await getToken();
            setStatus(status);
            const response = await updateTalentPool(token, {
                id: props.member.id,
                status: status
            }

            );
            if (response.message === "success") {
                toast.success("Member name: " + props.member.name + " status updated successfully!", { position: "bottom-right" });
                if(response.data.status == "Joined"){
                    navigate("/hr/employees/add-employee");
                }

            }
        } catch (error) {
            console.error("Error updating item status:", error);

        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative" asChild>
                {
                    status === "Screening" ? (
                        <Button variant="ghost"><Badge className="bg-green-600 rounded-full w-30 justify-center hover:bg-green-800">{status}</Badge></Button>
                    ) : status == "Rejected" ? (
                        <Button variant="ghost"><Badge className="bg-red-600 rounded-full w-30 justify-center hover:bg-red-800">{status}</Badge></Button>
                    ) : status === "Shortlisted" ? (
                        <Button variant="ghost"><Badge className="bg-gray-600 rounded-full w-30 justify-center hover:bg-gray-800">{status}</Badge></Button>
                    ) : status == "Selected" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-30 justify-center hover:bg-blue-800">{status}</Badge></Button>
                    ) : status == "Offer sent" ? (
                        <Button variant="ghost"><Badge className="bg-yellow-500 rounded-full w-30 justify-center hover:bg-yellow-600">{status}</Badge></Button>
                    ) : status == "On-boarding" ? (
                        <Button variant="ghost"><Badge className="bg-purple-600 rounded-full w-30 justify-center hover:bg-purple-800">{status}</Badge></Button>
                    ) : status == "Joined" ? (
                        <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-30 justify-center hover:bg-blue-800">{status}</Badge></Button>
                    ) : status === "Interview Stage" ? (
                        <Button variant="ghost"><Badge className="bg-gray-400 rounded-full  w-30 justify-center hover:bg-gray-500">{status}</Badge></Button>
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
                    onClick={() => { handleStatusChange("Offer sent") }}
                >
                    <Badge className="bg-yellow-500 rounded-full w-24 justify-center hover:bg-yellow-600">Offer sent</Badge>
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
