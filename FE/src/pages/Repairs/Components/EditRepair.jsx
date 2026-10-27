import { updateRepair } from "@/api/repair";
import { featchAllOrders } from "@/api/orderApi";
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

export function EditRepair({ onUpdate, repairData }) {
  const { getToken } = useAuth();
  const repairId = repairData?.repair_id;

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderNo, setOrderNo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [price, setPrice] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");

  const [data, setData] = useState([]);
  const [searchOrders, setSearchOrders] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    if (open && repairData) {
      setOrderNo(repairData.order_id || "");
      if (repairData.due_date) {
        setDueDate(repairData.due_date.split('T')[0]);
      } else {
        setDueDate("");
      }
      setPrice(repairData.price || "");
      setCustomerName(repairData.customer_name || "");
      setCustomerPhone(repairData.customer_phone || "");
      setDescription(repairData.description || "");
    }
  }, [open, repairData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const token = await getToken();

        let searchValue = searchOrders;
        if (searchValue.startsWith("INV/EHP/")) {
          searchValue = searchValue.replace("INV/EHP/", "");
        }

        const response = await featchAllOrders(token, searchValue, "", "", "", 10, 0);
        const apiData = response?.data.orders || [];

        const mappedData = apiData
          .map((order) => ({
            orderId: order.id,
            orderNo: order.order_no,
            type: order.type,
            created_at: order.created_at,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (open && repairData && repairData.order_id) {
          const orderExistsInList = mappedData.some((order) => order.orderId === repairData.order_id);
          if (!orderExistsInList) {
            mappedData.unshift({
              orderId: repairData.order_id,
              orderNo: repairData.order_no || "Existing Order",
              type: repairData.order_type || "",
              created_at: repairData.created_at || new Date().toISOString(),
            });
          }
        }
        setData(mappedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError("Failed to load orders.");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchData();
  }, [searchOrders, getToken, open, repairData]);

  const handleEditRepairSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const token = await getToken();
      setIsSubmitting(true);

      let finalDate = dueDate;
      if (dueDate && !dueDate.includes("T")) {
        finalDate = `${dueDate}T00:00:00Z`;
      }

      const response = await updateRepair(token, repairId, {
        repair_id: repairId,
        order_id: orderNo,
        due_date: finalDate,
        customer_name: customerName,
        customer_phone: customerPhone,
        price: parseFloat(price),
        description: description,
      });

      if (response.message === "success") {
        toast.success("Job updated successfully!", { position: "bottom-right" });
        setOpen(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error("Error updating repair!", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating repair:", error);
      toast.error("Error updating repair!", { position: "bottom-right" });
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
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Repair</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to repair details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditRepairSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            
            {/* Order No */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="OrderNo" className="text-slate-700 font-semibold text-sm">Order No.</Label>
              <Select value={orderNo} onValueChange={setOrderNo}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  <Input
                    type="text"
                    placeholder="Search Order No..."
                    className="mb-2 h-9"
                    value={searchOrders}
                    onChange={(e) => setSearchOrders(e.target.value)}
                  />
                  {ordersLoading ? (
                    <SelectItem value="loading" disabled>Searching orders...</SelectItem>
                  ) : ordersError ? (
                    <div className="p-2 text-rose-500 text-center text-xs">{ordersError}</div>
                  ) : data.length > 0 ? (
                    data.map((order) => (
                      <SelectItem key={order.orderId} value={order.orderId}>
                        {order.type}{order.orderNo}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-results" disabled>No orders found.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Price" className="text-slate-700 font-semibold text-sm">Price (LKR)</Label>
              <Input
                id="Price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="DueDate" className="text-slate-700 font-semibold text-sm">Due Date</Label>
              <Input
                id="DueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* Customer Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="CustomerName" className="text-slate-700 font-semibold text-sm">Customer Name</Label>
              <Input
                id="CustomerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* Customer Phone */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="CustomerPhone" className="text-slate-700 font-semibold text-sm">Customer Phone No.</Label>
              <Input
                id="CustomerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="Description" className="text-slate-700 font-semibold text-sm">Description</Label>
              <Textarea
                id="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[90px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                rows={3}
                placeholder="Enter description..."
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