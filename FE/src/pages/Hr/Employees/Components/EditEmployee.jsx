import { updateEmployee } from "@/api/hrApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil } from "lucide-react";

export function EditEmployee({ onUpdate, employeeData }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const employeeId = employeeData?.id;

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee Tab
  const [empID, setEmpID] = useState("");
  const [empFolder, setEmpFolder] = useState("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNo, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nic, setNic] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  // Position Tab
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [manager, setManager] = useState("");
  const [empStatus, setEmpStatus] = useState("");
  const [empType, setEmpType] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [hireSource, setHireSource] = useState("");
  const [workLocation, setWorkLocation] = useState("");

  // Reference Tab
  const [ref1, setRef1] = useState("");
  const [ref2, setRef2] = useState("");
  const [ref3, setRef3] = useState("");
  const [ref4, setRef4] = useState("");
  const [ref5, setRef5] = useState("");
  const [ref6, setRef6] = useState("");

  // Salary Tab
  const [basicSalary, setBasicSalary] = useState("");
  const [afterPromotionSalary, setAfterPromotionSalary] = useState("");
  const [transportAllowance, setTransportAllowance] = useState("");
  const [otherAllowance, setOtherAllowance] = useState("");
  const [hasOvertime, setHasOvertime] = useState(false);
  const [overtimeRate, setOvertimeRate] = useState("");
  const [hasAttendance, setHasAttendance] = useState(false);
  const [hasPerformanceBonus, setHasPerformanceBonus] = useState(false);
  const [salaryPerHour, setSalaryPerHour] = useState("");
  const [salaryPerDay, setSalaryPerDay] = useState("");
  const [salaryCycle, setSalaryCycle] = useState("");
  const [totalSalary, setTotalSalary] = useState("");
  const [hasEpfEtf, setHasEpfEtf] = useState(false);
  const [epfNo, setEpfNo] = useState("");
  const [etfNo, setEtfNo] = useState("");
  const [noOfAnnualLeave, setNoOfAnnualLeave] = useState("");
  const [noOfCasualLeave, setNoOfCasualLeave] = useState("");
  const [noOfSickLeave, setNoOfSickLeave] = useState("");
  const [noOfMaternityLeave, setNoOfMaternityLeave] = useState("");

  // Letters Tab
  const [ol, setOl] = useState("");
  const [loa, setLoa] = useState("");
  const [idStatus, setIdStatus] = useState("");
  const [personalFiles, setPersonalFiles] = useState("");

  // Bank Tab
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");

  // Other Tab
  const [resignationDate, setResignationDate] = useState("");
  const [terminationDate, setTerminationDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && employeeData) {
      setEmpID(employeeData.emp_id || "");
      setEmpFolder(employeeData.emp_folder || "");
      setSurname(employeeData.surname || "");
      setFirst(employeeData.first_name || "");
      setLastName(employeeData.last_name || "");
      setPhone(employeeData.phone || "");
      setEmail(employeeData.email || "");
      setNic(employeeData.nic || "");
      setAddress1(employeeData.permanent_address || "");
      setAddress2(employeeData.residential_address || "");
      setState(employeeData.state || "");
      setZipCode(employeeData.zip_code || "");
      setMaritalStatus(employeeData.marital_status || "");
      setGender(employeeData.gender || "");
      setDob(employeeData.date_of_birth || "");

      setJobTitle(employeeData.job_title || "");
      setDepartment(employeeData.department || "");
      setManager(employeeData.manager || "");
      setEmpStatus(employeeData.employment_status || "");
      setEmpType(employeeData.employee_type || "");
      setHireDate(employeeData.hire_date || "");
      setHireSource(employeeData.hire_source || "");
      setWorkLocation(employeeData.work_location || "");

      setRef1(employeeData.rer_no_p || "");
      setRef2(employeeData.rer_no_o || "");
      setRef3(employeeData.rer_no_s || "");
      setRef4(employeeData.rer_no_c || "");
      setRef5(employeeData.rer_no_w || "");
      setRef6(employeeData.rer_no_a || "");

      setBasicSalary(employeeData.basic_salary || "");
      setAfterPromotionSalary(employeeData.after_promotion_salary || "");
      setTransportAllowance(employeeData.transport_allowance || "");
      setOtherAllowance(employeeData.other_allowance || "");
      setHasOvertime(employeeData.has_overtime || false);
      setOvertimeRate(employeeData.overtime_rate || "");
      setHasAttendance(employeeData.has_attendance || false);
      setHasPerformanceBonus(employeeData.has_performance_bonus || false);
      setHasEpfEtf(employeeData.has_epf ? true : false);
      setSalaryPerHour(employeeData.salary_per_hour || "");
      setSalaryPerDay(employeeData.salary_per_day || "");
      setSalaryCycle(employeeData.salery_cycle || "");
      setTotalSalary(employeeData.total_salary || "");
      setEpfNo(employeeData.epf_no || "");
      setEtfNo(employeeData.etf_no || "");
      setNoOfAnnualLeave(employeeData.no_of_annual_leave || "");
      setNoOfCasualLeave(employeeData.no_of_casual_leave || "");
      setNoOfSickLeave(employeeData.no_of_sick_leave || "");
      setNoOfMaternityLeave(employeeData.no_of_maternity_leave || "");

      setOl(employeeData.ol || "");
      setLoa(employeeData.loa || "");
      setIdStatus(employeeData.id_status || "");
      setPersonalFiles(employeeData.personal_file || "");

      setBankName(employeeData.bank_name || "");
      setBranch(employeeData.branch || "");
      setAccountNo(employeeData.account_no || "");
      setAccountName(employeeData.account_holder_name || "");

      setResignationDate(employeeData.resignation_date || "");
      setTerminationDate(employeeData.termination_date || "");
      setNotes(employeeData.notes || "");
    }
  }, [open, employeeData]);

  const handleEditEmployeeSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = await getToken();
      const response = await updateEmployee(token, {
        id: employeeId,
        emp_id: empID,
        emp_folder: empFolder,
        surname: surname,
        first_name: firstName,
        last_name: lastName,
        phone: phoneNo,
        email: email,
        nic: nic,
        permanent_address: address1,
        residential_address: address2,
        state: state,
        zip_code: zipCode,
        marital_status: maritalStatus,
        gender: gender,
        date_of_birth: dob ? new Date(dob).toISOString() : null,
        job_title: jobTitle,
        manager: manager,
        employee_type: empType,
        employment_status: empStatus,
        hire_date: hireDate ? new Date(hireDate).toISOString() : null,
        hire_source: hireSource,
        work_location: workLocation,
        department: department,
        rer_no_p: ref1,
        rer_no_o: ref2,
        rer_no_s: ref3,
        rer_no_c: ref4,
        rer_no_w: ref5,
        rer_no_a: ref6,

        basic_salary: Number(basicSalary) || 0,
        after_promotion_salary: Number(afterPromotionSalary) || 0,
        transport_allowance: Number(transportAllowance) || 0,
        other_allowance: Number(otherAllowance) || 0,
        overtime_rate: Number(overtimeRate) || 0,
        salary_per_hour: Number(salaryPerHour) || 0,
        salary_per_day: Number(salaryPerDay) || 0,
        total_salary: Number(totalSalary) || 0,
        salery_cycle: salaryCycle,

        no_of_annual_leave: Number(noOfAnnualLeave) || 0,
        no_of_casual_leave: Number(noOfCasualLeave) || 0,
        no_of_sick_leave: Number(noOfSickLeave) || 0,
        no_of_maternity_leave: Number(noOfMaternityLeave) || 0,

        has_overtime: Boolean(hasOvertime),
        has_attendance: Boolean(hasAttendance),
        has_performance_bonus: Boolean(hasPerformanceBonus),
        has_epf: Boolean(hasEpfEtf),
        epf_no: epfNo,
        etf_no: etfNo,
        ol: ol,
        loa: loa,
        id_status: idStatus,
        personal_file: personalFiles,
        bank_name: bankName,
        branch: branch,
        account_no: accountNo,
        account_holder_name: accountName,
        resignation_date: resignationDate ? new Date(resignationDate).toISOString() : null,
        termination_date: terminationDate ? new Date(terminationDate).toISOString() : null,
        notes: notes,
        created_by: user?.id,
      });

      if (response.message === "success") {
        toast.success("Employee updated successfully!", { position: "bottom-right" });
        setOpen(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error("Error updating employee! " + response.message, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Error updating employee! Please try again.", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabTriggerClass = "rounded-t-xl border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4">
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Employee</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to employee details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditEmployeeSubmit} className="space-y-6 pt-4">
          <Tabs defaultValue="Employee" className="w-full">
            <div className="overflow-x-auto pb-1 mb-6">
              <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
                <TabsTrigger value="Employee" className={tabTriggerClass}>Employee</TabsTrigger>
                <TabsTrigger value="Position" className={tabTriggerClass}>Position</TabsTrigger>
                {/* <TabsTrigger value="Reference" className={tabTriggerClass}>Reference</TabsTrigger> */}
                <TabsTrigger value="Salary" className={tabTriggerClass}>Salary</TabsTrigger>
                <TabsTrigger value="Leave" className={tabTriggerClass}>Leave</TabsTrigger>
                {/* <TabsTrigger value="Letters" className={tabTriggerClass}>Letters</TabsTrigger> */}
                <TabsTrigger value="Bank" className={tabTriggerClass}>Bank</TabsTrigger>
                <TabsTrigger value="Other" className={tabTriggerClass}>Other</TabsTrigger>
              </TabsList>
            </div>

            {/* --- EMPLOYEE TAB --- */}
            <TabsContent value="Employee" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="empID" className="text-slate-700 font-semibold text-sm">Employee ID</Label>
                    <Input id="empID" value={empID} onChange={(e) => setEmpID(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  {/* <div className="flex flex-col gap-2">
                    <Label htmlFor="empFolder" className="text-slate-700 font-semibold text-sm">Employee Folder</Label>
                    <Input id="empFolder" value={empFolder} onChange={(e) => setEmpFolder(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div> */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="surname" className="text-slate-700 font-semibold text-sm">Surname</Label>
                    <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName" className="text-slate-700 font-semibold text-sm">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirst(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName" className="text-slate-700 font-semibold text-sm">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="PhoneNo" className="text-slate-700 font-semibold text-sm">Phone No.</Label>
                    <Input id="PhoneNo" value={phoneNo} onChange={(e) => setPhone(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email</Label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="nic" className="text-slate-700 font-semibold text-sm">NIC/Passport No.</Label>
                    <Input id="nic" value={nic} onChange={(e) => setNic(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2 ">
                    <Label htmlFor="dob" className="text-slate-700 font-semibold text-sm">Date of Birth</Label>
                    <input
                      type="date"
                      id="dob"
                      value={dob ? dob.slice(0, 10) : ""}
                      onChange={(e) => setDob(e.target.value)}
                      className="bg-slate-50 border border-slate-200 h-11 rounded-xl px-3 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="maritalStatus" className="text-slate-700 font-semibold text-sm">Marital Status</Label>
                    <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select Marital Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="gender" className="text-slate-700 font-semibold text-sm">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select a gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="address1" className="text-slate-700 font-semibold text-sm">Permanent Address</Label>
                    <Input id="address1" value={address1} onChange={(e) => setAddress1(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="address2" className="text-slate-700 font-semibold text-sm">Residential Address</Label>
                    <Input id="address2" value={address2} onChange={(e) => setAddress2(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  {/* <div className="flex flex-col gap-2">
                    <Label htmlFor="state" className="text-slate-700 font-semibold text-sm">State</Label>
                    <Input id="state" value={state} onChange={(e) => setState(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="zipcode" className="text-slate-700 font-semibold text-sm">Zip Code</Label>
                    <Input id="zipcode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div> */}


                </div>
              </div>
            </TabsContent>

            {/* --- POSITION TAB --- */}
            <TabsContent value="Position" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="jobTitle" className="text-slate-700 font-semibold text-sm">Job Title</Label>
                    <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="manager" className="text-slate-700 font-semibold text-sm">Manager</Label>
                    <Input id="manager" value={manager} onChange={(e) => setManager(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="employeeType" className="text-slate-700 font-semibold text-sm">Employee Type</Label>
                    <Select value={empType} onValueChange={setEmpType}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select employee type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="employeeStatus" className="text-slate-700 font-semibold text-sm">Employee Status</Label>
                    <Select value={empStatus} onValueChange={setEmpStatus}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Select employee status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                        <SelectItem value="Terminated">Terminated</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="HireDate" className="text-slate-700 font-semibold text-sm">Hire Date</Label>
                    <input
                      type="date"
                      id="HireDate"
                      value={hireDate ? hireDate.slice(0, 10) : ""}
                      onChange={(e) => setHireDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 h-11 rounded-xl px-3 w-full text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hireSource" className="text-slate-700 font-semibold text-sm">Hire Source</Label>
                    <Input id="hireSource" value={hireSource} onChange={(e) => setHireSource(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="workLocation" className="text-slate-700 font-semibold text-sm">Work Location</Label>
                    <Input id="workLocation" value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="department" className="text-slate-700 font-semibold text-sm">Department</Label>
                    <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- REFERENCE TAB --- */}
            <TabsContent value="Reference" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ref1" className="text-slate-700 font-semibold text-sm">RER No | PEM</Label>
                    <Input id="ref1" value={ref1} onChange={(e) => setRef1(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ref2" className="text-slate-700 font-semibold text-sm">RER No | OL</Label>
                    <Input id="ref2" value={ref2} onChange={(e) => setRef2(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ref3" className="text-slate-700 font-semibold text-sm">RER No | SCRT</Label>
                    <Input id="ref3" value={ref3} onChange={(e) => setRef3(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ref4" className="text-slate-700 font-semibold text-sm">RER No | CNF</Label>
                    <Input id="ref4" value={ref4} onChange={(e) => setRef4(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ref5" className="text-slate-700 font-semibold text-sm">RER No | WRN</Label>
                    <Input id="ref5" value={ref5} onChange={(e) => setRef5(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ref6" className="text-slate-700 font-semibold text-sm">RER No | APT</Label>
                    <Input id="ref6" value={ref6} onChange={(e) => setRef6(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- SALARY TAB --- */}
            <TabsContent value="Salary" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="basicSalary" className="text-slate-700 font-semibold text-sm">Basic Salary</Label>
                    <Input type="number" id="basicSalary" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  {/* <div className="flex flex-col gap-2">
                    <Label htmlFor="afterPromotionSalary" className="text-slate-700 font-semibold text-sm">After Promotion Salary</Label>
                    <Input type="number" id="afterPromotionSalary" value={afterPromotionSalary} onChange={(e) => setAfterPromotionSalary(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div> */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="transportAllowance" className="text-slate-700 font-semibold text-sm">Transport Allowance</Label>
                    <Input type="number" id="transportAllowance" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="otherAllowance" className="text-slate-700 font-semibold text-sm">Other Allowance</Label>
                    <Input type="number" id="otherAllowance" value={otherAllowance} onChange={(e) => setOtherAllowance(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="totalSalary" className="text-slate-700 font-semibold text-sm">Total Salary</Label>
                    <Input type="number" id="totalSalary" value={totalSalary} onChange={(e) => setTotalSalary(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hasAttendance" className="text-slate-700 font-semibold text-sm">Has Attendance Software</Label>
                    <Select value={hasAttendance ? "Yes" : "No"} onValueChange={(val) => setHasAttendance(val === "Yes")}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Has Attendance Software" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hasPerformanceBonus" className="text-slate-700 font-semibold text-sm">Has Performance Bonus</Label>
                    <Select value={hasPerformanceBonus ? "Yes" : "No"} onValueChange={(val) => setHasPerformanceBonus(val === "Yes")}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Has Performance Bonus" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hasOvertime" className="text-slate-700 font-semibold text-sm">Has Overtime</Label>
                    <Select value={hasOvertime ? "Yes" : "No"} onValueChange={(val) => setHasOvertime(val === "Yes")}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Has Overtime" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="overtimeRate" className="text-slate-700 font-semibold text-sm">Overtime Rate (LKR)</Label>
                    <Input type="number" id="overtimeRate" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="salaryCycle" className="text-slate-700 font-semibold text-sm">Salary Cycle</Label>
                    <Select value={salaryCycle} onValueChange={setSalaryCycle}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Salary Cycle" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="31">31</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="salaryPerHour" className="text-slate-700 font-semibold text-sm">Salary Per Hour (LKR)</Label>
                    <Input type="number" id="salaryPerHour" value={salaryPerHour} onChange={(e) => setSalaryPerHour(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="salaryPerDay" className="text-slate-700 font-semibold text-sm">Salary Per Day (LKR)</Label>
                    <Input type="number" id="salaryPerDay" value={salaryPerDay} onChange={(e) => setSalaryPerDay(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hasEpfEtf" className="text-slate-700 font-semibold text-sm">Has EPF/ ETF</Label>
                    <Select value={hasEpfEtf ? "Yes" : "No"} onValueChange={(val) => setHasEpfEtf(val === "Yes")}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl"><SelectValue placeholder="Has EPF/ ETF" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="epfNo" className="text-slate-700 font-semibold text-sm">EPF No.</Label>
                    <Input id="epfNo" value={epfNo} onChange={(e) => setEpfNo(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="etfNo" className="text-slate-700 font-semibold text-sm">ETF No.</Label>
                    <Input id="etfNo" value={etfNo} onChange={(e) => setEtfNo(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- LEAVE TAB --- */}
            <TabsContent value="Leave" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="noOfAnuualLeave" className="text-slate-700 font-semibold text-sm">No Of Annual Leave</Label>
                    <Input type="number" id="noOfAnuualLeave" value={noOfAnnualLeave} onChange={(e) => setNoOfAnnualLeave(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="noOfCasualLeave" className="text-slate-700 font-semibold text-sm">No Of Casual Leave</Label>
                    <Input type="number" id="noOfCasualLeave" value={noOfCasualLeave} onChange={(e) => setNoOfCasualLeave(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="noOfSickLeave" className="text-slate-700 font-semibold text-sm">No Of Sick Leave</Label>
                    <Input type="number" id="noOfSickLeave" value={noOfSickLeave} onChange={(e) => setNoOfSickLeave(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="noOfMaternityLeave" className="text-slate-700 font-semibold text-sm">No Of Maternity Leave</Label>
                    <Input type="number" id="noOfMaternityLeave" value={noOfMaternityLeave} onChange={(e) => setNoOfMaternityLeave(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- LETTERS TAB --- */}
            <TabsContent value="Letters" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ol" className="text-slate-700 font-semibold text-sm">O/L</Label>
                    <Input id="ol" value={ol} onChange={(e) => setOl(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="loa" className="text-slate-700 font-semibold text-sm">LOA</Label>
                    <Input id="loa" value={loa} onChange={(e) => setLoa(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="idStatus" className="text-slate-700 font-semibold text-sm">ID Status</Label>
                    <Input id="idStatus" value={idStatus} onChange={(e) => setIdStatus(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="personalFiles" className="text-slate-700 font-semibold text-sm">Personal File</Label>
                    <Input id="personalFiles" value={personalFiles} onChange={(e) => setPersonalFiles(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- BANK TAB --- */}
            <TabsContent value="Bank" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bankName" className="text-slate-700 font-semibold text-sm">Bank Name</Label>
                    <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="branch" className="text-slate-700 font-semibold text-sm">Branch</Label>
                    <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="accountNo" className="text-slate-700 font-semibold text-sm">Account No.</Label>
                    <Input id="accountNo" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="accountName" className="text-slate-700 font-semibold text-sm">Account Holder</Label>
                    <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* --- OTHER TAB --- */}
            <TabsContent value="Other" className="mt-0 outline-none">
              <div className="p-6 border border-slate-200/70 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="resignationDate" className="text-slate-700 font-semibold text-sm">Resignation Date</Label>
                    <input
                      type="date"
                      id="resignationDate"
                      value={resignationDate ? resignationDate.slice(0, 10) : ""}
                      onChange={(e) => setResignationDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 h-11 rounded-xl px-3 w-full text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="terminationDate" className="text-slate-700 font-semibold text-sm">Termination Date</Label>
                    <input
                      type="date"
                      id="terminationDate"
                      value={terminationDate ? terminationDate.slice(0, 10) : ""}
                      onChange={(e) => setTerminationDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 h-11 rounded-xl px-3 w-full text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="notes" className="text-slate-700 font-semibold text-sm">Notes</Label>
                    <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-slate-50 border-slate-200 h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}