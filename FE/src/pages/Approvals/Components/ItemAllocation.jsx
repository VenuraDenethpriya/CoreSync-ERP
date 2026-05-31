import { useEffect, useState } from "react";
import { createInventoryAllocation, createInventoryUsage, fetchInventoryItemsList } from "@/api/inventoryApi";
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

    console.log("Allocated Items:", allocatedItems);

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
            console.log("Usage Data:", allocationData);
            const response = await createInventoryAllocation(token, allocationData);
            if (response.message === "success") {
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
                setItems(response?.data?.items);
            } catch (error) {
                console.error("Error fetching items list:", error);
            }
        };
        fetchItems();
    }, [search, getToken]);

    useEffect(() => {
        if (!isOpen) {
            setAllocatedItems([{ item_id: 0, count: 1 }]);
            setSearch("")
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
            <DialogContent className="sm:max-w-[700px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="pb-4">
                        <DialogTitle>
                            Item Allocation for {props.orderData?.type}{props.orderData?.order_no}
                        </DialogTitle>
                    </DialogHeader>
                    <div>
                        {allocatedItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-x-4 mt-2">
                                <Label className="text-xs" htmlFor={`item-${index}`}>
                                    Item {index + 1}
                                </Label>
                                <Select
                                    value={item.id}
                                    onValueChange={(value) => {
                                        const updated = [...allocatedItems];
                                        updated[index].item_id = value;
                                        setAllocatedItems(updated);
                                    }}

                                >
                                    <SelectTrigger className="w-[400px]">
                                        <SelectValue placeholder="Select Item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <Input placeholder="Search items" onChange={(e) => { setSearch(e.target.value) }} />
                                        {items?.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.item_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    placeholder="Quantity"
                                    className="bg-white w-16 text-xs text-center ml-20"
                                    min="1"
                                    value={item.count}
                                    onChange={(e) => {
                                        const updated = [...allocatedItems];
                                        updated[index].count = e.target.value;
                                        setAllocatedItems(updated);
                                    }}
                                />
                                <Trash2
                                    size={16}
                                    className="cursor-pointer text-red-500 hover:text-red-700"
                                    onClick={() => handleRemoveItem(index)}
                                />
                            </div>
                        ))}
                    </div>
                    <div
                        className="flex items-center text-blue-600 hover:underline cursor-pointer gap-x-2 mt-2"
                    >
                        <PlusCircle size={12} onClick={handleAddItem} />
                        <span className="text-xs" onClick={handleAddItem}>Add</span>
                    </div>

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={handleSubmit}>Submit</Button>
                    </DialogFooter>
                </form>
            </DialogContent >
        </Dialog >
    );
}

export default ItemAllocation;