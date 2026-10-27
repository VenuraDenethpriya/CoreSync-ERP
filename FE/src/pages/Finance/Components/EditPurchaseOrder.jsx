import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // 1. Import Checkbox
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { updateInventoryItem } from "@/api/inventoryApi"; 
import { fetchUsersList } from "@/api/userApi";

const PREDEFINED_ITEMS = [
    "CoreSync main sticker",
    "Role plug(8)",
    "Screw nails black(1.5)",
    "Cotton waste",
    "9v battery",
    "Oxifura face mask",
    "Blind riverts(2mm)"
];

// 2. Add IsTransferMoney to the Zod Schema
const formSchema = z.object({
    Department: z.string().optional(),
    Date: z.date({ required_error: "Date is required" }),
    RequestedBy: z.string().optional(),
    Description: z.string().optional(),
    IsTransferMoney: z.boolean().default(false), // Checkbox validation
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

export function EditPurchaseOrder({ purchaseData, onUpdate }) {
    const { getToken } = useAuth();
    const itemId = purchaseData?.id;

    const [open, setOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [searchEmployee, setSearchEmployee] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultItemRow = {
        item_name: '', custom_item_name: '', description: '', qty: 1, estimated_cost: 0, supplier: '', reason: ''
    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Department: "",
            Date: new Date(),
            RequestedBy: "",
            Description: "",
            IsTransferMoney: false,
            addItems: [defaultItemRow]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "addItems",
    });

    const watchedItems = form.watch("addItems");

    useEffect(() => {
        if (open && purchaseData) {
            const mappedItems = (purchaseData.items || []).map(item => {
                const isPredefined = PREDEFINED_ITEMS.includes(item.item_name);
                return {
                    item_name: isPredefined ? item.item_name : "custom",
                    custom_item_name: isPredefined ? "" : item.item_name,
                    description: item.description || "",
                    qty: item.qty || 1,
                    estimated_cost: item.estimated_cost || 0,
                    supplier: item.supplier || "",
                    reason: item.reason || ""
                };
            });

            if (mappedItems.length === 0) mappedItems.push(defaultItemRow);

            // 3. Map the existing boolean value when the modal opens
            form.reset({
                Department: purchaseData.department || "",
                Date: purchaseData.date ? new Date(purchaseData.date) : new Date(),
                RequestedBy: purchaseData.requestedBy ? String(purchaseData.requestedBy) : "",
                Description: purchaseData.remarks || purchaseData.description || "",
                IsTransferMoney: purchaseData.is_transfer_money === true, 
                addItems: mappedItems
            });
        }
    }, [open, purchaseData, form]);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const token = await getToken();
                const response = await fetchUsersList(token, searchEmployee, 10, 0);
                const employeesList = response?.data?.items || [];
                const formattedList = employeesList.map(item => ({
                    id: item.id,
                    name: item.first_name + " " + item.last_name
                }));
                setEmployees(formattedList);
            } catch (err) {
                console.error("Error fetching employees:", err);
            }
        };
        if (open) loadEmployees();
    }, [getToken, searchEmployee, open]);

    const handleSubmit = async (values) => {
        try {
            setIsSubmitting(true);
            const token = await getToken();

            const finalItems = values.addItems.map(item => ({
                item_name: item.item_name === "custom" ? item.custom_item_name : item.item_name,
                description: item.description,
                qty: item.qty,
                estimated_cost: item.estimated_cost,
                supplier: item.supplier,
                reason: item.reason,
            }));

            // 4. Attach the checkbox boolean to your payload
            const payload = {
                id: itemId,
                department: values.Department,
                date: values.Date,
                requestedBy: values.RequestedBy,
                remarks: values.Description,
                is_transfer_money: values.IsTransferMoney, 
                items: finalItems,
            };

            const response = await updateInventoryItem(token, payload);

            if ((response.data && response.data.message === "success") || response.message === "success") {
                toast.success("Purchase order updated successfully!", { position: "bottom-right" });
                if (onUpdate) onUpdate(payload);
                setOpen(false);
            } else {
                toast.error("Error updating! " + (response.data?.message || response.message || ""), { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error updating:", error);
            toast.error("Error updating purchase order!", { position: "bottom-right" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit</Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[1200px] w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Purchase Order</DialogTitle>
                    <DialogDescription>
                        Make changes to purchase order details. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        
                        {/* General Details Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border">
                            <div className="flex flex-col gap-4">
                                <FormField control={form.control} name="Date" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal bg-white", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-3" align="start"> 
                                                <Calendar 
                                                    mode="single" 
                                                    selected={field.value || undefined} 
                                                    onSelect={date => field.onChange(date === null ? undefined : date)} 
                                                    initialFocus 
                                                    classNames={{
                                                        head_cell: "w-10 font-medium text-sm text-muted-foreground pb-2", 
                                                        cell: "h-10 w-10 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="RequestedBy" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Requested By</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <Input type="text" placeholder="Search employees…" className="mb-2" value={searchEmployee} onChange={(e) => setSearchEmployee(e.target.value)} />
                                                {employees.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                {/* 5. Checkbox UI mapped properly for react-hook-form */}
                                <FormField control={form.control} name="IsTransferMoney" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="bg-white"
                                            />
                                        </FormControl>
                                        <FormLabel className="font-medium text-gray-700 cursor-pointer">
                                            Is transfer money?
                                        </FormLabel>
                                    </FormItem>
                                )} />

                            </div>

                            <div className="flex flex-col gap-4">
                                <FormField control={form.control} name="Department" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl><Input className="bg-white" placeholder="Enter department" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="Description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Remarks (if any)</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-[70px] bg-white border rounded-md border-gray-200 p-2 text-sm" placeholder="Remarks" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        {/* Dynamic Items Section */}
                        <div className="bg-gray-50 p-4 rounded-xl border">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg text-gray-800">Purchase Details</h3>
                                <Button type="button" variant="outline" size="sm" className="flex items-center gap-2 border-blue-600 text-blue-700" onClick={() => append(defaultItemRow)}>
                                    <Plus className="w-4 h-4" /> Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => {
                                    const currentItemName = watchedItems[index]?.item_name;
                                    return (
                                    <div key={field.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 w-full items-start">
                                            
                                            <div className="md:col-span-3 space-y-2">
                                                <FormField control={form.control} name={`addItems.${index}.item_name`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600">Item Name</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-white h-9 text-sm"><SelectValue placeholder="Select item" /></SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {PREDEFINED_ITEMS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                                                                <SelectItem value="custom" className="text-blue-600 font-medium">➕ Type New Item...</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )} />

                                                {currentItemName === "custom" && (
                                                    <FormField control={form.control} name={`addItems.${index}.custom_item_name`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl><Input className="h-9 text-sm border-blue-300 bg-blue-50/50" placeholder="Type new item name..." {...field} /></FormControl>
                                                            <FormMessage className="text-[10px]" />
                                                        </FormItem>
                                                    )} />
                                                )}
                                            </div>

                                            <div className="md:col-span-3">
                                                <FormField control={form.control} name={`addItems.${index}.description`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600">Description</FormLabel>
                                                        <FormControl>
                                                            <textarea className="flex min-h-[36px] w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground" placeholder="Details..." rows={1} {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>

                                            <div className="md:col-span-1">
                                                <FormField control={form.control} name={`addItems.${index}.qty`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600">Qty</FormLabel>
                                                        <FormControl><Input className="h-9 text-sm px-2 text-center" type="number" min="1" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>

                                            <div className="md:col-span-1">
                                                <FormField control={form.control} name={`addItems.${index}.estimated_cost`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600">Cost</FormLabel>
                                                        <FormControl><Input className="h-9 text-sm px-2" type="number" min="0" step="0.01" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>

                                            <div className="md:col-span-2">
                                                <FormField control={form.control} name={`addItems.${index}.supplier`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold text-gray-600">Supplier</FormLabel>
                                                        <FormControl><Input className="h-9 text-sm" placeholder="Supplier" {...field} /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </div>

                                            <div className="md:col-span-2 flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <FormField control={form.control} name={`addItems.${index}.reason`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-semibold text-gray-600">Reason</FormLabel>
                                                            <FormControl><Input className="h-9 text-sm" placeholder="Reason" {...field} /></FormControl>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                
                                                {fields.length > 1 && (
                                                    <Button type="button" variant="ghost" onClick={() => remove(index)} className="mt-6 text-red-400 hover:text-red-700 hover:bg-red-50 p-2 h-9" title="Remove Item">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}