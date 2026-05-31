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
  const Id = Data.id;
  const clerkID = Data.clerkID;

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [role, setRole] = useState("");
  // const [clerkID, setClerkID] = useState("");

  const handleOpenChange = (newOpen) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };


  useEffect(() => {
    if (open && Data) {
      setFirstName(Data.firstName)
      setLastName(Data.lastName)
      setEmail(Data.email)
      setPhoneNo(Data.phoneNo)
      setRole(Data.role)
      // setClerkID(Data.clerkID)
    }
  }, [open, Data]);

  const handleEditItemSubmit = async () => {
    try {
      const token = await getToken();
      const clerkData = await updateClerkUser(token, clerkID, firstName, lastName, email, phoneNo, role);
      
                  if (!clerkData.success) {
                      toast.error("Failed to update Clerk user: " + clerkData.message);
                      return;
                  }
      
      const response = await updateUser(token, {
        user_id: Id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_no: phoneNo,
        role: role,
        // clerk_id: clerkID,
      });

      if (response.message === "success") {
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1200px] sm:h-auto h-[800px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to user details. Click save when you're done.
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
          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="Role" className="pt-2 text-left">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
                <SelectItem value="WAREHOUSE_STAFF">WAREHOUSE_STAFF</SelectItem>
                <SelectItem value="INVENTORY_MANAGER">INVENTORY_MANAGER</SelectItem>
                <SelectItem value="OFFICE_STAFF">OFFICE_STAFF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ClerkID" className="justify-self-start text-left">
              Clerk ID
            </Label>
            <Input
              id="ClerkID"
              value={clerkID}
              onChange={(e) => setClerkID(e.target.value)}
              className="col-span-3"
            />
          </div> */}
        </div>

        <DialogFooter>
          <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleEditItemSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}