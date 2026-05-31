import { deleteUser } from "@/api/userApi";
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

export function UserDeleteAlert({ Data, open, onOpenChange, onDeleteSuccess }) {
  const { getToken } = useAuth();


  const handleOpenChange = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };


  const handleDelete = async () => {
    try {
      const token = await getToken();
      const Id = Data.id;

      await deleteUser(token, Id);

      toast.success("User deleted successfully!", { position: "bottom-right" });
      if (onDeleteSuccess) {
        onDeleteSuccess(Id);
      }
      
      handleOpenChange(false);

    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to delete {Data.userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This user will be deleted from your system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}