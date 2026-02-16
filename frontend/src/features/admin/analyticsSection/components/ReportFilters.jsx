export default function ReportFilters({
	startDate,
	endDate,
	reportType,
	setStartDate,
	setEndDate,
	setReportType,
	onGenerate,
}) {
	const today = new Date().toISOString().split("T")[0]; // e.g. "2026-02-16"

	return (
		<div className="bg-white rounded-2xl shadow p-6 mb-6">
			<div className="flex flex-wrap items-end gap-4">
				<div className="flex flex-col">
					<label className="text-xs text-slate-500 mb-1">Report Type</label>
					<select
						className="border rounded-lg px-3 py-2 text-sm"
						value={reportType}
						onChange={(e) => setReportType(e.target.value)}
					>
						<option value="Sales">Sales</option>
						<option value="Inventory">Inventory</option>
						<option value="User Activity">User Activity</option>
					</select>
				</div>

				<div className="flex flex-col">
					<label className="text-xs text-slate-500 mb-1">Start Date</label>
					<input
						type="date"
						className="border rounded-lg px-3 py-2 text-sm"
						value={startDate}
						max={endDate || today}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>

				<div className="flex flex-col">
					<label className="text-xs text-slate-500 mb-1">End Date</label>
					<input
						type="date"
						className="border rounded-lg px-3 py-2 text-sm"
						value={endDate}
						min={startDate || undefined}
						max={today}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>

				<button
					onClick={onGenerate}
					className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
				>
					Generate Report
				</button>
			</div>
		</div>
	);
}
