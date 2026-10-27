import { deleteInventoryOrder } from "@/api/inventoryApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

// FIXED 1: Added onDeleteSuccess to the props here!
export function DeleteAlert({ itemData, open, onOpenChange, onDeleteSuccess }) {
  const { getToken } = useAuth();

  const handleDelete = async () => {
    try {
      const token = await getToken();
      
      const itemId = itemData.id;
      const response = await deleteInventoryOrder(token, itemId);
      
      if (response.message == "success") {
        toast.success("Inventory item deleted successfully!", { position: "bottom-right" });
        
        onOpenChange(false);
        
        if (typeof onDeleteSuccess === 'function') {
          onDeleteSuccess(itemId);
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item.", { position: "bottom-right" });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to delete {itemData?.orderNo}?</AlertDialogTitle>
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