import { deletePurchaseOrder } from "@/api/finance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function PurchaseOrderDeleteAlert({ purchaseData }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault(); 

    try {
      const token = await getToken();

      const purchaseOrderId = purchaseData?.id || purchaseData?._id; 
      
      if (!purchaseOrderId) {
        console.error("Could not find ID in purchaseData:", purchaseData);
        toast.error("Error: Missing Purchase Order ID");
        return;
      }

      const response = await deletePurchaseOrder(token, purchaseOrderId);
      

      if (response?.message?.toLowerCase() === "success" || response?.status === 200 || response?.ok) {
        toast.success("Purchase order deleted successfully!", { position: "bottom-right" });

        setTimeout(() => {
          navigate("/finance");
        }, 2500);
      } else {
        toast.error("Failed to delete. Unexpected API response.");
      }

    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("An error occurred while deleting.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to delete {purchaseData?.purchase_no}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This item will be deleted from your system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}