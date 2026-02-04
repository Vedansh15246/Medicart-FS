// src/components/StatCard.jsx
export default function StatCard({ label, value, trend, period, icon, color }) {
  const formatted = typeof value === "number" ? value.toLocaleString() : value ?? "0";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${color}`}>
        <img src={icon} alt="Icon" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-600">{label}</div>
        <div className="text-2xl font-semibold text-slate-900">{formatted}</div>
        <div className="mt-1 text-sm text-slate-400">{period}</div>
      </div>
    </div>
  );
}
