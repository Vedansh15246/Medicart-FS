import { LineChart, Line, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";

export default function WeeklyRevenueCard({ weeklyPerformanceData, formatRupee }) {
	return (
		<div className="bg-white rounded-2xl shadow p-7 h-full overflow-hidden">
			<h2 className="text-lg font-semibold mb-4 text-gray-800">Weekly Revenue Performance</h2>
			<div className="h-80 w-full min-w-0">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={weeklyPerformanceData} margin={{ top: 10, right: 24, left: 8, bottom: 16 }}>
						<XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} />
						<YAxis tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={8} tickFormatter={(v) => formatRupee(v)} />
						<Tooltip formatter={(value) => [formatRupee(value), "Revenue"]} contentStyle={{ border: 'none', boxShadow: 'none', backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 8 }} />
						<Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: "#334155", fontSize: 12 }} />
						<Line name="Revenue" type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
