import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { createInventoryUsage, fetchInventoryItemByCode } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createRepairItemUsage } from "@/api/repair";

function AddUsage({ onUpdate, ...props }) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;
    const [scannedItems, setScannedItems] = useState([]);
    const [currentScan, setCurrentScan] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    
    // NEW: Local state for the inline notification
    const [notification, setNotification] = useState(null);

    const showNotification = (type, text) => {
        setNotification({ type, text });
        if (type === "error") {
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleBarcodeScan = async (e) => {
        const code = e.target.value.trim().toUpperCase();
        if (!code) return;

        setCurrentScan("");

        try {
            const token = await getToken();
            const response = await fetchInventoryItemByCode(token, code);

            if (response?.message === "This item already used") {
                showNotification("error", "This item already used");
                return;
            }
            if (response?.message === "record not found") {
                showNotification("error", "Item not found for code: " + code);
                return;
            }

            const matchedItem = response?.data;

            if (!matchedItem) {
                showNotification("error", "Item not found for code: " + code);
                return;
            }

            const exists = scannedItems.find(item => item.id === matchedItem.id);

            if (exists) {
                setScannedItems(prev =>
                    prev.map(item =>
                        item.id === matchedItem.id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                );
            } else {
                setScannedItems(prev => [
                    ...prev,
                    {
                        id: matchedItem.id,
                        code: matchedItem.item_code,
                        name: matchedItem.item_name,
                        quantity: 1,
                        user: userID,
                    }
                ]);
            }
        } catch (error) {
            console.error("Error scanning barcode:", error);
            if (error.response?.data?.message === "This item already used") {
                showNotification("error", "This item already used");
            } else {
                showNotification("error", "Error scanning barcode. Please try again.");
            }
        }
    };

    const handleRemoveItem = (id) => {
        setScannedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            let response;

            if (props.type === "order") {
                const usageData = scannedItems.map(item => ({
                    item_id: item.id,
                    order_id: props.orderData.order_id || props.orderData.id,
                    user_name: userID,
                }));

                response = await createInventoryUsage(token, { usages: usageData });
            } 
            else if (props.type === "job") {
                const usageData = scannedItems.map(item => ({
                    item_id: item.id,
                    repair_id: props.jobData.Job_id,
                    user_name: userID,
                }));

                response = await createRepairItemUsage(token, { repair_usages: usageData });
            }

            if (response && (response.message === "success" || response.status === "success" || response.status === 200 || response.status === 201)) {
                showNotification("success", "Usage data submitted successfully!");
               
                setTimeout(() => {
                    setIsOpen(false);
                    setScannedItems([]);
                    setNotification(null);
                    if (onUpdate) {
                        onUpdate();
                    }
                }, 1500);
            } else {
                showNotification("error", `Error: ${response?.message || "Failed to submit"}`);
            }

        } catch (error) {
            console.error("Error submitting usage data:", error);
            showNotification("error", "An unexpected error occurred.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setNotification(null); 
        }}>
            <DialogTrigger asChild>
                <button className="flex items-center text-blue-600 hover:underline cursor-pointer mt-1 gap-x-1">
                    <PlusCircle size={12} />
                    <span className="text-xs">Add</span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="pb-4">
                        <DialogTitle>
                            {props.type === "order"
                                ? `Item usage for ${props.orderData?.type || props?.order_type || ""}${props.orderData?.order_no || props?.order_no || ""}`
                                : (props.type === "job")
                                    ? `Item usage for ${props.jobData?.Job_no}`
                                    : "Add usage"
                            }
                        </DialogTitle>
                    </DialogHeader>

                    {/* INLINE NOTIFICATION BANNER */}
                    {notification && (
                        <div className={`flex items-center gap-2 p-3 mb-4 rounded-md text-sm font-medium transition-all ${
                            notification.type === "success" 
                                ? "bg-green-50 text-green-800 border border-green-200" 
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                            {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            {notification.text}
                        </div>
                    )}

                    {/* Barcode input */}
                    <div className="mb-4">
                        <Input
                            value={currentScan}
                            onChange={(e) => setCurrentScan(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleBarcodeScan(e);
                                }
                            }}
                            placeholder="Scan or enter item code"
                            autoFocus
                            disabled={notification?.type === "success"} // Disable input while saving
                        />
                    </div>

                    {/* Scanned items list */}
                    <div className="grid gap-2">
                        {scannedItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-11 items-center gap-4">
                                <Input className="col-span-3" readOnly value={item.code} />
                                <Input
                                    className="col-span-1 readOnly text-center"
                                    readOnly
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const qty = parseInt(e.target.value) || 1;
                                        setScannedItems(prev =>
                                            prev.map((itm, i) =>
                                                i === index ? { ...itm, quantity: qty } : itm
                                            )
                                        );
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="col-span-1 flex justify-center items-center text-red-500 hover:text-red-700 disabled:opacity-50"
                                    disabled={notification?.type === "success"}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="pt-4 sm:justify-between">
                        <div className="flex items-center">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Items: {scannedItems.length}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button variant="outline" disabled={notification?.type === "success"}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={scannedItems.length === 0 || notification?.type === "success"}>
                                {notification?.type === "success" ? "Saved!" : "Save"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AddUsage;