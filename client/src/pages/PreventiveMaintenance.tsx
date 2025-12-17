import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle, FileText, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";

const pmSchedules = [
  { id: "PM-001", eq: "Bioreactor 200L", task: "Seal Replacement", freq: "Monthly", last: "2024-02-15", next: "2024-03-15", status: "Overdue" },
  { id: "PM-002", eq: "Autoclave Sterilizer", task: "Validation Cycle", freq: "Weekly", last: "2024-03-10", next: "2024-03-17", status: "Due Today" },
  { id: "PM-003", eq: "HPLC System", task: "Column Flush", freq: "Daily", last: "2024-03-16", next: "2024-03-17", status: "Completed" },
  { id: "PM-004", eq: "Centrifuge C-12", task: "Motor Inspection", freq: "Quarterly", last: "2023-12-20", next: "2024-03-20", status: "Upcoming" },
];

export default function PreventiveMaintenance() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Preventive Maintenance</h2>
          <p className="text-slate-500">Manage maintenance schedules, work orders, and compliance.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Maintenance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
             <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mx-auto"
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <span>Overdue (3)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-400" />
                <span>Due Today (2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Scheduled (12)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>PM Schedules</CardTitle>
            <CardDescription>Upcoming and overdue tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pmSchedules.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.eq}</TableCell>
                    <TableCell>{item.task}</TableCell>
                    <TableCell className="text-slate-500">{item.freq}</TableCell>
                    <TableCell className="font-medium">{item.next}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "px-2 py-0.5",
                        item.status === "Overdue" ? "bg-rose-50 text-rose-700 border-rose-200" :
                        item.status === "Due Today" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        item.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Log</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
