import { updateLeaveRequst } from "@/api/hrApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


export const AddComment = ({ row, getToken, handleInventoryUpdate }) => {
  const { id, comment } = row.original;
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState(comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsSubmitting(true);

    try {
      const token = await getToken();
      const response = await updateLeaveRequst(token, {
        id: id,
        comment: newComment,
      }

      );
      handleInventoryUpdate({ comment: newComment }, id);

      toast.success("Comment saved successfully!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to save comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="group flex items-center justify-between pl-5 pr-2 gap-2" onClick={(e) => e.stopPropagation()}>
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div className="capitalize text-slate-600 truncate max-w-[150px] cursor-default">
              {comment || "-"}
            </div>
          </TooltipTrigger>
          
          {comment && (
            <TooltipContent 
              side="top" 
              align="start" 
              className="max-w-[250px] bg-slate-800 text-white p-3 shadow-lg z-[100]"
            >
              <p className="text-sm break-words whitespace-normal">{comment}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button 
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-all shrink-0"
            title="Edit Comment"
            onClick={() => setNewComment(comment || "")} 
          >
            <Pencil size={14} />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Comment</DialogTitle>
            <DialogDescription>
              Add or edit the comment for this leave request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment here..."
              className="resize-none h-24"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting || newComment === comment} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};