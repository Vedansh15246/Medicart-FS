import StatCard from "../StatCard";
import IconOrders from "../assets/icon-orders.svg";
import IconIncome from "../assets/icon-income.svg";
import IconAverage from "../assets/icon-average.svg";
import IconUsers from "../assets/icon-users.svg";

export default function StatCardsGrid({ data, formatRupee }) {
    const metrics = data?.metrics || {};

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
                label="New Orders"
                value={metrics?.newOrders?.value ?? 0}
                trend={metrics?.newOrders?.trend}
                period="Last 30 days"
                icon={IconOrders}
                bgColor="bg-violet-500"
                textColor="text-violet-600"
            />
            <StatCard
                label="Total Income"
                value={formatRupee(metrics?.totalIncome?.value)}
                trend={metrics?.totalIncome?.trend}
                period="Year to date"
                icon={IconIncome}
                bgColor="bg-emerald-500"
                textColor="text-emerald-600"
            />
            <StatCard
                label="Avg Order"
                value={formatRupee(metrics?.avgOrderValue?.value)}
                trend={metrics?.avgOrderValue?.trend}
                period="Per customer"
                icon={IconAverage}
                bgColor="bg-rose-500"
                textColor="text-rose-600"
            />
            <StatCard
                label="New Users"
                value={metrics?.newUsers?.value ?? 0}
                trend={metrics?.newUsers?.trend}
                period="Last 30 days"
                icon={IconUsers}
                bgColor="bg-amber-500"
                textColor="text-amber-600"
            />
        </div>
    );
}