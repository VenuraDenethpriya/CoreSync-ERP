import { updateProduct } from "@/api/productApi";
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

export function EditEV({ productData, onUpdate }) {
  const { getToken } = useAuth();
  const productId = productData?.id;

  const cellTypeOptions = [
    "EVE 20Ah",
    "EVE 100Ah",
    "EVE 105Ah",
    "EVE 230Ah",
    "EVE 280Ah",
    "Goshen 50Ah",
    "Goshen 300Ah",
    "Lishen 200Ah",
    "Samsung SDI 94Ah",
    "Samsung SDI 100Ah",
    "Panasonic 50Ah",
  ];

  const bmsTypeOptions = [
    "16 S 100A communication BMS",
    "16S 150A communication BMS",
    "16S 200A communication BMS",
    "8S 100A 0.6A balancing BMS",
    "24S 150A BMS",
    "24S 120A BMS",
    "8S 200A high current BMS",
    "500A Relay BMS",
    "60A 8S BMS",
    "60A 24S BMS",
  ];

  const vehicleTypeOptions = [
    "Electric Car",
    "Electric Bike",
    "Electric Threewheel",
    "Electric Forklift",
    "Other",
  ];

  const [open, setOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [cellType, setCellType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [voltage, setVoltage] = useState("");
  const [bmsType, setBmsType] = useState("");
  const [Specifications, setSpecification] = useState("");
  const [isActive, setIsActive] = useState("");

  useEffect(() => {
    if (open && productData) {
      setProductName(productData.name || "");
      setCategory(productData.category || "");
      setBasePrice(productData.base_price || "");
      setVehicleType(productData.type || "");
      setCellType(productData.cell_type || "");
      setCapacity(productData.capacity || "");
      setVoltage(productData.voltage || "");
      setBmsType(productData.bms_type || "");
      setSpecification(productData.Specifications || "");
      setIsActive(productData.is_active ? "true" : "false");
    }
  }, [open, productData]);

  const handleEditBatteryPackSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const token = await getToken();
      const response = await updateProduct(token, productId, {
        name: productName,
        category: category,
        base_price: parseFloat(basePrice),
        type: vehicleType,
        cell_type: cellType,
        capacity: parseFloat(capacity),
        voltage: parseFloat(voltage),
        bms_type: bmsType,
        Specifications: Specifications,
        is_active: isActive === "true",
      });
      const isSuccess = 
        (response.data && response.data.message === "success") || 
        response.message === "success";

      if (isSuccess) {
        const updatedViewData = {
            name: productName,
            category: category,
            base_price: parseFloat(basePrice),
            type: vehicleType,
            cell_type: cellType,
            capacity: parseFloat(capacity),
            voltage: parseFloat(voltage),
            bms_type: bmsType,
            Specifications: Specifications,
            is_active: isActive === "true",
            updated_at: new Date().toISOString() 
        };
        if (onUpdate) {
            onUpdate(updatedViewData);
        }

        setOpen(false);
        toast.success("E-Vehicle updated successfully!", { position: "bottom-right" });
      } else {
        toast.error("Error updating E-Vehicle!", { position: "bottom-right" });
      }
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating E-Vehicle!", { position: "bottom-right" });
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
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit E-Vehicle</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to e-vehicle details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditBatteryPackSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            
            {/* Product Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="ProductName" className="text-slate-700 font-semibold text-sm">Product Name</Label>
              <Input
                id="ProductName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Category" className="text-slate-700 font-semibold text-sm">Category</Label>
              <Input
                id="Category"
                value={category}
                className="bg-slate-100 border-slate-200 h-11 rounded-xl font-semibold text-slate-500 cursor-not-allowed"
                disabled
              />
            </div>

            {/* Base Price */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="BasePrice" className="text-slate-700 font-semibold text-sm">Base Price (LKR)</Label>
              <Input
                id="BasePrice"
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* Vehicle Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="PackType" className="text-slate-700 font-semibold text-sm">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cell Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="CellType" className="text-slate-700 font-semibold text-sm">Cell Type</Label>
              <Select value={cellType} onValueChange={setCellType}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue placeholder="Select a cell type" />
                </SelectTrigger>
                <SelectContent>
                  {cellTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Capacity" className="text-slate-700 font-semibold text-sm">Battery Capacity (Ah)</Label>
              <Input
                id="Capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* Voltage */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Voltage" className="text-slate-700 font-semibold text-sm">Battery Voltage (V)</Label>
              <Input
                id="Voltage"
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* BMS Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="BmsType" className="text-slate-700 font-semibold text-sm">BMS Type</Label>
              <Select value={bmsType} onValueChange={setBmsType}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue placeholder="Select a BMS type" />
                </SelectTrigger>
                <SelectContent>
                  {bmsTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Is Active */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="IsActive" className="text-slate-700 font-semibold text-sm">Is Active</Label>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue placeholder="Select active status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specification */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="Specifications" className="text-slate-700 font-semibold text-sm">Specification</Label>
              <textarea
                id="Specifications"
                value={Specifications}
                onChange={(e) => setSpecification(e.target.value)}
                className="w-full min-h-[90px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                rows={3}
                placeholder="Enter specifications..."
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