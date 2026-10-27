import { useEffect, useState } from "react";
import { createInventoryAllocation, fetchInventoryItemsList } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ItemAllocation(props) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;
    const [items, setItems] = useState([]);
    const limit = 10;
    const offset = 0;
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [allocatedItems, setAllocatedItems] = useState([{ item_id: 0, count: 1 }]);

    const handleRemoveItem = (index) => {
        const updated = [...allocatedItems];
        updated.splice(index, 1);
        setAllocatedItems(updated);
    };

    const handleAddItem = () => {
        const updated = [...allocatedItems];
        updated.push({ item_id: 0, count: 1 });
        setAllocatedItems(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            let response;

            if (props.type === "order") {
                const allocationData = {
                    allocation: {
                        items: allocatedItems.map(item => ({
                            item_id: item.item_id,
                            count: Number(item.count),
                        })),
                        order_id: props.orderData?.id,
                        user_name: userID,
                    },
                };
                response = await createInventoryAllocation(token, allocationData);
            }
            if (props.type === "pack") {
                const allocationData = {
                    allocation: {
                        items: allocatedItems.map(item => ({
                            item_id: item.item_id,
                            count: Number(item.count),
                        })),
                        pack_id: props.packData?.id,
                        user_name: userID,
                    },
                };
                response = await createInventoryAllocation(token, allocationData);
            }

            if (response && response.message === "success") {
                toast.success("Item allocation submitted successfully!", { position: "bottom-right" });
                setIsOpen(false);
                props.onSuccess();
            } else {
                toast.error("Failed to submit item allocation.", { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting usage data:", error);
        }
    };

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const token = await getToken();
                const response = await fetchInventoryItemsList(token, search, limit, offset);
                setItems(response?.data?.items || []);
            } catch (error) {
                console.error("Error fetching items list:", error);
            }
        };
        if (isOpen) {
            fetchItems();
        }
    }, [search, getToken, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setAllocatedItems([{ item_id: 0, count: 1 }]);
            setSearch("");
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center text-blue-600 hover:underline cursor-pointer mt-1 gap-x-1">
                    <PlusCircle size={12} />
                    <span className="text-xs">Add</span>
                </button>
            </DialogTrigger>
            
            {/* Explicit width containment on the Dialog wrapper pane */}
            <DialogContent className="w-[92vw] max-w-[700px] rounded-xl p-4 sm:p-6 box-border overflow-x-hidden">
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-base sm:text-lg break-words">
                            Item Allocation for {props.orderData?.type}{props.orderData?.order_no}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {/* Items Grouping Window */}
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                        {allocatedItems.map((item, index) => (
                            /* Turned from a standard horizontal row to a flexible stacked structure on screens below sm breakpoint */
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border border-slate-100 sm:border-none w-full box-border">
                                <div className="flex items-center justify-between w-full sm:w-auto shrink-0">
                                    <Label className="text-xs font-semibold text-gray-500" htmlFor={`item-${index}`}>
                                        Item {index + 1}
                                    </Label>
                                    {/* Position Trash utility clearly visible on upper right inside mobile layouts */}
                                    <div className="sm:hidden">
                                        <Trash2
                                            size={16}
                                            className="cursor-pointer text-red-500 hover:text-red-700"
                                            onClick={() => handleRemoveItem(index)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Item Dropdown Selector Panel */}
                                <div className="w-full sm:flex-1">
                                    <Select
                                        value={item.item_id || undefined}
                                        onValueChange={(value) => {
                                            const updated = [...allocatedItems];
                                            updated[index].item_id = value;
                                            setAllocatedItems(updated);
                                        }}
                                    >
                                        <SelectTrigger className="w-full text-xs">
                                            <SelectValue placeholder="Select Item" />
                                        </SelectTrigger>
                                        <SelectContent className="max-w-[90vw] sm:max-w-md">
                                            <div className="p-2 sticky top-0 bg-white z-10">
                                                <Input 
                                                    placeholder="Search items..." 
                                                    className="text-xs h-8"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)} 
                                                />
                                            </div>
                                            {items?.map((invItem) => (
                                                <SelectItem key={invItem.id} value={invItem.id} className="text-xs">
                                                    {invItem.item_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Quantity Input Field Control Wrapper */}
                                <div className="w-full sm:w-24 flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        className="bg-white text-xs h-9 w-full sm:w-20 text-center"
                                        min="1"
                                        value={item.count}
                                        onChange={(e) => {
                                            const updated = [...allocatedItems];
                                            updated[index].count = e.target.value;
                                            setAllocatedItems(updated);
                                        }}
                                    />
                                    {/* Kept desktop inline delete hook layout structure */}
                                    <div className="hidden sm:block">
                                        <Trash2
                                            size={16}
                                            className="cursor-pointer text-red-500 hover:text-red-700 shrink-0 ml-1"
                                            onClick={() => handleRemoveItem(index)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions Grouping Segment */}
                    <div className="flex items-center text-blue-600 hover:underline cursor-pointer gap-x-2 py-2 border-b border-slate-100">
                        <PlusCircle size={14} onClick={handleAddItem} />
                        <span className="text-xs font-medium" onClick={handleAddItem}>Add another item</span>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto text-xs h-9">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 text-xs h-9">Submit Allocation</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default ItemAllocation;