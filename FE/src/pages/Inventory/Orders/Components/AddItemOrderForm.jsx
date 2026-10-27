import { z } from "zod";
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
import { createInventoryOrderItem, fetchInventoryItemsList } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
    ItemCode: z.string().min(2, { message: "Item code is required" }),
    ItemName: z.string().min(2, { message: "Item name is required" }),
    Quantity: z.coerce.number({ required_error: "Quantity is required" }).min(0, { message: "Quantity must be a positive number" }),
    Amount: z.coerce.number({ required_error: "Amount is required" }).min(0, { message: "Amount must be a positive number" }),
    Date: z.date({ required_error: "Date is required" }),
});

const AddItemOrderForm = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { user } = useUser();
    const userID = user?.id;

    const [searchCode, setSearchCode] = useState("");
    const [limitCode, setLimitCode] = useState(10);
    const [offsetCode, setOffsetCode] = useState(0);

    const [inventoryData, setInventoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Status: "In Stock",
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

    useEffect(() => {
        const getInventoryItems = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
                if (!token) return;

                const response = await fetchInventoryItemsList(token, searchCode, limitCode, offsetCode);
                const apiData = response?.data?.items || [];

                const mappedData = apiData
                    .map((item) => ({
                        id: item.id,
                        itemCode: item.item_code,
                        itemName: item.item_name,
                        updatedAt: item.updated_at
                    }))
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                setInventoryData(mappedData);
            } catch (error) {
                console.error("Failed to fetch inventory items:", error);
            } finally {
                setIsLoading(false);
            }
        };

        getInventoryItems();
    }, [getToken, searchCode, limitCode, offsetCode]);

    async function handleSubmit(values) {
        try {
            const token = await getToken();
            const payload = {
                item_code: values.ItemCode,
                item_name: values.ItemName,
                amount: values.Amount,
                order_quantity: values.Quantity,
                order_date: values.Date,
                created_by: userID,
            };

            const response = await createInventoryOrderItem(token, payload);
            if (response.message == "success") {
                toast.success("Inventory order added successfully!", { position: "bottom-right" });
                navigate("/inventory");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding inventory order!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/inventory");
    };

    const handleClearAll = () => {
        form.reset({
            ItemCode: "",
            ItemName: "",
            Quantity: "",
            Amount: "",
            Date: undefined
        });
        setIsCreatingNew(false);
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">

                        {/* --- LEFT COLUMN --- */}
                        <div className="flex flex-col gap-5">

                            {/* ITEM CODE */}
                            <FormField
                                control={form.control}
                                name="ItemCode"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-slate-700 font-semibold">Item Code</FormLabel>
                                        {isCreatingNew ? (
                                            <div className="flex flex-col gap-2">
                                                <FormControl>
                                                    <Input className="bg-slate-50 border-blue-500 h-11 rounded-xl shadow-sm" placeholder="Type new item code..." {...field} />
                                                </FormControl>
                                                <button
                                                    type="button"
                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline text-left w-fit transition-colors font-medium"
                                                    onClick={() => {
                                                        setIsCreatingNew(false);
                                                        form.setValue("ItemCode", "");
                                                        form.setValue("ItemName", "");
                                                    }}
                                                >
                                                    ← Back to select existing item
                                                </button>
                                            </div>
                                        ) : (
                                            <Select
                                                value={field.value}
                                                onValueChange={(val) => {
                                                    if (val === "CREATE_NEW") {
                                                        setIsCreatingNew(true);
                                                        form.setValue("ItemCode", "");
                                                        form.setValue("ItemName", "");
                                                        return;
                                                    }

                                                    field.onChange(val);
                                                    const matchedItem = inventoryData.find(i => i.itemCode === val);
                                                    if (matchedItem) {
                                                        form.setValue("ItemName", matchedItem.itemName, { shouldValidate: true });
                                                    }
                                                }}
                                                onOpenChange={(isOpen) => {
                                                    if (!isOpen) setSearchCode("");
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                        <SelectValue placeholder="Select item code" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <div className="p-2">
                                                        <Input
                                                            placeholder="Search code…"
                                                            value={searchCode}
                                                            onChange={(e) => setSearchCode(e.target.value)}
                                                            className="w-full h-9 rounded-lg"
                                                        />
                                                    </div>
                                                    {inventoryData?.map((item) => (
                                                        <SelectItem key={item.id} value={item.itemCode}>
                                                            {item.itemCode}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="CREATE_NEW" className="text-blue-700 font-semibold bg-blue-50 mt-1 border-t hover:bg-blue-100 cursor-pointer">
                                                        ➕ Create New Item
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* QUANTITY */}
                            <FormField
                                control={form.control}
                                name="Quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                placeholder="Enter quantity"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* DATE */}
                            <FormField
                                control={form.control}
                                name="Date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-700 font-semibold mb-1">Order Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal bg-slate-50 border-slate-200 h-11 rounded-xl",
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
                                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-slate-200" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={(date) => field.onChange(date === null ? undefined : date)}
                                                    initialFocus
                                                    classNames={{
                                                        head_cell: "w-8 font-normal text-[0.8rem]",
                                                        cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- RIGHT COLUMN --- */}
                        <div className="flex flex-col gap-5">

                            {/* ITEM NAME */}
                            <FormField
                                control={form.control}
                                name="ItemName"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel className="text-slate-700 font-semibold">Item Name</FormLabel>

                                        {isCreatingNew ? (
                                            <FormControl>
                                                <Input className="bg-slate-50 border-blue-500 h-11 rounded-xl shadow-sm" placeholder="Type new item name..." {...field} />
                                            </FormControl>
                                        ) : (
                                            <Select
                                                value={field.value}
                                                onValueChange={(val) => {
                                                    if (val === "CREATE_NEW") {
                                                        setIsCreatingNew(true);
                                                        form.setValue("ItemCode", "");
                                                        form.setValue("ItemName", "");
                                                        return;
                                                    }

                                                    field.onChange(val);
                                                    const matchedItem = inventoryData.find(i => i.itemName === val);
                                                    if (matchedItem) {
                                                        form.setValue("ItemCode", matchedItem.itemCode, { shouldValidate: true });
                                                    }
                                                }}
                                                onOpenChange={(isOpen) => {
                                                    if (!isOpen) setSearchCode("");
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                        <SelectValue placeholder="Select item name" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <div className="p-2">
                                                        <Input
                                                            placeholder="Search name…"
                                                            value={searchCode}
                                                            onChange={(e) => setSearchCode(e.target.value)}
                                                            className="w-full h-9 rounded-lg"
                                                        />
                                                    </div>
                                                    {inventoryData?.map((item) => (
                                                        <SelectItem key={`name-${item.id}`} value={item.itemName}>
                                                            {item.itemName}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="CREATE_NEW" className="text-blue-700 font-semibold bg-blue-50 mt-1 border-t hover:bg-blue-100 cursor-pointer">
                                                        ➕ Create New Item
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* AMOUNT */}
                            <FormField
                                control={form.control}
                                name="Amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Amount (LKR)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                placeholder="Enter amount"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                    </div>

                    {/* --- FOOTER BUTTONS --- */}
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
                            >
                                Add Order
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

export default AddItemOrderForm;