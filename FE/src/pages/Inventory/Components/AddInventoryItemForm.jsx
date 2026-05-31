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
import { createInventoryItem } from "@/api/inventoryApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
    ItemCode: z.string().min(2, { message: "Item code is required" }),
    ItemName: z.string().min(2, { message: "Item name is required" }),
    // Quantity: z.coerce.number({ required_error: "Quantity is required" }).min(0, { message: "Quantity must be a positive number" }),
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
    console.log(sellable);

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
            console.log("Token:", token);
            const payload = {
                item_code: values.ItemCode,
                item_name: values.ItemName,
                // quantity_in_stock: values.Quantity,
                unit_cost: values.UnitPrice,
                threshold: values.Threshold,
                status: values.Status,
                created_by: userID,
            };
            console.log("Payload:", payload);

            const response = await createInventoryItem(token, payload);
            console.log("Response:", response);
            if (response.message == "success") {
                if (sellable) {
                    toast.success("Inventory item added successfully!", { position: "bottom-right" });
                    navigate(`/products/add-other?id=${response.data.id}`);
                }
                else {
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
    }

    const handleClearAll = () => {
        form.reset(), {
            keepErrors: false,
            keepDirty: false,
            keepTouched: false,
            keepIsSubmitted: false,
            keepSubmitCount: false,
        };
    };



    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                        <div className="flex flex-col gap-4">
                            {/* Left Column */}
                            <FormField
                                control={form.control}
                                name="ItemCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Code</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Item Code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormField
                                control={form.control}
                                name="Quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="bg-white"
                                                placeholder="Quantity"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                            <FormField
                                control={form.control}
                                name="Threshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Threshold</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                className="bg-white"
                                                placeholder="Threshold"
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
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue className="bg-white" placeholder="Select a Status" />
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

                        <div className="flex flex-col gap-4">
                            {/* Right Column */}
                            <FormField
                                control={form.control}
                                name="ItemName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Item Name" {...field} />
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
                                        <FormLabel>Unit Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="bg-white"
                                                placeholder="Unit Price"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sellable"
                                render={() => (
                                    <FormItem className="flex items-center gap-4 mt-1">
                                        <div className="">
                                            <FormLabel className="">Sellable</FormLabel>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="sellable"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        className="flex flex-row items-center"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                className="w-6 h-6 bg-white border-gray-300 rounded-md"
                                                                checked={sellable}
                                                                onCheckedChange={(checked) => {
                                                                    setSellable(!!checked);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal">
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 ">Add Item</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>

                </form>
            </Form>
        </div>
    )
}

export default AddInventoryItemForm;