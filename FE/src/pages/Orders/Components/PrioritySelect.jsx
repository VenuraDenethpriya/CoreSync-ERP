import { useState } from "react";
import { updatePack } from "@/api/orderApi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

export function PrioritySelect({ priority: initialPriority, packId, serialNo, onUpdate }) {
    const { getToken } = useAuth();
    const [priority, setPriority] = useState(initialPriority);

    const handlePriorityChange = async (newPriority) => {
        setPriority(newPriority); 
        
        try {
            const token = await getToken();
            const response = await updatePack(token, {
                packId: packId,
                priority: newPriority,
            });
            
            if (response.message === "success") {
                toast.success(`Pack NO: ${serialNo} priority updated to ${newPriority}!`);

                if (onUpdate) {
                    onUpdate();
                }
            } else {
                setPriority(initialPriority); 
                toast.error("Failed to update priority");
            }
        } catch (error) {
            setPriority(initialPriority); 
            console.error("Error updating order priority:", error);
            toast.error("An error occurred while updating.");
        }
    };

    return (
        <Select value={priority} onValueChange={handlePriorityChange}>
            <SelectTrigger 
                className={`w-[180px] transition-colors duration-200 ${
                    priority === "Urgent" 
                        ? "bg-red-50 border-red-500 text-red-700 font-bold hover:bg-red-100" 
                        : ""
                }`}
            >
                <SelectValue placeholder="Set Priority" />
            </SelectTrigger>
            
            <SelectContent>
                <SelectItem value="Urgent">
                    <span className="flex items-center gap-2 font-bold text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" /> Urgent
                    </span>
                </SelectItem>
                <SelectItem value="High">
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> High
                    </span>
                </SelectItem>
                <SelectItem value="Medium">
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" /> Medium
                    </span>
                </SelectItem>
                <SelectItem value="Low">
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400" /> Low
                    </span>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}