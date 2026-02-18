export default function DashboardHeader() {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-lg md:text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
				<p className="text-slate-500 text-sm font-medium">Real-time sales, revenue, and order trends</p>
			</div>
			<div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
				Live updates enabled
			</div>
		</div>
	);
}
