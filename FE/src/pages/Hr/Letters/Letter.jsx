import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { LockIcon, FileText, Download, Briefcase, UserCheck, AlertTriangle, Award, UserX, Settings } from "lucide-react";
import { Roles } from "@/const/const";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { createAuditLog } from "@/api/settingApi";
import logoImage from "@/assets/logo-long.jpg";

const letterCategories = [
  {
    category: "Recruitment",
    icon: Briefcase,
    letters: ["Offer Letter", "Appointment Letter", "Employment Contract", "Job Description (JD)", "Interview Invitation", "Interview Rejection"]
  },
  {
    category: "Employee Onboarding",
    icon: UserCheck,
    letters: ["Welcome Letter", "Joining Instructions", "Confidentiality Agreement (NDA)", "Code of Conduct Acknowledgement"]
  },
  {
    category: "Employment Changes",
    icon: Settings,
    letters: ["Confirmation Letter", "Probation Extension", "Promotion Letter", "Salary Increment", "Transfer Letter", "Demotion Letter", "Designation Change"]
  },
  {
    category: "Leave & Attendance",
    icon: FileText,
    letters: ["Leave Approval Letter", "Leave Rejection Letter", "Return-to-Work Letter", "Warning for Unauthorized Absence"]
  },
  {
    category: "Disciplinary",
    icon: AlertTriangle,
    letters: ["Verbal Warning Record", "First Warning Letter", "Final Warning Letter", "Show Cause Letter", "Suspension Letter", "Hearing Invitation", "Outcome Letter"]
  },
  {
    category: "Appreciation & Recognition",
    icon: Award,
    letters: ["Appreciation Letter", "Certificate of Recognition", "Employee of the Month"]
  },
  {
    category: "Separation",
    icon: UserX,
    letters: ["Resignation Acceptance", "Termination Letter", "Redundancy Letter", "Experience Letter", "Service Certificate", "Relieving Letter", "Full & Final Settlement"]
  },
  {
    category: "General HR",
    icon: FileText,
    letters: ["Salary Verification", "Employment Verification", "No Objection Certificate (NOC)", "Training Nomination", "Policy Update Notice"]
  }
];

