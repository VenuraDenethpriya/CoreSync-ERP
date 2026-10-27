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
import { createClerkUser, createUser } from "@/api/userApi";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
    FirstName: z.string().min(2, { message: "First name is required" }),
    LastName: z.string().min(2, { message: "Last name is required" }),
    Email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
    PhoneNo: z
        .string()
        .regex(/^94\d{9}$/, {
            message: "Phone number must be in the format 94XXXXXXXXX (e.g., 94771234567)",
        }),
    Role: z.string().min(2, { message: "Role is required" }),
    Password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[a-zA-Z]/, { message: "Password must contain at least 1 letter" })
        .regex(/\d/, { message: "Password must contain at least 1 number" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least 1 special character" }),
});

const AddUserForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userID = user?.id;
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            FirstName: "",
            LastName: "",
            Email: "",
            PhoneNo: "",
            Role: "",
            Password: "",
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
            setIsSubmitting(true);
            const token = await getToken();
            const clerkData = await createClerkUser(token, values.FirstName, values.LastName, values.Email, values.PhoneNo, values.Password, values.Role);

            if (!clerkData.success) {
                toast.error("Failed to create Clerk user: " + clerkData.message);
                setIsSubmitting(false);
                return;
            }
            const clerkUserId = clerkData.clerkUserId;

            const payload = {
                first_name: values.FirstName,
                last_name: values.LastName,
                email: values.Email,
                phone_no: values.PhoneNo,
                role: values.Role,
                clerk_id: clerkUserId,
                created_by: userID,
            };

            const response = await createUser(token, payload);
            if (response.message == "success") {
                toast.success("User added successfully!", { position: "bottom-right" });
                navigate("/users");
            } else {
                toast.error("Error adding user! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding user!", { position: "bottom-right" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => {
        navigate("/users");
    }

    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="FirstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">First Name</FormLabel>
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
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Phone No.</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="94XXXXXXXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                    <SelectValue placeholder="Select user role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                                                <SelectItem value="HEAD">HEAD</SelectItem>
                                                <SelectItem value="FINANCE_HEAD">FINANCE_HEAD</SelectItem>
                                                <SelectItem value="HR_HEAD">HR_HEAD</SelectItem>
                                                <SelectItem value="WAREHOUSE_STAFF">WAREHOUSE_STAFF</SelectItem>
                                                <SelectItem value="INVENTORY_MANAGER">INVENTORY_MANAGER</SelectItem>
                                                <SelectItem value="OFFICE_STAFF">OFFICE_STAFF</SelectItem>
                                                <SelectItem value="SALES_TEAM">SALES_TEAM</SelectItem>
                                                <SelectItem value="READ_ONLY">READ_ONLY</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="LastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Last Name</FormLabel>
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
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Email</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl pr-10"
                                                    placeholder="Enter password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

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
                                {isSubmitting ? "Submitting..." : "Add User"}
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

export default AddUserForm;