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
import { isValidPhoneNumber } from "libphonenumber-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createEmployee } from "@/api/hrApi";

const formSchema = z.object({
    EmployeeID: z.string().min(2, { message: "Employee ID is required" }),
    EmpFolder: z.string().optional(),
    Surname: z.string().min(2, { message: "Surname is required" }),
    FirstName: z.string().min(2, { message: "First name is required" }),
    SecondName: z.string().min(2, { message: "Second name is required" }),
    NIC: z.string().min(2, { message: "NIC/Passport is required" }),
    PhoneNo: z
        .string()
        .transform((val) => val.startsWith('+') ? val : `+${val}`)
        .refine((val) => isValidPhoneNumber(val), {
            message: "Invalid international phone number",
        }),
    Gender: z.enum(["Male", "Female"], {
        errorMap: () => ({ message: "Gender is required" }),
    }),
    MeritalStatus: z.string().optional(),
    DOB: z.string().optional(),
    Email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
    PermanentAddress: z.string().optional(),
    ResidentialAddress: z.string().optional(),
    State: z.string().optional(),
    Zip: z.string().optional(),
    Department: z.string().optional(),
    JobTitle: z.string().optional(),
    Manager: z.string().optional(),
    HireDate: z.string().optional(),
    HiringSource: z.string().optional(),
    EmployeeType: z.enum(["Full-Time", "Part-Time", "Contract", "Intern"], {
        errorMap: () => ({ message: "Employee type is required" }),
    }),
    EmploymentStatus: z.enum(["Active", "On Leave", "Others", "Terminated"], {
        errorMap: () => ({ message: "Employment status is required" }),
    }),
    WorkLocation: z.string().optional(),

    OL: z.string().optional(),
    LOA: z.string().optional(),
    ID: z.string().optional(),
    PersonalFile: z.string().optional(),

    RefNo1: z.string().optional(),
    RefNo2: z.string().optional(),
    RefNo3: z.string().optional(),
    RefNo4: z.string().optional(),
    RefNo5: z.string().optional(),
    RefNo6: z.string().optional(),

    HasAttendece:z.enum(["Yes", "No"], {
        errorMap: () => ({ message: "Please specify if the employee has attendance records" }),
    }),
    Basic: z.string().optional(),
    AfterPromotion: z.string().optional(),
    TransportAllowance: z.string().optional(),
    OvertimeRate: z.string().optional(),
    HasOvertime: z.enum(["Yes", "No"], {
        errorMap: () => ({ message: "Please specify if the employee has overtime" }),
    }),
    OtherAllowance: z.string().optional(),
    TotalSalary: z.string().optional(),
    SalaryPerHour: z.string().optional(),
    salaryPerDay: z.string().optional(),
    SalaryCycle: z.enum(["15", "31"], {
        errorMap: () => ({ message: "Salary cycle is required" }),
    }),
    HasPerformanceBonus: z.enum(["Yes", "No"], {
        errorMap: () => ({ message: "Please specify if the employee has performance bonus" }),
    }),

    HasEpf: z.string().optional(),
    EpfNo: z.string().optional(),
    EtfNo: z.string().optional(),

    NoOfAnnualLeave: z.string().optional(),
    NoOfCasualLeave: z.string().optional(),
    NoOfSickLeave: z.string().optional(),
    NoOfMaternity: z.string().optional(),

    BankName: z.string().optional(),
    Branch: z.string().optional(),
    AccountNo: z.string().optional(),
    AccountHolderName: z.string().optional(),

    ResignationDate: z.string().optional(),
    TerminationDate: z.string().optional(),
    Notes: z.string().optional(),
});

