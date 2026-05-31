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
import { PlusCircle, Trash2 } from "lucide-react";
import { createInventoryUsage, fetchInventoryItemByCode, fetchInventoryItemsList } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { createRepairItemUsage } from "@/api/repair";

function AddUsage({ onUpdate, ...props }) {
    console.log("Order Data in AddUsage:");
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;
    const [scannedItems, setScannedItems] = useState([]);
    const [currentScan, setCurrentScan] = useState("");
    const limit = 1;
    const offset = 0;
    const [isOpen, setIsOpen] = useState(false);


    // const handleBarcodeScan = async (e) => {
    //     const code = e.target.value.trim().toUpperCase();
    //     if (!code) return;

    //     try {
    //         const token = await getToken();
    //         const response = await fetchInventoryItemByCode(token, code);


    //         if (response?.message === "This item already used") {
    //             toast.error("This item already used");
    //             return;
    //         }
    //         if (response?.message === "record not found") {
    //             toast.error("Item not found for code: " + code);
    //             return;
    //         }

    //         const matchedItem = response?.data;

    //         if (!matchedItem) {
    //             toast.error("Item not found for code: " + code);
    //             return;
    //         }

    //         const exists = scannedItems.find(item => item.id === matchedItem.id);

    //         if (exists) {
    //             setScannedItems(prev =>
    //                 prev.map(item =>
    //                     item.id === matchedItem.id ? { ...item, quantity: item.quantity + 1 } : item
    //                 )
    //             );
    //         } else {
    //             setScannedItems(prev => [
    //                 ...prev,
    //                 {
    //                     id: matchedItem.id,
    //                     code: matchedItem.item_code,
    //                     name: matchedItem.item_name,
    //                     quantity: 1,
    //                     user: userID,
    //                 }
    //             ]);
    //         }
    //     } catch (error) {
    //         console.error("Error scanning barcode:", error);

    //         if (
    //             error.response?.data?.message === "This item already used"
    //         ) {
    //             toast.error("This item already used");
    //         }
    //         else {
    //             toast.error("Error scanning barcode. Please try again.");
    //         }
    //     }
    // };
    const handleBarcodeScan = async (e) => {
        const code = e.target.value.trim().toUpperCase();
        if (!code) return;

        setCurrentScan("");

        try {
            const token = await getToken();
            const response = await fetchInventoryItemByCode(token, code);

            if (response?.message === "This item already used") {
                toast.error("This item already used");
                return;
            }
            if (response?.message === "record not found") {
                toast.error("Item not found for code: " + code);
                return;
            }

            const matchedItem = response?.data;

            if (!matchedItem) {
                toast.error("Item not found for code: " + code);
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

            if (
                error.response?.data?.message === "This item already used"
            ) {
                toast.error("This item already used");
            }
            else {
                toast.error("Error scanning barcode. Please try again.");
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

            if (props.type === "order") {
                const usageData = scannedItems.map(item => ({
                    item_id: item.id,
                    // order_id: props.orderData.id || props.orderData.order_id,
                    order_id: props.orderData.order_id || props.orderData.id,
                    // usage_count: item.quantity,
                    user_name: userID,
                }));

                const requestBody = {
                    usages: usageData
                };

                const response = await createInventoryUsage(token, requestBody);

                if (response.message === "success") {
                    toast.success("Usage data submitted successfully!", { position: "bottom-right" });
                    setIsOpen(false);
                    setScannedItems([]);

                    if (onUpdate) {
                        onUpdate();
                    }
                } else {
                    toast.error(`Error submitting usage data: ${response.message}`, { position: "bottom-right" });
                }
            }
            else if (props.type === "job"){
                const usageData = scannedItems.map(item => ({
                    item_id: item.id,
                    // order_id: props.orderData.id || props.orderData.order_id,
                    repair_id: props.jobData.Job_id,
                    // usage_count: item.quantity,
                    user_name: userID,
                }));

                const requestBody = {
                    repair_usages: usageData
                };

                const response = await createRepairItemUsage(token, requestBody);

                if (response.message === "success") {
                    toast.success("Repair usage data submitted successfully!", { position: "bottom-right" });
                    setIsOpen(false);
                    setScannedItems([]);

                    if (onUpdate) {
                        onUpdate();
                    }
                } else {
                    toast.error(`Error submitting usage data: ${response.message}`, { position: "bottom-right" });
                }
            }



        } catch (error) {
            console.error("Error submitting usage data:", error);
            // toast.error("An unexpected error occurred while submitting usage data.", { position: "bottom-right" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                        />

                    </div>

                    {/* Scanned items list */}
                    <div className="grid gap-2">
                        {scannedItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-11 items-center gap-4"
                            >
                                <Input className="col-span-3" readOnly value={item.code} />
                                {/* <Input className="col-span-4" readOnly value={item.name} /> */}
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
                                    className="col-span-1 flex justify-center items-center text-red-500 hover:text-red-700"
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
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    );
}

export default AddUsage;