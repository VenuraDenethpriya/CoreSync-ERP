import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createSalesTarget } from "@/api/saleApi";


function AddTarget({ salespersonId, fetchTargets }) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTarget, setNewTarget] = useState({ month: "", year: "", amount: "" });

    const handleAddTarget = async (e) => {
        e.preventDefault();
        
        const finalYear = newTarget.year ? parseInt(newTarget.year, 10) : new Date().getFullYear();
        
        try {
            const token = await getToken();
            
            const payload = {
                salesperson_id: salespersonId, 
                month: parseInt(newTarget.month, 10),
                year: finalYear,
                amount: parseFloat(newTarget.amount),
                created_by : userID,
            };

            await createSalesTarget(token, payload);
            
            toast.success("Target added!");
            setIsDialogOpen(false);
            setNewTarget({ month: "", year: "", amount: "" });
            fetchTargets(); 
        } catch (error) {
            toast.error("Failed to add target");
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Target
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set New Target</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTarget} className="space-y-4">
                    <div>
                        <Label>Month (1-12)</Label>
                        <Input
                            type="number"
                            min="1"
                            max="12"
                            value={newTarget.month}
                            onChange={(e) => setNewTarget({ ...newTarget, month: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Label>Year (Optional)</Label>
                        <Input
                            type="number"
                            placeholder={new Date().getFullYear().toString()}
                            value={newTarget.year}
                            onChange={(e) => setNewTarget({ ...newTarget, year: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>Amount (LKR)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={newTarget.amount}
                            onChange={(e) => setNewTarget({ ...newTarget, amount: e.target.value })}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">Save Target</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AddTarget;