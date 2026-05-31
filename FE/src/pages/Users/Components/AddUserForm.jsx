import { set, z } from "zod"
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
    Email: z.string().optional(),
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

    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {

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
            const clerkData = await createClerkUser(token, values.FirstName, values.LastName, values.Email, values.PhoneNo, values.Password, values.Role);

            if (!clerkData.success) {
                toast.error("Failed to create Clerk user: " + clerkData.message);
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            {/* Left Column */}
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
                                name="PhoneNo"
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
                                name="Role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue className="bg-white" placeholder="Role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                                                <SelectItem value="HEAD">HEAD</SelectItem>
                                                <SelectItem value="WAREHOUSE_STAFF">WAREHOUSE_STAFF</SelectItem>
                                                <SelectItem value="INVENTORY_MANAGER">INVENTORY_MANAGER</SelectItem>
                                                <SelectItem value="OFFICE_STAFF">OFFICE_STAFF</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Right Column */}
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
                                name="Password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    className="bg-white pr-10"
                                                    placeholder="Enter password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 ">Add User</Button>
                            <Button variant="outline" className="border-2 border-red-400 hover:bg-red-500 hover:text-white" onClick={handleClose}>Close</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddUserForm;