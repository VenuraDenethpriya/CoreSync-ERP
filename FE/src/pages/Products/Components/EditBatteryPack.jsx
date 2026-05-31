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

export function EditBatteryPack({ productData, onUpdate }) {
  const { getToken } = useAuth();
  const productId = productData.id;

  const packTypeOptions = [
    "Eco Cell",
    "PowerVault",
    "Solar Flex",
    "Power Hub",
    "Li-ion"
  ];

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

  const monitorOptions = [
    "3.2 LCD",
    "4.3 LCD",
    "2.5 LCD",
    "Not Required",
  ];



  const [open, setOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [cellCount, setCellCount] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [packType, setPackType] = useState("");
  const [cellType, setCellType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [voltage, setVoltage] = useState("");
  const [bmsType, setBmsType] = useState("");
  const [monitor, setMonitor] = useState("");
  const [Specifications, setSpecification] = useState("");
  const [isActive, setIsActive] = useState("");

  useEffect(() => {
    if (open && productData) {
      setProductName(productData.name);
      setCategory(productData.category);
      setCellCount(productData.cell_count);
      setBasePrice(productData.base_price);
      setPackType(productData.type);
      setCellType(productData.cell_type);
      setCapacity(productData.capacity);
      setVoltage(productData.voltage);
      setBmsType(productData.bms_type);
      setMonitor(productData.monitor);
      setSpecification(productData.Specifications);
      setIsActive(productData.is_active ? "true" : "false");
    }
  }, [open, productData]);

  const handleEditBatteryPackSubmit = async () => {
    try {
      const token = await getToken();
      const response = await updateProduct(token, productId, {
        name: productName,
        category: category,
        cell_count: cellCount,
        base_price: parseFloat(basePrice),
        type: packType,
        cell_type: cellType,
        capacity: parseFloat(capacity),
        voltage: parseFloat(voltage),
        bms_type: bmsType,
        monitor: monitor,
        Specifications: Specifications,
        is_active: isActive === "true" ? true : false,
      });
      const isSuccess =
        (response.data && response.data.message === "success") ||
        response.message === "success";

      if (isSuccess) {
        const apiData = response.data || response;
        const mappedData = {
          name: apiData.ProductName,
          category: apiData.Category,
          cell_count: apiData.CellCount,
          base_price: apiData.BasePrice,
          type: apiData.Type,
          cell_type: apiData.CellType,
          capacity: apiData.Capacity,
          voltage: apiData.Voltage,
          bms_type: apiData.BmsType,
          monitor: monitor, 
          Specifications: Specifications, 
          is_active: apiData.is_active,
          updated_at: apiData.updated_at
        };

        if (onUpdate) {
          onUpdate(mappedData);
        }

        setOpen(false);
        toast.success("Battery pack updated successfully!", { position: "bottom-right" });
      }

    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} className="w-[1200px] sm:w-fit">
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] sm:h-fit h-[800px] overflow-y-auto my-8">
        <DialogHeader>
          <DialogTitle>Edit Battery Pack</DialogTitle>
          <DialogDescription>
            Make changes to battery pack details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 py-4">
          {/* Product Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ProductName" className="justify-self-start text-left">
              Product Name
            </Label>
            <Input
              id="ProductName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Category" className="justify-self-start text-left">
              Category
            </Label>
            <Input
              id="Category"
              value={category}
              className="col-span-3 font-bold"
              disabled
            />
          </div>

          {/* Model */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="CellCount" className="justify-self-start text-left">
              Cell Count
            </Label>
            <Input
              id="CellCount"
              value={cellCount}
              onChange={(e) => setCellCount(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Base Price */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="BasePrice" className="justify-self-start text-left">
              Base Price
            </Label>
            <Input
              id="BasePrice"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Pack Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="PackType" className="justify-self-start text-left">
              Pack Type
            </Label>
            <Select value={packType} onValueChange={setPackType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a pack type" />
              </SelectTrigger>
              <SelectContent>
                {packTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cell Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="CellType" className="justify-self-start text-left">
              Cell Type
            </Label>
            <Select value={cellType} onValueChange={setCellType}>
              <SelectTrigger className="col-span-3">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Capacity" className="justify-self-start text-left">
              Capacity
            </Label>
            <Input
              id="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Voltage */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Voltage" className="justify-self-start text-left">
              Voltage
            </Label>
            <Input
              id="Voltage"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* BMS Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="BmsType" className="justify-self-start text-left">
              BMS Type
            </Label>
            <Select value={bmsType} onValueChange={setBmsType}>
              <SelectTrigger className="col-span-3">
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

          {/* Monitor */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="PackType" className="justify-self-start text-left">
              Monitor
            </Label>
            <Select value={monitor} onValueChange={setMonitor}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a Monitor" />
              </SelectTrigger>
              <SelectContent>
                {monitorOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* Is Active */}
          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="IsActive" className="pt-2 text-left">
              Is Active
            </Label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select active status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specification */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="Specifications" className="justify-self-start text-left mt-2">
              Specification
            </Label>
            <textarea
              id="Specifications"
              value={Specifications}
              onChange={(e) => setSpecification(e.target.value)}
              className="col-span-3 border rounded-md p-2"
              rows={4}
            />
          </div>

        </div>

        <DialogFooter>
          <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleEditBatteryPackSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
