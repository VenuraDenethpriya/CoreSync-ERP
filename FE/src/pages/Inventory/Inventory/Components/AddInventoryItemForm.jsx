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
import { createInventoryItem } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    ItemCode: z.string().min(2, { message: "Item code is required" }),
    ItemName: z.string().min(2, { message: "Item name is required" }),
    UnitPrice: z.coerce.number({ required_error: "Unit price is required" }).min(0, { message: "Unit price must be a positive number" }),
    Threshold: z.coerce.number({ required_error: "Threshold is required" }).min(0, { message: "Threshold must be a positive number" }),
    Status: z.string().min(1, { message: "Status is required" }),
});

const AddInventoryItemForm = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { user } = useUser();
    const userID = user?.id;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Status: "In Stock",
        }
    });
    const [sellable, setSellable] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

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
            const payload = {
                item_code: values.ItemCode,
                item_name: values.ItemName,
                unit_cost: values.UnitPrice,
                threshold: values.Threshold,
                status: values.Status,
                created_by: userID,
            };

            const response = await createInventoryItem(token, payload);
            if (response.message == "success") {
                if (sellable) {
                    toast.success("Inventory item added successfully!", { position: "bottom-right" });
                    navigate(`/products/add-other?id=${response.data.id}`);
                } else {
                    toast.success("Inventory item added successfully!", { position: "bottom-right" });
                    navigate("/inventory");
                }
            } else {
                toast.error("Error adding inventory item! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding inventory item!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/inventory");
    };

    const handleClearAll = () => {
        form.reset({
            Status: "In Stock",
        });
        setSellable(false);
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                        {/* Left Column */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="ItemCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Item Code</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter item code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Threshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Threshold</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                placeholder="Enter threshold quantity"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select a Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="In Stock">In Stock</SelectItem>
                                                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                                <SelectItem value="Expired">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="ItemName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Item Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter item name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="UnitPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Unit Price (LKR)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                placeholder="Enter unit price"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Sellable Checkbox Field */}
                            <div className="flex items-center gap-3 pt-4">
                                <Checkbox
                                    className="w-5 h-5 bg-slate-50 border-slate-300 rounded-md data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    checked={sellable}
                                    onCheckedChange={(checked) => {
                                        setSellable(!!checked);
                                    }}
                                />
                                <label className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                                    Sellable Item
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="flex sm:justify-between justify-center items-center pt-6 border-t border-slate-100">
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
                                Add Item
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

export default AddInventoryItemForm;