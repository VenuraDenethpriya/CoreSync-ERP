import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { fetchUsersList } from "@/api/userApi";
import { createPurchaseOrder, fechListName } from "@/api/finance";

const formSchema = z.object({
    Department: z.string().optional(),
    Date: z.date({ required_error: "Date is required" }),
    RequestedBy: z.string().optional(),
    Description: z.string().optional(),
    addItems: z.array(z.object({
        item_name: z.string().min(1, "Select an item"),
        custom_item_name: z.string().optional(),
        description: z.string().optional(),
        qty: z.coerce.number().min(1, "Min 1"),
        estimated_cost: z.coerce.number().min(0, "Cost must be 0+"),
        supplier: z.string().optional(),
        reason: z.string().optional(),
    })).min(1, "At least one item is required")
});

const AddPurchasesOrderForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const [employees, setEmployees] = useState([]);
    const [searchEmployee, setSearchEmployee] = useState("");
    const [employeeLimit, setEmployeeLimit] = useState(10);
    const [employeeOffset, setEmployeeOffset] = useState(0);

    const [items, setItems] = useState([]);
    const [searchItems, setSearchItems] = useState("");
    const [itemsLimit, setItemsLimit] = useState(10);
    const [itemOffset, setItemOffset] = useState(0);

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const defaultItemRow = {
        item_name: '', custom_item_name: '', description: '', qty: 1, estimated_cost: 0, supplier: '', reason: ''
    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { addItems: [defaultItemRow] }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "addItems",
    });

    const watchedItems = form.watch("addItems");

    useEffect(() => {
        const loadItemsList = async () => {
            try {
                const token = await getToken();
                const response = await fechListName(token, searchItems, itemsLimit, itemOffset);
                const itemList = response?.data?.items || [];
                const uniqueNames = [...new Set(itemList.map(item => item.item_name))];
                const formattedList = uniqueNames.map((name, index) => ({
                    id: index,
                    name: name
                }));
                setItems(formattedList);
            } catch (err) {
                console.error("Error fetching items:", err);
            }
        };

        const delaySearch = setTimeout(() => loadItemsList(), 300);
        return () => clearTimeout(delaySearch);
    }, [getToken, searchItems, itemsLimit, itemOffset]);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const token = await getToken();
                const response = await fetchUsersList(token, searchEmployee, employeeLimit, employeeOffset);
                const employeesList = response?.data?.items || [];
                const formattedList = employeesList.map(item => ({
                    id: item.id,
                    clerk_id: item.clerk_id,
                    name: item.first_name + " " + item.last_name
                }));
                setEmployees(formattedList);
            } catch (err) {
                console.error("Error fetching employees:", err);
            }
        };
        const delaySearch = setTimeout(() => loadEmployees(), 300);
        return () => clearTimeout(delaySearch);
    }, [getToken, searchEmployee, employeeLimit, employeeOffset]);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function handleSubmit(values) {
        try {
            const token = await getToken();
            setIsSubmitting(true);

            const finalItems = values.addItems.map(item => ({
                ...item,
                item_name: item.item_name === "custom" ? item.custom_item_name : item.item_name
            }));

            const payload = {
                department: values.Department,
                date: values.Date,
                requested_by: values.RequestedBy,
                remark: values.Description,
                items: finalItems,
                created_by: userID
            };

            const response = await createPurchaseOrder(token, payload);
            if (response.message === "success") {
                toast.success("Purchase order added successfully!", { position: "bottom-right" });
                navigate("/finance");
            } else {
                toast.error("Error adding purchase order! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding purchase order!", { position: "bottom-right" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => navigate("/finance");
    const handleClearAll = () => form.reset({ addItems: [defaultItemRow] });

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    {/* General Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-5">
                        <h2 className="font-bold text-lg text-slate-800">Purchase Order Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-5">
                                <FormField control={form.control} name="Date" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full h-11 rounded-xl pl-3 text-left font-normal bg-slate-50 border-slate-200", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-3 bg-white rounded-2xl shadow-xl border border-slate-200/70" align="start">
                                                <Calendar 
                                                    mode="single" 
                                                    selected={field.value || undefined} 
                                                    onSelect={date => field.onChange(date === null ? undefined : date)} 
                                                    initialFocus 
                                                    classNames={{
                                                        head_cell: "w-10 font-medium text-sm text-slate-500 pb-2",
                                                        cell: "h-10 w-10 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-xl transition-colors",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="RequestedBy" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Requested By</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select requester" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Search employees..."
                                                        className="mb-2 h-9 text-sm"
                                                        value={searchEmployee}
                                                        onChange={(e) => setSearchEmployee(e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                {employees.map((p) => <SelectItem key={p.id} value={String(p.clerk_id)}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="flex flex-col gap-5">
                                <FormField control={form.control} name="Department" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Department</FormLabel>
                                        <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter department" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="Description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Remarks (if any)</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-[90px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none" placeholder="Enter remarks..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Purchase Details Section */}
                    <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <h2 className="font-bold text-lg text-slate-800">Purchase Details</h2>
                            <Button type="button" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4" onClick={() => append(defaultItemRow)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => {
                                const currentItemName = watchedItems[index]?.item_name;

                                return (
                                    <div key={field.id} className="p-4 border border-slate-200/70 rounded-2xl bg-white shadow-sm flex flex-col gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

                                            {/* Name Field */}
                                            <div className="md:col-span-3 space-y-2">
                                                <FormField control={form.control} name={`addItems.${index}.item_name`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-slate-600">Item Name</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl text-sm">
                                                                    <SelectValue placeholder="Select item" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <div className="p-2">
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Search items..."
                                                                        className="mb-2 h-9 text-sm"
                                                                        value={searchItems}
                                                                        onChange={(e) => setSearchItems(e.target.value)}
                                                                        onKeyDown={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                {items.map((item) => (
                                                                    <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                                                                ))}
                                                                <SelectItem value="custom" className="text-blue-600 font-semibold border-t rounded-none mt-1">➕ Type New Item...</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )} />

                                                {currentItemName === "custom" && (
                                                    <FormField control={form.control} name={`addItems.${index}.custom_item_name`} render={({ field }) => (
                                                        <FormItem className="mt-2">
                                                            <FormControl>
                                                                <Input className="h-11 rounded-xl text-sm border-blue-300 bg-blue-50/50" placeholder="Type new item name..." {...field} />
                                                            </FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )} />
                                                )}
                                            </div>

                                            {/* Description Field */}
                                            <div className="md:col-span-3">
                                                <FormField control={form.control} name={`addItems.${index}.description`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-slate-600">Description</FormLabel>
                                                        <FormControl>
                                                            <Input className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm" placeholder="Item details..." {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )} />
                                            </div>

                                            {/* Quantity Field */}
                                            <div className="md:col-span-1">
                                                <FormField control={form.control} name={`addItems.${index}.qty`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-slate-600">Qty</FormLabel>
                                                        <FormControl><Input className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm text-center" type="number" min="1" {...field} /></FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )} />
                                            </div>

                                            {/* Est Cost Field */}
                                            <div className="md:col-span-1">
                                                <FormField control={form.control} name={`addItems.${index}.estimated_cost`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-slate-600">Cost</FormLabel>
                                                        <FormControl><Input className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm px-2" type="number" min="0" step="0.01" {...field} /></FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )} />
                                            </div>

                                            {/* Supplier Field */}
                                            <div className="md:col-span-2">
                                                <FormField control={form.control} name={`addItems.${index}.supplier`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-slate-600">Supplier</FormLabel>
                                                        <FormControl><Input className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm" placeholder="Supplier" {...field} /></FormControl>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )} />
                                            </div>

                                            {/* Reason Field & Delete */}
                                            <div className="md:col-span-2 flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <FormField control={form.control} name={`addItems.${index}.reason`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-semibold text-slate-600">Reason</FormLabel>
                                                            <FormControl><Input className="h-11 rounded-xl bg-slate-50 border-slate-200 text-sm" placeholder="Reason" {...field} /></FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )} />
                                                </div>

                                                {fields.length > 1 && (
                                                    <Button type="button" variant="ghost" onClick={() => remove(index)} className="mt-5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 h-11 w-11 rounded-xl shrink-0" title="Remove Item">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex sm:justify-between justify-center items-center pt-6 border-t border-slate-100 pb-10">
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
                                {isSubmitting ? "Submitting..." : "Add Purchase Order"}
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
    );
};

export default AddPurchasesOrderForm;