import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchAnalyticsSummary,
  fetchSalesByCategory,
  fetchTopProducts,
  fetchRevenueSeries,
  fetchOrderSeries,
  refreshAnalytics,
} from "../analyticsApi";

import DashboardHeader from "../components/DashboardHeader";
import StatCardsGrid from "../components/StatCardsGrid";
import RevenueChartCard from "../components/RevenueChartCard";
import OrdersChartCard from "../components/OrdersChartCard";
import CategoryPieCard from "../components/CategoryPieCard";
import TopProductsTable from "../components/TopProductsTable";


const PIE_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [statRange, setStatRange] = useState("yearly");
  const [salesRange, setSalesRange] = useState("yearly");
  const [summary, setSummary] = useState({});
  const [categorySales, setCategorySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [orderSeries, setOrderSeries] = useState([]);
  const isMounted = useRef(true);

  const formatRupee = (value) => {
    const normalized = Number(value) || 0;
    return `₹${normalized.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const [summaryData, categoryData, topProductsData] =
        await Promise.all([
          fetchAnalyticsSummary(),
          fetchSalesByCategory(),
          fetchTopProducts(6),
        ]);

      if (!isMounted.current) return;

      setSummary(summaryData ?? {});
      const resolvedCategoryData = Array.isArray(categoryData)
        ? categoryData
        : (Array.isArray(categoryData?.data) ? categoryData.data : (Array.isArray(categoryData?.categorySales) ? categoryData.categorySales : []));
      setCategorySales(resolvedCategoryData);
      setTopProducts(Array.isArray(topProductsData) ? topProductsData : []);
    } catch (error) {
      console.warn("Failed to load analytics data", error);
    }
  }, []);

  const loadRevenueSeries = useCallback(async (range) => {
    try {
      const data = await fetchRevenueSeries(range);
      if (!isMounted.current) return;
      setRevenueSeries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Failed to load revenue series", error);
      if (isMounted.current) setRevenueSeries([]);
    }
  }, []);

  const loadOrderSeries = useCallback(async (range) => {
    try {
      const data = await fetchOrderSeries(range);
      if (!isMounted.current) return;
      setOrderSeries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Failed to load order series", error);
      if (isMounted.current) setOrderSeries([]);
    }
  }, []);


  useEffect(() => {
    isMounted.current = true;
    const initialLoad = setTimeout(() => {
      loadDashboardData();
    }, 0);
    const intervalId = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      isMounted.current = false;
      clearTimeout(initialLoad);
      clearInterval(intervalId);
    };
  }, [loadDashboardData]);

  useEffect(() => {
    loadRevenueSeries(statRange);
  }, [loadRevenueSeries, statRange]);

  useEffect(() => {
    loadOrderSeries(salesRange);
  }, [loadOrderSeries, salesRange]);

  // Generate chart data from summary
  const yearlyStatsData = useMemo(() => {
    if (Array.isArray(revenueSeries) && revenueSeries.length > 0) {
      return revenueSeries.map((item) => ({
        label: item.label ?? item.date ?? "",
        value: item.value ?? item.totalRevenue ?? 0,
      }));
    }
    return [];
  }, [revenueSeries]);

  const ordersData = useMemo(() => {
    if (Array.isArray(orderSeries) && orderSeries.length > 0) {
      return orderSeries.map((item) => ({
        label: item.label ?? item.date ?? "",
        orders: item.orders ?? item.totalOrders ?? 0,
      }));
    }
    return [];
  }, [orderSeries]);

  const pieData = useMemo(() => {
    const normalized = categorySales
      .map((item) => {
        const value = Number(item?.totalRevenue ?? item?.value ?? item?.revenue ?? 0);
        return {
          category: item?.categoryName ?? item?.category ?? item?.name ?? item?.label ?? "Uncategorized",
          value: Number.isFinite(value) ? value : 0,
        };
      })
      .filter((item) => item.category && item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (normalized.length <= 3) {
      return normalized;
    }

    const topThree = normalized.slice(0, 3);
    const othersValue = normalized
      .slice(3)
      .reduce((sum, item) => sum + item.value, 0);

    return [...topThree, { category: "Others", value: othersValue }];
  }, [categorySales]);

  const maxTopVal = useMemo(() => {
    const values = topProducts.map((item) => item.totalRevenue || 0);
    return Math.max(1, ...values);
  }, [topProducts]);

  const totalRevenueByRange = useMemo(() => {
    if (statRange === "daily") {
      return summary.revenueToday || 0;
    }
    if (statRange === "weekly") {
      return summary.revenueThisWeek || 0;
    }
    if (statRange === "monthly") {
      return summary.revenueThisMonth || 0;
    }
    return summary.revenueThisYear || 0;
  }, [summary, statRange]);

  const totalOrdersByRange = useMemo(() => {
    if (salesRange === "daily") {
      return summary.ordersToday || 0;
    }
    if (salesRange === "weekly") {
      return summary.ordersThisWeek || 0;
    }
    if (salesRange === "monthly") {
      return summary.ordersThisMonth || 0;
    }
    return summary.ordersThisYear || 0;
  }, [summary, salesRange]);

  const resolvedSummary = summary || {};
  const resolvedOrders = resolvedSummary.ordersThisMonth ?? resolvedSummary.totalOrders ?? resolvedSummary.ordersToday ?? 0;
  const resolvedUsers = resolvedSummary.totalUsers ?? resolvedSummary.newUsers30 ?? 0;
  const dashboardDto = {
    metrics: {
      newOrders: { value: resolvedOrders },
      totalIncome: { value: resolvedSummary.totalRevenue ?? 0 },
      avgOrderValue: { value: resolvedSummary.avgOrderValue ?? 0, trend: 0 },
      totalExpense: { value: 0 },
      newUsers: { value: resolvedUsers },
    },
    yearlyStatsData,
    ordersData,
    pieData,
    topProducts,
    maxTopVal,
    totalRevenueByRange,
    totalOrdersByRange,
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2 sm:pt-24">
        
        {/* 1. Header Section */}
        <div className="mb-8">
          <DashboardHeader />
        </div>

        {/* 2. Top Stats Section (Slim & Compact) */}
        <section className="mb-8 max-w-6xl">
          <StatCardsGrid data={dashboardDto} formatRupee={formatRupee} />
        </section>

        {/* 3. Primary Charts Row (Large Trends) */}
        <div className=" flex flex-col lg:flex-row gap-7  ">
          <div className="flex-1  p-3 h-[460px]">
            <RevenueChartCard
              statRange={statRange}
              setStatRange={setStatRange}
              yearlyStatsData={dashboardDto.yearlyStatsData}
              totalRevenue={dashboardDto.totalRevenueByRange}
              formatRupee={formatRupee}
            />
          </div>
          <div className="flex-1  p-3 h-[460px]">
            <OrdersChartCard
              salesRange={salesRange}
              setSalesRange={setSalesRange}
              ordersData={dashboardDto.ordersData}
              totalOrders={dashboardDto.totalOrdersByRange}
            />
          </div>
        </div>

        {/* 4. Secondary Row (The "Analysis" Row) */}
        <div className="flex flex-col lg:flex-row gap-7">
          <div className="flex-1  p-3 h-[460px]">
            <CategoryPieCard 
              pieData={dashboardDto.pieData} 
              colors={PIE_COLORS} 
            />
          </div>

          <div className="flex-1  p-3 h-[460px]">
            <TopProductsTable 
              topProducts={dashboardDto.topProducts} 
              maxTopVal={dashboardDto.maxTopVal} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}