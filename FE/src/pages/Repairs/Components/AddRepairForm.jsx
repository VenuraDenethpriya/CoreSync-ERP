import { custom, set, z } from "zod"
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
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { createSale } from "@/api/saleApi";
import { Textarea } from "@/components/ui/textarea";
import { featchAllOrders } from "@/api/orderApi";
import { createRepair, fetchLastJobNo } from "@/api/repair";

const formSchema = z.object({
    // JobNo: z.string().min(2, { message: "Job No is required" }),
    OrderNo: z.string().optional(),
    DueDate: z.date({ required_error: "Due Date is required" }),
    CustomerName: z.string().optional(),
    CustomerPhone: z
        .string()
        .regex(/^94\d{9}$/, {
            message: "Phone number must be in the format 94XXXXXXXXX (e.g., 94771234567)",
        }),
    Description: z.string().optional(),
    Price: z.number({ invalid_type_error: "Price must be a number" }).optional(),
});

const AddRepairForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const [data, setData] = useState([])
    const [searchOrders, setSearchOrders] = useState("")
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [limitOrders, setLimitOrders] = useState(10)
    const [offsetOrders, setOffsetOrders] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const defaultDueDate = addDays(new Date(), 2);
    const [lastJobNo, setLastJobNo] = useState(null);
    const [isFetchingJob, setIsFetchingJob] = useState(true);

    const vat = "";
    const orderStatus = "";
    const paymentStatus = "";

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            DueDate: defaultDueDate,
        }
    });

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    async function handleSubmit(values) {
        try {
            const token = await getToken();
            setIsSubmitting(true);

            const payload = {
                job_no: newJobNo,
                order_id: values.OrderNo,
                due_date: values.DueDate,
                customer_name: values.CustomerName,
                customer_phone: values.CustomerPhone,
                description: values.Description,
                price: values.Price,
                created_by: userID
            };

            const response = await createRepair(token, payload);
            if (response.message == "success") {
                toast.success("Repair added successfully!", { position: "bottom-right" });
                navigate("/repairs");
                setIsSubmitting(false);
            } else {
                toast.error("Error adding repair! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding repair!", { position: "bottom-right" });
        }
    }

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
                setTotalOrders(total)

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
        const loadLastJobNo = async () => {
            try {
                const token = await getToken();
                const response = await fetchLastJobNo(token);

                // Update this line to look inside 'data' for 'last_job_no'
                if (response && response.data && response.data.last_job_no) {
                    setLastJobNo(response.data.last_job_no);
                } else {
                    setLastJobNo(null); 
                }
            } catch (error) {
                console.error("Error fetching last job no:", error);
                setLastJobNo(null); 
            } finally {
                setIsFetchingJob(false);
            }
        };
        loadLastJobNo();
    }, [getToken]);

    const generateNextJobNo = (last) => {
        // Handle the loading state before the fetch completes
        if (last === undefined) return "Loading...";

        // 1. Calculate today's prefix (e.g., JOB-260427)
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayPrefix = `JOB-${yy}${mm}${dd}`;

        // 2. If the last job is from TODAY, increment its sequence
        if (last && last.startsWith(todayPrefix)) {
            // Split by hyphen and grab the last part (the sequence number)
            const parts = last.split('-');
            const lastSequence = parts[parts.length - 1];

            // Increment and pad back to 2 digits (e.g., "01" -> "02")
            const nextSequence = String(parseInt(lastSequence, 10) + 1).padStart(2, "0");
            return `${todayPrefix}-${nextSequence}`;
        }

        // 3. If there is no last job, or the last job was from yesterday, start at 01
        return `${todayPrefix}-01`;
    };

    const newJobNo = generateNextJobNo(lastJobNo);
    console.log("Generated Job No:", newJobNo);

    const handleClose = () => {
        navigate("/repairs");
    }

    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div >
            <h1 className="text-right">
                Job No: <span className="font-semibold">{newJobNo}</span>
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            {/* Left Column */}
                            <FormField
                                control={form.control}
                                name="OrderNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order NO</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Order NO" />
                                                </SelectTrigger>
                                            </FormControl>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CustomerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Enter customer name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="bg-white"
                                                placeholder="Enter price"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value === "" ? "" : Number(value));
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Right Column */}
                            <FormField
                                control={form.control}
                                name="DueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date === null ? undefined : date);
                                                    }}
                                                    initialFocus
                                                    classNames={{
                                                        head_cell: "w-8 font-normal text-[0.8rem]",
                                                        cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                                    }}
                                                />
                                            </PopoverContent>
                                            <FormMessage />
                                        </Popover>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CustomerPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Phone No.</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Enter cusotmer phone no." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="bg-white"
                                                placeholder="Enter description"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                    </div>

                    <div className="flex sm:justify-between justify-center">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm shadow-sm hover:bg-slate-100 transition-all"
                            onClick={handleClearAll}
                            title="Clear All"
                        >
                            <MdOutlineRefresh className="text-lg" />
                            {isSmallScreen ? null : "Clear All"}
                        </Button>

                        <div className="flex gap-4 ml-2">
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Add Repair"}</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddRepairForm;