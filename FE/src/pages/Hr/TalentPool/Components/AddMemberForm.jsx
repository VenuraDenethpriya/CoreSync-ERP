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
import { isValidPhoneNumber } from "libphonenumber-js";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createTalentPool } from "@/api/hrApi";
import { uploadImageToCloudinary } from "@/api/cloudinaryApi";

const formSchema = z.object({
    CandidateName: z.string().min(2, { message: "Candidate name is required" }),
    Email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
    PhoneNo: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`)
        .refine((val) => isValidPhoneNumber(val), {
            message: "Invalid international phone number",
        }),
    PositionApplied: z.string().min(2, { message: "Position applied for is required" }),
    DateOfApplication: z.date({
        required_error: "Date of application is required",
        invalid_type_error: "That's not a valid date",
    }),
    EvaluationScore: z.coerce.number()
        .min(0, { message: "Evaluation score must be at least 0" })
        .max(10, { message: "Evaluation score must be between 0 and 10" }),
    Comments: z.string().optional(),
    CV: z.any().refine((files) => files?.length > 0, { message: "CV is required" }),
});

const AddMemberForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userID = user?.id;
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            CandidateName: "",
            Email: "",
            PhoneNo: "",
            PositionApplied: "",
            EvaluationScore: "",
            Comments: "",
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
            setIsSubmitting(true);
            let resumeUrl = "";

            if (values.CV && values.CV.length > 0) {
                try {
                    const file = values.CV[0];
                    resumeUrl = await uploadImageToCloudinary(file);
                } catch (uploadError) {
                    console.error("Failed to upload resume:", uploadError);
                    toast.error("Failed to upload resume. Please try again.", { position: "bottom-right" });
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload = {
                candidate_name: values.CandidateName,
                phone: values.PhoneNo,
                email: values.Email,
                date_of_application: values.DateOfApplication,
                position_applied: values.PositionApplied,
                evaluation_score: values.EvaluationScore,
                resume: resumeUrl,
                created_by: userID,
                comments: values.Comments,
            };

            const response = await createTalentPool(token, payload);
            if (response.message == "success") {
                toast.success("Talent pool member added successfully!", { position: "bottom-right" });
                navigate("/hr/talent-pool");
            } else {
                toast.error("Error adding new member! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding new member!", { position: "bottom-right" });
        } finally {
            setIsSubmitting(false);
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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={form.control}
                                name="CandidateName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Candidate Name</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter candidate name" {...field} />
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
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter candidate email address" {...field} />
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
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Position Applied</FormLabel>
                                        <FormControl>
                                            <Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter position applied" {...field} />
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
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Resume</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="bg-slate-50 border-slate-200 h-11 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                onChange={(e) => field.onChange(e.target.files)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-5">
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
                                name="DateOfApplication"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Date of Application</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-11 rounded-xl pl-3 text-left font-normal bg-slate-50 border-slate-200",
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
                                                        head_cell: "w-10 font-medium text-sm text-slate-500 pb-2",
                                                        cell: "h-10 w-10 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                        day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-xl transition-colors",
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
                                name="EvaluationScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Evaluation Score (0 - 10)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" min="0" max="10" className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Enter evaluation score" {...field} />
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
                                        <FormLabel className="text-slate-700 font-semibold text-sm">Comments</FormLabel>
                                        <FormControl>
                                            <textarea className="w-full min-h-[90px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" placeholder="Enter comments..." {...field} />
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
                                {isSubmitting ? "Submitting..." : "Add Member"}
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

export default AddMemberForm;