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
import { Pencil } from "lucide-react";

export function EditCustomer({ onUpdate, customerData }) {
  const { getToken } = useAuth();
  const customerId = customerData?.customerId;

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo1, setPhoneNo1] = useState("");
  const [phoneNo2, setPhoneNo2] = useState("");
  const [address, setAddress] = useState("");
  const [vatNo, setVatNo] = useState("");

  useEffect(() => {
    if (open && customerData) {
      setTitle(customerData.title || "");
      setFirstName(customerData.first_name || "");
      setLastName(customerData.last_name || "");
      setEmail(customerData.email || "");
      setPhoneNo1(customerData.phone_no1 || "");
      setPhoneNo2(customerData.phone_no2 || "");
      setAddress(customerData.address || "");
      setVatNo(customerData.vat_no || "");
    }
  }, [open, customerData]);

  const handleEditCustomerSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const token = await getToken();
      setIsSubmitting(true);

      const response = await updateCustomer(token, {
        customer_id: customerId,
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
      } else {
        toast.error("Error updating customer! " + response.message, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Error updating customer! Please try again.", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4">
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Customer</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to customer details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditCustomerSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Title" className="text-slate-700 font-semibold text-sm">Title</Label>
              <Select value={title} onValueChange={setTitle}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue placeholder="Select a title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr.">Mr</SelectItem>
                  <SelectItem value="Mrs.">Mrs</SelectItem>
                  <SelectItem value="Miss.">Miss</SelectItem>
                  <SelectItem value="M/S.">M/S</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                  <SelectItem value="Rev">Rev</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone No 1 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="PhoneNo1" className="text-slate-700 font-semibold text-sm">Phone No.</Label>
              <Input
                id="PhoneNo1"
                value={phoneNo1}
                onChange={(e) => setPhoneNo1(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="94XXXXXXXXX"
              />
            </div>

            {/* Secondary Phone No */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="PhoneNo2" className="text-slate-700 font-semibold text-sm">Secondary Phone No.</Label>
              <Input
                id="PhoneNo2"
                value={phoneNo2}
                onChange={(e) => setPhoneNo2(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="94XXXXXXXXX"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Email" className="text-slate-700 font-semibold text-sm">Email</Label>
              <Input
                id="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="john@example.com"
              />
            </div>

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

            {/* Address */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="Address" className="text-slate-700 font-semibold text-sm">Address</Label>
              <Input
                id="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="123 Street Name"
              />
            </div>

            {/* Vat No */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="VatNo" className="text-slate-700 font-semibold text-sm">VAT No.</Label>
              <Input
                id="VatNo"
                value={vatNo}
                onChange={(e) => setVatNo(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="Customer's VAT No"
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