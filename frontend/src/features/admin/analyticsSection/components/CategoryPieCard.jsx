import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function CategoryPieCard({ pieData = [], colors = [] }) {
    const safeColors = colors?.length ? colors : ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    const hasData = pieData.some((item) => Number(item?.value) > 0);

    return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col overflow-hidden">
            <h2 className="text-base font-bold text-slate-800 mb-6">Revenue by Category</h2>
            <div className="flex-1 min-h-[260px] w-full min-w-0">
                {!hasData ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="text-4xl mb-2">🍰</div>
                        <p className="text-sm">No data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minHeight={260} minWidth={0}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="category"
                                innerRadius="50%" // Slightly smaller inner hole
                                outerRadius="75%"
                                cx="50%"
                                cy="45%"
                                paddingAngle={6}
                            >
                                {pieData.map((_, idx) => (
                                    <Cell key={idx} fill={safeColors[idx % safeColors.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "10px", border: "none", boxShadow: 'none', backgroundColor: 'rgba(255,255,255,0.98)' }}
                            />
                            <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}