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
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createSale } from "@/api/saleApi";
import { fethchSalespersonNames } from "@/api/salespersonApi";
import { uploadAudioToCloudinary, uploadImageToCloudinary } from "@/api/cloudinaryApi";

const formSchema = z.object({
    SalesPerson: z.string().min(2, { message: "Salesperson is required" }),
    Type: z.string().optional(),
    Commission: z.coerce.number().optional(),
    Date: z.date({ required_error: "Date is required" }),
    CustomerName: z.string().optional(),
    CustomerPhone: z
        .string()
        .regex(/^94\d{9}$/, {
            message: "Phone number must be in the format 94XXXXXXXXX (e.g., 94771234567)",
        }),
    Description: z.string().optional(),
    Recording: z
        .any()
        .refine((file) => file instanceof File || !file, "Invalid file")
        .optional(),

});

const AddSaleForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;
    const [salespersons, setSalespersons] = useState([]);

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {

        }
    });

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadSalespersons = async () => {
            try {
                const token = await getToken();
                const response = await fethchSalespersonNames(token);
                const salespersonsList = response.data.salespersons;

                const formattedList = salespersonsList.map(item => ({
                    id: item.id,
                    name: item.salesperson
                }));

                setSalespersons(formattedList);
            } catch (err) {
                console.error("Error fetching salespersons:", err);
            }
        };

        loadSalespersons();
    }, []);

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

            let recordingUrl = "";

            if (values.Recording instanceof File) {
                try {
                    recordingUrl = await uploadAudioToCloudinary(values.Recording);
                } catch (err) {
                    console.error("Upload error:", err);
                    toast.error("Failed to upload call recording.", { position: "bottom-right" });
                    setIsSubmitting(false);
                    return;
                }
            }
            const payload = {
                type: values.Type,
                status: "Quoted",
                salesperson: values.SalesPerson,
                commission: values.Commission,
                date: values.Date,
                customer_name: values.CustomerName,
                customer_phone: values.CustomerPhone,
                description: values.Description,
                recording_url: recordingUrl,
                updated_by: userID
            };

            const response = await createSale(token, payload);
            if (response.message == "success") {
                toast.success("Sale added successfully!", { position: "bottom-right" });
                navigate("/sales");
            } else {
                toast.error("Error adding sale! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding sale!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/sales");
    }

    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            {/* Left Column */}
                            <FormField
                                control={form.control}
                                name="SalesPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salesperson</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Salesperson" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {salespersons.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
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
                                name="Commission"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Commission</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Enter commission" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CustomerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Enter customer name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Specification" {...field} />
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
                                name="Type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue className="bg-white" placeholder="Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="BatteryPack">Battery Pack</SelectItem>
                                                <SelectItem value="Solar">Solar</SelectItem>
                                                <SelectItem value="Repair">Repair</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
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
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date === null ? undefined : date);
                                                    }}
                                                    initialFocus
                                                    classNames={{
                                                        head_cell: "w-8 font-normal text-[0.8rem]",
                                                        cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                                    }}
                                                />
                                            </PopoverContent>
                                            <FormMessage />
                                        </Popover>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CustomerPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Phone No.</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Enter cusotmer phone no." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Recording"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recording</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="audio/*"
                                                className="bg-white"
                                                onChange={(e) => field.onChange(e.target.files?.[0])}
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Add sale"}</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddSaleForm;