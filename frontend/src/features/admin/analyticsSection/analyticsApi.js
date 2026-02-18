import client from "../../../api/client";


export const fetchAnalyticsSummary = async () => {
	const response = await client.get("/api/admin/analytics/summary");
	return response.data;
};


export const fetchSalesByCategory = async () => {
	const response = await client.get("/api/admin/analytics/sales-by-category");
	return response.data;
};


export const fetchTopProducts = async (limit = 6) => {
	const response = await client.get("/api/admin/analytics/top-products", {
		params: { limit },
	});
	console.log("Top Products Data:", response.data);
	return response.data;
};


export const fetchRevenueSeries = async (range = "weekly") => {
	const response = await client.get("/api/admin/analytics/revenue-series", {
		params: { range },
	});
	return response.data;
};

export const fetchOrderSeries = async (range = "weekly") => {
	const response = await client.get("/api/admin/analytics/order-series", {
		params: { range },
	});
	return response.data;
};

// Trigger analytics data refresh from all services
export const refreshAnalytics = async () => {
	const response = await client.post("/api/admin/analytics/refresh");
	return response.data;
};

export const fetchReportList = async () => {
	const response = await client.get("/api/admin/reports/list");
	return response.data;
};

export const deleteReport = async (reportId) => {
	const response = await client.delete(`/api/admin/reports/${reportId}`);
	return response.data;
};

export const generateSalesReport = async (startDate, endDate) => {
	const response = await client.get("/api/admin/reports/sales", {
		params: { startDate, endDate },
	});
	return response.data;
};

export const generateInventoryReport = async () => {
	const response = await client.get("/api/admin/reports/inventory");
	return response.data;
};

export const generateUserActivityReport = async (startDate, endDate) => {
	const response = await client.get("/api/admin/reports/user-activity", {
		params: { startDate, endDate },
	});
	return response.data;
};
