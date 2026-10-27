import { uploadImageToCloudinary } from "@/api/cloudinaryApi";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/clerk-react";
import { useRef, useState } from "react";
import { toast } from "sonner";



function DeliveryProof(props) {
  const { getToken } = useAuth();
  const dialogCloseRef = useRef(null);
  const [deliveryProof, setDeliveryProof] = useState([]);



  const handleStatusChange = async () => {
    if (deliveryProof.length == 0) {
      toast.error("Please upload delivery proof befor change order status as delivered", { position: "bottom-right" });
      return;
    }

    try {
      const token = await getToken();
      let receiptUrl = "";

      if (deliveryProof && deliveryProof.length > 0) {
        try {
          const file = deliveryProof[0];
          receiptUrl = await uploadImageToCloudinary(file);
        } catch (uploadError) {
          console.error("Failed to upload receipt:", uploadError);
          toast.error("Failed to upload delivery proof. Please try again.", { position: "bottom-right" });
          return;
        }
      }

      const response = await updateOrderStatus(token, {
        id: props.orderId,
        OrderStatus: "Delivered",
        PaymentStatus: props.paymentStatus,
        DeliveryProof: receiptUrl
      });

      if (response.message === "success") {
        toast.success(`Order NO: ${props.orderNo} marked as delivered!`, { position: "bottom-right" });

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
            <Badge className="bg-green-600 rounded-full w-24 justify-center hover:bg-green-800">Delivered</Badge>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
    
          <div className="py-5">
            <Label>Delivery Proof</Label>
            <Input
              type="file"
              className="bg-white"
              placeholder="Receipt"
              onChange={(e) => setDeliveryProof(e.target.files)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" ref={dialogCloseRef}>Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              className="bg-blue-700 hover:bg-blue-900"
              onClick={handleStatusChange}
              disabled={deliveryProof.length === 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default DeliveryProof;