
import { useState, useMemo, useEffect, useRef } from "react"
import {
  LineChart, Line, BarChart, Bar, Tooltip, XAxis, YAxis, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import StatCard from "./StatCard"
import { analyticsService } from "../../../api/analyticsService";

import onlineShopping from "./dashboardImages/online-Shopping.png";
import bill from "./dashboardImages/bill.png";
import salary from "./dashboardImages/salary.png";
import newaccount from "./dashboardImages/newaccount.png";
 
const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"]
 
export default function Dashboard() {
 
  const [statRange, setStatRange] = useState("yearly")
  const [salesRange, setSalesRange] = useState("yearly")
  // default to an empty analytics shape
  const [analyticsData, setAnalyticsData] = useState({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  // reports UI removed per design
  const [realTimeNewUsers, setRealTimeNewUsers] = useState(0);
  const realTimeNewUsersRef = useRef(0);

  // use ref to track mount state for async tasks
  const isMounted = useRef(true);

  // Format numbers as Indian rupees
  const formatRupee = (v) => {
    const n = Number(v) || 0;
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  async function fetchAnalytics() {
    setLoadingAnalytics(true);
    try {
      const results = await Promise.allSettled([
        analyticsService.getSummary(),
        // fetch a full-year timeseries so yearly charts are accurate and include today
        analyticsService.getRevenueTimeseries(365),
        // recent 30-day orders timeseries for the orders chart
        analyticsService.getOrdersTimeseries(30),
        analyticsService.getTopProducts(6)
      ]);

      if (!isMounted.current) return;

      const summaryRes = results[0].status === 'fulfilled' ? results[0].value : null;
  const timeseriesRes = results[1].status === 'fulfilled' ? results[1].value : null;
  const ordersRes = results[2].status === 'fulfilled' ? results[2].value : null;
  const topRes = results[3].status === 'fulfilled' ? results[3].value : null;

      const summary = summaryRes && typeof summaryRes === 'object' ? summaryRes : {};
  const timeseries = Array.isArray(timeseriesRes) ? timeseriesRes : [];
  const ordersTimeseries = Array.isArray(ordersRes) ? ordersRes : [];
  const top = Array.isArray(topRes) ? topRes : [];

      // Build a small analytics-shaped object that the dashboard expects
      const newAnalytics = { ...analyticsData };

      newAnalytics.metrics = newAnalytics.metrics || {};
      newAnalytics.metrics.newOrders = newAnalytics.metrics.newOrders || {};
      newAnalytics.metrics.totalIncome = newAnalytics.metrics.totalIncome || {};
      newAnalytics.metrics.totalExpense = newAnalytics.metrics.totalExpense || {};
      newAnalytics.metrics.newUsers = newAnalytics.metrics.newUsers || {};

  newAnalytics.metrics.newOrders.value = summary.ordersThisMonth ?? summary.ordersToday ?? 0;
  newAnalytics.metrics.totalIncome.value = summary.totalRevenue ?? 0;
  // expose average order value from summary as a more useful stat
  newAnalytics.metrics.avgOrderValue = { value: summary.avgOrderValue ?? 0, trend: 0 };
  // keep backward-compatible totalExpense slot but set to 0
  newAnalytics.metrics.totalExpense.value = 0;
  newAnalytics.metrics.newUsers.value = summary.newUsers30 ?? 0;
    // keep raw summary for easier charting decisions
    newAnalytics.summary = summary;

      // Map timeseries to weeklyPerformanceData & salesRevenueData (defensive)
      newAnalytics.lastWeek = newAnalytics.lastWeek || {};
  const ts = Array.isArray(timeseries) ? timeseries : [];
  // keep full timeseries on analyticsData so other components can use it
  newAnalytics.timeseries = ts;
  newAnalytics.ordersTimeseries = ordersTimeseries;
  // lastWeek - use last 7 days
  const last7 = ts.slice(-7);
      newAnalytics.lastWeek.lineCharts = { salesPerformance: last7.map(t => ({ day: t.date, revenue: t.revenue })) };
      newAnalytics.lastWeek.barCharts = { salesRevenue: last7.map(t => ({ day: t.date, sales: 0, revenue: t.revenue })) };

      // pie: use top products
      newAnalytics.lastWeek.pieCharts = { salesByCategory: (Array.isArray(top) ? top : []).map(p => ({ category: p.name, value: p.quantity })) };

      // monthly aggregation (group ts into 4 buckets)
      const buckets = 4;
      const monthlyBuckets = Array.from({length: buckets}, (_,i)=>[]);
      ts.forEach((item, idx) => {
        const bi = Math.floor((idx / Math.max(1, ts.length)) * buckets);
        monthlyBuckets[Math.min(bi, buckets-1)].push(item.revenue || 0);
      });
      newAnalytics.monthly = { lineCharts: { engagement: monthlyBuckets.map((arr,i)=>({ week: `W${i+1}`, activeUsers: arr.reduce((a,b)=>a+b,0) })) }, barCharts: { ordersByHour: [] } };

      // yearly aggregation: group by month label present in ts
      const byMonth = {};
      ts.forEach(t => {
        try {
          const m = new Date(t.date).toLocaleString(undefined, { month: 'short' });
          byMonth[m] = (byMonth[m] || 0) + (t.revenue || 0);
        } catch (e) {}
      });
      newAnalytics.yearly = { lineCharts: { yearlyStats: Object.keys(byMonth).map(m => ({ month: m, avgOrderValue: byMonth[m] })) }, barCharts: { salesRevenue: Object.keys(byMonth).map(m => ({ period: m, totalSales: 0, totalRevenue: byMonth[m] })) } };

      setAnalyticsData(newAnalytics);
    } catch (err) {
      // keep shipped analytics.json as fallback
      console.warn('Failed to load analytics from server, using static sample', err?.message || err);
    } finally {
      setLoadingAnalytics(false);
    }
  }

  useEffect(() => {
    // mark mounted
    isMounted.current = true;
    // initial fetch + polling
    fetchAnalytics();
    const id = setInterval(() => { fetchAnalytics(); }, 15000);
    return () => { isMounted.current = false; clearInterval(id); };
  }, []);

  // SSE subscription for real-time push updates (falls back to polling if SSE not allowed)
  useEffect(() => {
    let es;
    try {
      es = analyticsService.subscribeToStream(
        (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.event === 'user_created') {
              realTimeNewUsersRef.current = realTimeNewUsersRef.current + 1;
              setRealTimeNewUsers(realTimeNewUsersRef.current);
            } else {
              fetchAnalytics();
            }
          } catch (_) {
            fetchAnalytics();
          }
        },
        () => {
          console.warn('EventSource error');
        }
      );
      // named event (analytics)
      es.addEventListener('analytics', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.event === 'user_created') {
            realTimeNewUsersRef.current = realTimeNewUsersRef.current + 1;
            setRealTimeNewUsers(realTimeNewUsersRef.current);
          } else {
            fetchAnalytics();
          }
        } catch (_) {
          fetchAnalytics();
        }
      });
    } catch (err) {
      // EventSource may throw if not supported or if connection blocked by auth; polling still works
      console.warn('SSE not available for analytics stream', err?.message || err);
    }

    return () => { if (es && es.close) es.close(); };
  }, []);

  // reports functionality removed from dashboard UI (kept on Reports page)
 
  const yearlyStatsData = useMemo(() => {
    // Use monthly/yearly aggregation if available; otherwise derive from timeseries
    const times = analyticsData?.timeseries ?? [];
    // If no timeseries is present, return empty arrays so the charts stay honest (no fake data)
  if (statRange === "yearly") {
      const src = analyticsData?.yearly?.barCharts?.salesRevenue ?? [];
      if (src.length > 0) return src.map(d => ({ label: d.period, value: d.totalRevenue }));
      // derive by grouping timeseries by month
      if (!times.length) return [];
      const srcTimes = times;
      const byMonth = {};
      srcTimes.forEach(t => {
        const m = new Date(t.date).toLocaleString(undefined, { month: 'short' });
        byMonth[m] = (byMonth[m] || 0) + (t.revenue || 0);
      });
      return Object.keys(byMonth).map(m => ({ label: m, value: byMonth[m] }));
    }

    if (statRange === "monthly") {
      const src = analyticsData?.monthly?.lineCharts?.engagement ?? [];
      if (src.length > 0) return src.map(d => ({ label: d.week, value: d.activeUsers }));
      if (!times.length) return [];
      const srcTimes = times.slice(-30);
      // group into 4 weekly buckets
      const buckets = [0,0,0,0];
      srcTimes.forEach((t, idx) => { buckets[Math.floor((idx / srcTimes.length) * 4)] += (t.revenue || 0); });
      return buckets.map((v,i) => ({ label: `W${i+1}`, value: v }));
    }

    const src = analyticsData?.weekly?.lineCharts?.weeklyStats ?? [];
    if (src.length > 0) return src.map(d => ({ label: d.day, value: d.value }));
    const lastWeek = (analyticsData?.lastWeek?.lineCharts?.salesPerformance ?? []);
    if (!lastWeek.length) return [];
    return lastWeek.map(d => ({ label: d.date || d.day, value: d.revenue ?? d.value ?? 0 }));
  }, [statRange, analyticsData])
 
 
  const salesRevenueData = useMemo(() => {
    const times = analyticsData?.timeseries ?? [];
    // Do not fabricate data; if no timeseries exists return empty
  if (salesRange === "yearly") {
      const src = analyticsData?.yearly?.barCharts?.salesRevenue ?? [];
      if (src.length > 0) return src.map(d => ({ label: d.period, sales: d.totalSales, revenue: d.totalRevenue }));
      // fallback: no data -> empty
      if (!times.length) return [];
      const srcTimes = times;
      const byMonth = {};
      srcTimes.forEach(t => {
        const m = new Date(t.date).toLocaleString(undefined, { month: 'short' });
        byMonth[m] = (byMonth[m] || 0) + (t.revenue || 0);
      });
      return Object.keys(byMonth).map(m => ({ label: m, revenue: byMonth[m] }));
    }

    if (salesRange === "monthly") {
      const src = analyticsData?.monthly?.barCharts?.ordersByHour ?? [];
      if (src.length > 0) return src.map(d => ({ label: d.hour, sales: d.orders }));
      if (!times.length) return [];
      const srcTimes = times.slice(-30);
      return srcTimes.map(t => ({ label: t.date, revenue: t.revenue }));
    }

    const src = analyticsData?.weekly?.barCharts?.salesRevenue ?? [];
    if (src.length > 0) return src.map(d => ({ label: d.day, revenue: d.revenue }));
    if (!times.length) return [];
    const srcTimes = times.slice(-7);
    return srcTimes.map(t => ({ label: t.date || t.day, revenue: t.revenue }));
  }, [salesRange, analyticsData])
 
 
  const hasRevenueSeries = useMemo(
    () => salesRevenueData.some(d => typeof d.revenue === "number"),
    [salesRevenueData]
  )
 
 
  const weeklyPerformanceData = useMemo(
    () => (analyticsData?.lastWeek?.lineCharts?.salesPerformance ?? [])
      .map(d => ({ day: d.day, revenue: d.revenue })),
    [analyticsData]
  )
  // Orders timeseries (last 30 days) for the Orders chart
  const ordersData = useMemo(() => {
    const ots = analyticsData?.ordersTimeseries ?? [];
    if (!Array.isArray(ots) || !ots.length) return [];

    if (salesRange === 'weekly') {
      const src = ots.slice(-7);
      return src.map(d => ({ label: d.date, orders: Number(d.orders || 0) }));
    }

    if (salesRange === 'monthly') {
      const src = ots.slice(-30);
      return src.map(d => ({ label: d.date, orders: Number(d.orders || 0) }));
    }

    // yearly: aggregate by month label
    if (salesRange === 'yearly') {
      const byMonth = {};
      ots.forEach(d => {
        const m = new Date(d.date).toLocaleString(undefined, { month: 'short' });
        byMonth[m] = (byMonth[m] || 0) + Number(d.orders || 0);
      });
      return Object.keys(byMonth).map(m => ({ label: m, orders: byMonth[m] }));
    }

    return ots.map(d => ({ label: d.date, orders: Number(d.orders || 0) }));
  }, [analyticsData, salesRange]);
  const pieData = analyticsData?.lastWeek?.pieCharts?.salesByCategory ?? []

  // leaderboard helpers for top products
  const topProducts = Array.isArray(pieData) ? pieData : [];
  const maxTopVal = topProducts.length ? Math.max(...topProducts.map(p => p.value || p.quantity || 0)) : 1;
 
 
 
 
