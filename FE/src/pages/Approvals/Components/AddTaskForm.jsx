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
import { fetchUsersList } from "@/api/userApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { DateTime } from "./DateTime";
import { featchAllOrders, fetchAllBatteryPacks } from "@/api/orderApi";
import { TaskSelect } from "./TaskSelect";
import { createTask } from "@/api/taskApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRepairsList } from "@/api/repair";
import { useDebounce } from "@/hooks/useDebounce";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const formSchema = z.object({
    Assignee: z.string().min(2, { message: "Assignee is required" }),
    Task: z.string().optional(),
    OrderID: z.string().optional(),
    JobID: z.string().optional(),
    PackID: z.string().optional(),
    Date: z
        .date({ required_error: "Date is required" })
        .refine((date) => date instanceof Date && !isNaN(date), {
            message: "Please select a valid date",
        }),

    startTime: z.string().optional(),
    endTime: z.string().optional(),
    Description: z.string().optional(),
}).refine((data) => {
    if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

const AddTaskForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

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
    const search = "WAREHOUSE_STAFF";
    const limit = 100;
    const offset = 0;
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [employeesError, setEmployeesError] = useState(null);

    const [jobData, setJobData] = useState([]);
    const [jobSearch, setJobSearch] = useState("");
    const debouncedSearch = useDebounce(jobSearch, 500);
    const [limitJob, setLimitJob] = useState(10);
    const [offsetJob, setOffsetJob] = useState(0);

    const [packData, setPackData] = useState([]);
    const [packSearch, setPackSearch] = useState("");
    const debouncedPackSearch = useDebounce(packSearch, 500);
    const [limitPack, setLimitPack] = useState(10);
    const [offsetPack, setOffsetPack] = useState(0);
    const [packLoading, setPackLoading] = useState(false);
    const [packError, setPackError] = useState("");

    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startTime: "08:00",
            endTime: "18:00",
            Assignee: "",
            Task: "",
            OrderID: "",
            JobID: "",
            PackID: "",
            Description: "",
        }
    });

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch employees
    useEffect(() => {
        const fetchWarehouseEmployees = async () => {
            try {
                setEmployeesLoading(true);
                setEmployeesError(null);
                const token = await getToken();
                const response = await fetchUsersList(token, search, limit, offset);
                const items = response?.data?.items || [];

                const validEmployees = items
                    .filter(emp => emp.clerk_id && emp.clerk_id.trim() !== "")
                    .map((emp) => ({
                        id: emp.id,
                        value: emp.clerk_id,
                        label: `${emp.first_name} ${emp.last_name}`,
                    }));

                setWarehouseEmployees(validEmployees);

            } catch (error) {
                console.error("Error fetching warehouse employees:", error);
                setEmployeesError("Failed to load assignees.");
            } finally {
                setEmployeesLoading(false);
            }
        };
        fetchWarehouseEmployees();
    }, [getToken]);

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
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();

                const response = await fetchRepairsList(token, debouncedSearch, limitJob, offsetJob);
                const apiData = response?.data.repairs || [];
                const total = response.data.total_repairs;
                setTotal(total);

                const mappedData = apiData
                    .map((repair) => ({
                        repairId: repair.repair_id,
                        jobNo: repair.job_no,
                        customerName: repair.customer_name,
                        price: repair.price,
                        status: repair.status,
                        due_date: repair.due_date,
                        created_at: repair.created_at,
                        updated_at: repair.updated_at,
                    }))
                    .sort((a, b) => new Date(b.expected_delivery_date) - new Date(a.expected_delivery_date));

                setJobData(mappedData);
            } catch (error) {
                setIsError(true);
                console.error("Error fetching orders:", error);
                setErrorMessage(error.message);
            } finally {
                setIsLoading(false);
                setIsError(false);
            }
        };
        fetchData();
    }, [debouncedSearch, limitJob, offsetJob, getToken]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setPackLoading(true);
                const token = await getToken();

                const response = await fetchAllBatteryPacks(token, debouncedPackSearch, limitPack, offsetPack);
                const apiData = response?.data.packs || [];
                const total = response.data.total_packs;
                setTotal(total);

                const mappedData = apiData
                    .map((pack) => ({
                        packId: pack.id,
                        serialNo: pack.serial_no,
                        status: pack.status
                    }));

                setPackData(mappedData);
            } catch (error) {
                setPackError(error.message);
            } finally {
                setPackLoading(false);
            }
        };
        fetchData();
    }, [debouncedPackSearch, limitPack, offsetPack, getToken]);


    async function handleSubmit(values) {
        try {
            setIsSubmitting(true);
            const token = await getToken();
            const combinedTime = `${values.startTime} - ${values.endTime}`;

            const payload = {
                task: values.Task,
                date: values.Date,
                time: combinedTime,
                assignee: values.Assignee,
                supervisor: userID,
                description: values.Description,
            };

            if (values.OrderID) payload.order_id = values.OrderID;
            if (values.JobID) payload.job_id = values.JobID;
            if (values.PackID) payload.pack_id = values.PackID;

            const response = await createTask(token, payload);
            if (response.message == "success") {
                toast.success("Task added successfully!", { position: "bottom-right" });
                navigate("/approvals");
            } else {
                toast.error("Error adding task! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding task!", { position: "bottom-right" });
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

    const tabTriggerClass = "rounded-t-xl border-b-2 border-transparent px-5 py-2 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm";

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-5">
                            {/* Assignee */}
                            <FormField
                                control={form.control}
                                name="Assignee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Assignee</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select assignee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employeesLoading ? (
                                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                ) : employeesError ? (
                                                    <div className="p-2 text-red-600 text-center text-sm">{employeesError}</div>
                                                ) : warehouseEmployees.length > 0 ? (
                                                    warehouseEmployees.map((emp) => (
                                                        <SelectItem key={emp.id} value={emp.value}>
                                                            {emp.label}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-employees" disabled>No assignees found.</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Reference Tabs (Order No / Serial No / Job No) */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-700 font-semibold text-sm">Reference Item</Label>
                                <Tabs defaultValue="orderNO" className="w-full">
                                    <div className="overflow-x-auto pb-1 mb-3">
                                        <TabsList className="inline-flex gap-1 border-b border-slate-200/70 bg-transparent h-auto p-0">
                                            <TabsTrigger value="orderNO" className={tabTriggerClass}>Order No</TabsTrigger>
                                            <TabsTrigger value="serialNo" className={tabTriggerClass}>Serial No</TabsTrigger>
                                            <TabsTrigger value="jobNo" className={tabTriggerClass}>Job No</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="orderNO" className="mt-0 outline-none">
                                        <FormField
                                            control={form.control}
                                            name="OrderID"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
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
                                                                <div className="p-2 text-red-600 text-center text-sm">{ordersError}</div>
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
                                    </TabsContent>

                                    <TabsContent value="serialNo" className="mt-0 outline-none">
                                        <FormField
                                            control={form.control}
                                            name="PackID"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                                                                <SelectValue placeholder="Select Serial No" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <div className="p-2">
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Search Serial No…"
                                                                    className="w-full h-9 text-sm"
                                                                    value={packSearch}
                                                                    onChange={(e) => setPackSearch(e.target.value)}
                                                                />
                                                            </div>
                                                            {packLoading ? (
                                                                <SelectItem value="loading" disabled>Searching packs...</SelectItem>
                                                            ) : packError ? (
                                                                <div className="p-2 text-red-600 text-center text-sm">{packError}</div>
                                                            ) : packData.length > 0 ? (
                                                                packData.map((pack) => (
                                                                    <SelectItem key={pack.packId} value={pack.packId}>
                                                                        {pack.serialNo}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="no-results" disabled>No packs found.</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="jobNo" className="mt-0 outline-none">
                                        <FormField
                                            control={form.control}
                                            name="JobID"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full">
                                                                <SelectValue placeholder="Select Job No" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <div className="p-2">
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Search Job No…"
                                                                    className="w-full h-9 text-sm"
                                                                    value={jobSearch}
                                                                    onChange={(e) => setJobSearch(e.target.value)}
                                                                />
                                                            </div>
                                                            {isLoading ? (
                                                                <SelectItem value="loading" disabled>Searching jobs...</SelectItem>
                                                            ) : isError ? (
                                                                <div className="p-2 text-red-600 text-center text-sm">{errorMessage}</div>
                                                            ) : jobData.length > 0 ? (
                                                                jobData.map((job) => (
                                                                    <SelectItem key={job.repairId} value={job.repairId}>
                                                                        {job.jobNo}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="no-results" disabled>No jobs found.</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>

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
                                                placeholder="Enter task description..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Task */}
                            <FormField
                                control={form.control}
                                name="Task"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Task</FormLabel>
                                        <TaskSelect value={field.value} onChange={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date & Time */}
                            <DateTime control={form.control} />
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
                                {isSubmitting ? "Submitting..." : "Add Task"}
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

export default AddTaskForm;