// [ADDED 2026-10-13] Excess / shortage reports: Admins comment, Eranja approves (named adjustment) or rejects.
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approveDiscrepancy, commentDiscrepancy, fetchDiscrepancies, fetchStockLevels, rejectDiscrepancy, reportDiscrepancy } from "@/api/stockControlApi";
import { Field, StatusBadge, inputCls, notify, when } from "./shared";

const SOURCE = { COUNT: "Month-end count", PACK: "Pack completion (BOM)", OTHER: "Reported" };

export default function DiscrepanciesTab({ status }) {
  const { getToken } = useAuth();
  const [filter, setFilter] = useState("PENDING");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [stock, setStock] = useState([]);
  const [form, setForm] = useState({ inventory_id: "", quantity: "", explanation: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const res = await fetchDiscrepancies(token, filter);
    setRows(res.ok ? res.data?.items || [] : []);
    setLoading(false);
  }, [getToken, filter]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, okText) => {
    const token = await getToken();
    if (notify(await fn(token), okText)) load();
  };

  const comment = (d) => {
    const text = window.prompt(`Admin comment on ${d.item_code} (${d.quantity > 0 ? "+" : ""}${d.quantity}):`, d.admin_comment || "");
    if (text) act((t) => commentDiscrepancy(t, d.id, text), "Comment saved");
  };

  const openReport = async () => {
    const token = await getToken();
    const res = await fetchStockLevels(token, "");
    setStock(res.ok ? res.data?.items || [] : []);
    setForm({ inventory_id: "", quantity: "", explanation: "" });
    setReporting(true);
  };

  const saveReport = async () => {
    const token = await getToken();
    const res = await reportDiscrepancy(token, { inventory_id: form.inventory_id, quantity: Number(form.quantity), explanation: form.explanation });
    if (notify(res, "Reported to Eranja")) {
      setReporting(false);
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <select className={`${inputCls} sm:w-56`} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="PENDING">Waiting for approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </select>
        {status?.is_admin && (
          <Button variant="outline" className="rounded-xl" onClick={openReport}><Plus className="w-4 h-4 mr-2" /> Report excess / shortage</Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Excess / shortage</TableHead>
              <TableHead>From</TableHead>
              <TableHead>What happened</TableHead>
              <TableHead>Admin comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">Loading...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">Nothing here</TableCell></TableRow>
            ) : rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell><div className="font-semibold">{d.item_code}</div><div className="text-xs text-slate-500">{d.item_name}</div></TableCell>
                <TableCell className={`text-right font-semibold ${d.quantity < 0 ? "text-rose-600" : "text-emerald-600"}`}>{d.quantity > 0 ? "+" : ""}{d.quantity}</TableCell>
                <TableCell className="text-xs">{SOURCE[d.source_type] || d.source_type}<div className="text-slate-500">{d.source_ref} · {when(d.created_at)}</div></TableCell>
                <TableCell className="max-w-[260px] text-xs text-slate-600">{d.explanation}</TableCell>
                <TableCell className="max-w-[220px] text-xs text-slate-600">{d.admin_comment || "-"}</TableCell>
                <TableCell><StatusBadge status={d.status} />{d.adjustment_name && <div className="text-xs text-slate-500 mt-1">{d.adjustment_name}</div>}</TableCell>
                <TableCell>
                  {d.status === "PENDING" && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {status?.is_admin && <Button size="sm" variant="outline" className="rounded-xl" onClick={() => comment(d)}>Comment</Button>}
                      {status?.can_approve && <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => act((t) => approveDiscrepancy(t, d.id), "Approved: stock balanced")}>Approve</Button>}
                      {status?.can_approve && <Button size="sm" variant="outline" className="rounded-xl text-rose-600" onClick={() => act((t) => rejectDiscrepancy(t, d.id), "Rejected")}>Reject</Button>}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-slate-500">Stock changes only after approval, under the adjustment name shown. Shortages found at pack completion are already out of stock; approving them records the reason.</p>

      <Dialog open={reporting} onOpenChange={setReporting}>
       <DialogContent className="rounded-2xl sm:max-w-xl px-4">
          <DialogHeader><DialogTitle>Report excess or shortage</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label="Stock item">
              <select className={inputCls} value={form.inventory_id} onChange={(e) => setForm({ ...form, inventory_id: e.target.value })}>
                <option value="">Choose...</option>
                {stock.map((s) => <option key={s.id} value={s.id}>{s.item_code} - {s.item_name}</option>)}
              </select>
            </Field>
            <Field label="Quantity" hint="+ for excess, - for shortage (e.g. -4)"><input type="number" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
            <Field label="What happened to the goods"><textarea className={`${inputCls} h-24 py-2`} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setReporting(false)}>Cancel</Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={!form.inventory_id || !Number(form.quantity) || !form.explanation.trim()} onClick={saveReport}>Send to Eranja</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
