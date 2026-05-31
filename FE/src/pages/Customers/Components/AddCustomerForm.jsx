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
import { createCustomer } from "@/api/customerApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { isValidPhoneNumber } from "libphonenumber-js";

const formSchema = z.object({
    Title: z.string().min(2, { message: "Title is required" }),
    FirstName: z.string().min(2, { message: "First name is required" }),
    LastName: z.string().optional(),
    Email: z.string().optional(),
    Address: z.string().min(2, { message: "Address is required" }),
    PhoneNo1: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`) 
        .refine((val) => isValidPhoneNumber(val), {
          message: "Invalid international phone number",
        }),
    
        PhoneNo2: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`) 
        .refine((val) => isValidPhoneNumber(val), {
          message: "Invalid  phone number",
        })
        .or(z.literal(""))
        .optional(),
    
    vatNo: z.string().optional(),
});

const AddCustomerForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();

    const userID = user?.id;
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Title: "Mr.",
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
            console.log("Token:", token);
            const payload = {
                Title: values.Title,
                PhoneNo1: values.PhoneNo1,
                PhoneNo2: values.PhoneNo2,
                FirstName: values.FirstName,
                LastName: values.LastName,
                Email: values.Email,
                Address: values.Address,
                CreatedBy: userID,
                VatNo: values.vatNo,
            };

            const response = await createCustomer(token, payload);
            console.log("Response:", response);
            if (response.message == "success") {
                toast.success("Customer added successfully!", { position: "bottom-right" });
                navigate("/customers");
            } else {
                toast.error("Error adding customer! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding customer!", { position: "bottom-right" });
        }
    }

    const handleClose = () => {
        navigate("/customers");
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
                                name="Title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue className="bg-white" placeholder="Mr" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Mr.">Mr</SelectItem>
                                                <SelectItem value="Mrs.">Mrs</SelectItem>
                                                <SelectItem value="Miss.">Miss</SelectItem>
                                                <SelectItem value="M/S.">M/S</SelectItem>
                                                <SelectItem value="Dr">Dr</SelectItem>
                                                <SelectItem value="Rev">Rev</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="PhoneNo2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Secondary Phone No.</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="94XXXXXXXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="FirstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="First Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Address" {...field} />
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
                                name="PhoneNo1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone No.</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="94XXXXXXXXX" {...field} />
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="LastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Last Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="vatNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>VAT No:</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Customer's VAT No" {...field} />
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 ">Add Customer</Button>
                            <Button
                                variant="outline"
                                className="border-2 border-red-400 hover:bg-red-500 hover:text-white"
                                onClick={handleClose}
                            >Close
                            </Button>
                        </div>
                    </div>

                </form>
            </Form>
        </div>
    )
}

export default AddCustomerForm;