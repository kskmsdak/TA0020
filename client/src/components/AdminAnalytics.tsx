import { Report } from "@shared/schema";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdminAnalytics({ reports }: { reports: Report[] }) {
  // 1. Status Distribution
  const statusCounts = reports.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // 2. Severity by Type
  const severityByType = reports.reduce((acc, curr) => {
    if (!acc[curr.complaintType]) {
      acc[curr.complaintType] = { total: 0, count: 0 };
    }
    acc[curr.complaintType].total += curr.severityScore;
    acc[curr.complaintType].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const severityData = Object.entries(severityByType).map(([name, { total, count }]) => ({
    name,
    avgSeverity: Math.round(total / count)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-64">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Reports by Status</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Avg Severity by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={severityData}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="avgSeverity" fill="#475569" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
