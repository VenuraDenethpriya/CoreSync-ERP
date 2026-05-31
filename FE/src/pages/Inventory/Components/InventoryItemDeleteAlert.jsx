import { deleteInventoryItem } from "@/api/inventoryApi";
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

export function InventoryDeleteAlert({ itemData }) {
  const { getToken } = useAuth();
const navigate = useNavigate();
  // const handleOpenChange = (newOpen) => {
  //   if (onOpenChange) {
  //     onOpenChange(newOpen);
  //   }
  // };


  const handleDelete = async () => {
    try {
      const token = await getToken();
      console.log("Token:", token);
      const itemId = itemData.id;
      const response = await deleteInventoryItem(token, itemId);
      if (response.message == "success") {
        toast.error("Inventory item deleted successfully!", { position: "bottom-right" });
        // handleOpenChange(false);
        setTimeout(() => {
          navigate("/inventory");
        }, 2500);
      }

      // toast.success("Inventory item deleted successfully!", { position: "bottom-right" });
      // // handleOpenChange(false);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2500);

    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    // <AlertDialog open={open} onOpenChange={handleOpenChange}>
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to delete {itemData.itemName}?</AlertDialogTitle>
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