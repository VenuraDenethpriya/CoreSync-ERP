// [ADDED 2026-10-13] Inventory controls API (/api/v1/stock-control). Every call returns
// { ok, data, message }: ok=false carries the server's reason (e.g. "purchase requests are on hold ...").
const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

const call = async (token, method, path, body) => {
  try {
    const response = await fetch(`${apiUrl}/stock-control${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await response.json().catch(() => ({}));
    const ok = response.ok && json?.message === "success";
    return { ok, data: json?.data, message: ok ? "success" : json?.message || json?.error || `Error ${response.status}` };
  } catch (error) {
    console.error("Stock control request failed:", error);
    return { ok: false, data: null, message: "Network error" };
  }
};

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && p.append(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const fetchStockControlStatus = (token) => call(token, "GET", "/status");
export const fetchStockLevels = (token, query) => call(token, "GET", `/stock${qs({ query })}`);
export const fetchStockLedger = (token, params) => call(token, "GET", `/ledger${qs(params)}`);
export const fetchFinishedPacks = (token) => call(token, "GET", "/finished-packs");
export const checkGoods = (token, body) => call(token, "POST", "/check", body);
export const runLowLevelCheck = (token) => call(token, "POST", "/low-level/run");

export const fetchPurchaseRequests = (token, params) => call(token, "GET", `/purchase-requests${qs(params)}`);
export const fetchPurchaseRequest = (token, id) => call(token, "GET", `/purchase-requests/${id}`);
export const createPurchaseRequest = (token, body) => call(token, "POST", "/purchase-requests", body);
export const submitPurchaseRequest = (token, id, body) => call(token, "POST", `/purchase-requests/${id}/submit`, body || {});
export const approvePurchaseRequest = (token, id) => call(token, "POST", `/purchase-requests/${id}/approve`);
export const rejectPurchaseRequest = (token, id, reason) => call(token, "POST", `/purchase-requests/${id}/reject`, { reason });
export const markPurchaseRequestPaid = (token, id) => call(token, "POST", `/purchase-requests/${id}/paid`);
export const receivePurchaseRequest = (token, id, body) => call(token, "POST", `/purchase-requests/${id}/receive`, body);

export const fetchDiscrepancies = (token, status) => call(token, "GET", `/discrepancies${qs({ status })}`);
export const reportDiscrepancy = (token, body) => call(token, "POST", "/discrepancies", body);
export const commentDiscrepancy = (token, id, comment) => call(token, "POST", `/discrepancies/${id}/comment`, { comment });
export const approveDiscrepancy = (token, id) => call(token, "POST", `/discrepancies/${id}/approve`);
export const rejectDiscrepancy = (token, id) => call(token, "POST", `/discrepancies/${id}/reject`);

export const fetchCurrentCount = (token) => call(token, "GET", "/counts/current");
export const openCount = (token) => call(token, "POST", "/counts");
export const enterCount = (token, lineId, counted) => call(token, "PUT", `/counts/lines/${lineId}`, { counted_qty: counted });
export const commentCountLine = (token, lineId, comment) => call(token, "POST", `/counts/lines/${lineId}/comment`, { comment });
export const closeCount = (token, countId) => call(token, "POST", `/counts/${countId}/close`);
