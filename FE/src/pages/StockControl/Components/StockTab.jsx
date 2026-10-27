// [ADDED 2026-10-13] Stock levels by stage (Paid / Warehouse / Checked), low levels, check goods.
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { RefreshCw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { checkGoods, fetchFinishedPacks, fetchStockLevels, runLowLevelCheck } from "@/api/stockControlApi";
import { Field, inputCls, notify } from "./shared";

export default function StockTab({ status }) {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [finished, setFinished] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null); // item being checked
  const [form, setForm] = useState({ quantity: "", method: "BATCH", code: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const [res, fin] = await Promise.all([fetchStockLevels(token, query), fetchFinishedPacks(token)]);
    setItems(res.ok ? res.data?.items || [] : []);
    setFinished(fin.ok ? fin.data?.items || [] : []);
    setLoading(false);
  }, [getToken, query]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const runCheck = async () => {
    const token = await getToken();
    const res = await runLowLevelCheck(token);
    if (notify(res)) {
      const d = res.data;
      notify({ ok: true }, d.on_hold ? `Low levels updated. No drafts: ${d.hold_reason}` :
        `Low levels updated for ${d.items_updated} items; ${d.drafts_made?.length || 0} purchase request drafts made`);
      load();
    }
  };

  const saveCheck = async () => {
    const token = await getToken();
    const res = await checkGoods(token, { inventory_id: checking.id, quantity: Number(form.quantity), method: form.method, code: form.code });
    if (notify(res, `${form.quantity} ${checking.item_code} moved to Checked`)) {
      setChecking(null);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input className={`${inputCls} sm:w-80`} placeholder="Search item code or name" value={query} onChange={(e) => setQuery(e.target.value)} />
        {status?.is_admin && (
          <Button variant="outline" className="rounded-xl" onClick={runCheck}>
            <RefreshCw className="w-4 h-4 mr-2" /> Run low-level check now
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">1. Paid</TableHead>
              <TableHead className="text-right">2. Warehouse</TableHead>
              <TableHead className="text-right">3. Checked</TableHead>
              <TableHead className="text-right">Reserved for packs</TableHead>
              <TableHead className="text-right">In open PRs</TableHead>
              <TableHead className="text-right">Low level</TableHead>
              <TableHead className="text-right">Free</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-slate-400 py-8">Loading...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-slate-400 py-8">No stock items</TableCell></TableRow>
            ) : items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>
                  <div className="font-semibold text-slate-800">{it.item_code}</div>
                  <div className="text-xs text-slate-500">{it.item_name}</div>
                  {it.pending_adjustment !== 0 && (
                    <Badge className="mt-1 rounded-full border-0 bg-amber-100 text-amber-800 hover:bg-amber-100">
                      pending adjustment {it.pending_adjustment > 0 ? "+" : ""}{it.pending_adjustment}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">{it.paid}</TableCell>
                <TableCell className="text-right">{it.warehouse}</TableCell>
                <TableCell className="text-right">{it.checked}</TableCell>
                <TableCell className="text-right">{Math.round(it.hold)}</TableCell>
                <TableCell className="text-right">{it.requested}</TableCell>
                <TableCell className="text-right">{it.low_level || "-"}</TableCell>
                <TableCell className={`text-right font-semibold ${it.is_low ? "text-rose-600" : "text-slate-800"}`}>
                  {it.free}{it.is_low && <span className="ml-1 text-xs">low</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="rounded-xl" disabled={it.warehouse <= 0}
                    onClick={() => { setChecking(it); setForm({ quantity: "", method: "BATCH", code: "" }); }}>
                    <ScanLine className="w-4 h-4 mr-1" /> Check
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-slate-500">
        Free = Warehouse + Checked + Paid + in open purchase requests - reserved. Low level = stock for {status?.low_level_packs || 10} of the pack that needs the most of the item.
      </p>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-3">Finished packs in stock</h3>
        {finished.length === 0 ? <p className="text-sm text-slate-400">None</p> : (
          <ul className="text-sm space-y-1">
            {finished.map((f) => <li key={f.product_id} className="flex justify-between"><span>{f.product_name}</span><span className="font-semibold">{f.packs}</span></li>)}
          </ul>
        )}
      </div>

      <Dialog open={!!checking} onOpenChange={(o) => !o && setChecking(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Check {checking?.item_code} before use</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Moves goods from Warehouse ({checking?.warehouse}) to Checked. Optional for now.</p>
          <div className="grid gap-3">
            <Field label="Quantity"><input type="number" min="1" className={inputCls} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Field>
            <Field label="How it was checked">
              <select className={inputCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="BARCODE">Unit barcode</option>
                <option value="BATCH">Box / bag / reel label</option>
                <option value="BIN">Shelf / bin label + quantity</option>
                <option value="MANUAL">Picked by item (no label)</option>
              </select>
            </Field>
            <Field label="Label or barcode scanned (optional)"><input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setChecking(null)}>Cancel</Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={!(Number(form.quantity) > 0)} onClick={saveCheck}>Move to Checked</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
