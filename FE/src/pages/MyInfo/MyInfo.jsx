import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Copy, Briefcase, Mail,
  Calendar, Clock, CheckCircle2, XCircle, Plus,
  Palmtree, Stethoscope, Baby, User, ChevronLeft, ChevronRight
} from "lucide-react";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { featchMyInfo } from "@/api/hrApi";

function MyInfo() {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const [myInforData, setMyInfoData] = useState({});
  const [activeTab, setActiveTab] = useState("employee");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchMyInfoData = async () => {
    try {
      const token = await getToken();
      const res = await featchMyInfo(token, email);
      const myInfo = res.data;
      setMyInfoData(myInfo);
    } catch (error) {
      setIsError(true);
      setErrorMessage("Error fetching my info: " + error.message);
      toast.error("Couldn't load my info", { position: "bottom-right" });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMyInfoData().finally(() => {
      setIsLoading(false);
      setIsError(false);
    });
  }, [email, getToken]);

  const tabTriggerClass = "rounded-t-xl border-b-2 border-transparent px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-sm";

  const allLeaveHistory = [
    ...(myInforData.pending_leaves || []),
    ...(myInforData.taken_leaves || []),
    ...(myInforData.rejected_leaves || [])
  ].sort((a, b) => new Date(b.date[0]) - new Date(a.date[0]));

  const leaveMap = {};
  [...(myInforData.taken_leaves || []), ...(myInforData.pending_leaves || [])].forEach((leave) => {
    leave.date.forEach((d) => {
      const localDate = new Date(d);
      const dateStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      leaveMap[dateStr] = leave.status;
    });
  });

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header Profile Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/70 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-200"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-[72px] h-[72px] rounded-full bg-slate-200 flex-shrink-0"></div>
              <div className="space-y-3">
                <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
                <div className="flex gap-3">
                  <div className="h-5 w-32 bg-slate-100 rounded-xl"></div>
                  <div className="h-5 w-40 bg-slate-100 rounded-xl"></div>
                </div>
              </div>
            </div>
            <div className="h-16 w-32 bg-slate-100 rounded-2xl border border-slate-200/70"></div>
          </div>
        </div>

        {/* Tabs Trigger Skeleton */}
        <div className="w-full flex gap-2 overflow-x-hidden pb-1 mb-4 border-b border-slate-200/70">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-slate-200 rounded-t-xl shrink-0"></div>
          ))}
        </div>

        {/* Tab Content Skeleton (Mimics Default InfoCard Tab) */}
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="h-6 w-48 bg-slate-200 rounded-lg mb-6 border-b border-slate-100 pb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col py-1.5 border-b border-slate-100">
                <div className="h-3 w-24 bg-slate-200 rounded mb-2.5"></div>
                <div className="h-4 w-40 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Timestamps Skeleton */}
        <div className="flex justify-end pt-2">
          <div className="space-y-2 text-right w-48">
            <div className="h-3 w-full bg-slate-200 rounded"></div>
            <div className="h-3 w-3/4 bg-slate-200 rounded ml-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState errorMessage={errorMessage} />;

  return (
    <div className="w-full space-y-6">

      {/* --- HEADER PROFILE SECTION --- */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/70 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center p-1 bg-white rounded-full border-2 border-slate-200 flex-shrink-0 shadow-sm">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: "72px",
                      height: "72px",
                    },
                    userButtonTrigger: {
                      padding: "0",
                      margin: "0",
                      boxShadow: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }
                  }
                }}
              />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                {myInforData.first_name} {myInforData.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-xs font-semibold">
                  <Briefcase size={13} />
                  {myInforData.job_title} ({myInforData.department})
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Mail size={13} />
                  {email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
            <div className="text-left md:text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee ID</p>
              <p className="text-base font-extrabold text-slate-800">{myInforData.emp_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 mb-4">
          <TabsList className="inline-flex gap-2 min-w-max border-b border-slate-200/70 bg-transparent h-auto p-0">
            <TabsTrigger value="employee" className={tabTriggerClass}>Profile Data</TabsTrigger>
            <TabsTrigger value="position" className={tabTriggerClass}>Position & Dept</TabsTrigger>
            <TabsTrigger value="salary" className={tabTriggerClass}>Payroll Info</TabsTrigger>
            <TabsTrigger value="leave" className={tabTriggerClass}>Leave Dashboard</TabsTrigger>
            <TabsTrigger value="bank" className={tabTriggerClass}>Bank Details</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employee" className="mt-0 outline-none">
          <InfoCard title="Personal Information">
            <DetailRow label="Surname" value={myInforData.surname} />
            <DetailRow label="Phone No." value={myInforData.phone} />
            <DetailRow label="NIC / Passport No." value={myInforData.nic} />
            <DetailRow label="Date of Birth" value={myInforData.date_of_birth ? new Date(myInforData.date_of_birth).toLocaleDateString() : undefined} />
            <DetailRow label="Gender" value={myInforData.gender} />
            <DetailRow label="Marital Status" value={myInforData.marital_status} />
            <DetailRow label="Permanent Address" value={myInforData.permanent_address} className="md:col-span-2" />
            <DetailRow label="Residential Address" value={myInforData.residential_address} className="md:col-span-2" />
            {/* <DetailRow label="State" value={myInforData.state} />
            <DetailRow label="Zip Code" value={myInforData.zip_code} /> */}
          </InfoCard>
        </TabsContent>

        <TabsContent value="position" className="mt-0 outline-none">
          <InfoCard title="Employment Details">
            <DetailRow label="Job Title" value={myInforData.job_title} />
            <DetailRow label="Department" value={myInforData.department} />
            <DetailRow label="Employee Type" value={myInforData.employee_type} />
            <DetailRow label="Employment Status" value={<StatusBadge status={myInforData.employment_status} />} />
            <DetailRow label="Manager" value={myInforData.manager} />
            <DetailRow label="Work Location" value={myInforData.work_location} />
            <DetailRow label="Hire Date" value={myInforData.hire_date ? new Date(myInforData.hire_date).toLocaleDateString() : undefined} />
            <DetailRow label="Hiring Source" value={myInforData.hire_source} />
          </InfoCard>
        </TabsContent>

        <TabsContent value="salary" className="mt-0 outline-none">
          <InfoCard title="Compensation & Benefits">
            <DetailRow label="Basic Salary" value={`LKR ${myInforData.basic_salary?.toLocaleString()}`} />
            {/* <DetailRow label="After Promotion Salary" value={`LKR ${myInforData.after_promotion_salary?.toLocaleString()}`} /> */}
            <DetailRow label="Transport Allowance" value={`LKR ${myInforData.transport_allowance?.toLocaleString()}`} />
            <DetailRow label="Other Allowance" value={`LKR ${myInforData.other_allowance?.toLocaleString()}`} />
            <DetailRow label="Salary Per Hour" value={`LKR ${myInforData.salary_per_hour?.toLocaleString()}`} />
            <DetailRow label="Salary Per Day" value={`LKR ${myInforData.salary_per_day?.toLocaleString()}`} />
            <DetailRow label="Total Salary" value={<span className="text-emerald-600 font-extrabold">LKR {myInforData.total_salary?.toLocaleString()}</span>} />
            <DetailRow label="Salary Cycle" value={`Day ${myInforData.salery_cycle}`} />
            <DetailRow label="Overtime Status" value={myInforData.has_overtime ? `Yes (Rate: LKR ${myInforData.overtime_rate})` : "No"} />
            <DetailRow label="Performance Bonus" value={myInforData.has_performance_bonus ? "Eligible" : "Not Eligible"} />
            <DetailRow label="EPF/ ETF" value={myInforData.has_epf ? "Eligible" : "Not Eligible"} />
            <DetailRow label="EPF No" value={myInforData.epf_no} />
            <DetailRow label="ETF No" value={myInforData.etf_no} />
          </InfoCard>
        </TabsContent>

        <TabsContent value="bank" className="mt-0 outline-none">
          <InfoCard title="Direct Deposit Details">
            <DetailRow label="Bank Name" value={myInforData.bank_name} />
            <DetailRow label="Branch" value={myInforData.branch} />
            <DetailRow label="Account No" value={myInforData.account_no} />
            <DetailRow label="Account Holder Name" value={myInforData.account_name} />
          </InfoCard>
        </TabsContent>

        {/* --- LEAVE DASHBOARD --- */}
        <TabsContent value="leave" className="mt-0 outline-none">
          <div className="space-y-6">

            {/* Actions & Balances */}
            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Leave Balances</h3>
                  <p className="text-sm text-slate-500">Track your available time off for {new Date().getFullYear()}</p>
                </div>
                <button
                  onClick={() => navigate('/hr/leave/add-leave-request')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm text-sm"
                >
                  <Plus size={16} /> Request Leave
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <LeaveStatCard
                  title="Annual" icon={Palmtree}
                  textColor="text-emerald-500" bgColor="bg-emerald-500"
                  total={myInforData.no_of_annual_leave} taken={myInforData.taken_annual_leave}
                />
                <LeaveStatCard
                  title="Casual" icon={User}
                  textColor="text-blue-500" bgColor="bg-blue-500"
                  total={myInforData.no_of_casual_leave} taken={myInforData.taken_casual_leave}
                />
                <LeaveStatCard
                  title="Sick" icon={Stethoscope}
                  textColor="text-rose-500" bgColor="bg-rose-500"
                  total={myInforData.no_of_sick_leave} taken={myInforData.taken_sick_leave}
                />
                <LeaveStatCard
                  title="Maternity" icon={Baby}
                  textColor="text-purple-500" bgColor="bg-purple-500"
                  total={myInforData.no_of_maternity_leave} taken={myInforData.taken_maternity_leave}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              <div className="lg:col-span-5">
                <LeaveCalendar leaveMap={leaveMap} />
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex-shrink-0">
                  <h3 className="text-lg font-bold text-slate-800">Leave History</h3>
                </div>

                <div className="overflow-y-auto max-h-[420px]">
                  {allLeaveHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No leave requests found.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {allLeaveHistory.map((leave, index) => (
                        <div key={index} className="p-5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-slate-800 text-base">{leave.type} Leave</span>
                                <LeaveStatusBadge status={leave.status} />
                              </div>
                              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                <Calendar size={14} className="text-slate-400" />
                                {leave.date.length} {leave.date.length === 1 ? 'Day' : 'Days'}:
                                <span className="font-semibold text-slate-700">
                                  {leave.date.map(d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })).join(', ')}
                                </span>
                              </p>
                            </div>

                            {leave.status === "Rejected" && (
                              <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-100 sm:max-w-xs w-full flex flex-col gap-2">
                                {leave.rejected_by && (
                                  <div>
                                    <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-rose-500">Rejected By:</span>
                                    <span className="font-medium">{leave.rejected_by}</span>
                                  </div>
                                )}
                                {leave.comment && (
                                  <div>
                                    <span className="font-bold block mb-0.5 text-[10px] uppercase tracking-wider text-rose-500">Reason:</span>
                                    <span>{leave.comment}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </TabsContent>

      </Tabs>

      {/* Timestamps */}
      <div className="flex justify-end pt-2">
        <div className="text-right text-xs text-slate-400 space-y-0.5">
          <p>Profile created on {myInforData.created_at ? new Date(myInforData.created_at).toLocaleDateString() : "N/A"}</p>
          <p>Last updated: {myInforData.updated_at ? new Date(myInforData.updated_at).toLocaleString() : "N/A"}</p>
        </div>
      </div>

    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-6 sm:p-8">
      <h3 className="text-lg font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12">
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value, className = "" }) {
  const isPhoneField = label.includes("Phone");
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!", { position: "bottom-right" });
    }
  };

  return (
    <div className={`flex flex-col py-1.5 ${className}`}>
      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</span>
      <span className="text-sm text-slate-800 font-semibold flex items-center gap-2">
        {value || <span className="text-slate-300 italic font-normal">Not provided</span>}
        {isPhoneField && value && (
          <Copy
            size={14}
            className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
            onClick={handleCopy}
          />
        )}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status) return "N/A";
  const isActive = status.toLowerCase() === "active";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

function LeaveStatCard({ title, icon: Icon, textColor, bgColor, total = 0, taken = 0 }) {
  const totalNum = Number(total) || 0;
  const takenNum = Number(taken) || 0;

  const remaining = Math.max(totalNum - takenNum, 0);
  const percentage = totalNum > 0 ? Math.min((takenNum / totalNum) * 100, 100) : 0;

  return (
    <div className="border border-slate-200/70 rounded-2xl p-5 bg-slate-50/50 flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-slate-700 flex items-center gap-2 text-sm">
          <div className={`p-2 rounded-xl bg-white shadow-sm border border-slate-200/70 ${textColor}`}>
            <Icon size={18} />
          </div>
          {title}
        </span>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-800">{remaining}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Left</span>
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-in-out ${bgColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs font-semibold text-slate-500">
        <span>Allowance: {totalNum}</span>
        <span>Taken: {takenNum}</span>
      </div>
    </div>
  );
}

function LeaveStatusBadge({ status }) {
  let config = { bg: "bg-slate-100", text: "text-slate-700", icon: Clock };

  switch (status) {
    case "Pending":
      config = { bg: "bg-amber-100", text: "text-amber-700", icon: Clock };
      break;
    case "Approved":
      config = { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 };
      break;
    case "Rejected":
      config = { bg: "bg-rose-100", text: "text-rose-700", icon: XCircle };
      break;
  }

  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
      <Icon size={13} /> {status}
    </span>
  );
}

function LeaveCalendar({ leaveMap }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: firstDay })
    .map(() => null)
    .concat(Array.from({ length: daysInMonth }).map((_, i) => i + 1));

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">{monthNames[month]} {year}</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-auto">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="p-2" />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = leaveMap[dateStr];

          let bgClass = "text-slate-700 hover:bg-slate-50 border border-transparent cursor-default";

          if (status === 'Approved') {
            bgClass = "bg-emerald-100 text-emerald-800 font-bold border-emerald-300 shadow-sm";
          } else if (status === 'Pending') {
            bgClass = "bg-amber-100 text-amber-800 font-bold border-amber-300 shadow-sm";
          }

          return (
            <div
              key={idx}
              className={`p-1 flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-colors ${bgClass}`}
              title={status ? `${status} Leave` : ''}
            >
              <span>{day}</span>
              {status && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${status === 'Approved' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-5 mt-6 text-xs font-semibold text-slate-500 justify-center border-t border-slate-100 pt-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300"></div>
          Approved / Taken
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300"></div>
          Pending
        </div>
      </div>
    </div>
  );
}

export default MyInfo;