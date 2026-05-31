import { featchAllOrders } from "@/api/orderApi";
import { updateRepair } from "@/api/repair";
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
import { float64 } from "zod";

export function EditRepair({ onUpdate, ...props }) {
  const { getToken } = useAuth();
  const repairId = props.repairData.repair_id;

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [orderNo, setOrderNo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [price, setPrice] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");

  const [data, setData] = useState([])
  const [searchOrders, setSearchOrders] = useState("")
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [limitOrders, setLimitOrders] = useState(10)
  const [offsetOrders, setOffsetOrders] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const vat = "";
  const orderStatus = "";
  const paymentStatus = "";


  useEffect(() => {
    if (open && props.repairData) {
      setOrderNo(props.repairData.order_id);
      if (props.repairData.due_date) {
        const formattedDate = props.repairData.due_date.split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate("");
      }
      setPrice(props.repairData.price)
      setCustomerName(props.repairData.customer_name)
      setCustomerPhone(props.repairData.customer_phone)
      setDescription(props.repairData.description)


    }
  }, [open, props.repairData]);

  const handleEditSaleSubmit = async () => {
    try {
      const token = await getToken();
      setIsSubmitting(true);

      let finalDate = dueDate;
      if (!dueDate.includes("T")) {
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
        setIsSubmitting(false);
        setOpen(false);

        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error("Error updating repair:", error);
      toast.error("Error updating repair! Please try again.", { position: "bottom-right" });
    }
  };

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

        const response = await featchAllOrders(token, searchValue, vat, orderStatus, paymentStatus, limitOrders, offsetOrders);
        const apiData = response?.data.orders || [];
        const total = response.data.total_orders;
        setTotalOrders(total);

        const mappedData = apiData
          .map((order) => ({
            orderId: order.id,
            orderNo: order.order_no,
            type: order.type,
            created_at: order.created_at,
            updated_at: order.updated_at,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // --- NEW CODE: Inject existing order if it's not in the fetched list ---
        if (open && props.repairData && props.repairData.order_id) {
          const orderExistsInList = mappedData.some((order) => order.orderId === props.repairData.order_id);

          if (!orderExistsInList) {
            mappedData.unshift({
              orderId: props.repairData.order_id,
              // Fallbacks in case these aren't joined in your repairData payload
              orderNo: props.repairData.order_no || "Existing Order",
              type: props.repairData.order_type || "",
              created_at: props.repairData.created_at || new Date().toISOString(),
            });
          }
        }
        // -----------------------------------------------------------------------

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError("Failed to load orders. Please try again.");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchData();
  }, [searchOrders, limitOrders, offsetOrders, getToken, open, props.repairData]); // Added open and props.repairData to dependencies

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Edit Repair</DialogTitle>
          <DialogDescription>
            Make changes to repair details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="OrderNo" className="justify-self-start text-left">
              Order No.
            </Label>
            <Select value={orderNo} onValueChange={setOrderNo} className="col-span-3">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                <Input
                  type="text"
                  placeholder="Search Order No"
                  className="mb-2"
                  value={searchOrders}
                  onChange={(e) => setSearchOrders(e.target.value)}
                />
                {ordersLoading ? (
                  <SelectItem value="loading" disabled>Searching orders...</SelectItem>
                ) : ordersError ? (
                  <div className="p-2 text-red-600 text-center">
                    <p>{ordersError}</p>
                  </div>
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Price" className="justify-self-start text-left">
              Price
            </Label>
            <Input
              id="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="DueDate" className="justify-self-start text-left">
              Due Date
            </Label>
            <Input
              id="DueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
