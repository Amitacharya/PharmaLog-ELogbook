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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Plus, FileText, Clock, CheckCircle, AlertCircle, Search, Eye, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEquipment, useLogEntries, useCreateLogEntry, useSubmitLogEntry, useApproveLogEntry } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";

export default function LogEntry() {
  const { user } = useAuth();
  const { data: equipment, isLoading: equipmentLoading } = useEquipment();
  const { data: logs, isLoading: logsLoading, isError } = useLogEntries();
  const createLogEntry = useCreateLogEntry();
  const submitLogEntry = useSubmitLogEntry();
  const approveLogEntry = useApproveLogEntry();

  const [activeTab, setActiveTab] = useState("new");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [signAction, setSignAction] = useState<"submit" | "approve">("submit");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [viewingLog, setViewingLog] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    equipmentId: "",
    activityType: "",
    activityDate: new Date().toISOString().split('T')[0], // Today's date as default
    startTime: "",
    endTime: "",
    description: "",
    batchNumber: "",
    readings: ""
  });

  const [signatureData, setSignatureData] = useState({
    password: "",
    reason: ""
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateDraft = async () => {
    if (!formData.equipmentId || !formData.activityType || !formData.activityDate || !formData.startTime || !formData.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Parse the selected date
    const [year, month, day] = formData.activityDate.split('-').map(Number);
    const [startHour, startMin] = formData.startTime.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, startHour, startMin);
    
    let endDate: Date | undefined;
    if (formData.endTime) {
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      endDate = new Date(year, month - 1, day, endHour, endMin);
    }

    try {
      const logEntry = await createLogEntry.mutateAsync({
        equipmentId: formData.equipmentId,
        activityType: formData.activityType as any,
        startTime: startDate.toISOString(),
        endTime: endDate?.toISOString(),
        description: formData.description,
        batchNumber: formData.batchNumber || undefined,
        readings: formData.readings || undefined,
        status: "Draft"
      });
      
      setSelectedLogId(logEntry.id);
      setSignAction("submit");
      setIsSignModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create log entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLogId) return;

    try {
      if (signAction === "submit") {
        await submitLogEntry.mutateAsync({
          id: selectedLogId,
          password: signatureData.password,
          reason: signatureData.reason
        });
        toast({
          title: "Entry Submitted",
          description: "Log entry has been signed and submitted for approval.",
        });
      } else {
        await approveLogEntry.mutateAsync({
          id: selectedLogId,
          password: signatureData.password,
          reason: signatureData.reason
        });
        toast({
          title: "Entry Approved",
          description: "Log entry has been approved successfully.",
        });
      }
      
      setIsSignModalOpen(false);
      setFormData({
        equipmentId: "",
        activityType: "",
        activityDate: new Date().toISOString().split('T')[0],
        startTime: "",
        endTime: "",
        description: "",
        batchNumber: "",
        readings: ""
      });
      setSignatureData({ password: "", reason: "" });
      setSelectedLogId(null);
      setActiveTab("history");
    } catch (error: any) {
      toast({
        title: "Signature Failed",
        description: error.message || "Failed to sign entry. Please verify your credentials.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = (logId: string) => {
    setSelectedLogId(logId);
    setSignAction("approve");
    setIsSignModalOpen(true);
  };

  const handleViewDetails = (log: any) => {
    setViewingLog(log);
    setIsDetailsModalOpen(true);
  };

  const handleApproveFromDetails = () => {
    if (viewingLog) {
      setIsDetailsModalOpen(false);
      handleApprove(viewingLog.id);
    }
  };

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = log.logId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getEquipmentName = (equipmentId: string) => {
    return equipment?.find(eq => eq.id === equipmentId)?.name || equipmentId;
  };

  const pendingApprovalCount = logs?.filter(log => log.status === "Submitted").length || 0;
  const draftCount = logs?.filter(log => log.status === "Draft").length || 0;
  const approvedCount = logs?.filter(log => log.status === "Approved").length || 0;

  if (equipmentLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Log Entries</h3>
          <p className="text-slate-500">Failed to load log entries. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900" data-testid="text-page-title">E-Log Book</h2>
          <p className="text-sm text-slate-500 mt-1">Record and manage equipment activities with compliant electronic signatures</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingApprovalCount}</p>
              <p className="text-xs text-slate-500">Pending Approval</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{draftCount}</p>
              <p className="text-xs text-slate-500">Drafts</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{approvedCount}</p>
              <p className="text-xs text-slate-500">Approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="new" className="gap-2" data-testid="tab-new-entry">
            <Plus className="h-4 w-4" />
            New Entry
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2" data-testid="tab-history">
            <FileText className="h-4 w-4" />
            Log History
            {pendingApprovalCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-[10px]">
                {pendingApprovalCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* New Entry Tab */}
        <TabsContent value="new" className="mt-0">
          <Card className="border-t-4 border-t-blue-600">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Create New Activity Log</CardTitle>
              <CardDescription>Fill in the details below. All fields marked are required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Equipment <span className="text-rose-500">*</span></Label>
                    <Select value={formData.equipmentId} onValueChange={(value) => handleFormChange("equipmentId", value)}>
                      <SelectTrigger data-testid="select-equipment" className="h-10">
                        <SelectValue placeholder="Select equipment..." />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment?.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            <div className="flex flex-col">
                              <span>{eq.name}</span>
                              <span className="text-xs text-slate-500">{eq.equipmentId}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Activity Type <span className="text-rose-500">*</span></Label>
                    <Select value={formData.activityType} onValueChange={(value) => handleFormChange("activityType", value)}>
                      <SelectTrigger data-testid="select-activity-type" className="h-10">
                        <SelectValue placeholder="Select activity type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operation">Operation / Usage</SelectItem>
                        <SelectItem value="Cleaning">Cleaning</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Calibration">Calibration</SelectItem>
                        <SelectItem value="Sampling">Sampling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Activity Date <span className="text-rose-500">*</span></Label>
                    <Input 
                      type="date" 
                      value={formData.activityDate}
                      onChange={(e) => handleFormChange("activityDate", e.target.value)}
                      data-testid="input-activity-date"
                      className="h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Start Time <span className="text-rose-500">*</span></Label>
                      <Input 
                        type="time" 
                        value={formData.startTime}
                        onChange={(e) => handleFormChange("startTime", e.target.value)}
                        data-testid="input-start-time"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">End Time</Label>
                      <Input 
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleFormChange("endTime", e.target.value)}
                        data-testid="input-end-time"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Remarks / Observations <span className="text-rose-500">*</span></Label>
                    <Textarea 
                      placeholder="Enter detailed observations, activities performed, deviations noted, etc." 
                      className="min-h-[140px] resize-none"
                      value={formData.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      data-testid="textarea-description"
                    />
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 border space-y-2">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Entry Details</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-slate-500">Logged By:</div>
                      <div className="font-medium text-slate-900">{user?.fullName}</div>
                      <div className="text-slate-500">Date:</div>
                      <div className="font-medium text-slate-900">{new Date().toLocaleDateString()}</div>
                      <div className="text-slate-500">Time:</div>
                      <div className="font-medium text-slate-900">{new Date().toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => setFormData({
                  equipmentId: "",
                  activityType: "",
                  activityDate: new Date().toISOString().split('T')[0],
                  startTime: "",
                  endTime: "",
                  description: "",
                  batchNumber: "",
                  readings: ""
                })}
              >
                Clear Form
              </Button>
              <Button 
                onClick={handleCreateDraft}
                disabled={createLogEntry.isPending}
                data-testid="button-create-log"
                className="gap-2"
              >
                <Lock className="h-4 w-4" />
                {createLogEntry.isPending ? "Creating..." : "Sign & Submit"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Log Entry History</CardTitle>
                  <CardDescription>View and manage all activity log entries</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search logs..." 
                      className="pl-9 h-9 w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-filter-logs"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Submitted">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-semibold">Log ID</TableHead>
                      <TableHead className="font-semibold">Equipment</TableHead>
                      <TableHead className="font-semibold">Activity</TableHead>
                      <TableHead className="font-semibold">Date/Time</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                          {searchTerm || statusFilter !== "all" 
                            ? "No log entries found matching your filters." 
                            : "No log entries available. Create your first entry above."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-slate-50/50" data-testid={`row-log-${log.id}`}>
                          <TableCell className="font-mono text-xs font-semibold text-blue-600">{log.logId}</TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{getEquipmentName(log.equipmentId)}</div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">{log.activityType}</TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleDateString()}<br/>
                            <span className="font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-xs font-medium",
                              log.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              log.status === "Submitted" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-slate-100 text-slate-600 border-slate-200"
                            )}>
                              {log.status === "Submitted" ? "Pending Approval" : log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewDetails(log)}
                                data-testid={`button-view-${log.id}`}
                                className="h-7 text-xs gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              {log.status === "Submitted" && (user?.role === "QA" || user?.role === "Admin") && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(log.id)}
                                  data-testid={`button-approve-${log.id}`}
                                  className="h-7 text-xs"
                                >
                                  Approve
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* E-Signature Modal */}
      <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Electronic Signature Required
            </DialogTitle>
            <DialogDescription>
              {signAction === "submit" 
                ? "Re-enter your password to sign and submit this record."
                : "Re-enter your password to approve this record."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSign}>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                <p className="font-medium">Signing as:</p>
                <p>{user?.fullName} ({user?.username})</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={signatureData.password}
                  onChange={(e) => setSignatureData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder="Enter your password"
                  data-testid="input-signature-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Signing Reason</Label>
                <Select 
                  value={signatureData.reason}
                  onValueChange={(value) => setSignatureData(prev => ({ ...prev, reason: value }))}
                  required
                >
                  <SelectTrigger data-testid="select-signature-reason">
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I am the author of this entry">I am the author of this entry</SelectItem>
                    <SelectItem value="I have reviewed this entry">I have reviewed this entry</SelectItem>
                    <SelectItem value="I am approving this entry">I am approving this entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border">
                This action is 21 CFR Part 11 compliant and creates an immutable audit trail record.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSignModalOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={submitLogEntry.isPending || approveLogEntry.isPending}
                data-testid="button-sign-record"
              >
                {submitLogEntry.isPending || approveLogEntry.isPending ? "Verifying..." : "Sign Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Log Entry Details
            </DialogTitle>
            <DialogDescription>
              {viewingLog?.logId} - Complete activity log information
            </DialogDescription>
          </DialogHeader>
          {viewingLog && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn(
                  "text-xs font-medium",
                  viewingLog.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  viewingLog.status === "Submitted" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-slate-100 text-slate-600 border-slate-200"
                )}>
                  {viewingLog.status === "Submitted" ? "Pending Approval" : viewingLog.status}
                </Badge>
                <span className="text-xs text-slate-500">
                  Created: {new Date(viewingLog.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Equipment</p>
                  <p className="text-sm font-semibold text-slate-900">{getEquipmentName(viewingLog.equipmentId)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Activity Type</p>
                  <p className="text-sm font-semibold text-slate-900">{viewingLog.activityType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Start Time</p>
                  <p className="text-sm font-semibold text-slate-900">{new Date(viewingLog.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">End Time</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {viewingLog.endTime ? new Date(viewingLog.endTime).toLocaleString() : "In progress"}
                  </p>
                </div>
                {viewingLog.batchNumber && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Batch Number</p>
                    <p className="text-sm font-semibold text-slate-900">{viewingLog.batchNumber}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 uppercase font-medium mb-2">Description / Observations</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewingLog.description}</p>
              </div>

              {viewingLog.readings && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-2">Readings / Measurements</p>
                  <p className="text-sm text-blue-900 font-mono">{viewingLog.readings}</p>
                </div>
              )}

              {viewingLog.submittedAt && (
                <div className="p-3 bg-slate-50 rounded-lg border text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-3 w-3" />
                    <span>Submitted on {new Date(viewingLog.submittedAt).toLocaleString()}</span>
                  </div>
                  {viewingLog.approvedAt && (
                    <div className="flex items-center gap-2 text-emerald-600 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Approved on {new Date(viewingLog.approvedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            {viewingLog?.status === "Submitted" && (user?.role === "QA" || user?.role === "Admin") && (
              <Button onClick={handleApproveFromDetails} data-testid="button-approve-from-details">
                <Lock className="h-4 w-4 mr-2" />
                Approve Entry
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
