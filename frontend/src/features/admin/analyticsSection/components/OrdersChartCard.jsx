import { BarChart, Bar, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";

export default function OrdersChartCard({ salesRange, setSalesRange, ordersData, totalOrders }) {
	return (
		<div className="bg-white rounded-2xl shadow p-7 h-full overflow-hidden">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-gray-800">Orders</h2>
				<select
					className="border rounded-lg px-3 py-1.5 text-sm"
					value={salesRange}
					onChange={(e) => setSalesRange(e.target.value)}
				>
					<option value="daily">Today</option>
					<option value="yearly">All time</option>
					<option value="monthly">30 days</option>
					<option value="weekly">7 days</option>
				</select>
			</div>

			<div className="text-2x2 font-bold text-gray-800 mb-1">{totalOrders}</div>

			<div className="h-64 w-full min-w-0">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={ordersData} margin={{ top: 10, right: 24, left: 8, bottom: 16 }} barSize={20} barCategoryGap="20%">
						<XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
						<YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
						<Tooltip formatter={(value) => [value, "Orders"]} contentStyle={{ border: 'none', boxShadow: 'none', backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 8 }} />
						<Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "#334155", fontSize: 12 }} />
						<Bar dataKey="orders" fill="#60a5fa" radius={[6, 6, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
