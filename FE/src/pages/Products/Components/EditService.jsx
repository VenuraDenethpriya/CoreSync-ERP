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

export function EditService({ productData, onUpdate }) {
  const { getToken } = useAuth();
  const productId = productData.id;


  const [open, setOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [Specifications, setSpecification] = useState("");
  const [isActive, setIsActive] = useState("");

  useEffect(() => {
    if (open && productData) {
      setProductName(productData.name);
      setCategory(productData.category);
      setBasePrice(productData.base_price);
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
        base_price: parseFloat(basePrice),
        Specifications: Specifications,
        is_active: isActive === "true" ? true : false,
      });
      const isSuccess =
        (response.data && response.data.message === "success") ||
        response.message === "success";

      if (isSuccess) {
        const updatedViewData = {
          name: productName,
          category: category,
          base_price: parseFloat(basePrice),
          Specifications: Specifications,
          is_active: isActive === "true",
          updated_at: new Date().toISOString()
        };
        if (onUpdate) {
          onUpdate(updatedViewData);
        }

        setOpen(false);
        toast.success("Product updated successfully!", { position: "bottom-right" });
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
          <DialogTitle>Edit E-Vehicle</DialogTitle>
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
    </Dialog >
  );
}