const Letter = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("Recruitment");
  const [selectedLetter, setSelectedLetter] = useState("Offer Letter");

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    subject: "",
    bodyText: "Please enter the main content of the letter here...",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDownloadPDF = async () => {
    if (!formData.employeeName) {
      toast.error("Please enter the employee's name.");
      return;
    }

    try {
      const img = new Image();
      img.src = logoImage;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => {
          console.error("Failed to load logo image");
          resolve();
        };
      });

      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(img, "JPEG", margin, 12, 45, 13);
      let cursorY = 40;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${formData.date}`, margin, cursorY);
      cursorY += 10;
      doc.text(`To: ${formData.employeeName}`, margin, cursorY);
      cursorY += 5;
      if (formData.employeeId) {
        doc.text(`Emp ID: ${formData.employeeId}`, margin, cursorY);
        cursorY += 5;
      }
      cursorY += 10;

      if (formData.subject) {
        doc.setFont("helvetica", "bold");
        doc.text(`Subject: ${formData.subject}`, margin, cursorY);
        doc.setFont("helvetica", "normal");
        cursorY += 15;
      }

      doc.text(`Dear ${formData.employeeName},`, margin, cursorY);
      cursorY += 10;

      const splitBody = doc.splitTextToSize(formData.bodyText, 170);
      doc.text(splitBody, margin, cursorY);

      cursorY += (splitBody.length * 5) + 20;

      doc.text("Sincerely,", margin, cursorY);
      cursorY += 15;
      doc.setFont("helvetica", "bold");
      doc.text("Human Resources Department", margin, cursorY);

      const footerY = pageHeight - 30;
      doc.setLineWidth(0.5);
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, footerY, pageWidth - margin, footerY);

      doc.addImage(img, "JPEG", margin, footerY + 4, 38, 11);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("CoreSync Private Limited", 100, footerY + 9, { align: "center" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Address :", 82, footerY + 15, { align: "right" });
      doc.setFont("helvetica", "italic");
      doc.text("No 11, __________, Sril Lanka", 84, footerY + 15);

      doc.setFont("helvetica", "bold");
      doc.text("Contact :", 152, footerY + 9, { align: "right" });
      doc.setFont("helvetica", "italic");
      doc.text("(+94) 743020154", 154, footerY + 9);

      doc.setFont("helvetica", "bold");
      doc.text("Email :", 152, footerY + 15, { align: "right" });

      doc.setFont("helvetica", "italic");
      doc.setTextColor(0, 80, 200);
      doc.text("CoreSync.energy@gmail.com", 154, footerY + 15);

      const emailWidth = doc.getTextWidth("CoreSync.energy@gmail.com");
      doc.setDrawColor(0, 80, 200);
      doc.setLineWidth(0.2);
      doc.line(154, footerY + 15.5, 154 + emailWidth, footerY + 15.5);

      const fileName = `${formData.employeeName}_${selectedLetter.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      const token = await getToken();
      await createAuditLog(token, {
        action: "Letter Generated",
        status_code: 200,
        user: user.id,
        description: `${user.firstName} generated a ${selectedLetter} for ${formData.employeeName}.`,
      });

      toast.success("Letter downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  if (
    user?.publicMetadata?.role === Roles.FINANCE_HEAD ||
    user?.publicMetadata?.role === Roles.FINANCE_ASSISTANT ||
    user?.publicMetadata?.role === Roles.WAREHOUSE_STAFF ||
    user?.publicMetadata?.role === Roles.INVENTORY_MANAGER ||
    user?.publicMetadata?.role === Roles.OFFICE_STAFF ||
    user?.publicMetadata?.role === Roles.SALES_HEAD ||
    user?.publicMetadata?.role === Roles.SALES_TEAM
  ) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full px-4">
        <div className="bg-white shadow-sm rounded-2xl p-8 max-w-md text-center border border-red-100">
          <div className="flex flex-col items-center justify-center gap-3">
            <LockIcon className="w-12 h-12 text-red-500" />
            <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
            <p className="text-sm text-gray-500">
              You are not authorized to access this page. Please contact your
              administrator if you believe this is a mistake.
            </p>
            <Button
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm"
              onClick={() => navigate("/")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">

      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate">
            Document Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a category and template to generate official HR documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-10 px-4"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" /> Export {selectedLetter}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* --- CATEGORIES SIDEBAR --- */}
        <div className="lg:col-span-1 bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-220px)] flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-sm">
            Categories
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {letterCategories.map((cat) => {
              const Icon = cat.icon;
              const isActiveCat = selectedCategory === cat.category;

              return (
                <div key={cat.category} className="mb-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.category);
                      setSelectedLetter(cat.letters[0]);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${isActiveCat ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <Icon size={16} />
                    {cat.category}
                  </button>

                  {isActiveCat && (
                    <div className="ml-6 mt-1 border-l-2 border-slate-100 flex flex-col gap-1">
                      {cat.letters.map((letter) => (
                        <button
                          key={letter}
                          onClick={() => setSelectedLetter(letter)}
                          className={`text-left pl-3 py-1.5 text-xs font-medium rounded-r-xl transition-all ${selectedLetter === letter
                              ? "text-blue-700 font-bold bg-blue-50/50 border-l-2 border-blue-600 -ml-[2px]"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- TEMPLATE EDITOR PANEL --- */}
        <div className="lg:col-span-3 bg-white border border-slate-200/70 rounded-2xl shadow-sm p-6 lg:p-8 h-[calc(100vh-220px)] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <FileText className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">{selectedLetter}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="employeeName" className="text-slate-700 font-semibold text-sm">Employee Name <span className="text-rose-500">*</span></Label>
              <Input
                id="employeeName"
                name="employeeName"
                placeholder="Enter employee name"
                value={formData.employeeName}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="employeeId" className="text-slate-700 font-semibold text-sm">Employee ID (Optional)</Label>
              <Input
                id="employeeId"
                name="employeeId"
                placeholder="e.g. EMP-001"
                value={formData.employeeId}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-slate-700 font-semibold text-sm">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subject" className="text-slate-700 font-semibold text-sm">Subject Line</Label>
              <Input
                id="subject"
                name="subject"
                placeholder={`e.g. ${selectedLetter}`}
                value={formData.subject}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bodyText" className="text-slate-700 font-semibold text-sm">Letter Body Content</Label>
            <Textarea
              id="bodyText"
              name="bodyText"
              rows={12}
              className="w-full border border-slate-200 rounded-xl bg-slate-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none"
              placeholder="Type or paste the main body of the letter here..."
              value={formData.bodyText}
              onChange={handleInputChange}
            />
            <p className="text-xs text-slate-400 mt-1">
              The header, date, greetings, and sign-off are generated automatically. Only type the main paragraphs here.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Letter;