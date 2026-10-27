import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { featchAllOrders } from "@/api/orderApi";
import { fetchUsersList } from "@/api/userApi";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { DateTime } from "./DateTime";
import { createSite } from "@/api/siteApi";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    Location: z.string().min(2, { message: "Site Location is required" }),
    Date: z
        .date({ required_error: "Date is required" })
        .refine((date) => date instanceof Date && !isNaN(date), {
            message: "Please select a valid date",
        }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    Description: z.string().optional(),
    Type: z.string().min(1, { message: "Solar type is required" }),
    PanelType: z.string().optional(),
    Inverter: z.string().optional(),
    Capacity: z.number({ required_error: "Capacity is required" }),
    OrderID: z.string().optional(),
    Assignee: z.array(z.string()).min(1, { message: "At least one assignee is required" })
}).refine((data) => {
    if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

const AddSiteForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Assignee: [],
            startTime: "08:00",
            endTime: "18:00",
            Location: "",
            Description: "",
            Type: "",
            PanelType: "",
            Inverter: "",
        }
    });

    const vat = "";
    const orderStatus = "";
    const paymentStatus = "";
    const [data, setData] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [searchOrders, setSearchOrders] = useState("");
    const [limitOrders, setLimitOrders] = useState(10);
    const [offsetOrders, setOffsetOrders] = useState(0);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    const [warehouseEmployees, setWarehouseEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [employeesError, setEmployeesError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

                setData(mappedData);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setOrdersError("Failed to load orders. Please try again.");
            } finally {
                setOrdersLoading(false);
            }
        };
        fetchData();
    }, [searchOrders, limitOrders, offsetOrders, getToken]);

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

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function handleSubmit(values) {
        const payload = {
            order_id: values.OrderID,
            location: values.Location,
            assginee: values.Assignee,
            date: values.Date,
            start_time: values.startTime,
            end_time: values.endTime,
            capacity: values.Capacity,
            panel_type: values.PanelType,
            solar_type: values.Type,
            Inverter: values.Inverter,
            status: "Drafted",
            description: values.Description,
            created_by: userID,
        };
        try {
            setIsSubmitting(true);
            const token = await getToken();
            const tesponse = await createSite(token, payload);
            if (tesponse.message == "success") {
                toast.success("Site added successfully!", { position: "bottom-right" });
                navigate("/approvals");
            } else {
                toast.error("Error adding site! " + tesponse.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding site!", { position: "bottom-right" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => {
        navigate("/approvals");
    }

    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                        <div className="flex flex-col gap-5">
                            {/* Order No */}
                            <FormField
                                control={form.control}
                                name="OrderID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Order No</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select Order No" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Search Order No…"
                                                        className="w-full h-9 text-sm"
                                                        value={searchOrders}
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Assignees */}
                            <FormField
                                control={form.control}
                                name="Assignee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Assignees</FormLabel>
                                        <FormControl>
                                            <MultiSelectDropdown
                                                options={warehouseEmployees}
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                isLoading={employeesLoading}
                                                error={employeesError}
                                                placeholder="Select assignees..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Capacity */}
                            <FormField
                                control={form.control}
                                name="Capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Capacity (kW)</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value ? field.value.toString() : undefined}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select Capacity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="3">3kW</SelectItem>
                                                <SelectItem value="5">5kW</SelectItem>
                                                <SelectItem value="6">6kW</SelectItem>
                                                <SelectItem value="10">10kW</SelectItem>
                                                <SelectItem value="15">15kW</SelectItem>
                                                <SelectItem value="20">20kW</SelectItem>
                                                <SelectItem value="30">30kW</SelectItem>
                                                <SelectItem value="40">40kW</SelectItem>
                                                <SelectItem value="50">50kW</SelectItem>
                                                <SelectItem value="100">100kW</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Solar Type */}
                            <FormField
                                control={form.control}
                                name="Type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Solar Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select a solar type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="On-grid">On-grid</SelectItem>
                                                <SelectItem value="Off-grid">Off-grid</SelectItem>
                                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="Description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="bg-slate-50 border-slate-200 rounded-xl p-3 h-24 focus:bg-white transition-all resize-none"
                                                placeholder="Enter description..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Location */}
                            <FormField
                                control={form.control}
                                name="Location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Location</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Site Location" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date & Time */}
                            <DateTime control={form.control} />

                            {/* Panel Type */}
                            <FormField
                                control={form.control}
                                name="PanelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Panel Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select a Panel Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="JA Solar">JA Solar</SelectItem>
                                                <SelectItem value="Jinko Solar">Jinko Solar</SelectItem>
                                                <SelectItem value="Canadian Solar">Canadian Solar</SelectItem>
                                                <SelectItem value="Longi">Longi</SelectItem>
                                                <SelectItem value="Trina">Trina</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Inverter */}
                            <FormField
                                control={form.control}
                                name="Inverter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Inverter</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select an Inverter" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Solax">Solax</SelectItem>
                                                <SelectItem value="Deye">Deye</SelectItem>
                                                <SelectItem value="Huawei">Huawei</SelectItem>
                                                <SelectItem value="Growatt">Growatt</SelectItem>
                                                <SelectItem value="SMA">SMA</SelectItem>
                                                <SelectItem value="Solis">Solis</SelectItem>
                                                <SelectItem value="Saji">Saji</SelectItem>
                                                <SelectItem value="ABB">ABB</SelectItem>
                                                <SelectItem value="Felicity (offGrid)">Felicity (offGrid)</SelectItem>
                                                <SelectItem value="SRNE (OffGrid)">SRNE (OffGrid)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex sm:justify-between justify-center items-center pt-6 border-t border-slate-100 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm shadow-sm transition-all"
                            onClick={handleClearAll}
                            title="Clear All"
                        >
                            <MdOutlineRefresh className="text-lg" />
                            {isSmallScreen ? null : "Clear All"}
                        </Button>

                        <div className="flex gap-3">
                            <Button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Add Site"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl px-6"
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddSiteForm;