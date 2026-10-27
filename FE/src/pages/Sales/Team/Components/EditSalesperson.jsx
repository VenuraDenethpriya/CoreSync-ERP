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
import { Pencil } from "lucide-react";

export function EditSalesperson({ onUpdate, salespersonData }) {
  const { getToken } = useAuth();
  const Id = salespersonData?.id;

  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  useEffect(() => {
    if (open && salespersonData) {
      setFirstName(salespersonData.first_name || "");
      setLastName(salespersonData.last_name || "");
      setEmail(salespersonData.email || "");
      setPhoneNo(salespersonData.phone || "");
    }
  }, [open, salespersonData]);

  const handleEditSalespersonSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4">
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] w-full rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Salesperson</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to salesperson details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditSalespersonSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="FirstName" className="text-slate-700 font-semibold text-sm">First Name</Label>
              <Input
                id="FirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="LastName" className="text-slate-700 font-semibold text-sm">Last Name</Label>
              <Input
                id="LastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="PhoneNo" className="text-slate-700 font-semibold text-sm">Phone No.</Label>
              <Input
                id="PhoneNo"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="Email" className="text-slate-700 font-semibold text-sm">Email</Label>
              <Input
                id="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}