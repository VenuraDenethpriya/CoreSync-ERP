import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MdOutlineRefresh } from "react-icons/md";
import { createProduct } from "@/api/productApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

const formSchema = z.object({
    ProductName: z.string().min(2, { message: "Product name is required" }),
    Category: z.string().min(2).max(100),
    BasePrice: z.number({ required_error: "Base price is required" }),
    Specifications: z.string().optional(),
});

const AddServiceForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Category: "SERVICE",
        }
    })

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
            Specifications: values.Specifications,
            BasePrice: values.BasePrice,
            CreatedBy: userID,
        };
        try {
            const token = await getToken();
            const response = await createProduct(token, payload);
            if (response.message == "success") {
                toast.success("Product added successfully!", { position: "bottom-right" });
                navigate("/products");
            } else {
                toast.error("Error adding Service! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding service!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/products");
    }

    const handleClearAll = () => {
        form.reset({
            Category: "SERVICE",
            ProductName: "",
            BasePrice: undefined,
            Specifications: ""
        });
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

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
                                            <Input className="font-semibold bg-slate-100 border-slate-200 h-11 rounded-xl text-slate-500 cursor-not-allowed" placeholder="Service" {...field} readOnly />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Specifications"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Specifications</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-[46px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" placeholder="Enter specifications..." {...field} />
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

export default AddServiceForm;