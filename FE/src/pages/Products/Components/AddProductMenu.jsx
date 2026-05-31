"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function AddProductDropdownMenu() {
    const navigate = useNavigate();

    const handleBatteryPackClick = () => {
        navigate("/products/add-battery-pack");
    };
    const handleSolarClick = () => {
        navigate("/products/add-solar");
    };

    const handleEVClick = () => {
        navigate("/products/add-ev");
    };

    const handleService = () => {
        navigate("/products/add-service");
    };


    const handleOtherClick = () => {
        navigate("/products/add-other");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="bg-blue-800 hover:bg-blue-900">New Product</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Select Product</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    onClick={handleBatteryPackClick}
                >
                    Battery Pack
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    onClick={handleSolarClick}
                >
                    Solar
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    onClick={handleEVClick}
                >
                    E-Vehicle
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    onClick={handleService}
                >
                    Service
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    onClick={handleOtherClick}
                >
                    Other
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
