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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
    CandidateName: z.string().min(2, { message: "Candidate name is required" }),
    Email: z.string().optional(),
    PhoneNo: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`)
        .refine((val) => isValidPhoneNumber(val), {
            message: "Invalid international phone number",
        }),
    PositionApplied: z.string().min(2, { message: "Position applied for is required" }),
    DateOfApplication: z.string().min(2, { message: "Date of application is required" }),
    EvaluationScore: z.number().min(0).max(10, { message: "Evaluation score must be between 0 and 10" }),
    Comments: z.string().optional(),
    CV: z.any().refine((files) => files?.length > 0, { message: "CV is required" }),
});

const AddMemberForm = () => {
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            {/* Left Column */}
                            <FormField
                                control={form.control}
                                name="CandidateName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Candidate Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Candidate Name" {...field} />
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
                                name="PositionApplied"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position Applied</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Position Applied" {...field} />
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
                                name="DateOfApplication"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date of Application</FormLabel>
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
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
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
                                name="EvaluationScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Evaluation Score</FormLabel>
                                        <FormControl>
                                            <Input className="bg-white" placeholder="Evaluation Score" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="Comments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Comments</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-5 border-2 rounded-md border-gray-200 p-2 overflow-hidden" placeholder="Comments" {...field} />
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

export default AddMemberForm;