"use client";

import React, { useState } from "react";

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

export function AddQuoteDropdownMenu() {
    const navigate = useNavigate();
    
    const handleBatteryPackClick = () => {
        navigate("/quotes/add-battery-pack-quote");
    };
    const handleSolarClick = () => {
        navigate("/quotes/add-solar-quote");
    };

    return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-800 hover:bg-blue-900">New Quote</Button>
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
                        disabled
                    >
                        E-Bike
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
    );
}
