export default function StatCard({ label, value, trend, period, icon, bgColor, className }) {
  const isPositive = trend >= 0;

  return (
    /* Added max-w-[280px] to prevent it from stretching too far */
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all max-w-[280px] w-full ${className}`}>
      
      <div className={`h-0.5 w-full ${bgColor}`} />
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400 truncate">
            {label}
          </p>
          <div className={`p-1.5 rounded-lg ${bgColor} bg-opacity-10 shrink-0`}>
            <img src={icon} alt="" className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-lg font-bold text-slate-900 leading-none">
            {value}
          </h3>
        </div>

        <p className="text-[9px] text-slate-400 mt-1 font-medium italic">
          {period}
        </p>
      </div>
    </div>
  );
}