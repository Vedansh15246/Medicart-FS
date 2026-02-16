export default function ReportHeader({ reportCount }) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 mb-6">
			
			<div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
				{reportCount} reports generated
			</div>
		</div>
	);
}
