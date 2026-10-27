// [ADDED 2026-10-13] Month-end count: supervisor enters counts, Admins comment on differences, then close.
import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Roles } from "@/const/const";
import { closeCount, commentCountLine, enterCount, fetchCurrentCount, openCount } from "@/api/stockControlApi";
import { StatusBadge, inputCls, notify, when } from "./shared";

const COUNTERS = [Roles.SUPER_ADMIN, Roles.HEAD, Roles.INVENTORY_MANAGER, Roles.WAREHOUSE_STAFF];

export default function CountTab({ status, onChanged }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({}); // lineId -> typed value

  const load = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const res = await fetchCurrentCount(token);
    setCount(res.ok ? res.data?.count : null);
    setDraft({});
    setLoading(false);
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const isOpen = count?.status === "OPEN";
  const canOpen = COUNTERS.includes(role) && !isOpen && count?.month !== thisMonth && new Date().getDate() >= (status?.count_start_day || 25);

  const run = async (fn, okText) => {
    const token = await getToken();
    const res = await fn(token);
    if (notify(res, okText)) {
      await load();
      onChanged?.();
    }
  };

  const saveLine = async (line) => {
    const v = draft[line.id];
    if (v === undefined || v === "") return;
    const token = await getToken();
    const res = await enterCount(token, line.id, Number(v));
    if (notify(res)) load();
  };

  const comment = (line) => {
    const text = window.prompt(`Admin comment for ${line.item_code}: counted ${line.counted_qty}, CoreSync ${line.system_qty}`, line.admin_comment || "");
    if (text) run((t) => commentCountLine(t, line.id, text), "Comment saved");
  };

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  const done = count?.lines?.filter((l) => l.counted_qty !== null).length || 0;
  const diffs = count?.lines?.filter((l) => l.difference) || [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-sm">
          {count ? (
            <>
              <div className="font-bold text-slate-800 flex items-center gap-2">Count {count.month} <StatusBadge status={count.status} /></div>
              <div className="text-slate-500">Opened {when(count.opened_at)}{count.closed_at ? ` · closed ${when(count.closed_at)}` : ""} · {done} of {count.lines?.length || 0} counted · {diffs.length} differences</div>
            </>
          ) : <div className="text-slate-500">No count yet. The count opens on the {status?.count_start_day || 25}th.</div>}
        </div>
        <div className="flex gap-2">
          {canOpen && <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => run((t) => openCount(t), "Count opened: purchase requests are on hold until it is closed")}>Open this month's count</Button>}
          {isOpen && status?.is_admin && <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => run((t) => closeCount(t, count.id), "Count closed: differences sent to Eranja")}>Close count</Button>}
        </div>
      </div>

      {count && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-x-auto">
          <Table className="min-w-[860px]">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">CoreSync</TableHead>
                <TableHead className="text-right w-40">Counted</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead>Admin comment</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {count.lines?.map((l) => (
                <TableRow key={l.id}>
                  <TableCell><div className="font-semibold">{l.item_code}</div><div className="text-xs text-slate-500">{l.item_name}</div></TableCell>
                  <TableCell className="text-right">{l.system_qty}</TableCell>
                  <TableCell className="text-right">
                    {isOpen && COUNTERS.includes(role) ? (
                      <input type="number" min="0" className={`${inputCls} w-28 text-right`} value={draft[l.id] ?? (l.counted_qty ?? "")}
                        onChange={(e) => setDraft({ ...draft, [l.id]: e.target.value })} onBlur={() => saveLine(l)} />
                    ) : (l.counted_qty ?? "-")}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${l.difference < 0 ? "text-rose-600" : l.difference > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    {l.difference === null ? "-" : `${l.difference > 0 ? "+" : ""}${l.difference}`}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-[260px]">{l.admin_comment || (l.difference ? <span className="text-amber-700">needs a comment</span> : "-")}</TableCell>
                  <TableCell className="text-right">
                    {isOpen && status?.is_admin && l.difference ? <Button size="sm" variant="outline" className="rounded-xl" onClick={() => comment(l)}>Comment</Button> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
