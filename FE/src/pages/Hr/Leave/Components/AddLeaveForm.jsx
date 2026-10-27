import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MdOutlineRefresh } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { AlertCircle, CalendarRange, Palmtree, Stethoscope, Baby, User, Paperclip } from "lucide-react";
import { createLeaveRequest, featchMyInfo, fetchEmployeeList, fetchPublicHolidays } from "@/api/hrApi";
import { uploadImageToCloudinary } from "@/api/cloudinaryApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Roles } from "@/const/const";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_FILE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
];

const formSchema = z.object({
    employeeId: z.string().optional(),
    type: z.string().min(1, "Please select a leave type"),
    dates: z.array(z.date()).min(1, "Please select at least one date from the calendar"),
    reason: z.string().optional(),
    proof: z
        .any()
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
        .refine(
            (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
            "Only .jpg, .jpeg, .png and .pdf formats are supported."
        ),
});

const AddLeaveForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const navigate = useNavigate();

    const [myInfoData, setMyInfoData] = useState(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);
    const [holidays, setHolidays] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employeeData, setEmployeeData] = useState([]);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "",
            dates: [],
            reason: "",
            proof: undefined,
        },
    });

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const token = await getToken();
                const response = await fetchEmployeeList(token, debouncedSearch, limit, offset);
                const apiData = response?.data?.employees || [];
                setTotal(response.data.total_employees || 0);

                const mappedData = apiData
                    .map((emp) => ({
                        id: emp.id,
                        empID: emp.emp_id,
                        empName: emp.emp_name,
                        createdAt: emp.created_at,
                    }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setEmployeeData(mappedData);
            } catch (error) {
                console.error("Error fetching employee list:", error);
            }
        };

        fetchEmployeeData();
    }, [getToken, debouncedSearch, limit, offset]);

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const token = await getToken();
                const res = await featchMyInfo(token, email);
                setMyInfoData(res.data);
            } catch (error) {
                toast.error("Failed to load your leave balances.");
            } finally {
                setIsLoadingInfo(false);
            }
        };
        if (email) fetchBalances();
    }, [email, getToken]);

    useEffect(() => {
        const loadHolidays = async () => {
            try {
                const holidayDates = await fetchPublicHolidays();
                setHolidays(holidayDates);
            } catch (error) {
                console.error("Failed to load holidays:", error);
            }
        };
        loadHolidays();
    }, []);

    async function handleSubmit(values) {
        try {
            const token = await getToken();
            setIsSubmitting(true);

            let fileUrl = "";

            if (values.proof) {
                try {
                    const file = values.proof;
                    fileUrl = await uploadImageToCloudinary(file);
                } catch (uploadError) {
                    console.error("Failed to upload document:", uploadError);
                    toast.error("Failed to upload document. Please try again.", { position: "bottom-right" });
                    setIsSubmitting(false);
                    return;
                }
            }

            const formattedDates = values.dates.map(date => date.toISOString());

            const payload = {
                employee_id: values.employeeId || myInfoData?.id,
                type: values.type,
                dates: formattedDates,
                year: new Date().getFullYear().toString(),
                reason: values.reason,
                proof: fileUrl,
                created_by: user?.id
            };

            const response = await createLeaveRequest(token, payload);

            if (response.message === "success") {
                toast.success("Leave request submitted successfully!", { position: "bottom-right" });
                if (!values.employeeId) {
                    navigate("/myinfo");
                } else {
                    navigate("/hr/leave");
                }
            } else {
                toast.error("Error: " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit leave request.", { position: "bottom-right" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => navigate("/myinfo");
    const handleClearAll = () => form.reset();

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) return true;

        return holidays.some(
            (holiday) =>
                date.getDate() === holiday.getDate() &&
                date.getMonth() === holiday.getMonth() &&
                date.getFullYear() === holiday.getFullYear()
        );
    };

    return (
        <div className="w-full">
            {/* --- LEAVE BALANCES REMINDER --- */}
            {!isLoadingInfo && myInfoData && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <BalanceCard title="Annual" icon={Palmtree} color="text-emerald-500" total={myInfoData.no_of_annual_leave} taken={myInfoData.taken_annual_leave} />
                    <BalanceCard title="Casual" icon={User} color="text-blue-500" total={myInfoData.no_of_casual_leave} taken={myInfoData.taken_casual_leave} />
                    <BalanceCard title="Sick" icon={Stethoscope} color="text-rose-500" total={myInfoData.no_of_sick_leave} taken={myInfoData.taken_sick_leave} />
                    <BalanceCard title="Maternity" icon={Baby} color="text-purple-500" total={myInfoData.no_of_maternity_leave} taken={myInfoData.taken_maternity_leave} />
                </div>
            )}

            {/* --- FORM SECTION --- */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                        {/* Left Column: Enlarged Multi-Month Calendar */}
                        <div className="xl:col-span-8 bg-slate-50/50 p-6 border border-slate-200/70 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                                    <CalendarRange className="text-blue-600" size={18} />
                                    Select Leave Dates
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-slate-200/70 flex justify-center w-full overflow-hidden shadow-sm">
                                <FormField
                                    control={form.control}
                                    name="dates"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-full">
                                            <FormControl>
                                                <Calendar
                                                    mode="multiple"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={isDateDisabled}
                                                    numberOfMonths={isSmallScreen ? 1 : 2}
                                                    pagedNavigation
                                                    className="bg-transparent w-full flex justify-center"
                                                    classNames={{
                                                        months: "flex flex-col md:flex-row space-y-4 md:space-x-8 md:space-y-0 w-full justify-center",
                                                        month: "space-y-4 w-full flex flex-col items-center",
                                                        caption: "flex justify-center pt-1 relative items-center w-full mb-2",
                                                        caption_label: "text-sm sm:text-base font-semibold text-slate-800",
                                                        nav: "space-x-1 flex items-center",
                                                        nav_button: "h-8 w-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 shadow-sm",
                                                        nav_button_previous: "absolute left-1",
                                                        nav_button_next: "absolute right-1",
                                                        table: "w-full border-collapse space-y-1",
                                                        head_row: "flex w-full justify-between mb-2",
                                                        head_cell: "w-9 sm:w-10 text-slate-400 font-semibold text-xs text-center",
                                                        row: "flex w-full justify-between mt-2",
                                                        cell: "h-9 w-9 sm:h-10 sm:w-10 text-center p-0 relative focus-within:relative focus-within:z-20",
                                                        day: "h-9 w-9 sm:h-10 sm:w-10 p-0 font-medium aria-selected:opacity-100 rounded-xl transition-colors text-sm flex items-center justify-center",
                                                        day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white shadow-sm",
                                                        day_today: "bg-slate-100 text-slate-900 font-bold",
                                                    }}
                                                    modifiers={{ holiday: holidays }}
                                                    modifiersStyles={{
                                                        holiday: { color: '#ef4444', fontWeight: 'bold', textDecoration: 'underline' }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <div className="mt-6 flex flex-col sm:flex-row gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                                                <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Public Holidays Disabled</p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Right Column: Leave Details */}
                        <div className="xl:col-span-4 space-y-6 flex flex-col">
                            <div className="bg-slate-50/50 p-6 border border-slate-200/70 rounded-2xl shadow-sm flex-1 space-y-5">
                                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-200/70 pb-3">Leave Details</h3>

                                <div className="space-y-4">
                                    {(user?.publicMetadata?.role === Roles.SUPER_ADMIN || 
                                      user?.publicMetadata?.role === Roles.HEAD || 
                                      user?.publicMetadata?.role === Roles.HR_HEAD || 
                                      user?.publicMetadata?.role === Roles.HR_ASSISTANT) && (
                                        <FormField
                                            control={form.control}
                                            name="employeeId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-slate-700 font-semibold text-sm">Employee Name</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                                <SelectValue placeholder="Select employee name" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {employeeData?.map((emp) => (
                                                                <SelectItem key={emp.id} value={emp.id}>
                                                                    {emp.empName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Leave Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
                                                            <SelectValue placeholder="Select type of leave" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Annual">Annual Leave</SelectItem>
                                                        <SelectItem value="Casual">Casual Leave</SelectItem>
                                                        <SelectItem value="Sick">Sick Leave</SelectItem>
                                                        <SelectItem value="Maternity">Maternity Leave</SelectItem>
                                                        <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Reason for Leave</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please provide a brief explanation..."
                                                        className="resize-none bg-slate-50 border-slate-200 rounded-xl p-3 h-24 focus:bg-white transition-all"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* --- PROOF FILE UPLOAD --- */}
                                    <FormField
                                        control={form.control}
                                        name="proof"
                                        render={({ field: { value, onChange, ...fieldProps } }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                                                    Supporting Document <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...fieldProps}
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="bg-slate-50 border-slate-200 h-11 rounded-xl cursor-pointer file:text-blue-700 file:bg-blue-50 file:border-0 file:rounded-lg file:mr-3 file:px-3 file:py-1 hover:file:bg-blue-100"
                                                        onChange={(event) => {
                                                            const file = event.target.files && event.target.files[0];
                                                            onChange(file || undefined);
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                                                    <Paperclip size={12} />
                                                    Accepts PDF, JPG, PNG up to 5MB. E.g., Medical Certificate.
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Summary Box */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-6">
                                        <AlertCircle className="text-blue-600 mt-0.5 shrink-0" size={18} />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-semibold mb-1">Request Summary</p>
                                            <p>You have selected <strong>{form.watch("dates").length}</strong> days.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center items-center gap-4 pt-6 border-t border-slate-100 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm shadow-sm transition-all w-full sm:w-auto"
                            onClick={handleClearAll}
                        >
                            <MdOutlineRefresh className="text-lg" />
                            Clear Form
                        </Button>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-6 w-full sm:w-auto"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-8 w-full sm:w-auto"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Request"}
                            </Button>
                        </div>
                    </div>

                </form>
            </Form>
        </div>
    );
};

function BalanceCard({ title, icon: Icon, color, total = 0, taken = 0 }) {
    const remaining = total - taken;
    return (
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-600 flex items-center gap-2 text-sm">
                    <Icon size={16} className={color} />
                    {title}
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800">{remaining}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Left</span>
            </div>
        </div>
    );
}

export default AddLeaveForm;