import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createSalespereson } from "@/api/salespersonApi";

const formSchema = z.object({
    FirstName: z.string().min(2, { message: "First name is required" }),
    LastName: z.string().min(2, { message: "Last name is required" }),
    Email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
    Status: z.string().optional(),
    PhoneNo: z
        .string()
        .regex(/^\d{9}$/, {
            message: "Phone number must be in the format 7XXXXXXXX",
        }),
});

const AddSalespersonForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            FirstName: "",
            LastName: "",
            Email: "",
            PhoneNo: "",
            Status: "Active",
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
        try {
            const token = await getToken();
            const payload = {
                first_name: values.FirstName,
                last_name: values.LastName,
                email: values.Email,
                phone: values.PhoneNo,
                created_by: userID,
                status: values.Status || "Active",
            };

            const response = await createSalespereson(token, payload);
            if (response.message == "success") {
                toast.success("Salesperson added successfully!", { position: "bottom-right" });
                navigate("/sales");
            } else {
                toast.error("Error adding salesperson! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding salesperson!", { position: "bottom-right" });
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* --- LEFT COLUMN --- */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="FirstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">First Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter first name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="PhoneNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Phone No.</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="771234567" {...field} />
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
                                name="LastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Last Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter last name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Email</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter email address" {...field} />
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
                                Add Salesperson
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

export default AddSalespersonForm;