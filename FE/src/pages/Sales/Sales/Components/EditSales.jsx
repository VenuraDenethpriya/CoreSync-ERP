import { uploadAudioToCloudinary } from "@/api/cloudinaryApi";
import { updateCustomer } from "@/api/customerApi";
import { updateSale } from "@/api/saleApi";
import { fethchSalespersonNames } from "@/api/salespersonApi";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function EditSale({ onUpdate, ...props }) {
  const { getToken } = useAuth();
  const saleId = props.saleData.id;

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [salespersonsList, setSalespersonsList] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [type, setType] = useState("");
  const [commission, setCommission] = useState("");
  const [date, setDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [recording, setRecording] = useState([]);
  const [description, setDescription] = useState("");


  useEffect(() => {
    if (open && props.saleData) {
      setSelectedSalesperson(props.saleData.salesperson_id);
      setType(props.saleData.type)
      setCommission(props.saleData.commission)
      if (props.saleData.date) {
        setDate(props.saleData.date.split("T")[0]);
      } else {
        setDate("");
      }
      setCustomerName(props.saleData.customer_name)
      setCustomerPhone(props.saleData.customer_phone)
      setRecording(props.saleData.recording_url)
      setDescription(props.saleData.description)

    }
  }, [open, props.saleData]);

  useEffect(() => {
    const loadSalespersons = async () => {
      try {
        const token = await getToken();
        const response = await fethchSalespersonNames(token);
        const salespersonsList = response.data.salespersons;

        const formattedList = salespersonsList.map(item => ({
          id: item.id,
          name: item.salesperson
        }));

        setSalespersonsList(formattedList);
      } catch (err) {
        console.error("Error fetching salespersons:", err);
      }
    };

    loadSalespersons();
  }, []);

  const handleEditSaleSubmit = async () => {
    try {
      const token = await getToken();
      setIsSubmitting(true);
      let recordingUrl = "";

      if (recording instanceof File) {
        try {
          recordingUrl = await uploadAudioToCloudinary(recording);
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("Failed to upload call recording.", { position: "bottom-right" });
          setIsSubmitting(false);
          return;
        }
      }
      let finalDate = date;
      if (!date.includes("T")) {
        finalDate = `${date}T00:00:00Z`;
      }
      const response = await updateSale(token, {
        id: saleId,
        salesperson: selectedSalesperson,
        type: type,
        commission: parseFloat(commission),
        date: finalDate || props.saleData.date,
        customer_name: customerName,
        customer_phone: customerPhone,
        description: description,
        recording_url: recordingUrl || props.saleData.recording_url,
      });
      if (response.message === "success") {
        toast.success("Sale updated successfully!", { position: "bottom-right" });
        setOpen(false);
        if (onUpdate) {
            onUpdate();
        }
      }
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error("Error updating sale! Please try again.", { position: "bottom-right" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>
            Make changes to sale details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Salespereson" className="justify-self-start text-left">
              Salesperson
            </Label>
            <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a saleperson" />
              </SelectTrigger>
              <SelectContent>
                {salespersonsList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Type" className="justify-self-start text-left">
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BatteryPack">Battery Pack</SelectItem>
                <SelectItem value="Solar">Solar</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Commission" className="justify-self-start text-left">
              Commission
            </Label>
            <Input
              id="Commission"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Date" className="justify-self-start text-left">
              Date
            </Label>
            <Input
              id="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3 w-full"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="CustomerName" className="justify-self-start text-left">
              Customer Name
            </Label>
            <Input
              id="CustomerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3"
            />
          </div>


          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="CustomerPhone" className="justify-self-start text-left">
              Customer Phone No.
            </Label>
            <Input
              id="CustomerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Recording" className="justify-self-start text-left">
              Recording
            </Label>
            <Input
              type="file"
              accept="audio/*"
              className="col-span-3 w-full bg-white"
              onChange={(e) => setRecording(e.target.files?.[0])}
            />
          </div>
ma lagin innw denwa n

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Description" className="justify-self-start text-left">
              Description
            </Label>
            <Textarea
              id="Description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleEditSaleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
