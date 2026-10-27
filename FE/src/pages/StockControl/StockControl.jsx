// [ADDED 2026-10-13] Stock Control page: purchase requests, stock by stage, excess/shortage, month-end count.
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchStockControlStatus } from "@/api/stockControlApi";
import StockTab from "./Components/StockTab";
import PurchaseRequestsTab from "./Components/PurchaseRequestsTab";
import DiscrepanciesTab from "./Components/DiscrepanciesTab";
import CountTab from "./Components/CountTab";

export default function StockControl() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState("requests");

  const loadStatus = useCallback(async () => {
    const token = await getToken();
    const res = await fetchStockControlStatus(token);
    setStatus(res.ok ? res.data : null);
  }, [getToken]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  return (
    <div className="w-full space-y-5">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/70">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Stock Control</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every item comes in through a purchase request and leaves only by a pack's BOM or a delivery.
        </p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {status?.enabled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1"><ShieldCheck className="w-3.5 h-3.5" /> Controls on: manual stock changes are switched off</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-3 py-1">Controls not switched on yet: packs do not change stock</span>
          )}
          {status?.pr_on_hold && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 px-3 py-1"><AlertTriangle className="w-3.5 h-3.5" /> {status.hold_reason}</span>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="requests">Purchase requests</TabsTrigger>
          <TabsTrigger value="stock">Stock by stage</TabsTrigger>
          <TabsTrigger value="discrepancies">Excess / shortage</TabsTrigger>
          <TabsTrigger value="count">Month-end count</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-4"><PurchaseRequestsTab status={status} /></TabsContent>
        <TabsContent value="stock" className="mt-4"><StockTab status={status} /></TabsContent>
        <TabsContent value="discrepancies" className="mt-4"><DiscrepanciesTab status={status} /></TabsContent>
        <TabsContent value="count" className="mt-4"><CountTab status={status} onChanged={loadStatus} /></TabsContent>
      </Tabs>
    </div>
  );
}
