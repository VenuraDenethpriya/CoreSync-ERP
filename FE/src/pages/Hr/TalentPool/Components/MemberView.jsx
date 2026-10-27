import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ErrorState } from "@/components/Skeleton"; 
import { featchTalentPoolById } from "@/api/hrApi";
import { Badge } from "@/components/ui/badge";

function MemberView() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { talentPoolId } = useParams();

    const [memberData, setmemberData] = useState({});
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchmemberData = async () => {
        try {
            const token = await getToken();
            const res = await featchTalentPoolById(token, talentPoolId);
            const talentPool = res.data;
            setmemberData(talentPool);
        } catch (error) {
            setIsError(true);
            setErrorMessage("Error fetching talent pool data: " + error.message);
            toast.error("Couldn't load talent pool", { position: "bottom-right" });
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchmemberData().finally(() => {
            setIsLoading(false);
            setIsError(false);
        });
    }, [talentPoolId, getToken]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "Appiled":
                return <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-3 py-1 border-0">Applied</Badge>;
            case "Rejected":
                return <Badge className="rounded-full bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold text-xs px-3 py-1 border-0">Rejected</Badge>;
            case "Interview Stage":
                return <Badge className="rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold text-xs px-3 py-1 border-0">Interview Stage</Badge>;
            case "Hold for Future":
                return <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold text-xs px-3 py-1 border-0">Hold for Future</Badge>;
            default:
                return <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-xs px-3 py-1 border-0">{status || "No Status"}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="w-full space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
                        <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Member Details Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="h-6 w-40 bg-slate-200 rounded-lg mb-5"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
                                    <div className="h-4 w-28 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-40 bg-slate-100 rounded mt-2 sm:mt-0"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timestamps Skeleton */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex flex-col space-y-2">
                                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                    <div className="h-4 w-36 bg-slate-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return <ErrorState errorMessage={errorMessage} />;
    }

    return (
        <div className="w-full space-y-6">
            {/* Header Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                        {memberData.candidate_name}
                    </h1>
                    {getStatusBadge(memberData?.status)}
                </div>
            </div>

            <div className="space-y-6">
                {/* Member Details */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <h3 className="text-lg font-bold mb-5 text-slate-800">Member Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        <DetailRow label="Candidate Name" value={memberData.candidate_name} />
                        <DetailRow label="Phone No." value={memberData.phone} />
                        <DetailRow label="Email" value={memberData.email} />
                        <DetailRow label="Position Applied" value={memberData.position_applied} />
                        <DetailRow label="Date of Application" value={memberData.date_of_application ? new Date(memberData.date_of_application).toLocaleDateString() : undefined} />
                        <DetailRow label="Evaluation Score" value={memberData.evaluation_score} />
                        
                        <DetailRow 
                            label="Resume" 
                            value={
                                memberData.resume ? (
                                    <a 
                                        href={memberData.resume} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        View Document <ExternalLink size={14} />
                                    </a>
                                ) : undefined
                            } 
                        />

                        <DetailRow label="Comments" value={memberData.comments} />
                        <DetailRow label="Created By" value={memberData.created_by} />
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200/70">
                    <div className="text-xs sm:text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-16">
                        <Timestamp label="Created At" value={memberData.created_at} />
                        <Timestamp label="Last Updated At" value={memberData.Updated_at} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    const handleCopy = () => {
        if (typeof value === "string" && value) {
            navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard!", { position: "bottom-right" });
        }
    };

    const isPhoneField = label.includes("Phone No");

    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline py-1.5">
            <span className="text-slate-500 text-sm font-semibold">{label}:</span>
            <span className="text-sm text-slate-800 font-medium mt-1 sm:mt-0 flex items-center gap-1.5">
                {value || "N/A"}
                {isPhoneField && value && value !== "N/A" && (
                    <Copy
                        size={15}
                        className="cursor-pointer text-slate-400 hover:text-slate-700 transition-colors"
                        onClick={handleCopy}
                        title="Copy phone number"
                    />
                )}
            </span>
        </div>
    );
}

function Timestamp({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-1">{label}</span>
            <span className="font-semibold text-slate-700 text-sm">{value ? new Date(value).toLocaleString() : "N/A"}</span>
        </div>
    );
}

export default MemberView;