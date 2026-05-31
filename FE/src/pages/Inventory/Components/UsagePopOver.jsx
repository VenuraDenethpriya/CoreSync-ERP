import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateInventoryItem } from "@/api/inventoryApi";
import { useAuth } from "@clerk/clerk-react";

export function UsageDialog({ item, open, onOpenChange }) {
  const { getToken, isLoaded } = useAuth();
  const initialQty = item?.quantity || item?.quantity_in_stock || 0;


  const [quantity, setQuantity] = useState("");
  const newQuantity = initialQty - parseInt(quantity);

  const handleOpenChange = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleInputChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleSave = async () => {
    if (!isLoaded) return;

    let calculatedStatus = item.status;
    if (newQuantity <= item.threshold) {
      calculatedStatus = "Low Stock";
    } else if (newQuantity === 0) {
      calculatedStatus = "Out of Stock";
    } else {
      calculatedStatus = "In Stock";
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      const response = await updateInventoryItem(token, {
        item_id: item.id,
        item_code: item.itemCode,
        item_name: item.itemName,
        quantity_in_stock: parseInt(newQuantity),
        unit_cost: item.unitPrice,
        threshold: item.threshold,
        status: calculatedStatus,
      });

      if (response.message === "success") {
        toast.success("Item quantity updated successfully!", { position: "bottom-right" });
        handleOpenChange(false);
        setQuantity("");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Error updating item quantity! " + response.message, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Error updating quantity!", { position: "bottom-right" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Record Usage</DialogTitle>
          <DialogDescription>
            Item: <span className="font-medium text-foreground pr-6">{item.itemName}</span>
            Quantity: <span className="font-medium text-foreground">{initialQty}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="col-span-1">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={initialQty}
              value={quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity used"
              className="col-span-3"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="default"
            className="bg-blue-800 hover:bg-blue-900 mt-4"
            onClick={handleSave}
            disabled={!isLoaded || !quantity || parseInt(quantity) <= 0 || parseInt(quantity) > initialQty}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
