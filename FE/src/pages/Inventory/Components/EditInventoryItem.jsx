import { updateInventoryItem } from "@/api/inventoryApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// export function EditInventoryItem({ itemData, open, onOpenChange }) {
export function EditInventoryItem({ itemData, onUpdate }) {
  const { getToken } = useAuth();
  const itemId = itemData.id;

  // Form states
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  // const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [threshold, setThreshold] = useState("");
  const [status, setStatus] = useState("");

  const [open, setOpen] = useState(false);

  // const handleOpenChange = (newOpen) => {
  //   if (onOpenChange) {
  //     onOpenChange(newOpen);
  //   }
  // };


  // useEffect(() => {
  //   if (open && itemData) {
  //     setItemCode(itemData.itemCode || itemData.item_code || "");
  //     setItemName(itemData.itemName || itemData.item_name || "");
  //     setQuantity(itemData.quantity || itemData.quantity_in_stock || "");
  //     setUnitPrice(itemData.unitPrice || itemData.unit_cost || "");
  //     setThreshold(itemData.threshold || "");
  //     setStatus(itemData.status || "");
  //   }
  // }, [open, itemData]);

  useEffect(() => {
    if (itemData) {
      setItemCode(itemData.itemCode || itemData.item_code || "");
      setItemName(itemData.itemName || itemData.item_name || "");
      // setQuantity(itemData.quantity || itemData.quantity_in_stock || "");
      setUnitPrice(itemData.unitPrice || itemData.unit_cost || "");
      setThreshold(itemData.threshold || "");
      setStatus(itemData.status || "");
    }
  }, [itemData]);

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    let newStatus = status;
    // if (quantity < threshold) {
    //   newStatus = "Low Stock";
    // }
    // if (quantity == 0) {
    //   newStatus = "Out of Stock";
    // }
    // console.log("New Status:", newStatus);

    // if (quantity < threshold) {
    //   newStatus = "Low Stock";
    // }
    // if (quantity == 0) {
    //   newStatus = "Out of Stock";
    // }
    // if (quantity > threshold) {
    //   newStatus = "In Stock";
    // }
    try {
      const token = await getToken();
      console.log("Token:", token);
      const response = await updateInventoryItem(token, {
        item_id: itemId,
        item_code: itemCode,
        item_name: itemName,
        // quantity_in_stock: parseFloat(quantity),
        unit_cost: parseFloat(unitPrice),
        threshold: parseFloat(threshold),
        status: newStatus,
      });

      const isSuccess =
        (response.data && response.data.message === "success") ||
        response.message === "success";

      if (isSuccess) {
        const updatedItemData = {
          item_code: itemCode,
          item_name: itemName,
          // quantity: parseFloat(quantity),
          unit_cost: parseFloat(unitPrice),
          threshold: parseFloat(threshold),
          status: newStatus
        };
        if (onUpdate) {
          onUpdate(updatedItemData);
        }
        setOpen(false);
        toast.success("Item updated successfully!", { position: "bottom-right" });

      } else {
        // Error Logic
        // Fix the error message logging here too
        const errorMsg = response.data?.message || response.message || "Unknown error";
        toast.error("Error updating item! " + errorMsg, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Error updating item!", { position: "bottom-right" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] w-full sm:h-auto h-fit">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Make changes to inventory item details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditItemSubmit}>
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ItemCode">Item Code</Label>
              <Input
                id="ItemCode"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ItemName">Item Name</Label>
              <Input
                id="ItemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="col-span-3"
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Quantity">Quantity</Label>
              <Input
                id="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
              />
            </div> */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="UnitPrice">Unit Price</Label>
              <Input
                id="UnitPrice"
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Threshold">Threshold</Label>
              <Input
                id="Threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  );
}