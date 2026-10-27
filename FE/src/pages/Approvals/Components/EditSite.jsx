import { featchAllOrders } from "@/api/orderApi";
import { updateSite } from "@/api/siteApi";
import { fetchUsersList } from "@/api/userApi";
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
import { DateTimeSite } from "./DateTimeForSite";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { Pencil } from "lucide-react";

export function EditSite({ siteData, onUpdate }) {
  const { getToken } = useAuth();
  const siteId = siteData?.id;

  const [data, setData] = useState([]);
  const [searchOrders, setSearchOrders] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [limitOrders, setLimitOrders] = useState(10);
  const [offsetOrders, setOffsetOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const vat = "";
  const orderStatus = "";
  const paymentStatus = "";

  const panelTypeOptions = [
    "JA Solar",
    "Jinko",
    "Canadian Solar",
    "Longi",
    "Trina",
  ];

  const inverterOptions = [
    "Solax",
    "Deye",
    "Huawei",
    "Growatt",
    "SMA",
    "Solis",
    "Saji",
    "ABB",
    "Felicity (offGrid)",
    "SRNE (OffGrid)",
  ];

  const solarTypeOptions = [
    "On-grid",
    "Off-grid",
    "Hybrid",
  ];

  const [open, setOpen] = useState(false);

  const [orderNo, setOrderNo] = useState("");
  const [orderId, setOrderId] = useState("");
  const [location, setLocation] = useState("");
  const [assignee, setAssignee] = useState([]);
  const [date, setDate] = useState();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [inverter, setInverter] = useState("");
  const [panelType, setPanelType] = useState("");
  const [solarType, setSolarType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [warehouseEmployees, setWarehouseEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);

  useEffect(() => {
    if (open && siteData) {
      setOrderNo(siteData.order_no || "");
      setOrderId(siteData.order_id || "");
      setLocation(siteData.location || "");
      setPanelType(siteData.panel_type || "");
      setInverter(siteData.inverter || "");
      setCapacity(siteData.capacity || "");
      setAssignee(siteData.assginee || []);
      setDate(siteData.date ? new Date(siteData.date) : undefined);
      setStartTime(siteData.start_time || "");
      setEndTime(siteData.end_time || "");
      setSolarType(siteData.solar_type || "");
      setDescription(siteData.description || "");
    }
  }, [open, siteData]);

  const handleEditSolarSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = await getToken();
      const response = await updateSite(token, siteId, {
        id: siteId,
        order_id: orderId,
        location: location,
        assginee: assignee,
        date: date,
        start_time: startTime,
        end_time: endTime,
        capacity: Number(capacity) || 0,
        panel_type: panelType,
        solar_type: solarType,
        inverter: inverter,
        description: description,
      });

      const isSuccess =
        (response.data && response.data.message === "success") ||
        response.message === "success";

      if (isSuccess) {
        const updatedViewData = {
          id: siteId,
          order_id: orderId,
          location: location,
          assginee: assignee,
          date: date,
          start_time: startTime,
          end_time: endTime,
          capacity: capacity,
          panel_type: panelType,
          solar_type: solarType,
          inverter: inverter,
          description: description,
        };

        if (onUpdate) {
          onUpdate(updatedViewData);
        }

        setOpen(false);
        toast.success("Site updated successfully!", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error("Failed to update site.", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
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

        const response = await featchAllOrders(
          token,
          searchValue,
          vat,
          orderStatus,
          paymentStatus,
          limitOrders,
          offsetOrders
        );

        const apiData = response?.data?.data?.orders || response?.data?.orders || [];
        const total = response?.data?.data?.total_orders || response?.data?.total_orders || 0;
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

        if (open && siteData && siteData.order_id) {
          const orderExistsInList = mappedData.some(
            (order) => order.orderId === siteData.order_id
          );

          if (!orderExistsInList) {
            mappedData.unshift({
              orderId: siteData.order_id,
              orderNo: siteData.order_no || "Unknown Order",
              type: "",
              created_at: siteData.created_at || new Date().toISOString(),
            });
          }
        }

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError("Failed to load orders. Please try again.");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchData();
  }, [searchOrders, limitOrders, offsetOrders, getToken, open, siteData]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployeesLoading(true);
        setEmployeesError(null);
        const token = await getToken();

        const response = await fetchUsersList(token, "WAREHOUSE_STAFF", 100, 0);
        const items = response?.data?.items || [];

        const validEmployees = items
          .filter(emp => emp.clerk_id && emp.clerk_id.trim() !== "")
          .map((emp) => ({
            id: emp.id,
            value: emp.clerk_id,
            label: `${emp.first_name} ${emp.last_name}`,
          }));

        setWarehouseEmployees(validEmployees);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setEmployeesError("Failed to load employees.");
      } finally {
        setEmployeesLoading(false);
      }
    };

    loadEmployees();
  }, [getToken]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4">
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Site</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to site details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditSolarSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            
            {/* Order No */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="OrderNo" className="text-slate-700 font-semibold text-sm">Order No.</Label>
              <Select value={orderId || undefined} onValueChange={setOrderId}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      type="text"
                      placeholder="Search Order No…"
                      className="w-full h-9 text-sm"
                      value={searchOrders}
                      onKeyDown={(e) => e.stopPropagation()}
                      onChange={(e) => setSearchOrders(e.target.value)}
                    />
                  </div>
                  {ordersLoading ? (
                    <SelectItem value="loading" disabled>Searching orders...</SelectItem>
                  ) : ordersError ? (
                    <div className="p-2 text-red-600 text-center text-sm">
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

            {/* Location */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="location" className="text-slate-700 font-semibold text-sm">Location</Label>
              <Input
                id="location"
                value={location || ""}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="Site Location"
              />
            </div>

            {/* Assignees */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="text-slate-700 font-semibold text-sm">Assignees</Label>
              <MultiSelectDropdown
                options={warehouseEmployees}
                value={assignee || []}
                onChange={setAssignee}
                isLoading={employeesLoading}
                error={employeesError}
                placeholder="Select assignees..."
              />
            </div>

            {/* Schedule */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="text-slate-700 font-semibold text-sm">Schedule</Label>
              <DateTimeSite
                date={date}
                setDate={setDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
              />
            </div>

            {/* Capacity */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Capacity" className="text-slate-700 font-semibold text-sm">Capacity (kW)</Label>
              <Input
                id="Capacity"
                type="number"
                value={capacity || ""}
                onChange={(e) => setCapacity(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="Capacity"
              />
            </div>

            {/* Inverter */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Inverter" className="text-slate-700 font-semibold text-sm">Inverter</Label>
              <Select value={inverter || undefined} onValueChange={setInverter}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                  <SelectValue placeholder="Select an inverter" />
                </SelectTrigger>
                <SelectContent>
                  {inverterOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Panel Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="PanelType" className="text-slate-700 font-semibold text-sm">Panel Type</Label>
              <Select value={panelType || undefined} onValueChange={setPanelType}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                  <SelectValue placeholder="Select a panel type" />
                </SelectTrigger>
                <SelectContent>
                  {panelTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Solar Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="SolarType" className="text-slate-700 font-semibold text-sm">Solar Type</Label>
              <Select value={solarType || undefined} onValueChange={setSolarType}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                  <SelectValue placeholder="Select a solar type" />
                </SelectTrigger>
                <SelectContent>
                  {solarTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="Description" className="text-slate-700 font-semibold text-sm">Description</Label>
              <Textarea
                id="Description"
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-50 border-slate-200 rounded-xl p-3 h-24 focus:bg-white transition-all resize-none"
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