import { useEffect, useState, useCallback } from "react";
import {
  fetchReportList,
  deleteReport,
  generateInventoryReport,
  generateSalesReport,
  generateUserActivityReport,
} from "../analyticsApi";
import ReportHeader from "../components/ReportHeader";
import ReportFilters from "../components/ReportFilters";
import ReportPreview from "../components/ReportPreview";
import { useToast } from "../../../../components/ui/Toast";

const REPORT_TYPES = {
  SALES: { label: "Sales", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  INVENTORY: { label: "Inventory", color: "bg-blue-50 text-blue-700 border-blue-100" },
  USER_ACTIVITY: { label: "User Activity", color: "bg-purple-50 text-purple-700 border-purple-100" },
};

export default function ReportsPage() {
  const [reportList, setReportList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("Sales");
  const [preview, setPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { showToast } = useToast();

  // --- 1. LOGIC: PARSING & PREVIEW ---
  const parseReportPayload = useCallback((data) => {
    if (data?.reportData && typeof data.reportData === "string") {
      try { return JSON.parse(data.reportData); } 
      catch (err) { console.warn("Failed to parse reportData JSON", err); }
    }
    return data;
  }, []);

  const buildPreview = useCallback((type, data) => {
    const payload = parseReportPayload(data);
    const normalizedType = type?.toLowerCase() || "";

    if (normalizedType.includes("sales")) {
      const rows = payload?.dailySales || payload?.rows || [];
      return { 
        type: "Sales", 
        summary: { 
          totalOrders: payload?.totalOrders ?? 0, 
          totalRevenue: payload?.totalRevenue ?? 0, 
          avgOrderValue: payload?.avgOrderValue ?? 0 
        }, 
        rows: rows.slice(0, 10), 
        columns: ["date", "totalOrders", "totalRevenue"], 
        startDate: data?.startDate ?? payload?.startDate ?? null,
        endDate: data?.endDate ?? payload?.endDate ?? null,
        raw: payload 
      };
    }
    if (normalizedType.includes("inventory")) {
      const rows = payload?.lowStockItems || payload?.items || [];
      return { 
        type: "Inventory", 
        summary: { 
          totalProducts: payload?.totalProducts ?? 0, 
          lowStockCount: payload?.lowStockCount ?? 0, 
          outOfStockCount: payload?.outOfStockCount ?? 0 
        }, 
        rows: rows.slice(0, 10), 
        columns: ["medicineId", "medicineName", "totalQuantity", "stockStatus"], 
        startDate: data?.startDate ?? payload?.startDate ?? null,
        endDate: data?.endDate ?? payload?.endDate ?? null,
        raw: payload 
      };
    }
    const rows = payload?.topCustomers || payload?.rows || [];
    return { 
      type: "User Activity", 
      summary: { 
        totalCustomers: payload?.totalCustomers ?? 0, 
        activeCustomers: payload?.activeCustomers ?? 0, 
        inactiveCustomers: payload?.inactiveCustomers ?? 0 
      }, 
      rows: rows.slice(0, 10), 
      columns: ["userId", "fullName", "email", "totalOrders", "totalSpent"], 
      startDate: data?.startDate ?? payload?.startDate ?? null,
      endDate: data?.endDate ?? payload?.endDate ?? null,
      raw: payload 
    };
  }, [parseReportPayload]);

  // --- 2. DATA FETCHING ---
  const loadReports = async () => {
    setLoading(true);
    try {
      const list = await fetchReportList();
      setReportList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.warn("Failed to load report list", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const reportId = pendingDelete?.id;
    if (!reportId) return;
    try {
      await deleteReport(reportId);
      await loadReports();
      if (preview?.raw?.id === reportId) setPreview(null);
      setPendingDelete(null);
    } catch (error) {
      setErrorMessage("Failed to delete report.");
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleGenerate = async () => {
    const needsDates = reportType === "Sales" || reportType === "User Activity";
    if (needsDates && (!startDate || !endDate)) {
      setErrorMessage("Please select both start and end dates.");
      showToast("Please select both start and end dates.", "warning");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    try {
      let data;
      if (reportType === "Sales") data = await generateSalesReport(startDate, endDate);
      else if (reportType === "Inventory") data = await generateInventoryReport();
      else data = await generateUserActivityReport(startDate, endDate);

      setPreview(buildPreview(reportType, data));
      await loadReports();
      showToast(`${reportType} report generated successfully! 📊`, "success", "Report Ready");
    } catch (error) {
      setErrorMessage("Failed to generate report. Check connection.");
      showToast("Failed to generate report. Please try again.", "error", "Report Failed");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. EXPORT: CSV BUILDER ---
  const exportToCSV = (rows, columns = [], type = "report", previewStart = null, previewEnd = null) => {
    try {
      if (!Array.isArray(rows) || rows.length === 0) return;

      const cols = Array.isArray(columns) && columns.length > 0
        ? columns
        : Object.keys(rows[0] || {});

      const escapeCell = (v) => {
        if (v === null || v === undefined) return "";
        const s = typeof v === "object" ? JSON.stringify(v) : String(v);
        // escape quotes
        return `"${s.replace(/"/g, '""')}"`;
      };

      const header = cols.join(",");
      const body = rows.map(r => cols.map(c => escapeCell(r[c] ?? "")).join(",")).join("\n");
      const csv = `${header}\n${body}`;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
  const fileNameParts = [type.replace(/\s+/g, "_")];
  // prefer explicit preview dates, fall back to selected state
  const s = previewStart ?? startDate;
  const e = previewEnd ?? endDate;
  if (s) fileNameParts.push(String(s));
  if (e) fileNameParts.push(String(e));
      const filename = `${fileNameParts.join("_") || "report"}.csv`;
      a.href = url;
      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Failed to export CSV", err);
      setErrorMessage("Failed to export CSV file.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Active";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Active" : date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 pt-20 md:pt-24">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Real-time business data and history logs.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <ReportHeader reportCount={reportList.length} />
          </div>
        </header>

        {/* MAIN RESPONSIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT: GENERATOR & PREVIEW */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* PARAMETERS CARD */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="h-0.5 w-full bg-indigo-500" />
              <div className="p-4 md:p-6">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Report Parameters
                </h2>
                <ReportFilters
                  startDate={startDate} endDate={endDate} reportType={reportType}
                  setStartDate={setStartDate} setEndDate={setEndDate} setReportType={setReportType}
                  onGenerate={handleGenerate} loading={loading}
                />
                {errorMessage && (
                  <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-lg border border-rose-100 flex items-center gap-2">
                    ⚠️ {errorMessage}
                  </div>
                )}
              </div>
            </section>

            {/* PREVIEW CARD */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[400px] flex flex-col">
              <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Live Preview</h2>
                {preview && (
                  <button 
                    onClick={() => setPreview(null)} 
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase"
                  >
                    Clear Preview
                  </button>
                )}
              </div>
              <div className="p-4 md:p-6 flex-grow overflow-x-auto">
                {preview ? (
                  <ReportPreview 
                    preview={preview} 
                    onExportCSV={(rows) => exportToCSV(rows, preview?.columns, preview?.type, preview?.startDate, preview?.endDate)} 
                    onClear={() => setPreview(null)} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-40">
                    <div className="text-5xl mb-4 text-slate-300">📊</div>
                    <p className="text-slate-500 font-bold text-sm">No Active Report</p>
                    <p className="text-slate-400 text-xs max-w-[200px] mx-auto mt-1 font-medium">
                      Select parameters and generate to view your data table.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: HISTORY ASIDE */}
          <aside className="lg:col-span-4 h-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full lg:max-h-[850px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Recent Logs</h3>
                <button 
                  onClick={loadReports}
                  disabled={loading}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  {loading ? "SYNCING..." : "REFRESH"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[500px] lg:max-h-none">
                {reportList.length === 0 ? (
                  <div className="text-center text-slate-400 py-12 text-[10px] uppercase font-bold tracking-widest">
                    No records found
                  </div>
                ) : (
                  reportList.map((r, i) => (
                    <div 
                      key={r.id || i} 
                      className={`p-4 rounded-xl border transition-all ${
                        i === 0 
                        ? 'bg-indigo-50/30 border-indigo-100 ring-1 ring-indigo-50' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          REPORT_TYPES[r.reportType]?.color || 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.reportType || "General"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">
                          {formatDate(r.generatedAt || r.createdAt)}
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold truncate mb-3 ${
                        i === 0 ? 'text-indigo-900' : 'text-slate-700'
                      }`}>
                        {r.reportName || r.description || "System Log"}
                      </p>
                      
                      <div className="flex gap-4 border-t border-slate-100/50 pt-3">
                        <button 
                          onClick={() => setPreview(buildPreview(r.reportType, r))}
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest"
                        >
                          View Result
                        </button>
                        <button
                          onClick={() => setPendingDelete({ id: r.id, name: r.reportName || "this report" })}
                          className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[340px] rounded-2xl shadow-2xl p-6 border border-slate-100">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-lg mb-4">⚠️</div>
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to delete <b>{pendingDelete.name}</b>? This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => setPendingDelete(null)} 
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors order-1 sm:order-2"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}