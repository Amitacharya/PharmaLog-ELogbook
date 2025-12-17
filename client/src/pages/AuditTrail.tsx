import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const audits = [
  { id: "AUD-10045", timestamp: "2024-03-17 14:32:01", user: "John Doe", role: "Operator", action: "CREATE", entity: "Log Entry", oldValue: "-", newValue: "ID: LOG-1001" },
  { id: "AUD-10044", timestamp: "2024-03-17 14:30:15", user: "John Doe", role: "Operator", action: "LOGIN", entity: "Session", oldValue: "-", newValue: "Success" },
  { id: "AUD-10043", timestamp: "2024-03-17 12:15:00", user: "Sarah King", role: "QA", action: "APPROVE", entity: "Log Entry", oldValue: "Submitted", newValue: "Approved" },
  { id: "AUD-10042", timestamp: "2024-03-17 11:45:22", user: "Mike Ross", role: "Supervisor", action: "UPDATE", entity: "Equipment", oldValue: "Status: Active", newValue: "Status: Maintenance" },
  { id: "AUD-10041", timestamp: "2024-03-17 09:00:05", user: "System", role: "Admin", action: "BACKUP", entity: "Database", oldValue: "-", newValue: "Backup_17032024.bak" },
];

export default function AuditTrail() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Audit Trail</h2>
        <p className="text-slate-500">Secure, immutable record of all system activities (21 CFR Part 11).</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search audit logs..."
                  className="pl-9 h-9"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-3 w-3" />
                Filter
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-3 w-3" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[160px]">Timestamp (UTC)</TableHead>
                <TableHead className="w-[140px]">User / Role</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead className="w-[140px]">Entity</TableHead>
                <TableHead className="hidden md:table-cell">Old Value</TableHead>
                <TableHead className="hidden md:table-cell">New Value</TableHead>
                <TableHead className="text-right">Audit ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs text-slate-600">{item.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.user}</span>
                      <span className="text-xs text-slate-500">{item.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                      item.action === 'CREATE' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      item.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                      item.action === 'DELETE' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                      'bg-slate-50 text-slate-700 ring-slate-600/20'
                    }`}>
                      {item.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{item.entity}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-mono text-slate-500 truncate max-w-[150px]" title={item.oldValue}>
                    {item.oldValue}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-mono text-slate-900 truncate max-w-[150px]" title={item.newValue}>
                    {item.newValue}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400 text-right">{item.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
