import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MdOutlineRefresh } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { createProduct } from "@/api/productApi";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { featchNonResellableInventory, updateInventoryItem } from "@/api/inventoryApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    ProductName: z.string().min(2, { message: "Product name is required" }),
    Category: z.string().min(2).max(100),
    BrandName: z.string().optional(),
    Voltage: z.number().optional(),
    BasePrice: z.number({ required_error: "Base price is required" }),
    InventoryItemId: z.string().optional(),
});

const AddOtherForm = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const inventoryId = params.get("id");

    const { user } = useUser();
    const userID = user?.id;

    const { isLoaded, getToken } = useAuth();
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Category: "OTHER",
            InventoryItemId: inventoryId || undefined,
        }
    });

    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(15)
    const [offset, setOffset] = useState(0)
    const [data, setData] = useState([])

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function handleSubmit(values) {
        const payload = {
            ProductName: values.ProductName,
            Category: values.Category,
            Specifications: values.BrandName,
            Voltage: values.Voltage,
            BasePrice: values.BasePrice,
            CreatedBy: userID,
        };

        try {
            const token = await getToken();
            const response = await createProduct(token, payload);
            if (response.message == "success") {
                toast.success("Product added successfully!", { position: "bottom-right" });
                const updatePayload = {
                    item_id: values.InventoryItemId,
                    product_id: response.data.id,
                }
                if (values.InventoryItemId) {
                    await updateInventoryItem(token, updatePayload);
                }
                navigate("/products");
            } else {
                toast.error("Error adding product! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding product!", { position: "bottom-right" });
        }
    }

    useEffect(() => {
        if (!isLoaded) return;
        const getInventoryItems = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const response = await featchNonResellableInventory(token, search, limit);
                const apiData = response?.data?.items || [];

                const mappedData = apiData
                    .map((item) => ({
                        id: item.id,
                        itemCode: item.item_code,
                    }))
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

                setData(mappedData);
            } catch (error) {
                console.error("Failed to fetch inventory items:", error);
            }
        };

        getInventoryItems();
    }, [getToken, search, limit, offset, isLoaded]);

    const handleClose = () => {
        navigate("/products");
    }

    const handleClearAll = () => {
        form.reset({
            Category: "OTHER",
            ProductName: "",
            BrandName: "",
            Voltage: undefined,
            BasePrice: undefined,
            InventoryItemId: undefined
        });
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    {/* SELECT INVENTORY ITEM (IF APPLICABLE) */}
                    <FormField
                        control={form.control}
                        name="InventoryItemId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel className="text-slate-700 font-semibold">Inventory Item Code</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) setSearch("");
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
                                                placeholder="Search items…"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full h-9 rounded-lg"
                                            />
                                        </div>
                                        {
                                            data?.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.itemCode}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* PRODUCT NAME FULL WIDTH */}
                    <FormField
                        control={form.control}
                        name="ProductName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Product Name</FormLabel>
                                <FormControl>
                                    <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                        
                        {/* --- LEFT COLUMN --- */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="Category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Category</FormLabel>
                                        <FormControl>
                                            <Input className="font-semibold bg-slate-100 border-slate-200 h-11 rounded-xl text-slate-500 cursor-not-allowed" placeholder="Other" {...field} readOnly />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="BasePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Base Price (LKR)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter base price" {...field}
                                                type="number"
                                                value={field.value ?? ''}
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- RIGHT COLUMN --- */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="Voltage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Voltage (V)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter voltage" {...field}
                                                type="number"
                                                value={field.value ?? ''}
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="BrandName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Brand Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter brand name" {...field} />
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
                                Add Product
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

export default AddOtherForm;