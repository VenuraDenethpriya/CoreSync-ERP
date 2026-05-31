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
import { X } from "lucide-react";

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

  // Separate state for existing URL and new File upload
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
  }, []);

  useEffect(() => {
    if (open && saleData) {
      // 1. Handle Date
      if (saleData.createdAt) {
        const formattedDate = saleData.createdAt.split("T")[0];
        setDate(formattedDate);
      } else if (saleData.date) {
        setDate(saleData.date);
      }

      // 2. Handle Text Fields
      setCustomerName(saleData.customerName || "");
      setCustomerPhone(saleData.customerPhoneNo || "");

      // 3. Handle Recording (Check if URL exists)
      setExistingRecording(saleData.recording || null);
      setNewRecording(null); // Reset new file input

      // 4. Handle Salesperson Matching
      if (salespersonsList.length > 0 && saleData.agentName) {
        const agentCli = saleData.agentName;
        // Try to match by ID or Phone or Name depending on what saleData provides
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

      let recordingUrl = existingRecording; // Default to the existing URL

      // If a NEW file has been selected, upload it and use that URL instead
      if (newRecording instanceof File) {
        try {
          recordingUrl = await uploadAudioToCloudinary(newRecording);
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("Failed to upload call recording.", {
            position: "bottom-right",
          });
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
        recording_url: recordingUrl, // Send whichever URL is valid (new or old)
        updated_by: userID,
      };

      const response = await createSale(token, payload);

      if (response.message === "success") {
        toast.success("Sale updated successfully!", {
          position: "bottom-right",
        });
        setOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Reduced timeout for better UX
      }
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error("Error updating sale! Please try again.", {
        position: "bottom-right",
      });
    } finally {
      setIsSubmitting(false);
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
            <Select
              value={selectedSalesperson}
              onValueChange={setSelectedSalesperson}
            >
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

          {/* RECORDING FIELD START */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Recording" className="justify-self-start text-left">
              Recording
            </Label>
            <div className="col-span-3 w-full">
              {/* If we have an existing URL and no new file selected, show the player */}
              {existingRecording && !newRecording ? (
                <div className="flex items-center gap-2 border p-2 rounded-md bg-slate-50">
                  <audio
                    controls
                    src={existingRecording}
                    className="h-8 w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => setExistingRecording(null)} // User wants to remove/replace
                    title="Remove/Replace Recording"
                  >
                    X
                  </Button>
                </div>
              ) : (
                /* Else show the file input */
                <Input
                  type="file"
                  accept="audio/*"
                  className="bg-white"
                  onChange={(e) => setNewRecording(e.target.files?.[0])}
                />
              )}
            </div>
          </div>
          {/* RECORDING FIELD END */}

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
          <Button
            className="bg-blue-800 hover:bg-blue-900"
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