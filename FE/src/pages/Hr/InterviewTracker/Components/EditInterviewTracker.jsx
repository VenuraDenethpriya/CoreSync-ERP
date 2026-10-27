import { uploadImageToCloudinary } from "@/api/cloudinaryApi";
import { updateTalentPool } from "@/api/hrApi";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export function EditInterviewTracker({ onUpdate, memberData }) {
  const { getToken } = useAuth();
  const memberId = memberData?.id;

  const [open, setOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [positionApplied, setPositionApplied] = useState("");
  const [dateOfApplication, setDateOfApplication] = useState("");
  const [dateOfInterview, setDateOfInterview] = useState("");
  const [evaluationScore, setEvaluationScore] = useState("");
  const [interviewScore, setInterviewScore] = useState("");
  const [resume, setResume] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && memberData) {
      const formatDate = (dateString) => {
        if (!dateString || dateString.startsWith("0001-01-01")) return "";
        return dateString.split("T")[0];
      };
      setCandidateName(memberData.candidate_name || "");
      setPhoneNo(memberData.phone || "");
      setEmail(memberData.email || "");
      setPositionApplied(memberData.position_applied || "");
      setDateOfApplication(formatDate(memberData.date_of_application));
      setDateOfInterview(formatDate(memberData.date_of_interview));
      setEvaluationScore(memberData.evaluation_score || "");
      setInterviewScore(memberData.interview_score || "");
      setResume(memberData.resume || "");
      setComments(memberData.comments || "");
    }
  }, [open, memberData]);

  const handleEditSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setIsSubmitting(true);

      let resumeUrl = typeof resume === "string" ? resume : "";

      if (resume instanceof File) {
        try {
          resumeUrl = await uploadImageToCloudinary(resume);
        } catch (uploadError) {
          console.error("Failed to upload resume:", uploadError);
          toast.error("Failed to upload resume. Please try again.", { position: "bottom-right" });
          setIsSubmitting(false);
          return;
        }
      }

      const token = await getToken();
      const response = await updateTalentPool(token, {
        id: memberId,
        candidate_name: candidateName,
        phone: phoneNo,
        email: email,
        date_of_application: dateOfApplication ? dateOfApplication + "T00:00:00Z" : null,
        date_of_interview: dateOfInterview ? dateOfInterview + "T00:00:00Z" : null,
        position_applied: positionApplied,
        evaluation_score: parseInt(evaluationScore, 10) || 0,
        interview_score: parseInt(interviewScore, 10) || 0,
        resume: resumeUrl,
        comments: comments,
      });

      if (response.message === "success") {
        toast.success("Member updated successfully!", { position: "bottom-right" });
        setOpen(false);

        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error("Error updating member! " + response.message, { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Error updating interview member:", error);
      toast.error("Error updating member! Please try again.", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 px-4">
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] w-full max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/70 p-6 sm:p-8 bg-white shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-extrabold text-slate-800">Edit Candidate</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make changes to candidate details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-5">
            
            {/* Candidate Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="CandidateName" className="text-slate-700 font-semibold text-sm">Candidate Name</Label>
              <Input
                id="CandidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="John Doe"
              />
            </div>

            {/* Phone No */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="PhoneNo" className="text-slate-700 font-semibold text-sm">Phone No.</Label>
              <Input
                id="PhoneNo"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="94XXXXXXXXX"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="Email" className="text-slate-700 font-semibold text-sm">Email</Label>
              <Input
                id="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="john@example.com"
              />
            </div>

            {/* Position Applied */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="PositionApplied" className="text-slate-700 font-semibold text-sm">Position Applied</Label>
              <Input
                id="PositionApplied"
                value={positionApplied}
                onChange={(e) => setPositionApplied(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="Software Engineer"
              />
            </div>

            {/* Date Of Application */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="DateOfApplication" className="text-slate-700 font-semibold text-sm">Date Of Application</Label>
              <Input
                id="DateOfApplication"
                type="date"
                value={dateOfApplication}
                onChange={(e) => setDateOfApplication(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full"
              />
            </div>

            {/* Date Of Interview */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="DateOfInterview" className="text-slate-700 font-semibold text-sm">Date Of Interview</Label>
              <Input
                id="DateOfInterview"
                type="date"
                value={dateOfInterview}
                onChange={(e) => setDateOfInterview(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl w-full"
              />
            </div>

            {/* Evaluation Score */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="EvaluationScore" className="text-slate-700 font-semibold text-sm">Evaluation Score</Label>
              <Input
                id="EvaluationScore"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={evaluationScore}
                onChange={(e) => setEvaluationScore(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="8.5"
              />
            </div>

            {/* Interview Score */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="InterviewScore" className="text-slate-700 font-semibold text-sm">Interview Score</Label>
              <Input
                id="InterviewScore"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={interviewScore}
                onChange={(e) => setInterviewScore(e.target.value)}
                className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                placeholder="9.0"
              />
            </div>

            {/* Resume */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="Resume" className="text-slate-700 font-semibold text-sm">Resume</Label>
              {typeof resume === "string" && resume ? (
                <a
                  href={resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  View Current Resume (PDF/Document)
                </a>
              ) : null}
              <Input
                id="Resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="bg-slate-50 border-slate-200 h-11 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setResume(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Comments */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="Comments" className="text-slate-700 font-semibold text-sm">Comments</Label>
              <Textarea
                id="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full min-h-[90px] border border-slate-200 rounded-xl bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                rows={3}
                placeholder="Enter comments..."
              />
            </div>

          </div>

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