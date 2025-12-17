import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, MoreHorizontal, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const equipment = [
  { id: "EQ-2024-001", name: "Bioreactor B-204", type: "Bioreactor", location: "Room 101", status: "Operational", lastMaint: "2024-03-10" },
  { id: "EQ-2024-002", name: "Autoclave A-01", type: "Sterilization", location: "Room 102", status: "In Use", lastMaint: "2024-03-12" },
  { id: "EQ-2024-003", name: "HPLC System 3", type: "Analysis", location: "Lab A", status: "Maintenance", lastMaint: "2024-02-28" },
  { id: "EQ-2024-004", name: "Centrifuge C-12", type: "Separation", location: "Room 101", status: "Operational", lastMaint: "2024-03-01" },
  { id: "EQ-2024-005", name: "Incubator I-05", type: "Incubation", location: "Lab B", status: "Operational", lastMaint: "2024-03-15" },
  { id: "EQ-2024-006", name: "Lyophilizer L-02", type: "Drying", location: "Room 103", status: "Offline", lastMaint: "2024-01-20" },
];

export default function Equipment() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipment Inventory</h2>
          <p className="text-muted-foreground">Manage and monitor status of all GMP assets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === "Operational" ? "default" :
                      item.status === "In Use" ? "secondary" :
                      item.status === "Maintenance" ? "destructive" : "outline"
                    } className={
                      item.status === "Operational" ? "bg-green-600 hover:bg-green-700" :
                      item.status === "In Use" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                      item.status === "Maintenance" ? "bg-orange-500 hover:bg-orange-600" : ""
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.lastMaint}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
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
