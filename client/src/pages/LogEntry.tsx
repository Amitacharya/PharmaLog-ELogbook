import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Lock, Plus, Save, Filter, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const mockLogs = [
  { id: "LOG-1001", eq: "Bioreactor 200L", activity: "pH Calibration", user: "John Doe", time: "2024-03-17 08:30", status: "Approved", remarks: "Slope: 98%" },
  { id: "LOG-1002", eq: "Autoclave Sterilizer", activity: "Cycle Start", user: "Mike Ross", time: "2024-03-17 09:15", status: "Submitted", remarks: "Cycle #4421, Load A" },
  { id: "LOG-1003", eq: "Filling Machine", activity: "Line Clearance", user: "Sarah King", time: "2024-03-17 10:00", status: "Draft", remarks: "Changeover to Product B" },
];

export default function LogEntry() {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSignModalOpen(false);
      toast({
        title: "Record Signed & Saved",
        description: "Electronic signature applied successfully. Audit trail updated.",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">E-Log Book</h2>
          <p className="text-slate-500">Record equipment activities with 21 CFR Part 11 compliant signatures.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Entry Form */}
        <Card className="lg:col-span-1 border-t-4 border-t-blue-600 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>New Activity Log</CardTitle>
            <CardDescription>All fields are mandatory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Equipment</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Search equipment..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bio">Bioreactor 200L (EQ-BIO-001)</SelectItem>
                  <SelectItem value="aut">Autoclave Sterilizer (EQ-AUT-002)</SelectItem>
                  <SelectItem value="hplc">HPLC System (EQ-HPL-003)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="op">Operation / Usage</SelectItem>
                  <SelectItem value="cl">Cleaning</SelectItem>
                  <SelectItem value="mt">Maintenance</SelectItem>
                  <SelectItem value="cal">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Remarks / Observations</Label>
              <Textarea placeholder="Enter detailed observations..." className="min-h-[100px]" />
            </div>

            <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-500 border">
              <div className="flex justify-between mb-1">
                <span>Logged By:</span>
                <span className="font-mono font-medium text-slate-700">John Doe</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-mono font-medium text-slate-700">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setIsSignModalOpen(true)}>
              <Lock className="mr-2 h-4 w-4" />
              Sign & Submit Entry
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Logs List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Entries</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Filter logs..." className="h-8 w-[200px]" />
                <Button variant="outline" size="sm" className="h-8"><Filter className="h-3 w-3" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-medium">{log.id}</TableCell>
                    <TableCell className="font-medium text-sm">{log.eq}</TableCell>
                    <TableCell className="text-sm">{log.activity}</TableCell>
                    <TableCell className="text-xs text-slate-500">{log.user}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">{log.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-2 py-0.5",
                        log.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        log.status === "Submitted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* E-Signature Modal */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Electronic Signature Required</DialogTitle>
            <DialogDescription>
              Enter credentials to sign this record. This action is immutable.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSign}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value="jdoe" disabled className="bg-slate-50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Signing Reason</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">I am the author of this entry</SelectItem>
                    <SelectItem value="review">I have reviewed this entry</SelectItem>
                    <SelectItem value="approve">I am approving this entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSignModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Sign Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
