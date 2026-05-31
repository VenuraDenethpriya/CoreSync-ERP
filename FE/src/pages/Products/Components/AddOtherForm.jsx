import { set, z } from "zod"
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
import { featchNonResellableInventory, fetchInventoryItemsList, updateInventoryItem } from "@/api/inventoryApi";
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
    console.log("Inventory Id:", inventoryId);

    const { user } = useUser();
    const userID = user?.id;

    const { isLoaded, getToken } = useAuth();
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Category: "OTHER",
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
            console.log("Token:", token);
            const response = await createProduct(token, payload);
            console.log("Response:", response);
            if (response.message == "success") {
                toast.success("Product added successfully!", { position: "bottom-right" });
                const payload = {
                    item_id: values.InventoryItemId,
                    product_id: response.data.id,
                }
                await updateInventoryItem(token, payload);
                navigate("/products");
            } else {
                toast.error("Error adding battery pack! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
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
    }, [getToken, search, limit, offset]);

    const handleClose = () => {
        navigate("/products");
    }

    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">


                    <FormField
                        control={form.control}
                        name="InventoryItemId"
                        render={({ field }) => (
                            <FormItem className="w-full sm:w-1/2">
                                {/* <FormLabel>Item Code</FormLabel> */}
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    onOpenChange={
                                        (isOpen) => {
                                            if (!isOpen) setSearch("");
                                        }
                                    }
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select item code" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <div>
                                            <Input
                                                placeholder="Search items…"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="w-full"
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

                    <FormField
                        control={form.control}
                        name="ProductName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input className="bg-white" placeholder="Product Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
                        <div className="flex flex-col gap-4">
                            {/* Left Column */}
                            <FormField
                                control={form.control}
                                name="Category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input className="font-semibold bg-white" placeholder="Battery Pack" {...field} readOnly />
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
                                        <FormLabel>Base Price (Rs)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Base Price" {...field}
                                                type="number"
                                                className="bg-white"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Right Column */}

                            <FormField
                                control={form.control}
                                name="Voltage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Voltage (V)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Voltage" {...field}
                                                type="number"
                                                value={field.value ?? ''}
                                                className="bg-white"
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
                                        <FormLabel>Brand Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Brand Name" {...field} />
                                        </FormControl>
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 ">Add Product</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>

                </form>
            </Form>
        </div>
    )
}

export default AddOtherForm;
