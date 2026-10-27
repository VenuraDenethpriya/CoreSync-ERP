import { custom, set, z } from "zod"
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
import { useAuth, useUser } from "@clerk/clerk-react";
import { fetchProductsList } from "@/api/productApi";
import { createWireHarness } from "@/api/productionApi";

const formSchema = z.object({
    ProductID: z.string().min(2, { message: "Product is required" }),
    Quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }).optional(),
    Note: z.string().optional(),
    Status: z.string().optional(),
});

const AddCasingForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(15)
    const [offset, setOffset] = useState(0)
    const [productList, setProductList] = useState([]);

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Quantity: 1,
            Status: "Drafted"
        }
    });

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setIsSubmitting(true);

            const payload = {
                product_id: values.ProductID,
                quantity: values.Quantity,
                note: values.Note,
                // status: values.Status,
                created_by: userID,
            };

            const response = await createWireHarness(token, payload);
            if (response.message == "success") {
                toast.success("Wire harness added successfully!", { position: "bottom-right" });
                navigate("/productions");
            } else {
                toast.error("Error adding wire harness! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding wire harness!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/productions");
    }

    const handleClearAll = () => {
        form.reset();
    };

    useEffect(() => {
        try {
            const featchBasicProductsList = async () => {
                const token = await getToken();
                const response = await fetchProductsList(token, search, limit, offset);
                setProductList(response?.data?.products || []);
            };
            featchBasicProductsList();
        } catch (error) {
            console.error("Error fetching product data:", error);
        }
    }, [getToken, search, limit, offset]);

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            {/* Left Column */}
                            <FormField
                                control={form.control}
                                name="ProductID"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white w-full">
                                                    <SelectValue placeholder="Select a product..." />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent className="w-full">
                                                <div className="p-2">
                                                    <Input
                                                        placeholder="Search products…"
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                        // Prevent typing spaces/enters from closing the dropdown
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                        className="w-full"
                                                    />
                                                </div>

                                                {/* FIXED: Map over your product list ONLY to generate SelectItems */}
                                                {productList?.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.ProductName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />




                            <FormField
                                control={form.control}
                                name="Note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Note" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Right Column */}

                            <FormField
                                control={form.control}
                                name="Quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                className="bg-white"
                                                placeholder="Enter quantity"
                                                {...field}
                                            />
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Add Wire Harness"}</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddCasingForm;