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
    PositionTitle: z.string().min(2, { message: "Position title is required" }),
    Description: z.string().optional(),
    Department: z.string().min(2, { message: "Department is required" }),
    ExperienceRequired: z.string().optional(),
    Salary: z.number().min(0, { message: "Salary must be a positive number" }),

    ApplicantID: z.string().optional(),
    ApplicantName: z.string().min(2, { message: "Applicant name is required" }),
    Email: z.string().optional(),
    PhoneNo: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`)
        .refine((val) => isValidPhoneNumber(val), {
            message: "Invalid international phone number",
        }),
    CV: z.any().refine((files) => files?.length > 0, { message: "CV is required" }),
    CurrentEmployer: z.string().optional(),
    CurrentPosition: z.string().optional(),
    ExpectedSalary: z.number().min(0, { message: "Expected salary must be a positive number" }),

    DateOfInterview: z.string().optional(),
    DateApplied: z.string().optional(),
    Interviewer: z.string().optional(),
    InterviewScore: z.number().min(0).max(10).optional(),
    notes: z.string().optional(),
    JoinDate: z.string().optional(),
});

const AddInterviewTrackerForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();

    const userID = user?.id;
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
        navigate("/hr/talent-pool");
    }

    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="sm:space-y-8 space-y-4 w-full">

                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <h1 className="font-semibold text-xl mb-4">Position</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-6">
                                {/* Left Column */}
                                <FormField
                                    control={form.control}
                                    name="PositionTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position Title</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Position Title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ExperienceRequired"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Experience Required</FormLabel>
                                            <FormControl>
                                                <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Experience Required" {...field} />
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
                                                <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Description" {...field} />
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
                                    name="Department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Department" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="Salary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Salary</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Salary" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <h1 className="font-semibold text-xl mb-4">Applicant</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-6">
                                {/* Left Column */}
                                <FormField
                                    control={form.control}
                                    name="ApplicantName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Applicant Name</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Applicant Name" {...field} />
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
                                    name="CurrentPosition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Position</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Current Position" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="CV"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Resume</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    className="bg-white"
                                                    placeholder="Receipt"
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                />
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
                                    name="PhoneNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Phone Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ExpectedSalary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Salary</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Expected Salary" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="CurrentEmployer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Employer</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Current Employer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <h1 className="font-semibold text-xl mb-4">Interview</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-6">
                                {/* Left Column */}
                                <FormField
                                    control={form.control}
                                    name="ApplicantName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Applicant Name</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Applicant Name" {...field} />
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
                                    name="CurrentPosition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Position</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Current Position" {...field} />
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
                                    name="PhoneNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Phone Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="ExpectedSalary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Salary</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Expected Salary" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="CurrentEmployer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Employer</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Current Employer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-2xl shadow-sm bg-gray-50">
                        <h1 className="font-semibold text-xl mb-4">Others</h1>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-6">
                                {/* Left Column */}
                                <FormField
                                    control={form.control}
                                    name="ApplicantID"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Applicant ID</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Applicant ID" {...field} />
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
                                    name="JoinDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Join Date</FormLabel>
                                            <FormControl>
                                                <Input className="bg-white" placeholder="Join Date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                            <Button type="submit" className="bg-blue-800 hover:bg-blue-900 ">Add Member</Button>
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

export default AddInterviewTrackerForm;