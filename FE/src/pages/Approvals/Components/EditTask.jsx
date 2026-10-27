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
import { Textarea } from "@/components/ui/textarea";

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
                
                // Fetch Employees
                const usersResponse = await fetchUsersList(token, "WAREHOUSE_STAFF", 100, 0);
                if (usersResponse?.data?.items) {
                    const validUsers = usersResponse.data.items.filter(emp => emp.clerk_id).map(emp => ({
                        value: emp.clerk_id, label: `${emp.first_name} ${emp.last_name}`,
                    }));
                    setWarehouseEmployees(validUsers);
                }
                
                // Fetch Orders
                const ordersResponse = await featchAllOrders(token, "", "", "", "", 10, 0);
                if (ordersResponse?.data?.orders) {
                    const validOrders = ordersResponse.data.orders.filter(order => order.id).map(order => ({
                        value: order.id, 
                        label: `${order.type}${order.order_no}`,
                    }));

                    if (Data?.orderID && Data?.orderNO) {
                        const orderExists = validOrders.some(o => o.value === Data.orderID);
                        if (!orderExists) {
                            validOrders.unshift({
                                value: Data.orderID,
                                label: Data.orderNO 
                            });
                        }
                    }

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
    }, [isLoaded, open, getToken, Data]); 

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
            <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
                <DialogHeader className="space-y-1.5">
                    <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Task</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                        Make changes to task details. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
                            
                            {/* Assignee */}
                            <FormField control={form.control} name="Assignee" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-sm">Assignee</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                <SelectValue placeholder="Select assignee" />
                                            </SelectTrigger>
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

                            {/* Task */}
                            <FormField
                                control={form.control}
                                name="Task"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Task</FormLabel>
                                        <FormControl>
                                            <TaskSelect value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Order No */}
                            <FormField control={form.control} name="OrderID" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-sm">Order No</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                <SelectValue placeholder="Select order" />
                                            </SelectTrigger>
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

                            {/* Date & Time */}
                            <DateTime control={form.control} />

                            {/* Description */}
                            <FormField control={form.control} name="Description" render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel className="text-slate-700 font-semibold text-sm">Description</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            className="bg-slate-50 border-slate-200 rounded-xl p-3 h-24 focus:bg-white transition-all resize-none" 
                                            placeholder="Description" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
                            >
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}