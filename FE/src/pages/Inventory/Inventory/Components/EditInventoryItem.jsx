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
import { Pencil } from "lucide-react";

export function EditInventoryItem({ itemData, onUpdate }) {
  const { getToken } = useAuth();
  const itemId = itemData.id;

  // Form states
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [threshold, setThreshold] = useState("");
  const [status, setStatus] = useState("");

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (itemData) {
      setItemCode(itemData.itemCode || itemData.item_code || "");
      setItemName(itemData.itemName || itemData.item_name || "");
      setUnitPrice(itemData.unitPrice || itemData.unit_cost || "");
      setThreshold(itemData.threshold || "");
      setStatus(itemData.status || "");
    }
  }, [itemData]);

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    let newStatus = status;
    try {
      const token = await getToken();
      const response = await updateInventoryItem(token, {
        item_id: itemId,
        item_code: itemCode,
        item_name: itemName,
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
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4">
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] w-full rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Inventory Item</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to inventory item details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditItemSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ItemCode" className="text-slate-700 font-semibold text-sm">Item Code</Label>
              <Input
                id="ItemCode"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ItemName" className="text-slate-700 font-semibold text-sm">Item Name</Label>
              <Input
                id="ItemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="UnitPrice" className="text-slate-700 font-semibold text-sm">Unit Price (LKR)</Label>
              <Input
                id="UnitPrice"
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="Threshold" className="text-slate-700 font-semibold text-sm">Threshold</Label>
              <Input
                id="Threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}