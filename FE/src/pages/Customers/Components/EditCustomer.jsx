import { updateCustomer } from "@/api/customerApi";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function EditCustomer({ onUpdate, ...props }) {
  const { getToken } = useAuth();
  const cutomerId = props.customerData.customerId;

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo1, setPhoneNo1] = useState("");
  const [phoneNo2, setPhoneNo2] = useState("");
  const [address, setAddress] = useState("");
  const [vatNo, setVatNo] = useState("");


  useEffect(() => {
    if (open && props.customerData) {
      setTitle(props.customerData.title);
      setFirstName(props.customerData.first_name);
      setLastName(props.customerData.last_name);
      setEmail(props.customerData.email);
      setPhoneNo1(props.customerData.phone_no1);
      setPhoneNo2(props.customerData.phone_no2);
      setAddress(props.customerData.address);
      setVatNo(props.customerData.vat_no);
    }
  }, [open, props.customerData]);

  const handleEditCustomerSubmit = async () => {
    try {
      const token = await getToken();
      console.log("Token:", token);
      const response = await updateCustomer(token, {
        customer_id: cutomerId,
        Title: title,
        PhoneNo1: phoneNo1,
        PhoneNo2: phoneNo2,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Address: address,
        Vat: vatNo,
      });
      if (response.message === "success") {
        toast.success("Customer updated successfully!", { position: "bottom-right" });
        setOpen(false);

        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Error updating customer! Please try again.", { position: "bottom-right" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Make changes to customer details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Title" className="justify-self-start text-left">
              Title
            </Label>
            <Select value={title} onValueChange={setTitle}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr.">Mr</SelectItem>
                <SelectItem value="Mrs.">Mrs</SelectItem>
                <SelectItem value="Miss.">Miss</SelectItem>
                <SelectItem value="M/S.">M/S</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="PhoneNo1" className="justify-self-start text-left">
              Phone No.
            </Label>
            <Input
              id="PhoneNo1"
              value={phoneNo1}
              onChange={(e) => setPhoneNo1(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="PhoneNo2" className="justify-self-start text-left">
              Secondary Phone No.
            </Label>
            <Input
              id="PhoneNo2"
              value={phoneNo2}
              onChange={(e) => setPhoneNo2(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Email" className="justify-self-start text-left">
              Email
            </Label>
            <Input
              id="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="FirstName" className="justify-self-start text-left">
              First Name
            </Label>
            <Input
              id="FirstName"
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
            <Label htmlFor="Address" className="justify-self-start text-left">
              Address
            </Label>
            <Input
              id="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="VatNo" className="justify-self-start text-left">
              Vat No
            </Label>
            <Input
              id="VatNo"
              value={vatNo}
              onChange={(e) => setVatNo(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleEditCustomerSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
