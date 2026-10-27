import { updateSale } from "@/api/saleApi";
import { uploadAudioToCloudinary } from "@/api/cloudinaryApi";
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
import { Pencil } from "lucide-react";
import { fethchSalespersonNames } from "@/api/salespersonApi";

export function EditSale({ saleData, onUpdate }) {
  const { getToken } = useAuth();
  const saleId = saleData.id;

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
    if (open && saleData) {
      setSelectedSalesperson(saleData.salesperson_id || "");
      setType(saleData.type || "");
      setCommission(saleData.commission || "");
      setDate(saleData.date ? saleData.date.split("T")[0] : "");
      setCustomerName(saleData.customer_name || "");
      setCustomerPhone(saleData.customer_phone || "");
      setRecording(saleData.recording_url || []);
      setDescription(saleData.description || "");
    }
  }, [open, saleData]);

  useEffect(() => {
    const loadSalespersons = async () => {
      try {
        const token = await getToken();
        const response = await fethchSalespersonNames(token);
        const list = response.data.salespersons.map(item => ({
          id: item.id,
          name: item.salesperson
        }));
        setSalespersonsList(list);
      } catch (err) {
        console.error("Error fetching salespersons:", err);
      }
    };
    loadSalespersons();
  }, [getToken]);

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
      if (date && !date.includes("T")) {
        finalDate = `${date}T00:00:00Z`;
      }
      
      const response = await updateSale(token, {
        id: saleId,
        salesperson: selectedSalesperson,
        type: type,
        commission: parseFloat(commission),
        date: finalDate || saleData.date,
        customer_name: customerName,
        customer_phone: customerPhone,
        description: description,
        recording_url: recordingUrl || saleData.recording_url,
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
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Sale</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to sale details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-5 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="Salesperson" className="text-slate-700 font-semibold text-sm">Salesperson</Label>
            <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
              <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                <SelectValue placeholder="Select a salesperson" />
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="Type" className="text-slate-700 font-semibold text-sm">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BatteryPack">Battery Pack</SelectItem>
                <SelectItem value="Solar">Solar</SelectItem>
                <SelectItem value="Repair">Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="Commission" className="text-slate-700 font-semibold text-sm">Commission</Label>
            <Input
              id="Commission"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="Date" className="text-slate-700 font-semibold text-sm">Date</Label>
            <Input
              id="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="CustomerName" className="text-slate-700 font-semibold text-sm">Customer Name</Label>
            <Input
              id="CustomerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="CustomerPhone" className="text-slate-700 font-semibold text-sm">Customer Phone No.</Label>
            <Input
              id="CustomerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="Recording" className="text-slate-700 font-semibold text-sm">Recording</Label>
            <Input
              type="file"
              accept="audio/*"
              className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              onChange={(e) => setRecording(e.target.files?.[0])}
            />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="Description" className="text-slate-700 font-semibold text-sm">Description</Label>
            <Textarea
              id="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[90px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              rows={3}
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
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6" 
            onClick={handleEditSaleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}