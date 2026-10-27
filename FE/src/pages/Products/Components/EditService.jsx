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

export function EditService({ productData, onUpdate }) {
  const { getToken } = useAuth();
  const productId = productData?.id;

  const [open, setOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [Specifications, setSpecification] = useState("");
  const [isActive, setIsActive] = useState("");

  useEffect(() => {
    if (open && productData) {
      setProductName(productData.name || "");
      setCategory(productData.category || "");
      setBasePrice(productData.base_price || "");
      setSpecification(productData.Specifications || "");
      setIsActive(productData.is_active ? "true" : "false");
    }
  }, [open, productData]);

  const handleEditServiceSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const token = await getToken();
      const response = await updateProduct(token, productId, {
        name: productName,
        category: category,
        base_price: parseFloat(basePrice),
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
          Specifications: Specifications,
          is_active: isActive === "true",
          updated_at: new Date().toISOString()
        };
        if (onUpdate) {
          onUpdate(updatedViewData);
        }

        setOpen(false);
        toast.success("Service updated successfully!", { position: "bottom-right" });
      } else {
        toast.error("Error updating service!", { position: "bottom-right" });
      }

    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating service!", { position: "bottom-right" });
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
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Service</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to service details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditServiceSubmit} className="space-y-6 pt-4">
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

            {/* Is Active */}
            <div className="flex flex-col gap-2">
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