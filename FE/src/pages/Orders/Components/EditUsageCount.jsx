import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react";

function EditUsageCount(props) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const newValue = e.target.new_value.value;
    props.handleEditCount(props.item, newValue);
  };

  const isAllocation = props.type === "allocation";

  return (
    <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isAllocation ? "Edit Allocation Count" : "Edit Usage Count"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="new_value">{isAllocation ? "Count" : "Usage Count"}</Label>
              <Input
                type="number"
                name="new_value"
                id="new_value"
                placeholder={isAllocation ? "Enter new allocation count" : "Enter new usage count"}
                defaultValue={isAllocation ? props.item.count : props.item.usage_count}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default EditUsageCount;