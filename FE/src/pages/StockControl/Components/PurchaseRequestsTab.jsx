// [ADDED 2026-10-13] Purchase requests: raise (manual), submit drafts, approve, pay, receive with photos.
import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Roles } from "@/const/const";
import {
  approvePurchaseRequest, createPurchaseRequest, fetchPurchaseRequest, fetchPurchaseRequests, fetchStockLevels,
  markPurchaseRequestPaid, receivePurchaseRequest, rejectPurchaseRequest, submitPurchaseRequest,
} from "@/api/stockControlApi";
import { Field, PhotoPicker, Photos, StatusBadge, inputCls, lkr, notify, when } from "./shared";

const STATUSES = ["", "Draft", "Pending Approval", "Approved", "Paid", "Received", "Rejected"];
const RAISERS = [Roles.SUPER_ADMIN, Roles.HEAD, Roles.INVENTORY_MANAGER];
const STORE = [Roles.SUPER_ADMIN, Roles.HEAD, Roles.INVENTORY_MANAGER, Roles.WAREHOUSE_STAFF];
const PAYERS = [Roles.FINANCE_HEAD, Roles.SUPER_ADMIN];
const SHIPPING = ["Paid", "shipped", "Customs", "Action Needed"];

const emptyNew = { mode: "existing", inventory_id: "", new_item_code: "", new_item_name: "", quantity: "", amount: "", supplier: "", reason: "", purchase_photos: [] };
const emptyReceive = { quantity: "", received_by: "", goods_photos: [], item_photos: [], remark: "" };

