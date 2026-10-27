import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createInventoryFromOrder } from "@/api/inventoryApi";

export function RestockDialog({ item, open, onOpenChange, onUpdate }) {
  const { getToken, isLoaded } = useAuth();
  const { user } = useUser();
  // --- State ---
  const [baseUnitPrice, setBaseUnitPrice] = useState(item?.amount / item?.quantity || 0);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedBarcodes, setScannedBarcodes] = useState([]);

  const [expenses, setExpenses] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  // --- Calculations ---
  const totalExpenseAmount = useMemo(() =>
    expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0),
    [expenses]
  );

  const scannedCount = scannedBarcodes.length;


  const actualUnitPrice = scannedCount > 0
    ? ((baseUnitPrice * scannedCount) + totalExpenseAmount) / scannedCount
    : 0;

  // --- Handlers ---
  const handleScanBarcode = (e) => {
    if (e.key === "Enter" && barcodeInput.trim() !== "") {
      e.preventDefault();
      setScannedBarcodes([...scannedBarcodes, barcodeInput.trim()]);
      setBarcodeInput("");
    }
  };

  const removeBarcode = (index) => {
    setScannedBarcodes(scannedBarcodes.filter((_, i) => i !== index));
  };

  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      setExpenses([...expenses, { name: newExpenseName, amount: parseFloat(newExpenseAmount) }]);
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const removeExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!isLoaded || !user) {
      toast.error("User not authenticated.");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      const payload = {
        order_id: item.id,
        item_code: item.itemCode,
        item_name: item.itemName,
        unit_cost: parseFloat(actualUnitPrice.toFixed(2)),
        quantity: scannedCount,
        amount: parseFloat((actualUnitPrice * scannedCount).toFixed(2)),
        user_name: user?.id, 
        codes: scannedBarcodes,
        // remark: `Restocked ${scannedCount} items via CoreSync` 
      };


      const response = await createInventoryFromOrder(token, payload);


      const isSuccess = response.code === "0" || response.message === "success";

      if (isSuccess) {
        toast.success(`Restocked ${scannedCount} items!`);
        onUpdate && onUpdate();
        onOpenChange(false);
      } else {
        toast.error("Failed to save restock data.");
      }

    } catch (error) {
      console.error("Error restocking item:", error);
      toast.error("Error restocking item!", { position: "bottom-right" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Restock Item</DialogTitle>
          <DialogDescription>
            Order Details: <span className="font-bold">{item.itemName}</span> |
            Ordered Qty: <span className="font-bold">{item.quantity}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Read-Only Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
            <div>
              <Label>Base Unit Price (LKR)</Label>
              <Input type="number" value={baseUnitPrice} onChange={(e) => setBaseUnitPrice(e.target.value)} />
            </div>
            <div>
              <Label>Actual Unit Price (Calculated)</Label>
              <Input disabled value={actualUnitPrice.toFixed(2)} className="font-bold text-blue-700" />
            </div>
          </div>

          {/* Expenses Section */}
          <div className="space-y-2">
            <Label>Additional Expenses</Label>
            <div className="flex gap-2">
              <Input placeholder="Exp Name (e.g. Tax)" value={newExpenseName} onChange={(e) => setNewExpenseName(e.target.value)} />
              <Input type="number" placeholder="Amt" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
              <Button size="icon" onClick={addExpense}><Plus size={16} /></Button>
            </div>
            <ul className="text-sm space-y-1">
              {expenses.map((exp, i) => (
                <li key={i} className="flex justify-between bg-gray-100 p-1 rounded">
                  {exp.name}: {exp.amount} <button onClick={() => removeExpense(i)}><Trash2 size={14} className="text-red-500" /></button>
                </li>
              ))}
            </ul>
          </div>

          {/* Barcode Scanner */}
          <div className="space-y-2">
            <Label>Scan Barcodes (Total Scanned: {scannedCount})</Label>
            <Input
              placeholder="Scan barcode and press Enter..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleScanBarcode}
            />
            <div className="max-h-32 overflow-y-auto border p-2 rounded grid grid-cols-2 gap-2">
              {scannedBarcodes.map((code, i) => (
                <div key={i} className="text-xs bg-blue-100 p-1 flex justify-between items-center">
                  {code}
                  <button onClick={() => removeBarcode(i)}><Trash2 size={12} className="text-red-500" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={scannedCount === 0}>
            Confirm Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}