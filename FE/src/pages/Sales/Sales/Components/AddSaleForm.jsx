import { z } from "zod"
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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createSale } from "@/api/saleApi";
import { fethchSalespersonNames } from "@/api/salespersonApi";
import { uploadAudioToCloudinary } from "@/api/cloudinaryApi";

const formSchema = z.object({
    SalesPerson: z.string().min(2, { message: "Salesperson is required" }),
    Type: z.string().optional(),
    Commission: z.coerce.number().optional(),
    Date: z.date({ required_error: "Date is required" }),
    CustomerName: z.string().optional(),
    CustomerPhone: z
        .string()
        .regex(/^94\d{9}$/, {
            message: "Phone number must be in the format 94XXXXXXXXX",
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
    const [salespersonStatus, setSalespersonStatus] = useState("Active");
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            FirstName: "",
            LastName: "",
            Email: "",
            PhoneNo: ""
        }
    });

    useEffect(() => {
        const loadSalespersons = async () => {
            try {
                const token = await getToken();
                const response = await fethchSalespersonNames(token, salespersonStatus);
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
    }, [getToken]);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
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
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => { navigate("/sales"); }
    const handleClearAll = () => { form.reset(); };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* --- LEFT COLUMN --- */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="SalesPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Salesperson</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select salesperson" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {salespersons.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                                        <FormLabel className="text-slate-700 font-semibold">Commission</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter commission" {...field} />
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
                                        <FormLabel className="text-slate-700 font-semibold">Customer Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter customer name" {...field} />
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
                                name="Type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select type" />
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
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-700 font-semibold">Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("w-full h-11 rounded-xl pl-3 text-left font-normal bg-slate-50 border-slate-200", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="CustomerPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Customer Phone No.</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="94XXXXXXXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="Recording"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Recording</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="audio/*" className="bg-slate-50 border-slate-200 h-11 rounded-xl" onChange={(e) => field.onChange(e.target.files?.[0])} />
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
                                <FormLabel className="text-slate-700 font-semibold">Description</FormLabel>
                                <FormControl>
                                    <textarea className="w-full min-h-[90px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" placeholder="Enter description..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Add Sale"}
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

export default AddSaleForm;