import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdOutlineRefresh } from "react-icons/md";
import { createProduct } from "@/api/productApi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";


const formSchema = z.object({
    ProductName: z.string().min(2, { message: "Product name is required" }),
    Category: z.string().min(2).max(100),
    Capacity: z.number({ required_error: "Capacity is required" }),
    Type: z.string().min(1, { message: "Solar type is required" }),
    PanelType: z.string().optional(),
    Inverter: z.string().optional(),
    BasePrice: z.number({ required_error: "Base price is required" }),
    Specifications: z.string().optional(),
});



const AddSolarForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Category: "SOLAR",
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
            Capacity: values.Capacity,
            Type: values.Type,
            PanelType: values.PanelType,
            Inverter: values.Inverter,
            Specifications: values.Specifications,
            BasePrice: values.BasePrice,
            CreatedBy: userID,
        }
        try {
            const token = await getToken();
            const tesponse = await createProduct(token, payload);
            console.log("Response:", tesponse);
            if (tesponse.message == "success") {
                toast.success("Product added successfully!", { position: "bottom-right" });
                navigate("/products");
            } else {
                toast.error("Error adding solar panel! " + tesponse.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }
    const handleClose = () => {
        navigate("/products");
    }
    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full">

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
                                            <Input className="font-semibold bg-white" placeholder="Solar" {...field} readOnly />

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="PanelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Panel Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select a Panel Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="JA Solar">JA Solar</SelectItem>
                                                <SelectItem value="Jinko Solar">Jinko Solar</SelectItem>
                                                <SelectItem value="Canadian Solar">Canadian Solar</SelectItem>
                                                <SelectItem value="Longi">Longi</SelectItem>
                                                <SelectItem value="Trina">Trina</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="BasePrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BasePrice (Rs)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Base Price" {...field}
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

                            {/* <FormField
                                control={form.control}
                                name="Specifications"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specification</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Specification" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}
                            <FormField
                                control={form.control}
                                name="Specifications"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specifications</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select Specifications" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="5kW Solar Ongrid System Complete Installation">5kW Solar Ongrid System Complete Installation </SelectItem>
                                                <SelectItem value="6.2kW Solar Ongrid System Complete Installation">6.2kW Solar Ongrid System Complete Installation </SelectItem>
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
                                name="Capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity (kW)</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} >
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select a Capacity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="3">3kW</SelectItem>
                                                <SelectItem value="5">5kW</SelectItem>
                                                <SelectItem value="6">6kW</SelectItem>
                                                <SelectItem value="10">10kW</SelectItem>
                                                <SelectItem value="15">15kW</SelectItem>
                                                <SelectItem value="20">20kW</SelectItem>
                                                <SelectItem value="30">30kW</SelectItem>
                                                <SelectItem value="40">40kW</SelectItem>
                                                <SelectItem value="50">50kW</SelectItem>
                                                <SelectItem value="100">100kW</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Solar Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select a solar type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="On-grid">On-grid</SelectItem>
                                                <SelectItem value="Off-grid">Off-grid</SelectItem>
                                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Inverter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inverter</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Select a Inverter" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Solax">Solax</SelectItem>
                                                <SelectItem value="Deye">Deye</SelectItem>
                                                <SelectItem value="Huawei">Huawei</SelectItem>
                                                <SelectItem value="Growatt">Growatt</SelectItem>
                                                <SelectItem value="SMA">SMA</SelectItem>
                                                <SelectItem value="Solis">Solis</SelectItem>
                                                <SelectItem value="Saji">Saji</SelectItem>
                                                <SelectItem value="ABB">ABB</SelectItem>
                                                <SelectItem value="Felicity (offGrid)">Felicity (offGrid)</SelectItem>
                                                <SelectItem value="SRNE (OffGrid)">SRNE (OffGrid)</SelectItem>
                                            </SelectContent>
                                        </Select>
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

export default AddSolarForm