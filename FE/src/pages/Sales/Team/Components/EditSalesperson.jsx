import { updateSalesperson } from "@/api/salespersonApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function EditSalesperson({ onUpdate, ...props }) {
  const { getToken } = useAuth();

  const Id = props.salespersonData.id;
  const [open, setOpen] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");



  useEffect(() => {
    if (open && props.salespersonData) {
      setFirstName(props.salespersonData.first_name)
      setLastName(props.salespersonData.last_name)
      setEmail(props.salespersonData.email)
      setPhoneNo(props.salespersonData.phone)
    }
  }, [open, props.salespersonData]);

  const handleEditSalespersonSubmit = async () => {
    try {
      const token = await getToken();
      const response = await updateSalesperson(token, {
        id: Id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_no: phoneNo,
      });

      if (response.message === "success") {
        toast.success("Salesperson updated successfully!", { position: "bottom-right" });
        setOpen(false);
        
        if (onUpdate) {
            onUpdate();
        }
      } else {
        toast.error("Error updating salesperson! " + response.message, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating salesperson:", error);
      toast.error("Error updating salesperson!", { position: "bottom-right" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] sm:h-auto h-[800px]" >
        <DialogHeader>
          <DialogTitle>Edit Salesperson</DialogTitle>
          <DialogDescription>
            Make changes to salesperson details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="FisrstName" className="justify-self-start text-left">
              First Name
            </Label>
            <Input
              id="FisrstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="LastName" className="justify-self-start text-left">
              Last Name
            </Label>
            <Input
              id="LastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="PhoneNO" className="justify-self-start text-left">
              Phone No.
            </Label>
            <Input
              id="PhoneNo"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="justify-self-start text-left">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleEditSalespersonSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}