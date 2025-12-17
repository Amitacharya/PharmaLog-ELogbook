import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const audits = [
  { id: "AUD-9920", timestamp: "2024-03-17 14:32:01", user: "John Doe", action: "Login", details: "Successful login from IP 192.168.1.42" },
  { id: "AUD-9921", timestamp: "2024-03-17 14:35:12", user: "John Doe", action: "Create Log", details: "Created log entry #LOG-2024-890 for Bioreactor B-204" },
  { id: "AUD-9922", timestamp: "2024-03-17 15:10:05", user: "Sarah King", action: "Review Log", details: "Reviewed and signed off log #LOG-2024-889" },
  { id: "AUD-9923", timestamp: "2024-03-17 15:45:33", user: "System", action: "Backup", details: "Automated hourly database backup completed" },
  { id: "AUD-9924", timestamp: "2024-03-17 16:00:00", user: "Mike Ross", action: "Update Status", details: "Changed status of Autoclave A-01 to 'In Use'" },
  { id: "AUD-9925", timestamp: "2024-03-17 16:15:22", user: "John Doe", action: "Logout", details: "User logged out manually" },
  { id: "AUD-9926", timestamp: "2024-03-17 09:12:01", user: "Admin", action: "User Config", details: "Updated permissions for user group 'Operators'" },
];

export default function AuditTrail() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Audit Trail</h2>
        <p className="text-muted-foreground">Complete immutable history of all system actions for 21 CFR Part 11 compliance.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Events</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search audit logs..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">User</TableHead>
                <TableHead className="w-[120px]">Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[100px] text-right">Audit ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.timestamp}</TableCell>
                  <TableCell className="font-medium">{item.user}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                      {item.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{item.details}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground text-right">{item.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
