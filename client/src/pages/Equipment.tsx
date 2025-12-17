import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, MoreHorizontal, Plus, FileSpreadsheet, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const equipmentList = [
  { id: "EQ-BIO-001", name: "Bioreactor 200L", type: "Upstream", area: "Suite A", serial: "SN-99821", qual: "Qualified", pmFreq: "Monthly", nextPm: "2024-04-15" },
  { id: "EQ-AUT-002", name: "Autoclave Sterilizer", type: "Sterilization", area: "Wash Room", serial: "SN-11202", qual: "Qualified", pmFreq: "Weekly", nextPm: "2024-03-20" },
  { id: "EQ-HPL-003", name: "HPLC System Agilent", type: "Analytical", area: "QC Lab", serial: "SN-77621", qual: "Re-Qual Required", pmFreq: "Quarterly", nextPm: "2024-02-28" },
  { id: "EQ-CEN-004", name: "Centrifuge High-Speed", type: "Downstream", area: "Suite B", serial: "SN-33211", qual: "Qualified", pmFreq: "Monthly", nextPm: "2024-03-25" },
  { id: "EQ-FIL-005", name: "Filling Machine", type: "Fill Finish", area: "Clean Room", serial: "SN-88219", qual: "Qualified", pmFreq: "Bi-Weekly", nextPm: "2024-03-18" },
];

export default function EquipmentMaster() {
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
              {equipmentList.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs font-medium text-slate-700">{item.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                  <TableCell className="text-slate-600">{item.type}</TableCell>
                  <TableCell className="text-slate-600">{item.area}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{item.serial}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      item.qual === "Qualified" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }>
                      {item.qual}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs">{item.pmFreq}</TableCell>
                  <TableCell className={
                    new Date(item.nextPm) < new Date() ? "text-rose-600 font-medium" : "text-slate-600"
                  }>
                    {item.nextPm}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
                        <DropdownMenuItem>PM Schedule</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose-600">Decommission</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
