// [ADDED 2026-10-13] Small pieces shared by the Stock Control tabs.
import { useState } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { uploadImageToCloudinary } from "@/api/cloudinaryApi";

export const notify = (res, okText) => {
  if (res?.ok) {
    if (okText) toast.success(okText, { position: "bottom-right" });
    return true;
  }
  toast.error(res?.message || "Something went wrong", { position: "bottom-right" });
  return false;
};

const statusStyle = {
  Draft: "bg-slate-100 text-slate-700",
  "Pending Approval": "bg-amber-100 text-amber-800",
  Approved: "bg-blue-100 text-blue-800",
  Paid: "bg-indigo-100 text-indigo-800",
  shipped: "bg-indigo-100 text-indigo-800",
  Customs: "bg-indigo-100 text-indigo-800",
  "Action Needed": "bg-rose-100 text-rose-700",
  Received: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-700",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-slate-200 text-slate-700",
  OPEN: "bg-amber-100 text-amber-800",
  CLOSED: "bg-emerald-100 text-emerald-800",
};

export const StatusBadge = ({ status }) => (
  <Badge className={`rounded-full border-0 hover:opacity-90 whitespace-nowrap ${statusStyle[status] || "bg-slate-100 text-slate-700"}`}>{status}</Badge>
);

export const Field = ({ label, children, hint }) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-semibold text-slate-700">{label}</span>
    {children}
    {hint && <span className="text-xs text-slate-500">{hint}</span>}
  </label>
);

export const inputCls = "h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

// Photo picker using the existing Cloudinary upload (camera on phones).
export function PhotoPicker({ label, photos, onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const add = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadImageToCloudinary(f));
      onChange([...photos, ...urls]);
    } catch (e) {
      toast.error("Photo upload failed: " + e.message, { position: "bottom-right" });
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <div className="flex flex-wrap gap-2">
        {photos.map((url) => (
          <div key={url} className="relative">
            <a href={url} target="_blank" rel="noreferrer">
              <img src={url} alt={label} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
            </a>
            <button type="button" title="Remove photo" onClick={() => onChange(photos.filter((u) => u !== url))}
              className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 shadow">
              <X className="w-3 h-3 text-rose-600" />
            </button>
          </div>
        ))}
        <label className="w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-xs cursor-pointer hover:bg-slate-50">
          <Camera className="w-5 h-5 mb-1" />
          {uploading ? "Uploading..." : "Add"}
          <input type="file" accept="image/*" capture="environment" multiple className="hidden" disabled={uploading}
            onChange={(e) => { add(Array.from(e.target.files || [])); e.target.value = ""; }} />
        </label>
      </div>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
}

export const Photos = ({ urls }) =>
  urls?.length ? (
    <div className="flex flex-wrap gap-2">
      {urls.map((u) => (
        <a key={u} href={u} target="_blank" rel="noreferrer">
          <img src={u} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
        </a>
      ))}
    </div>
  ) : (
    <span className="text-slate-400">-</span>
  );

export const lkr = (n) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(n || 0);
export const when = (d) => (d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-");
