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
  const { user } = useUser();

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
    const val = e.target.value;
    setQuantity(val);
    setAmount((unitPrice || 0) * parseInt(val || 0));
  };

  const handleUnitPriceChange = (e) => {
    const val = e.target.value;
    setUnitPrice(val);
    setAmount((val || 0) * parseInt(quantity || 0));
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSave = async () => {
    if (!isLoaded) return;
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }
      const updatedStatus = newQuantity > (item?.threshold || 0) ? "In Stock" : "Low Stock";

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
          amount: parseFloat(amount) || 0,
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

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Restock Item</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Item: <span className="font-semibold text-slate-700">{item.itemName}</span> (Current Qty: <span className="font-semibold text-slate-700">{initialQty}</span>)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="unitPrice" className="text-slate-700 font-semibold text-sm">
              Unit Price
            </Label>
            <Input
              id="unitPrice"
              type="number"
              value={unitPrice}
              onChange={handleUnitPriceChange}
              placeholder="Enter unit price"
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity" className="text-slate-700 font-semibold text-sm">
              Quantity to Restock
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-slate-700 font-semibold text-sm">
              Total Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter total amount"
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
            disabled={!isLoaded || !quantity || parseInt(quantity) <= 0}
          >
            Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}