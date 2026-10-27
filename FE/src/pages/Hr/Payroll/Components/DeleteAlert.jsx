import { deletePayrollHistory } from "@/api/hrApi";
import { deleteTask } from "@/api/taskApi";
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

export function TaskDeleteAlert({ Data, open, onOpenChange, onDeleteSuccess }) {
  const { getToken } = useAuth();


  const handleOpenChange = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };


  const handleDelete = async (payrollHistoryId, empName) => {
    if (!window.confirm(`Are you sure you want to delete the payroll history for ${empName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await getToken();
      const res = await deletePayrollHistory(token, payrollHistoryId);

      if (res.message === "success" || res.code === "0") {
        toast.success(`Payroll history for ${empName} deleted successfully.`);
        fetchData(); // Refresh the list
      } else {
        toast.error(`Failed to delete payroll history: ${res.message}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the record.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to delete the {Data.month} payroll history for {Data.empName}?</AlertDialogTitle>
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