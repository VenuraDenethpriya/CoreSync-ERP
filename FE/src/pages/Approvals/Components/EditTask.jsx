import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { fetchUsersList } from "@/api/userApi";
import { featchAllOrders } from "@/api/orderApi";
import { updateTask } from "@/api/taskApi";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskSelect } from "./TaskSelect";
import { DateTime } from "./DateTime";

const taskFormSchema = z.object({
    Assignee: z.string().min(2, { message: "Assignee is required" }),
    Task: z.string().optional(),
    OrderID: z.string().optional(),
    Date: z.date({ required_error: "Date is required" }).refine(
        (date) => date instanceof Date && !isNaN(date),
        { message: "Please select a valid date" }
    ),
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

export function EditTask({ Data, open, onOpenChange, onUpdate }) {
    const { getToken, isLoaded } = useAuth();
    const [warehouseEmployees, setWarehouseEmployees] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            Assignee: "",
            Task: "",
            OrderID: "",
            startTime: "",
            endTime: "",
            Description: "",
            Date: undefined,
        },
    });

    useEffect(() => {
        const fetchDropdownData = async () => {
            setIsLoading(true);
            try {
                const token = await getToken();
                const usersResponse = await fetchUsersList(token, "WAREHOUSE_STAFF", 100, 0);
                if (usersResponse?.data?.items) {
                    const validUsers = usersResponse.data.items.filter(emp => emp.clerk_id).map(emp => ({
                        value: emp.clerk_id, label: `${emp.first_name} ${emp.last_name}`,
                    }));
                    setWarehouseEmployees(validUsers);
                }
                const ordersResponse = await featchAllOrders(token, "", "", "", "", 10, 0);
                if (ordersResponse?.data?.orders) {
                    const validOrders = ordersResponse.data.orders.filter(order => order.id).map(order => ({
                        value: order.id, label: `${order.type}${order.order_no}`,
                    }));
                    setOrders(validOrders);
                }
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                toast.error("Failed to load selection data.");
            } finally {
                setIsLoading(false);
            }
        };
        if (isLoaded && open) {
            fetchDropdownData();
        }
    }, [isLoaded, open, getToken]);


    useEffect(() => {
        if (Data && open && warehouseEmployees.length > 0) {
            const assigneeObject = warehouseEmployees.find(emp => emp.label === Data.assignee);
            const assigneeValue = assigneeObject ? assigneeObject.value : "";

            let start = "";
            let end = "";

            if (Data.time) {
                if (Data.time.includes("-")) {
                    const parts = Data.time.split("-").map(t => t.trim());
                    start = parts[0] || "";
                    end = parts[1] || "";
                } else {
                    start = Data.time.substring(0, 5);
                }
            }

            form.reset({
                Assignee: assigneeValue,
                Task: Data.task || "",
                OrderID: Data.orderID || "",
                startTime: start,
                endTime: end,
                Description: Data.description || "",
                Date: Data.date ? new Date(Data.date) : undefined,
            });
        }
    }, [Data, open, orders, warehouseEmployees, form]);

    const onSubmit = async (values) => {
        try {
            const token = await getToken();
            const combinedTime = `${values.startTime} - ${values.endTime}`;
            const response = await updateTask(token, {
                id: Data.id,
                order_id: values.OrderID,
                task: values.Task,
                date: values.Date,
                time: combinedTime,
                assignee: values.Assignee,
                description: values.Description,
            });
            if (response.message === "success") {
                onOpenChange(false);
                toast.success("Task updated successfully!", { position: "bottom-right" });

                const assigneeLabel = warehouseEmployees.find(e => e.value === values.Assignee)?.label || values.Assignee;
                const orderLabel = orders.find(o => o.value === values.OrderID)?.label || Data.orderNO;

                const updatedTaskData = {
                    id: Data.id,
                    task: values.Task,
                    assignee: assigneeLabel, 
                    date: values.Date.toISOString(), 
                    time: combinedTime,
                    orderID: values.OrderID,
                    orderNO: orderLabel, 
                    description: values.Description,
                    status: Data.status,
                    createdAt: Data.createdAt,
                    updatedAt: new Date().toISOString()
                };

                if (onUpdate) {
                    onUpdate(updatedTaskData);
                }

            } else {
                toast.error("Error updating task! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("Error updating task!", { position: "bottom-right" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1200px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Make changes to user details. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 py-4">
                            <FormField control={form.control} name="Assignee" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assignee</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoading ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                warehouseEmployees.map(emp => (
                                                    <SelectItem key={emp.value} value={emp.value}>{emp.label}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField
                                control={form.control}
                                name="Task"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Task</FormLabel>
                                        <FormControl>
                                            <TaskSelect value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={form.control} name="OrderID" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order No</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoading ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (
                                                orders.map(order => (
                                                    <SelectItem key={order.value} value={order.value}>{order.label}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <DateTime control={form.control} />

                            <FormField control={form.control} name="Description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}