const AddEmployeeForm = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userID = user?.id;
    const navigate = useNavigate();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            EmployeeID: "",
            EmpFolder: "",
            Surname: "",
            FirstName: "",
            SecondName: "",
            NIC: "",
            PhoneNo: "",
            Gender: undefined,
            MeritalStatus: "",
            DOB: "",
            Email: "",
            PermanentAddress: "",
            ResidentialAddress: "",
            State: "",
            Zip: "",
            Department: "",
            JobTitle: "",
            Manager: "",
            HireDate: "",
            HiringSource: "",
            EmployeeType: undefined,
            EmploymentStatus: undefined,
            WorkLocation: "",
            OL: "",
            LOA: "",
            ID: "",
            PersonalFile: "",
            RefNo1: "",
            RefNo2: "",
            RefNo3: "",
            RefNo4: "",
            RefNo5: "",
            RefNo6: "",
            HasAttendece: "",
            Basic: "",
            AfterPromotion: "",
            TransportAllowance: "",
            OvertimeRate: "",
            HasOvertime: undefined,
            OtherAllowance: "",
            TotalSalary: "",
            SalaryPerHour: "",
            salaryPerDay: "",
            SalaryCycle: undefined,
            HasPerformanceBonus: undefined,
            HasEpf: undefined,
            EpfNo: "",
            EtfNo: "",
            NoOfAnnualLeave: "",
            NoOfCasualLeave: "",
            NoOfSickLeave: "",
            NoOfMaternity: "",
            BankName: "",
            Branch: "",
            AccountNo: "",
            AccountHolderName: "",
            ResignationDate: "",
            TerminationDate: "",
            Notes: "",
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

            const toBool = (val) => val === "Yes" || val === true || val === "true";
            const formatDate = (dateStr) => {
                if (!dateStr) return null;
                return `${dateStr}T00:00:00Z`;
            };

            const payload = {
                emp_id: values.EmployeeID,
                emp_folder: values.EmpFolder,
                surname: values.Surname,
                first_name: values.FirstName,
                last_name: values.SecondName,
                phone: values.PhoneNo,
                email: values.Email,
                nic: values.NIC,
                permanent_address: values.PermanentAddress,
                residential_address: values.ResidentialAddress,
                state: values.State,
                zip_code: values.Zip,
                marital_status: values.MeritalStatus,
                gender: values.Gender,
                date_of_birth: formatDate(values.DOB),
                job_title: values.JobTitle,
                manager: values.Manager,
                employee_type: values.EmployeeType,
                employment_status: values.EmploymentStatus,
                hire_date: formatDate(values.HireDate),
                hire_source: values.HiringSource,
                work_location: values.WorkLocation,
                department: values.Department,
                rer_no_p: values.RefNo1,
                rer_no_o: values.RefNo2,
                rer_no_s: values.RefNo3,
                rer_no_c: values.RefNo4,
                rer_no_w: values.RefNo5,
                rer_no_a: values.RefNo6,

                basic_salary: Number(values.Basic) || 0,
                after_promotion_salary: Number(values.AfterPromotion) || 0,
                transport_allowance: Number(values.TransportAllowance) || 0,
                other_allowance: Number(values.OtherAllowance) || 0,
                overtime_rate: Number(values.OvertimeRate) || 0,
                salary_per_hour: Number(values.SalaryPerHour) || 0,
                salary_per_day: Number(values.salaryPerDay) || 0,
                total_salary: Number(values.TotalSalary) || 0,

                no_of_annual_leave: Number(values.NoOfAnnualLeave) || 0,
                no_of_casual_leave: Number(values.NoOfCasualLeave) || 0,
                no_of_sick_leave: Number(values.NoOfSickLeave) || 0,
                no_of_maternity_leave: Number(values.NoOfMaternity) || 0,

                has_overtime: toBool(values.HasOvertime),
                has_attendance: toBool(values.HasAttendece),
                has_performance_bonus: toBool(values.HasPerformanceBonus),

                salary_cycle: values.SalaryCycle,
                has_epf: toBool(values.HasEpf),
                epf_no: values.EpfNo,
                etf_no: values.EtfNo,
                ol: values.OL,
                loa: values.LOA,
                id_status: values.ID,
                personal_file: values.PersonalFile,
                bank_name: values.BankName,
                branch: values.Branch,
                account_no: values.AccountNo,
                account_holder_name: values.AccountHolderName,
                resignation_date: formatDate(values.ResignationDate),
                termination_date: formatDate(values.TerminationDate),
                notes: values.Notes,
                created_by: userID,
            };

            const response = await createEmployee(token, payload);
            if (response.message == "success") {
                toast.success("Employee added successfully!", { position: "bottom-right" });
                navigate("/hr/employees");
            } else {
                toast.error("Error adding employee! " + response.message, { position: "bottom-right" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Error adding employee!", { position: "bottom-right" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleClose = () => {
        navigate("/hr/employees");
    }

    const handleClearAll = () => {
        form.reset();
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">

                    <Tabs defaultValue="Employee" className="w-full">
                        <div className="overflow-x-auto pb-1 mb-6">
                            <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
                                <TabsTrigger value="Employee" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Employee</TabsTrigger>
                                <TabsTrigger value="Position" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Position</TabsTrigger>
                                {/* <TabsTrigger value="Reference" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Reference</TabsTrigger> */}
                                <TabsTrigger value="Salary" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Salary</TabsTrigger>
                                <TabsTrigger value="Leaves" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Leaves</TabsTrigger>
                                {/* <TabsTrigger value="Letters" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Letters</TabsTrigger> */}
                                <TabsTrigger value="Bank" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Bank</TabsTrigger>
                                <TabsTrigger value="Other" className="rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm">Other</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* --- EMPLOYEE TAB --- */}
                        <TabsContent value="Employee">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Employee Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="EmployeeID" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Employee ID</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="EMP001" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="FirstName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">First Name</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="First Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="PhoneNo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Phone No.</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="94XXXXXXXXX" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />


                                        <FormField control={form.control} name="NIC" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">NIC / Passport No.</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="NIC / Passport No." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />



                                        {/* <FormField control={form.control} name="State" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">State</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="State" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}

                                        <FormField control={form.control} name="MeritalStatus" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Marital Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select Marital Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Single">Single</SelectItem>
                                                        <SelectItem value="Married">Married</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="PermanentAddress" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Permanent Address</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Permanent Address" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />


                                    </div>

                                    <div className="flex flex-col gap-5">
                                        {/* <FormField control={form.control} name="EmpFolder" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">EMP Folder</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="EMP Folder" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}
                                        <FormField control={form.control} name="Surname" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Surname</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Surname" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="SecondName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Second Name</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Second Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />




                                        <FormField control={form.control} name="Email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Email</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="john@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="DOB" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Date of Birth</FormLabel>
                                                <FormControl><Input type="date" className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />



                                        {/* <FormField control={form.control} name="Zip" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Zip Code</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Zip Code" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}

                                        <FormField control={form.control} name="Gender" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Gender</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select Gender" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Male">Male</SelectItem>
                                                        <SelectItem value="Female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="ResidentialAddress" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Residential Address</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Residential Address" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />


                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- POSITION TAB --- */}
                        <TabsContent value="Position">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Position Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="JobTitle" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Job Title</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Job Title" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="EmployeeType" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Employee Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select Employee Type" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                                                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                                                        <SelectItem value="Contract">Contract</SelectItem>
                                                        <SelectItem value="Intern">Intern</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="HireDate" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Hire Date</FormLabel>
                                                <FormControl><Input type="date" className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="WorkLocation" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Work Location</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Work Location" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="Manager" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Manager</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Manager Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="EmploymentStatus" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Employment Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Active">Active</SelectItem>
                                                        <SelectItem value="On Leave">On Leave</SelectItem>
                                                        <SelectItem value="Terminated">Terminated</SelectItem>
                                                        <SelectItem value="Others">Others</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="HiringSource" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Hiring Source</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Hiring Source" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="Department" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Department</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Department" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- REFERENCE TAB --- */}
                        <TabsContent value="Reference">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Reference Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="RefNo1" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">RER No | PEM</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="RER No | PEM" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="RefNo3" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">RER No | SCRT</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="RER No | SCRT" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="RefNo5" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">RER No | WRN</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="RER No | WRN" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="RefNo2" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">RER No | OL</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="RER No | OL" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="RefNo4" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">RER No | CNF</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="RER No | CNF" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="RefNo6" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">RER No | APT</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="RER No | APT" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- SALARY TAB --- */}
                        <TabsContent value="Salary">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Salary Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="Basic" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Basic Salary</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Basic Salary" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="TransportAllowance" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Transport Allowance</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Transport Allowance" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="HasOvertime" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Has Overtime</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="HasAttendece" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Has Attendance Software</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="SalaryPerHour" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Salary Per Hour</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Salary Per Hour" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="SalaryCycle" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Salary Cycle</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select Salary Cycle" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="15">15</SelectItem>
                                                        <SelectItem value="31">31</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="EpfNo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">EPF No</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="EPF No" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        {/* <FormField control={form.control} name="AfterPromotion" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">After Promotion Salary</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="After Promotion Salary" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} /> */}

                                        <FormField control={form.control} name="OtherAllowance" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Other Allowance</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Other Allowance" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="OvertimeRate" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Overtime Rate</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Overtime Rate" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="HasPerformanceBonus" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Has Performance Bonus</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="salaryPerDay" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Salary Per Day</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Salary Per Day" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="TotalSalary" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Total Salary</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Total Salary" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                        <FormField control={form.control} name="HasEpf" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Has EPF/ ETF</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="EtfNo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">ETF No</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="ETF No" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />


                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- LEAVES TAB --- */}
                        <TabsContent value="Leaves">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Leave Quota Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="NoOfAnnualLeave" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">No Of Annual Leave</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="No Of Annual Leave" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="NoOfCasualLeave" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">No Of Casual Leave</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="No Of Casual Leave" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="NoOfSickLeave" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">No Of Sick Leave</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="No Of Sick Leave" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="NoOfMaternity" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">No Of Maternity Leave</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="No Of Maternity Leave" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- LETTERS TAB --- */}
                        <TabsContent value="Letters">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Letters and Documentation</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="OL" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">OL</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select OL Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="ID" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">ID</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select ID Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="LOA" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">LOA</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select LOA Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="PersonalFile" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Personal File</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yes">Yes</SelectItem>
                                                        <SelectItem value="No">No</SelectItem>
                                                        <SelectItem value="Pending">Pending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- BANK TAB --- */}
                        <TabsContent value="Bank">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Bank Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="BankName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Bank Name</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Bank Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="AccountNo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Account No</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Account No" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="Branch" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Branch</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Branch" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="AccountHolderName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Account Holder Name</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Account Holder Name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- OTHER TAB --- */}
                        <TabsContent value="Other">
                            <div className="p-6 border border-slate-200/70 rounded-2xl shadow-sm bg-slate-50/50 space-y-6">
                                <h2 className="font-bold text-lg text-slate-800">Other Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="ResignationDate" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Resignation Date</FormLabel>
                                                <FormControl><Input type="date" className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="Notes" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Notes</FormLabel>
                                                <FormControl><Input className="bg-slate-50 border-slate-200 h-11 rounded-xl" placeholder="Notes" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <FormField control={form.control} name="TerminationDate" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-sm">Termination Date</FormLabel>
                                                <FormControl><Input type="date" className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* --- FOOTER ACTIONS --- */}
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
                                {isSubmitting ? "Submitting..." : "Add Employee"}
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

export default AddEmployeeForm;