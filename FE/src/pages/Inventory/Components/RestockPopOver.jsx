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
import { creatInventoryRestock, updateInventoryItem } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";

export function RestockDialog({ item, open, onOpenChange, onUpdate }) {
  const { getToken, isLoaded } = useAuth();
  const {user} = useUser();

  const initialQty = item?.quantity || item?.quantity_in_stock || 0;
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [amount, setAmount] = useState("");


  const newQuantity = initialQty + parseInt(quantity || 0);

  const handleOpenChange = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleInputChange = (e) => {
    setQuantity(e.target.value);
    setAmount(unitPrice * parseInt(e.target.value));
  };

  const handleaunitPriceChange = (e) => {
    setUnitPrice(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(unitPrice * parseInt(quantity || e.target.value));
  };

  const handleSave = async () => {
    if (!isLoaded) return;
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }
      const updatedStatus = newQuantity > item.threshold ? "In Stock" : "Low Stock";

      const response = await updateInventoryItem(token, {
        item_id: item.id,
        item_code: item.itemCode,
        item_name: item.itemName,
        quantity_in_stock: newQuantity,
        unit_cost: item.unitPrice,
        threshold: item.threshold,
        status: updatedStatus, 
      });

      const isSuccess =
        (response.data && response.data.message === "success") ||
        response.message === "success";

      if (isSuccess) {
        toast.success(`Added ${quantity} units to ${item.itemName}. New total: ${newQuantity}`, {
          position: "bottom-right",
        });

        const updatedFields = {
            quantity: newQuantity,
            quantity_in_stock: newQuantity, 
            status: updatedStatus,
            unit_cost: parseFloat(unitPrice) || item.unitPrice 
        };

        if (onUpdate) {
            onUpdate(updatedFields);
        }

        handleOpenChange(false);

        await creatInventoryRestock(token, {
          item_id: item.id,
          unit_price: parseFloat(unitPrice),
          quantity: parseInt(quantity),
          amount: amount,
          user_name: user?.id
        });

        setQuantity("");
        setAmount("");
        setUnitPrice("");
      } else {
        const errorMsg = response.data?.message || response.message || "Unknown error";
        toast.error("Error restocking item! " + errorMsg, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error restocking item:", error);
      toast.error("Error restocking item!", { position: "bottom-right" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Restock</DialogTitle>
          <DialogDescription>
            Item: <span className="font-medium text-foreground pr-8">{item.itemName}</span>
            Current quantity: <span className="font-medium text-foreground">{initialQty}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitPrice" className="col-span-1">
              Unit Price
            </Label>
            <Input
              id="unitPrice"
              type="number"
              value={unitPrice}
              onChange={handleaunitPriceChange}
              placeholder="Enter unit price"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="col-span-1">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity to restock"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="col-span-1">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            className="bg-blue-800 hover:bg-blue-900"
            disabled={!isLoaded || !quantity || parseInt(quantity) <= 0}
          >
            Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}