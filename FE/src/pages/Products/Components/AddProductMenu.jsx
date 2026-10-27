"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> New Product
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-xl border-slate-200/70" align="end">
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">
                    Select Product
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem
                    onClick={handleBatteryPackClick}
                    className="rounded-xl px-3 py-2.5 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                >
                    Battery Pack
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleSolarClick}
                    className="rounded-xl px-3 py-2.5 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                >
                    Solar
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleEVClick}
                    className="rounded-xl px-3 py-2.5 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                >
                    E-Vehicle
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleService}
                    className="rounded-xl px-3 py-2.5 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                >
                    Service
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleOtherClick}
                    className="rounded-xl px-3 py-2.5 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                >
                    Other
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}