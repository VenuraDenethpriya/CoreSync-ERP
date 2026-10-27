import { uploadAudioToCloudinary } from "@/api/cloudinaryApi";
import { createSale } from "@/api/saleApi";
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
import { useAuth, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

export function AddtToSale({ saleData, open, setOpen }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const userID = user?.id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [salespersonsList, setSalespersonsList] = useState([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [type, setType] = useState("");
  const [commission, setCommission] = useState("");
  const [date, setDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");

  const [existingRecording, setExistingRecording] = useState(null);
  const [newRecording, setNewRecording] = useState(null);

  useEffect(() => {
    const loadSalespersons = async () => {
      try {
        const token = await getToken();
        const response = await fethchSalespersonNames(token);
        const salespersonsList = response.data.salespersons;

        const formattedList = salespersonsList.map((item) => ({
          id: item.id,
          name: item.salesperson,
          phone_no: item.phone_no,
        }));

        setSalespersonsList(formattedList);
      } catch (err) {
        console.error("Error fetching salespersons:", err);
      }
    };

    loadSalespersons();
  }, [getToken]);

  useEffect(() => {
    if (open && saleData) {
      if (saleData.createdAt) {
        const formattedDate = saleData.createdAt.split("T")[0];
        setDate(formattedDate);
      } else if (saleData.date) {
        setDate(saleData.date);
      }

      setCustomerName(saleData.customerName || "");
      setCustomerPhone(saleData.customerPhoneNo || "");
      setExistingRecording(saleData.recording || null);
      setNewRecording(null);

      if (salespersonsList.length > 0 && saleData.agentName) {
        const agentCli = saleData.agentName;
        const matchedAgent = salespersonsList.find(
          (person) => person.phone_no === agentCli || person.name === agentCli
        );

        if (matchedAgent) {
          setSelectedSalesperson(matchedAgent.id);
        }
      }
    }
  }, [open, saleData, salespersonsList]);

  const handleEditSaleSubmit = async () => {
    try {
      const token = await getToken();
      setIsSubmitting(true);

      let recordingUrl = existingRecording;

      if (newRecording instanceof File) {
        try {
          recordingUrl = await uploadAudioToCloudinary(newRecording);
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

      const payload = {
        salesperson: selectedSalesperson,
        type: type,
        commission: parseFloat(commission),
        date: finalDate,
        customer_name: customerName,
        customer_phone: customerPhone,
        description: description,
        recording_url: recordingUrl,
        updated_by: userID,
      };

      const response = await createSale(token, payload);

      if (response.message === "success") {
        toast.success("Sale created/updated successfully!", { position: "bottom-right" });
        setOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
           <Plus className="w-4 h-4 mr-2" /> Add to Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Add to Sale</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Fill in the details to add this lead to sales. Click save when you're done.
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
            {existingRecording && !newRecording ? (
              <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-xl bg-slate-50">
                <audio controls src={existingRecording} className="h-9 w-full" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                  onClick={() => setExistingRecording(null)}
                  title="Remove/Replace Recording"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Input
                type="file"
                accept="audio/*"
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                onChange={(e) => setNewRecording(e.target.files?.[0])}
              />
            )}
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