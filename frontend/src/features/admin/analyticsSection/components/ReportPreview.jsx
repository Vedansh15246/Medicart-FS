export default function ReportPreview({ preview, onExportCSV, onClear }) {
	if (!preview) {
		return null;
	}

	const rows = Array.isArray(preview.rows) ? preview.rows : [];
	const columns = Array.isArray(preview.columns) && preview.columns.length
		? preview.columns
		: (rows[0] ? Object.keys(rows[0]) : []);

	return (
		<div className="bg-white/80 rounded-xl shadow p-6">
			<h2 className="text-lg font-semibold mb-4">Report Preview</h2>

			{preview.summary && (
				<div className="flex gap-4 mb-4">
					{Object.entries(preview.summary).map(([k, v]) => (
						<div key={k} className="bg-gray-50 p-3 rounded shadow-sm">
							<div className="text-xs text-slate-500">{k}</div>
							<div className="text-lg font-semibold">
								{k.toLowerCase().includes("revenue") || k.toLowerCase().includes("avgordervalue")
									? `₹${Number(v || 0).toLocaleString("en-IN")}`
									: v}
							</div>
						</div>
					))}
				</div>
			)}

			<div className="overflow-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-gray-100">
							{columns.length > 0
								? columns.map((k) => (
										<th key={k} className="p-2 text-sm text-slate-600 capitalize">{k}</th>
									))
								: <th className="p-2 text-sm text-slate-600">No data</th>}
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 && (
							<tr><td className="p-2 text-sm text-slate-500">No rows to preview</td></tr>
						)}
						{rows.map((row, idx) => (
							<tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} border-t`}>
								{columns.map((col, i) => (
									<td key={i} className="p-2 text-sm">{String(row?.[col] ?? "")}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="mt-4 flex gap-2">
				<button onClick={() => onExportCSV(rows)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
					Download CSV
				</button>
				<button onClick={onClear} className="px-4 py-2 rounded-lg border">
					Clear Preview
				</button>
			</div>
		</div>
	);
}
