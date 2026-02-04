import { useState, useEffect, useRef } from "react";
import { reportService, analyticsService } from "../../../api/analyticsService";

export default function ReportPage() {
  const [reportList, setReportList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("Sales");
  const [preview, setPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const isMounted = useRef(true);

  async function loadReports() {
    try {
      const res = await reportService.getReports();
      const list = Array.isArray(res) ? res : [];
      setReportList(list);
    } catch (err) {
      console.warn('Failed to load saved reports', err?.message || err);
      setReportList([]);
    }
  }

  useEffect(() => {
    isMounted.current = true;
    loadReports();

    // subscribe to SSE so UI updates when reports are generated elsewhere
    let es;
    try {
      es = analyticsService.subscribeToStream(
        (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.event === 'report_generated') {
              loadReports();
            }
          } catch (_) {}
        },
        () => {
          // ignore - polling/loadReports will still work
        }
      );
    } catch (ex) {
      // ignore - polling/loadReports will still work
    }

    return () => { isMounted.current = false; if (es && es.close) es.close(); };
  }, []);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setErrorMessage("Please select both start and end dates.");
      return;
    }
    setErrorMessage("");
    try {
      // call specific backend endpoints per report type
      const params = { startDate, endDate };
      let res;
      if (reportType === 'Sales') {
        res = await reportService.generateSalesReport(params);
        // res contains summary + lists: topRevenue, expiryAlerts
        const data = res || {};
        // preview topRevenue rows (array)
        const rows = Array.isArray(data.topRevenue) ? data.topRevenue.slice(0,5) : [];
        setPreview({ type: 'Sales', summary: { newOrders: data.newOrders, newUsers: data.newUsers, totalIncome: data.totalIncome }, rows, raw: data });
      } else if (reportType === 'Inventory') {
        res = await reportService.generateInventoryReport(params);
        const rows = Array.isArray(res) ? res.slice(0,5) : [];
        setPreview({ type: 'Inventory', rows, raw: res });
      } else if (reportType === 'Compliance') {
        res = await reportService.generateComplianceReport(params);
        const rows = Array.isArray(res) ? res.slice(0,5) : [];
        setPreview({ type: 'Compliance', rows, raw: res });
      } else {
        // fallback to generic generate
        res = await reportService.generateReport(params);
        await loadReports();
        setPreview(res);
      }

      // refresh saved reports list
      await loadReports();
    } catch (err) {
      console.error("Failed to generate report", err?.message || err);
      setErrorMessage('Failed to generate report. See console for details.');
    }
  };

  const handlePreview = async (r) => {
    try {
      const res = await reportService.exportReport(r.id, 'json');
      // server returns JSON body
      setPreview({ ...r, metrics: res });
    } catch (err) {
      // fallback: try to parse metricsJson from list
      try {
        const parsed = typeof r.metricsJson === 'string' ? JSON.parse(r.metricsJson) : r.metricsJson || {};
        setPreview({ ...r, metrics: parsed });
      } catch (e) {
        setPreview({ ...r, metrics: {} });
      }
    }
  };

  const handleExport = (r, fmt = 'csv') => {
    const url = `/api/admin/reports/${r.id}/export?format=${fmt}`;
    // open in new tab to download
    window.open(url, '_blank');
  };

  const handleExportCSV = (data) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report.csv");
    link.click();
  };

  const generateButtonStyle = "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700";

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <div className="bg-[#16213E] rounded-xl shadow p-3 mb-6">
        <h1 className="text-2xl font-bold text-green-500">Reports</h1>
        <p className="text-sm text-white">Saved reports: {reportList.length}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 block">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 block">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-200"
          />
        </div>

        <div>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 rounded-lg border"
          >
            <option value="Sales">Sales Report</option>
            <option value="Inventory">Inventory Report</option>
            <option value="Compliance">Compliance Report</option>
          </select>
        </div>

        <div className="ml-auto">
          <button
            onClick={handleGenerate}
            disabled={!startDate || !endDate}
            className={`${generateButtonStyle} ${(!startDate || !endDate) ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
          >
            Generate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Report Preview</h2>
        {!preview && (
          <p className="text-sm text-slate-500">No preview. Choose a report type and date range then click Generate.</p>
        )}

        {preview && (
          <div>
            {preview.summary && (
              <div className="flex gap-4 mb-4">
                {Object.entries(preview.summary).map(([k,v]) => (
                  <div key={k} className="bg-gray-50 p-3 rounded shadow-sm">
                    <div className="text-xs text-slate-500">{k}</div>
                    <div className="text-lg font-semibold">{k === 'totalIncome' ? `₹${Number(v || 0).toLocaleString('en-IN')}` : v}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {preview.rows && preview.rows.length > 0 ? Object.keys(preview.rows[0]).map((k) => (
                      <th key={k} className="p-2 text-sm text-slate-600 capitalize">{k}</th>
                    )) : <th className="p-2 text-sm text-slate-600">No data</th>}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows && preview.rows.length === 0 && (
                    <tr><td className="p-2 text-sm text-slate-500">No rows to preview</td></tr>
                  )}
                  {preview.rows && preview.rows.map((row, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t` }>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="p-2 text-sm">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => handleExportCSV(preview.rows || [])} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Download CSV</button>
              <button onClick={() => setPreview(null)} className="px-4 py-2 rounded-lg border">Clear Preview</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}