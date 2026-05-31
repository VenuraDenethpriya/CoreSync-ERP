import { updateOrderStatus } from "@/api/orderApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/clerk-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const checklistItems = [
  "Battery charged",
  "Battery balanced",
  "Insulation test",
  "Batteries are tied properly",
  "Paint",
  "Casing errors",
  "Nuts are fully tied",
  "Small and big lugs are connected properly",
  "Welding parts",
  "BMS settings",
  "Output voltage checked",
  "Password changed",
  "Relays current shunt checked",
  "Display checked",
  "Fully sealed",
  "Correct stickers"
];

function OrderCompleteCheckList(props) {
  const { getToken } = useAuth();
  const dialogCloseRef = useRef(null); 
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = () => {
    setChecked(!checked);
  }

  
  const handleStatusChange = async () => {
    if (!checked) {
      toast.error("Please complete all checklist items before confirming!", { position: "bottom-right" });
      return;
    }

    try {
      const token = await getToken();
      const response = await updateOrderStatus(token, {
        id: props.orderId,
        OrderStatus: "Completed",
        PaymentStatus: props.paymentStatus
      });

      if (response.message === "success") {
        toast.success(`Order NO: ${props.orderNo} marked as completed!`, { position: "bottom-right" });

        if (dialogCloseRef.current) {
          dialogCloseRef.current.click();
        }
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <Badge className="bg-blue-600 rounded-full w-24 justify-center hover:bg-blue-800">Completed</Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <div className="grid gap-4">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Label className="font-normal" htmlFor={`check-${index}`}>{item}</Label>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="terms" chacked={checked} onCheckedChange={handleCheckboxChange}/>
            <Label htmlFor="terms">I confirm that I have followed all of the above steps.
            </Label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" ref={dialogCloseRef}>Cancel</Button>
            </DialogClose>
            <Button type="button" className="bg-blue-700 hover:bg-blue-900" onClick={handleStatusChange} disabled={!checked}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default OrderCompleteCheckList;
