import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { createProduct } from "@/api/productApi";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

const formSchema = z.object({
    ProductName: z.string().min(2, { message: "Product name is required" }),
    Category: z.string().min(2).max(100),
    CellCount: z.string().optional(),
    Type: z.string().min(1, { message: "Pack type is required" }),
    Voltage: z.number({ required_error: "Voltage is required" }),
    CellType: z.string().min(2, { message: "Cell type is required" }),
    BmsType: z.string().min(1, { message: "BMS type is required" }),
    Capacity: z.number({ required_error: "Capacity is required" }),
    Specifications: z.string().optional(),
    BasePrice: z.number({ required_error: "Base price is required" }),
    Monitor: z.string().optional(),
});

const AddBatteryPackForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Category: "BATTERY_PACK",
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

    async function handleSubmit(values) {
        const payload = {
            ProductName: values.ProductName,
            Category: values.Category,
            CellCount: values.CellCount,
            Type: values.Type,
            Voltage: values.Voltage,
            CellType: values.CellType,
            BmsType: values.BmsType,
            Capacity: values.Capacity,
            Specifications: values.Specifications,
            BasePrice: values.BasePrice,
            Monitor: values.Monitor,
            CreatedBy: userID,
        };
        try {
            const token = await getToken();
            const response = await createProduct(token, payload);
            if (response?.message == "success") {
                toast.success("Product added successfully!", { position: "bottom-right" });
                navigate("/products");
            } else {
                toast.error("Error adding battery pack! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding battery pack!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/products");
    };

    const handleClearAll = () => {
       form.reset({
           Category: "BATTERY_PACK",
           ProductName: "",
           CellCount: "",
           Type: "",
           Voltage: "",
           CellType: "",
           BmsType: "",
           Capacity: "",
           Specifications: "",
           BasePrice: "",
           Monitor: ""
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
                                            <Input className="font-semibold bg-slate-100 border-slate-200 h-11 rounded-xl text-slate-500 cursor-not-allowed" placeholder="Battery Pack" {...field} readOnly />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CellCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Cell Count</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter cell count" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select a Pack Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Eco Cell">Eco Cell</SelectItem>
                                                <SelectItem value="PowerVault">PowerVault</SelectItem>
                                                <SelectItem value="Solar Flex">Solar Flex</SelectItem>
                                                <SelectItem value="Li-ion">Power Hub</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                name="Monitor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Monitor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select a Monitor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="3.2 LCD">3.2 LCD</SelectItem>
                                                <SelectItem value="4.3 LCD">4.3 LCD</SelectItem>
                                                <SelectItem value="2.5 LCD">2.5 LCD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- RIGHT COLUMN --- */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="BmsType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">BMS Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select a BMS Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="16 S 100A communication BMS">16 S 100A communication BMS</SelectItem>
                                                <SelectItem value="16S 150A communication BMS">16S 150A communication BMS</SelectItem>
                                                <SelectItem value="16S 200A communication BMS">16S 200A communication BMS</SelectItem>
                                                <SelectItem value="8S 100A 0.6A balancing BMS">8S 100A 0.6A balancing BMS</SelectItem>
                                                <SelectItem value="24S 150A BMS">24S 150A BMS</SelectItem>
                                                <SelectItem value="24S 120A BMS">24S 120A BMS</SelectItem>
                                                <SelectItem value="8S 200A high current BMS">8S 200A high current BMS</SelectItem>
                                                <SelectItem value="500A Relay BMS">500A Relay BMS</SelectItem>
                                                <SelectItem value="60A 8S BMS">60A 8S BMS</SelectItem>
                                                <SelectItem value="60A 24S BMS">60A 24S BMS</SelectItem>
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
                                        <FormLabel className="text-slate-700 font-semibold">Base Price (LKR)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter base price" {...field}
                                                type="number"
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CellType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Cell Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select a Cell Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="EVE 20Ah">EVE 20Ah</SelectItem>
                                                <SelectItem value="EVE 100Ah">EVE 100Ah</SelectItem>
                                                <SelectItem value="EVE 105Ah">EVE 105Ah</SelectItem>
                                                <SelectItem value="EVE 150Ah">EVE 150Ah</SelectItem>
                                                <SelectItem value="EVE 230Ah">EVE 230Ah</SelectItem>
                                                <SelectItem value="EVE 280Ah">EVE 280Ah</SelectItem>
                                                <SelectItem value="Gotion 15Ah">Gotion 15Ah</SelectItem>
                                                <SelectItem value="Goshen 50Ah">Goshen 50Ah</SelectItem>
                                                <SelectItem value="Gotion 102Ah">Gotion 102Ah</SelectItem>
                                                <SelectItem value="Goshen 300Ah">Goshen 300Ah</SelectItem>
                                                <SelectItem value="Lishen 200Ah">Lishen 200Ah</SelectItem>
                                                <SelectItem value="Samsung SDI 94Ah">Samsung SDI 94Ah</SelectItem>
                                                <SelectItem value="Samsung SDI 100Ah">Samsung SDI 100Ah</SelectItem>
                                                <SelectItem value="Panasonic 50Ah">Panasonic 50Ah</SelectItem>
                                                <SelectItem value="CATL 40Ah">CATL 40Ah</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Capacity (Ah)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter capacity" {...field}
                                                type="number"
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                            />
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

export default AddBatteryPackForm;