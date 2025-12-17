import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileCheck,
  CalendarDays,
  AlertOctagon,
  ArrowUpRight
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

const activityData = [
  { time: "08:00", logs: 12 },
  { time: "10:00", logs: 35 },
  { time: "12:00", logs: 22 },
  { time: "14:00", logs: 48 },
  { time: "16:00", logs: 38 },
  { time: "18:00", logs: 15 },
];

const pmStatusData = [
  { name: "Compliant", value: 85 },
  { name: "Due Soon", value: 10 },
  { name: "Overdue", value: 5 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Plant Overview</h2>
        <p className="text-slate-500">Real-time monitoring of equipment status and compliance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Today's Activities</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">148</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
              +12% vs avg
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">Requires Supervisor/QA</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">PM Overdue</CardTitle>
            <AlertOctagon className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">3</div>
            <p className="text-xs text-slate-500 mt-1">Critical Attention Needed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Compliance Score</CardTitle>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">98.5%</div>
            <p className="text-xs text-slate-500 mt-1">GAMP-5 Adherence</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Activity Volume (24h)</CardTitle>
            <CardDescription>Log entries recorded per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="logs"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLogs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>PM Compliance</CardTitle>
            <CardDescription>Equipment Maintenance Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">Compliant</span>
                </div>
                <span className="text-sm font-bold">85%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-400" />
                  <span className="text-sm font-medium">Due Soon</span>
                </div>
                <span className="text-sm font-bold">10%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-orange-400 w-[10%]" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <span className="text-sm font-bold">5%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 w-[5%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Critical Alerts</CardTitle>
          <CardDescription>Exceptions requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { id: "ALT-001", eq: "Autoclave A-01", msg: "Cycle aborted due to pressure drop", time: "10 mins ago", severity: "high" },
              { id: "ALT-002", eq: "HPLC-03", msg: "Calibration expired today", time: "2 hours ago", severity: "medium" },
              { id: "ALT-003", eq: "Room 104", msg: "Temp excursion > 25°C detected", time: "4 hours ago", severity: "medium" },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 h-2 w-2 rounded-full",
                    alert.severity === "high" ? "bg-rose-500 animate-pulse" : "bg-orange-400"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{alert.msg}</p>
                    <p className="text-xs text-slate-500">Equipment: <span className="font-mono">{alert.eq}</span> • ID: {alert.id}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{alert.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
