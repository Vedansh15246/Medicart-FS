export default function TopProductsTable({ topProducts = [], maxTopVal }) {
    return (
        /* Constrain the whole card to a max width (e.g., 400px) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full w-full max-w-none">
            <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[13px] font-bold text-slate-800">Top Products</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase">
                    Ranked
                </span>
            </div>

            <div className="overflow-hidden">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="text-slate-400 text-[10px] uppercase tracking-tight font-bold border-b border-slate-50">
                            <th className="px-4 py-2 w-8">#</th>
                            <th className="px-2 py-2">Product</th>
                            <th className="px-2 py-2 text-center w-12">Qty</th>
                            <th className="px-4 py-2 text-right w-16">Share</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {topProducts.map((p, i) => {
                            // Logic to identify the first row
                            const isFirst = i === 0;
                            
                            return (
                                <tr 
                                    key={i} 
                                    className={`transition-colors ${
                                        isFirst 
                                        ? 'bg-amber-50/50 hover:bg-amber-50' // Different color for the top product
                                        : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <td className="px-4 py-1.5">
                                        <span className={`font-mono text-[10px] ${
                                            isFirst ? 'text-amber-600 font-bold' : 'text-slate-400'
                                        }`}>
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 min-w-0">
                                        <p className={`text-[11px] font-semibold truncate ${
                                            isFirst ? 'text-amber-900' : 'text-slate-700'
                                        }`}>
                                            {p.medicineName || p.name}
                                        </p>
                                    </td>
                                    <td className={`px-2 py-1.5 text-center text-[11px] ${
                                        isFirst ? 'text-amber-700 font-bold' : 'text-slate-600'
                                    }`}>
                                        {p.totalQuantity ?? 0}
                                    </td>
                                    <td className="px-4 py-1.5">
                                        <div className="flex items-center justify-end">
                                            <div className="w-8 bg-slate-200/50 rounded-full h-1 overflow-hidden">
                                                <div 
                                                    className={`h-full ${isFirst ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                                                    style={{ width: `${Math.round(((p.totalRevenue ?? 0) / (maxTopVal || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}