return (
  <div className="flex min-h-screen bg-gray-50">
    <div className="flex-1 flex flex-col">
      {/* Centered, constrained container on wide screens */}
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pt-16 sm:pt-20 lg:pt-24">
 
        {/* Header */}
        <div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-sm">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black p-2">Dashboard</h1>
            <p className="text-sm sm:text-red-500 text-slate-700 p-3">Overview of MediCart performance</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Pharmacy Analytics</span>
          </div>
        </div>

        {/* Reports UI removed from dashboard - reports are available on Reports page */}
 
        {/* Stat Cards (always 2 per row, aligned heights) */}
        <div className="grid grid-cols-2 gap-6">
          <StatCard
            className="min-h-[120px]"
            label="New Orders"
            value={analyticsData.metrics?.newOrders?.value ?? 0}
            trend={analyticsData.metrics?.newOrders?.trend}
            period="30 days"
            icon={onlineShopping}
            color="bg-violet-100 text-violet-700"
          />
          <StatCard
            className="min-h-[120px]"
            label="Total Income"
            value={formatRupee(analyticsData.metrics?.totalIncome?.value ?? 0)}
            trend={analyticsData.metrics?.totalIncome?.trend}
            period="All time"
            icon={salary}
            color="bg-emerald-100 text-emerald-700"
          />
          <StatCard
              className="min-h-[120px]"
              label="Avg Order Value"
              value={formatRupee(analyticsData.metrics?.avgOrderValue?.value ?? analyticsData.metrics?.totalExpense?.value ?? 0)}
              trend={analyticsData.metrics?.avgOrderValue?.trend ?? 0}
              period="Average"
              icon={bill}
              color="bg-rose-100 text-rose-700"
            />
          <StatCard
            className="min-h-[120px]"
            label="New Users"
            value={analyticsData.metrics?.newUsers?.value ?? 0}
            trend={analyticsData.metrics?.newUsers?.trend}
            period="30 days"
            icon={newaccount}
            color="bg-amber-100 text-amber-700"
          />
        </div>

  {/* Yearly Stats + Sales/Revenue (equal height cards) */}
  <div className="flex flex-wrap gap-2 justify-around ">
          {/* Yearly Stats card */}
          <div className="bg-white rounded-2xl shadow p-7 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Revenue (Yearly)</h2>
              <select
                className="border rounded-lg px-3 py-1.5 text-sm"
                value={statRange}
                onChange={(e) => setStatRange(e.target.value)}
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="text-2x2 font-bold text-gray-800 mb-1">
              {/* show total revenue for the selected range (real data only) */}
              {statRange === "weekly" ? formatRupee((analyticsData?.timeseries ?? []).slice(-7).reduce((s,d)=>s+(d.revenue||0),0)) : statRange === "monthly" ? formatRupee((analyticsData?.timeseries ?? []).slice(-30).reduce((s,d)=>s+(d.revenue||0),0)) : formatRupee((analyticsData?.timeseries ?? []).reduce((s,d)=>s+(d.revenue||0),0))}
            </div>
            <div className="h-80 w-full sm:w-80 bg-white">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyStatsData} margin={{ top: 10, right: 24, left: 8, bottom: 16 }}>
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} tickFormatter={(v) => formatRupee(v)} />
                  <Tooltip formatter={(value) => [formatRupee(value), 'Revenue']} />
                  <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "#334155", fontSize: 12 }} />
                  <Line name="Trend" type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales/Revenue card */}
          <div className="bg-white rounded-2xl shadow p-7 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Orders (Last 30 days)</h2>
              <select className="border rounded-lg px-3 py-1.5 text-sm" value={salesRange} onChange={(e) => setSalesRange(e.target.value)}>
                <option value="yearly">All time</option>
                <option value="monthly">30 days</option>
                <option value="weekly">7 days</option>
              </select>
            </div>
            <div className="text-2x2 font-bold text-gray-800 mb-1">
              {/* show total orders for selected range */}
              {salesRange === "weekly" ? (ordersData.slice(-7).reduce((s,d)=>s+(d.orders||0),0)) : salesRange === "monthly" ? (ordersData.slice(-30).reduce((s,d)=>s+(d.orders||0),0)) : (analyticsData?.summary?.totalOrders ?? 0)}
            </div>
            <div className="h-80 w-full sm:w-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData} margin={{ top: 10, right: 24, left: 8, bottom: 16 }} barSize={20} barCategoryGap="20%">
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                  <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "#334155", fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Performance + Sales by Category (equal height) */}
          <div className="flex flex-row flex-wrap gap-2 justify-around w-full">
            {/* Weekly Performance */}
            <div className="bg-white rounded-2xl shadow p-7 h-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Weekly Revenue Performance</h2>
              <div className="h-80 w-full sm:w-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyPerformanceData} margin={{ top: 10, right: 24, left: 8, bottom: 16 }}>
                      <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} tickFormatter={(v) => formatRupee(v)} />
                      <Tooltip formatter={(value) => [formatRupee(value), 'Revenue']} />
                      <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "#334155", fontSize: 12 }} />
                      <Line name="Revenue" type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales by Category */}
            <div className="bg-white rounded-2xl shadow p-4 h-full">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 p-3">Revenue by Category</h2>
              <div className="h-80 w-full sm:w-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value, name, props) => [value, props && props.payload ? props.payload.category : name]} />
                    <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "#334155", fontSize: 12 }} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={40}
                      paddingAngle={4}
                      label={({ name, percent, payload }) => `${payload.category || name} (${Math.round(percent * 100)}%)`}
                      labelLine
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Top Products placeholder removed from this row; moved to separate section at bottom for clarity */}
          </div>
        </div>
        
        
      </div>{/* Leaderboard: moved to its own section below so it appears at the end of the dashboard */}
        <div className="bg-white rounded-2xl shadow-sm p-4 w-full ">
          <h3 className="text-lg font-semibold mb-4">Top Products Leaderboard</h3>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Sold</th>
                  <th className="p-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 && (
                  <tr><td colSpan={4} className="p-2 text-sm text-slate-500">No top product data</td></tr>
                )}
                {topProducts.map((p, i) => (
                  <tr key={i} className={`${i === 0 ? 'bg-amber-50' : i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <td className="p-2 font-semibold">{i + 1}</td>
                    <td className="p-2">{p.category || p.name}</td>
                    <td className="p-2">{p.value || p.quantity || 0}</td>
                    <td className="p-2">
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.round(((p.value||p.quantity||0) / maxTopVal) * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  </div>
);
 
 
}
 