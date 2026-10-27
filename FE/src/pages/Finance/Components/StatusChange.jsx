import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/clerk-react";
import { updatePayment } from "@/api/orderApi";
import { updatePurchaseOrder } from "@/api/finance";

// 1. Added paymentId, orderNo, and amount to the destructured props
export function StatusChange({ 
  status: initialStatus, 
  payment: initialPayment, 
  orderId, 
  purchaseNo, 
  type, 
  onUpdate,
  paymentId, 
  orderNo, 
  amount 
}) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [status, setStatus] = useState(initialStatus);
  const [payment, setPayment] = useState(initialPayment);

  // 2. Updated display logic so "order" uses the status text
  const displayValue = (type === "status" || type === "order") ? status : payment;

  const handleChange = async (newValue) => {
    try {
      const token = await getToken();

      // Optimistically update the UI
      if (type === "status" || type === "order") setStatus(newValue);
      if (type === "payment") setPayment(newValue);

      // --- LOGIC FOR "ORDER" TYPE ---
      if (type === "order") {
        const response = await updatePayment(token, {
          id: paymentId,
          status: newValue, // 3. Use newValue directly to avoid stale state
        });

        if (response.message === "success") {
          // Wrap amount in Number() to prevent .toFixed crashes if amount is ever passed as a string
          toast.success(`Order No: ${orderNo}'s LKR ${Number(amount).toFixed(2)} payment status updated!`);
          if (onUpdate) onUpdate();
        } else {
          setStatus(initialStatus); // Revert UI
          toast.error("Failed to update payment status");
        }
        
        return; // 4. EXTREMELY IMPORTANT: Exit the function here so it doesn't call updatePurchaseOrder!
      }

      // --- LOGIC FOR "STATUS" or "PAYMENT" TYPE ---
      const response = await updatePurchaseOrder(token, {
        id: orderId, 
        status: type === "status" ? newValue : status,
        payment: type === "payment" ? newValue : payment,
        updated_by: user?.id,
      });

      if (response.message === "success") {
        toast.success(`Purchase order No: ${purchaseNo} updated!`);
        if (onUpdate) onUpdate();
      } else {
        setStatus(initialStatus);
        setPayment(initialPayment);
        toast.error("Failed to update");
      }
      
    } catch (error) {
      console.error("Error updating:", error);
      setStatus(initialStatus);
      setPayment(initialPayment);
      toast.error("An error occurred while updating");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {displayValue === "Pending" ? (
          <Button variant="ghost"><Badge className="bg-amber-500 rounded-full w-24 justify-center hover:bg-amber-700">{displayValue}</Badge></Button>
        ) : displayValue === "Confirmed" ? (
          <Button variant="ghost"><Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">{displayValue}</Badge></Button>
        ) : displayValue === "Rejected" ? (
          <Button variant="ghost"><Badge className="bg-red-500 rounded-full w-24 justify-center hover:bg-red-700">{displayValue}</Badge></Button>
        ) : displayValue === "Done" ? (
          <Button variant="ghost"><Badge className="bg-green-500 rounded-full w-24 justify-center hover:bg-green-700">{displayValue}</Badge></Button>
        ) : (
          <Button variant="ghost"><Badge className="bg-gray-500 rounded-full w-24 justify-center">{displayValue || "Unknown"}</Badge></Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start" className="w-40">
        {type === "status" || type === "order" ? (
          <div>
            <DropdownMenuCheckboxItem onClick={() => handleChange("Confirmed")}>
              <Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">Confirmed</Badge>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem onClick={() => handleChange("Rejected")}>
              <Badge className="bg-red-600 rounded-full w-24 justify-center hover:bg-red-800">Rejected</Badge>
            </DropdownMenuCheckboxItem>
          </div>
        ) : (
          <div>
            <DropdownMenuCheckboxItem onClick={() => handleChange(true)}>
              <Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">Done</Badge>
            </DropdownMenuCheckboxItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}