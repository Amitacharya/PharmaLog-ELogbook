import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, MoreHorizontal, Plus, FileSpreadsheet, Search, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useEquipment, useDeleteEquipment } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";

export default function EquipmentMaster() {
  const { data: equipmentList, isLoading, isError } = useEquipment();
  const deleteEquipment = useDeleteEquipment();
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this equipment?")) return;
    
    try {
      await deleteEquipment.mutateAsync(id);
      toast({
        title: "Equipment Decommissioned",
        description: "Equipment has been successfully removed from the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decommission equipment. Please try again.",
        variant: "destructive",
      });
    }
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
          <p className="text-slate-500">Failed to load equipment data. Please try again.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Equipment Master</h2>
          <p className="text-slate-500">Centralized registry of all GMP assets and qualification status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New Equipment
          </Button>
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
                <TableHead>Next PM</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                    {searchTerm ? "No equipment found matching your search." : "No equipment available."}
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
                        item.qualificationStatus === "Qualified" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }>
                        {item.qualificationStatus || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">{item.pmFrequency || "-"}</TableCell>
                    <TableCell className="text-slate-600">-</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${item.id}`}>
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Logs</DropdownMenuItem>
                          <DropdownMenuItem>PM Schedule</DropdownMenuItem>
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
    </div>
  );
}
