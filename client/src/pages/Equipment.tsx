import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, MoreHorizontal, Plus, FileSpreadsheet, Search, AlertTriangle, Eye, FileText, Calendar, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEquipment, useCreateEquipment, useDeleteEquipment, useLogEntries, usePMSchedules } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function EquipmentMaster() {
  const { data: equipmentList, isLoading, isError } = useEquipment();
  const { data: allLogs } = useLogEntries();
  const { data: pmSchedules } = usePMSchedules();
  const createEquipment = useCreateEquipment();
  const deleteEquipment = useDeleteEquipment();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    equipmentId: "",
    name: "",
    type: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    location: "",
    status: "Operational" as const,
    qualificationStatus: "",
    pmFrequency: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      equipmentId: "",
      name: "",
      type: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      location: "",
      status: "Operational",
      qualificationStatus: "",
      pmFrequency: "",
      description: "",
    });
  };

  const handleCreate = async () => {
    if (!formData.equipmentId || !formData.name || !formData.type || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Equipment ID, Name, Type, Location).",
        variant: "destructive",
      });
      return;
    }

    const cleanData = {
      equipmentId: formData.equipmentId,
      name: formData.name,
      type: formData.type,
      location: formData.location,
      status: formData.status,
      ...(formData.manufacturer && { manufacturer: formData.manufacturer }),
      ...(formData.model && { model: formData.model }),
      ...(formData.serialNumber && { serialNumber: formData.serialNumber }),
      ...(formData.qualificationStatus && { qualificationStatus: formData.qualificationStatus }),
      ...(formData.pmFrequency && { pmFrequency: formData.pmFrequency }),
      ...(formData.description && { description: formData.description }),
    };

    try {
      await createEquipment.mutateAsync(cleanData);
      toast({
        title: "Equipment Added",
        description: `${formData.name} has been successfully added to the registry.`,
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this equipment?")) return;
    
    try {
      const result = await deleteEquipment.mutateAsync(id);
      if (result.equipment) {
        toast({
          title: "Equipment Set to Offline",
          description: "Equipment has log entries and was marked as offline instead of deleted.",
        });
      } else {
        toast({
          title: "Equipment Decommissioned",
          description: "Equipment has been successfully removed from the system.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decommission equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsDetailsDialogOpen(true);
  };

  const handleViewLogs = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsLogsDialogOpen(true);
  };

  const getEquipmentLogs = (equipmentId: string) => {
    return allLogs?.filter(log => log.equipmentId === equipmentId) || [];
  };

  const getEquipmentPMSchedules = (equipmentId: string) => {
    return pmSchedules?.filter(schedule => schedule.equipmentId === equipmentId) || [];
  };

  const hasPMSchedule = (equipmentId: string) => {
    return getEquipmentPMSchedules(equipmentId).length > 0;
  };

  const handleViewPMSchedule = (equipment: any) => {
    setLocation(`/pm?equipment=${equipment.id}`);
  };

  const filteredEquipment = equipmentList?.filter(item => 
    item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
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
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Equipment</h3>
          <p className="text-slate-500">Failed to load equipment list. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Equipment Master</h2>
          <p className="text-sm text-slate-500">Manage registered equipment, qualifications, and maintenance schedules.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-equipment">
                <Plus className="h-4 w-4" />
                Add New Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Equipment</DialogTitle>
                <DialogDescription>
                  Add a new piece of equipment to the GMP asset registry.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentId">Equipment ID *</Label>
                    <Input
                      id="equipmentId"
                      placeholder="e.g., EQ-BIO-001"
                      value={formData.equipmentId}
                      onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                      data-testid="input-equipment-id"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Bioreactor 500L"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-equipment-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger data-testid="select-equipment-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bioreactor">Bioreactor</SelectItem>
                        <SelectItem value="Centrifuge">Centrifuge</SelectItem>
                        <SelectItem value="Chromatography">Chromatography System</SelectItem>
                        <SelectItem value="Filtration">Filtration System</SelectItem>
                        <SelectItem value="Storage">Storage Equipment</SelectItem>
                        <SelectItem value="Sterilization">Sterilization</SelectItem>
                        <SelectItem value="Analyzer">Analyzer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger data-testid="select-equipment-location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Production Hall A">Production Hall A</SelectItem>
                        <SelectItem value="Production Hall B">Production Hall B</SelectItem>
                        <SelectItem value="QC Laboratory">QC Laboratory</SelectItem>
                        <SelectItem value="Downstream Suite">Downstream Suite</SelectItem>
                        <SelectItem value="Cold Storage Room">Cold Storage Room</SelectItem>
                        <SelectItem value="Utilities Area">Utilities Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      placeholder="e.g., Sartorius"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      data-testid="input-manufacturer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Biostat STR 500"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      data-testid="input-model"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      placeholder="e.g., SN-2024-12345"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      data-testid="input-serial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="In Use">In Use</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualificationStatus">Qualification Status</Label>
                    <Select
                      value={formData.qualificationStatus}
                      onValueChange={(value) => setFormData({ ...formData, qualificationStatus: value })}
                    >
                      <SelectTrigger data-testid="select-qualification">
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="IQ">IQ (Installation Qualification)</SelectItem>
                        <SelectItem value="OQ">OQ (Operational Qualification)</SelectItem>
                        <SelectItem value="PQ">PQ (Performance Qualification)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pmFrequency">PM Frequency</Label>
                    <Select
                      value={formData.pmFrequency}
                      onValueChange={(value) => setFormData({ ...formData, pmFrequency: value })}
                    >
                      <SelectTrigger data-testid="select-pm-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Semi-Annually">Semi-Annually</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about this equipment..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="input-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createEquipment.isPending} data-testid="button-submit-equipment">
                  {createEquipment.isPending ? "Adding..." : "Add Equipment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Asset Inventory</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by ID, Name or Serial..."
                className="pl-9 h-9 bg-slate-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-equipment"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Name / Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>PM Freq.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    {searchTerm ? "No equipment found matching your search." : "No equipment available. Click 'Add New Equipment' to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEquipment.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50" data-testid={`row-equipment-${item.id}`}>
                    <TableCell className="font-mono text-xs font-medium text-slate-700" data-testid={`text-equipment-id-${item.id}`}>{item.equipmentId}</TableCell>
                    <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                    <TableCell className="text-slate-600">{item.type}</TableCell>
                    <TableCell className="text-slate-600">{item.location}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{item.serialNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.qualificationStatus === "PQ" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }>
                        {item.qualificationStatus || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">{item.pmFrequency || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        item.status === "Operational" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "In Use"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "Maintenance"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${item.id}`}>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(item)} data-testid={`button-view-details-${item.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewLogs(item)} data-testid={`button-view-logs-${item.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Logs
                          </DropdownMenuItem>
                          {hasPMSchedule(item.id) && (
                            <DropdownMenuItem onClick={() => handleViewPMSchedule(item)} data-testid={`button-pm-schedule-${item.id}`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              PM Schedule
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-rose-600" 
                            onClick={() => handleDelete(item.id)}
                            data-testid={`button-delete-${item.id}`}
                          >
                            Decommission
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Equipment Details Modal */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Equipment Details
            </DialogTitle>
            <DialogDescription>
              {selectedEquipment?.equipmentId} - Complete equipment information
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn(
                  "text-xs font-medium",
                  selectedEquipment.status === "Operational" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  selectedEquipment.status === "In Use" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  selectedEquipment.status === "Maintenance" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-slate-100 text-slate-600 border-slate-200"
                )}>
                  {selectedEquipment.status}
                </Badge>
                <Badge variant="outline" className={cn(
                  "text-xs font-medium",
                  selectedEquipment.qualificationStatus === "PQ" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  {selectedEquipment.qualificationStatus || "Pending Qualification"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Equipment Name</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedEquipment.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Type</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedEquipment.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Manufacturer</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedEquipment.manufacturer || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Model</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedEquipment.model || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Serial Number</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{selectedEquipment.serialNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Location</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedEquipment.location}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">PM Frequency</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedEquipment.pmFrequency || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Created</p>
                  <p className="text-sm font-semibold text-slate-900">{new Date(selectedEquipment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedEquipment.description && (
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-2">Description</p>
                  <p className="text-sm text-slate-700">{selectedEquipment.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
            <Button onClick={() => { setIsDetailsDialogOpen(false); handleViewLogs(selectedEquipment); }}>
              <FileText className="h-4 w-4 mr-2" />
              View Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Logs Modal */}
      <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Activity Logs - {selectedEquipment?.name}
            </DialogTitle>
            <DialogDescription>
              All log entries for {selectedEquipment?.equipmentId}
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="max-h-[400px] overflow-y-auto">
              {getEquipmentLogs(selectedEquipment.id).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>No activity logs found for this equipment.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Log ID</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getEquipmentLogs(selectedEquipment.id).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs font-medium text-blue-600">{log.logId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{log.activityType}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{log.description}</p>
                          </div>
                        </TableCell>
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
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