export default function PurchaseRequestsTab({ status }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const [filter, setFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stock, setStock] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyNew);
  const [receiving, setReceiving] = useState(null);
  const [rcv, setRcv] = useState(emptyReceive);
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);

  // New state variables for custom prompt dialogs
  const [submitting, setSubmitting] = useState(null);
  const [submitQty, setSubmitQty] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const res = await fetchPurchaseRequests(token, { status: filter, limit: 100 });
    setRows(res.ok ? res.data?.items || [] : []);
    setLoading(false);
  }, [getToken, filter]);

  useEffect(() => { load(); }, [load]);

  const openNew = async () => {
    const token = await getToken();
    const res = await fetchStockLevels(token, "");
    setStock(res.ok ? res.data?.items || [] : []);
    setForm(emptyNew);
    setCreating(true);
  };

  const chosen = stock.find((s) => s.id === form.inventory_id);
  const needsReason = form.mode === "new" || (chosen && !chosen.is_low);

  const act = async (fn, okText) => {
    setBusy(true);
    const token = await getToken();
    const res = await fn(token);
    setBusy(false);
    if (notify(res, okText)) load();
    return res.ok;
  };

  const saveNew = async () => {
    const body = {
      quantity: Number(form.quantity), amount: Number(form.amount || 0), supplier: form.supplier, reason: form.reason,
      purchase_photos: form.purchase_photos,
      ...(form.mode === "existing" ? { inventory_id: form.inventory_id } : { new_item_code: form.new_item_code, new_item_name: form.new_item_name }),
    };
    if (await act((t) => createPurchaseRequest(t, body), "Purchase request created")) setCreating(false);
  };

  const submitDraft = (pr) => {
    setSubmitting(pr);
    setSubmitQty(pr.order_quantity);
  };

  const confirmSubmit = async () => {
    if (await act((t) => submitPurchaseRequest(t, submitting.id, { quantity: Number(submitQty) }), `${submitting.order_no} submitted`)) {
      setSubmitting(null);
    }
  };

  const reject = (pr) => {
    setRejecting(pr);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (await act((t) => rejectPurchaseRequest(t, rejecting.id, rejectReason), `${rejecting.order_no} rejected`)) {
      setRejecting(null);
    }
  };

  const saveReceive = async () => {
    const body = { ...rcv, quantity: Number(rcv.quantity) };
    if (await act((t) => receivePurchaseRequest(t, receiving.id, body), "Goods received")) setReceiving(null);
  };

  const view = async (pr) => {
    const token = await getToken();
    const res = await fetchPurchaseRequest(token, pr.id);
    if (notify(res)) setViewing(res.data);
  };

  const actions = (pr) => {
    const out = [];
    const held = status?.pr_on_hold; 
    if (pr.status === "Draft" && status?.is_admin) out.push(<Button key="s" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={busy || held} onClick={() => submitDraft(pr)}>Submit</Button>);
    if (pr.status === "Pending Approval" && status?.can_approve) out.push(<Button key="a" size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" disabled={busy || held} onClick={() => act((t) => approvePurchaseRequest(t, pr.id), `${pr.order_no} approved`)}>Approve</Button>);
    if (["Draft", "Pending Approval", "Approved"].includes(pr.status) && (status?.can_approve || status?.is_admin)) out.push(<Button key="r" size="sm" variant="outline" className="rounded-xl text-rose-600" disabled={busy} onClick={() => reject(pr)}>Reject</Button>);
    if (pr.status === "Approved" && PAYERS.includes(role)) out.push(<Button key="p" size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" disabled={busy || held} onClick={() => act((t) => markPurchaseRequestPaid(t, pr.id), `${pr.order_no} marked paid`)}>Mark paid</Button>);
    if (SHIPPING.includes(pr.status) && pr.paid_at && STORE.includes(role)) out.push(<Button key="g" size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" disabled={busy || held} onClick={() => { setReceiving(pr); setRcv({ ...emptyReceive, quantity: String(pr.order_quantity - pr.received_quantity) }); }}>Goods received</Button>);
    out.push(<Button key="v" size="sm" variant="ghost" className="rounded-xl" onClick={() => view(pr)}>View</Button>);
    return out;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <select className={`${inputCls} sm:w-56`} value={filter} onChange={(e) => setFilter(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
        {RAISERS.includes(role) && (
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={status?.pr_on_hold} onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> New purchase request
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead>PR</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Est. amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">Loading...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No purchase requests</TableCell></TableRow>
            ) : rows.map((pr) => (
              <TableRow key={pr.id}>
                <TableCell>
                  <div className="font-semibold text-slate-800">{pr.order_no}</div>
                  <div className="text-xs text-slate-500">{pr.pr_type === "AUTO" ? "Automatic" : "Manual"} · {when(pr.created_at)}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{pr.item_code}</div>
                  <div className="text-xs text-slate-500">{pr.item_name}</div>
                </TableCell>
                <TableCell className="text-right">{pr.order_quantity}</TableCell>
                <TableCell className="text-right">{pr.received_quantity}</TableCell>
                <TableCell className="text-right">{lkr(pr.amount)}</TableCell>
                <TableCell><StatusBadge status={pr.status} /></TableCell>
                <TableCell className="max-w-[260px] text-xs text-slate-600">{pr.reason || "-"}</TableCell>
                <TableCell><div className="flex flex-wrap gap-2 justify-end">{actions(pr)}</div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* new manual PR */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="rounded-2xl max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New purchase request</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="radio" checked={form.mode === "existing"} onChange={() => setForm({ ...form, mode: "existing" })} /> Existing stock item</label>
              <label className="flex items-center gap-2"><input type="radio" checked={form.mode === "new"} onChange={() => setForm({ ...form, mode: "new" })} /> New item</label>
            </div>
            {form.mode === "existing" ? (
              <Field label="Stock item" hint={chosen ? (chosen.is_low ? `Below its low level (${chosen.free} free, low level ${chosen.low_level}): approved straight away.` : `Not low (${chosen.free} free, low level ${chosen.low_level || "-"}): needs a reason and Eranja's approval.`) : ""}>
                <select className={inputCls} value={form.inventory_id} onChange={(e) => setForm({ ...form, inventory_id: e.target.value })}>
                  <option value="">Choose...</option>
                  {stock.map((s) => <option key={s.id} value={s.id}>{s.item_code} - {s.item_name}{s.is_low ? " (low)" : ""}</option>)}
                </select>
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="New item code"><input className={inputCls} value={form.new_item_code} onChange={(e) => setForm({ ...form, new_item_code: e.target.value })} /></Field>
                <Field label="New item name"><input className={inputCls} value={form.new_item_name} onChange={(e) => setForm({ ...form, new_item_name: e.target.value })} /></Field>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity (BOM unit)"><input type="number" min="1" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
              <Field label="Estimated total (LKR)"><input type="number" min="0" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            </div>
            <Field label="Supplier"><input className={inputCls} value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
            <Field label={needsReason ? "Reason (required)" : "Reason"} hint={form.mode === "new" ? "New items are added to inventory after Eranja approves." : ""}>
              <textarea className={`${inputCls} h-20 py-2`} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Field>
            <PhotoPicker label="Photos of the goods to buy (optional)" photos={form.purchase_photos} onChange={(p) => setForm({ ...form, purchase_photos: p })} />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setCreating(false)}>Cancel</Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={busy || !(Number(form.quantity) > 0) || (needsReason && !form.reason.trim()) || (form.mode === "existing" ? !form.inventory_id : !(form.new_item_code && form.new_item_name))} onClick={saveNew}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* submit draft dialog */}
      <Dialog open={!!submitting} onOpenChange={(o) => !o && setSubmitting(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Submit {submitting?.order_no}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label={`Quantity to order for ${submitting?.item_code} (suggested ${submitting?.order_quantity}):`}>
              <input type="number" min="1" className={inputCls} value={submitQty} onChange={(e) => setSubmitQty(e.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setSubmitting(null)}>Cancel</Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={busy || !(Number(submitQty) > 0)} onClick={confirmSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* reject dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Reject {rejecting?.order_no}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label="Reason for rejecting (required):">
              <textarea className={`${inputCls} h-20 py-2`} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white" disabled={busy || !rejectReason.trim()} onClick={confirmReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* goods received */}
      <Dialog open={!!receiving} onOpenChange={(o) => !o && setReceiving(null)}>
        <DialogContent className="rounded-2xl max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Goods received: {receiving?.order_no}</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">{receiving?.item_code} {receiving?.item_name}. Moves the quantity from Paid to Warehouse and prints barcodes as before.</p>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity received"><input type="number" min="1" className={inputCls} value={rcv.quantity} onChange={(e) => setRcv({ ...rcv, quantity: e.target.value })} /></Field>
              <Field label="Received by"><input className={inputCls} value={rcv.received_by} onChange={(e) => setRcv({ ...rcv, received_by: e.target.value })} placeholder="Name" /></Field>
            </div>
            <PhotoPicker label="Photos of the goods received (required)" hint="Take them with the timestamp camera app so the date and time show on the photo."
              photos={rcv.goods_photos} onChange={(p) => setRcv({ ...rcv, goods_photos: p })} />
            <PhotoPicker label="Photos of the item / label" photos={rcv.item_photos} onChange={(p) => setRcv({ ...rcv, item_photos: p })} />
            <Field label="Remark"><input className={inputCls} value={rcv.remark} onChange={(e) => setRcv({ ...rcv, remark: e.target.value })} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setReceiving(null)}>Cancel</Button>
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" disabled={busy || !(Number(rcv.quantity) > 0) || !rcv.received_by.trim() || (status?.enabled && rcv.goods_photos.length === 0)} onClick={saveReceive}>Save receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* details */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewing?.order_no} <StatusBadge status={viewing?.status} /></DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-slate-500">Item</span><span>{viewing.item_code} {viewing.item_name}</span>
                <span className="text-slate-500">Quantity</span><span>{viewing.order_quantity} ordered, {viewing.received_quantity} received</span>
                <span className="text-slate-500">Estimated</span><span>{lkr(viewing.amount)}</span>
                <span className="text-slate-500">Raised by</span><span>{viewing.created_by_name || viewing.created_by} · {when(viewing.created_at)}</span>
                <span className="text-slate-500">Approved</span><span>{viewing.approved_by || "-"} · {when(viewing.approved_at)}</span>
                <span className="text-slate-500">Paid</span><span>{viewing.paid_by || "-"} · {when(viewing.paid_at)}</span>
                <span className="text-slate-500">Reason</span><span>{viewing.reason || "-"}</span>
                {viewing.rejected_reason && <><span className="text-slate-500">Rejected</span><span>{viewing.rejected_reason}</span></>}
              </div>
              <div><div className="font-semibold mb-1">Photos of goods to buy</div><Photos urls={viewing.purchase_photos} /></div>
              {(viewing.receipts || []).map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="font-semibold">Received {r.quantity} by {r.received_by} · {when(r.created_at)}</div>
                  <Photos urls={r.goods_photos} />
                  <Photos urls={r.item_photos} />
                  {r.remark && <div className="text-slate-500">{r.remark}</div>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}