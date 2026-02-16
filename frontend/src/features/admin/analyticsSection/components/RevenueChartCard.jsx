import { LineChart, Line, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";

export default function RevenueChartCard({
	statRange,
	setStatRange,
	yearlyStatsData,
	formatRupee,
	totalRevenue,
}) {
	return (
		<div className="bg-white rounded-2xl shadow p-7 h-full overflow-hidden">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-gray-800">Revenue</h2>
				<select
					className="border rounded-lg px-3 py-1.5 text-sm"
					value={statRange}
					onChange={(e) => setStatRange(e.target.value)}
				>
					<option value="daily">Daily</option>
					<option value="yearly">Yearly</option>
					<option value="monthly">Monthly</option>
					<option value="weekly">Weekly</option>
				</select>
			</div>

			<div className="text-2x2 font-bold text-gray-800 mb-1">{formatRupee(totalRevenue)}</div>

			<div className="h-64 w-full min-w-0">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={yearlyStatsData} margin={{ top: 10, right: 24, left: 8, bottom: 16 }}>
						<XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
						<YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} tickFormatter={(v) => formatRupee(v)} />
						<Tooltip formatter={(value) => [formatRupee(value), "Revenue"]} contentStyle={{ border: 'none', boxShadow: 'none', backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 0 }} />
						<Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "#334155", fontSize: 12 }} />
						<Line name="Trend" type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
