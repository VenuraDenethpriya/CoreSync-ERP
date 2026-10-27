import { updateClerkUser, updateUser } from "@/api/userApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function EditUser({ Data, open, onOpenChange, onUpdate }) {
  const { getToken } = useAuth();
  const Id = Data?.id;
  const clerkID = Data?.clerkID;

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  useEffect(() => {
    if (open && Data) {
      setFirstName(Data.firstName || "");
      setLastName(Data.lastName || "");
      setEmail(Data.email || "");
      setPhoneNo(Data.phoneNo || "");
      setRole(Data.role || "");
    }
  }, [open, Data]);

  const handleEditItemSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const response = await updateUser(token, {
        user_id: Id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_no: phoneNo,
        role: role,
      });

      if (response.message === "success") {
        const clerkData = await updateClerkUser(token, clerkID, firstName, lastName, email, phoneNo, role);

        if (!clerkData.success) {
          toast.error("Failed to update Clerk user: " + clerkData.message);
          setIsSubmitting(false);
          return;
        }

        handleOpenChange(false);
        toast.success("User updated successfully!", { position: "bottom-right" });

        const updatedUserForTable = {
          id: Id,
          firstName: firstName,
          lastName: lastName,
          userName: `${firstName} ${lastName}`,
          email: email,
          phoneNo: phoneNo,
          role: role,
          updatedAt: new Date().toISOString()
        };

        if (onUpdate) {
          onUpdate(updatedUserForTable);
        }
      } else {
        toast.error("Error updating user! " + response.message, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user!", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit User</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to user details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditItemSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="FirstName" className="text-slate-700 font-semibold text-sm">First Name</Label>
              <Input
                id="FirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="LastName" className="text-slate-700 font-semibold text-sm">Last Name</Label>
              <Input
                id="LastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="Doe"
              />
            </div>

            {/* Phone No */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="PhoneNo" className="text-slate-700 font-semibold text-sm">Phone No.</Label>
              <Input
                id="PhoneNo"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="94XXXXXXXXX"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="john@example.com"
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="Role" className="text-slate-700 font-semibold text-sm">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="FINANCE_HEAD">FINANCE_HEAD</SelectItem>
                  <SelectItem value="HR_HEAD">HR_HEAD</SelectItem>
                  <SelectItem value="WAREHOUSE_STAFF">WAREHOUSE_STAFF</SelectItem>
                  <SelectItem value="INVENTORY_MANAGER">INVENTORY_MANAGER</SelectItem>
                  <SelectItem value="OFFICE_STAFF">OFFICE_STAFF</SelectItem>
                  <SelectItem value="SALES_TEAM">SALES_TEAM</SelectItem>
                  <SelectItem value="READ_ONLY">READ_ONLY</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}