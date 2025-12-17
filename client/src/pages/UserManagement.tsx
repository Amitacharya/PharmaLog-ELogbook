import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MoreVertical, Shield } from "lucide-react";

const users = [
  { id: "USR-001", name: "John Doe", role: "Operator", dept: "Production", status: "Active", lastLogin: "Today, 08:00" },
  { id: "USR-002", name: "Sarah King", role: "QA Manager", dept: "Quality", status: "Active", lastLogin: "Today, 09:15" },
  { id: "USR-003", name: "Mike Ross", role: "Supervisor", dept: "Production", status: "Active", lastLogin: "Yesterday" },
  { id: "USR-004", name: "David Lee", role: "Operator", dept: "Packaging", status: "Locked", lastLogin: "3 days ago" },
  { id: "USR-005", name: "Admin System", role: "Administrator", dept: "IT", status: "Active", lastLogin: "Today, 07:00" },
];

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h2>
          <p className="text-slate-500">Manage access control, roles, and user accounts.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Total 42 registered users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-slate-400" />
                      <span>{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.dept}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      user.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600"
                    }>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{user.lastLogin}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
