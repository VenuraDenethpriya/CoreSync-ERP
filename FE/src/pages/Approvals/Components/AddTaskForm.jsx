import { set, z } from "zod"
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
import { featchAllOrders } from "@/api/orderApi";
import { TaskSelect } from "./TaskSelect";
import { createTask } from "@/api/taskApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchRepairsList } from "@/api/repair";
import { useDebounce } from "@/hooks/useDebounce";

export const formSchema = z.object({
    Assignee: z.string().min(2, { message: "Assignee is required" }),
    Task: z.string().optional(),
    OrderID: z.string().optional(),
    JobID: z.string().optional(),
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
    const [warehouseEmployees, setWarehouseEmployees] = useState([]);


    const search = "WAREHOUSE_STAFF";
    const limit = 100;
    const offset = 0;

    const [data, setData] = useState([])
    const [totalOrders, setTotalOrders] = useState(0)
    const [searchOrders, setSearchOrders] = useState("")
    const [limitOrders, setLimitOrders] = useState(10)
    const [offsetOrders, setOffsetOrders] = useState(0)
    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [employeesError, setEmployeesError] = useState(null);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const vat = "";
    const orderStatus = "";
    const paymentStatus = "";

    const [jobData, setJobData] = useState([])
    const [total, setTotal] = useState(0)

    const [jobSearch, setJobSearch] = useState("")
    const debouncedSearch = useDebounce(jobSearch, 500)

    const [limitJob, setLimitJob] = useState(10)
    const [offsetJob, setOffsetJob] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startTime: "08:00",
            endTime: "18:00",
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
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const token = await getToken();

                const response = await fetchRepairsList(token, debouncedSearch, limitJob, offsetJob);
                const apiData = response?.data.repairs || [];
                const total = response.data.total_repairs;
                setTotal(total)

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
                setIsError(true)
                console.error("Error fetching orders:", error);
                setErrorMessage(error.message)
            } finally {
                setIsLoading(false)
                setIsError(false)
            }
        };
        fetchData();
    }, [debouncedSearch, limitJob, offsetJob]);

    async function handleSubmit(values) {
        try {
            const token = await getToken();
            const combinedTime = `${values.startTime} - ${values.endTime}`;
            const payload = {
                task: values.Task,
                order_id: values.OrderID,
                job_id: values.JobID,
                date: values.Date,
                time: combinedTime,
                assignee: values.Assignee,
                supervisor: userID,
                description: values.Description,
            };
            console.log("Payload to be sent:", payload);
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            {/* Left Column */}
                            <FormField
                                control={form.control}
                                name="Assignee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue className="bg-white" placeholder="Assignee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employeesLoading ? (
                                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                ) : employeesError ? (
                                                    <div className="p-2 text-red-600 text-center">{employeesError}</div>
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
                            <Tabs defaultValue="orderNO" className="w-[460px]">
                                <TabsList>
                                    <TabsTrigger value="orderNO">Order No</TabsTrigger>
                                    <TabsTrigger value="jobNo">Job No</TabsTrigger>
                                </TabsList>
                                <TabsContent value="orderNO">
                                    <FormField
                                        control={form.control}
                                        name="OrderID"
                                        render={({ field }) => (
                                            <FormItem>
                                                {/* <FormLabel>Order No</FormLabel> */}
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue className="bg-white" placeholder="Order No" />
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
                                </TabsContent>
                                <TabsContent value="jobNo">
                                    <FormField
                                        control={form.control}
                                        name="JobID"
                                        render={({ field }) => (
                                            <FormItem>
                                                {/* <FormLabel>Order No</FormLabel> */}
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue className="bg-white" placeholder="Job No" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <Input
                                                            type="text"
                                                            placeholder="Search Job No"
                                                            className="mb-2"
                                                            value={jobSearch}
                                                            onChange={(e) => setJobSearch(e.target.value)}
                                                        />
                                                        {isLoading ? (
                                                            <SelectItem value="loading" disabled>Searching jobs...</SelectItem>
                                                        ) : isError ? (
                                                            <div className="p-2 text-red-600 text-center">
                                                                <p>{errorMessage}</p>
                                                            </div>
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


                            <FormField
                                control={form.control}
                                name="Description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="flex flex-col gap-10">
                            {/* Right Column */}
                            <FormField
                                control={form.control}
                                name="Task"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task</FormLabel>
                                        <TaskSelect value={field.value} onChange={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DateTime control={form.control} />
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 ">Add Task</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddTaskForm;