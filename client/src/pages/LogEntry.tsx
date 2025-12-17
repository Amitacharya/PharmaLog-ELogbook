import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

export default function LogEntry() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Log Entry Saved",
        description: "Log #LOG-2024-892 has been successfully recorded and cryptographically signed.",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">New Log Entry</h2>
        <p className="text-muted-foreground">Record a new operational or maintenance event. All entries are immutable.</p>
      </div>

      <Card className="border-t-4 border-t-primary">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Enter the specifics of the operation performed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment ID</Label>
                <Select required>
                  <SelectTrigger id="equipment">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bio-204">Bioreactor B-204</SelectItem>
                    <SelectItem value="aut-01">Autoclave A-01</SelectItem>
                    <SelectItem value="hplc-03">HPLC System 3</SelectItem>
                    <SelectItem value="cen-12">Centrifuge C-12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="process">Process Stage</Label>
                <Select required>
                  <SelectTrigger id="process">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prep">Preparation</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                    <SelectItem value="clean">Cleaning (CIP)</SelectItem>
                    <SelectItem value="maint">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity Type</Label>
              <Select required>
                <SelectTrigger id="activity">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calib">Calibration</SelectItem>
                  <SelectItem value="batch">Batch Processing</SelectItem>
                  <SelectItem value="sample">Sampling</SelectItem>
                  <SelectItem value="error">Error/Deviation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Observation</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the operation, readings, and any observations..." 
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reading1">Temp (°C)</Label>
                <Input id="reading1" type="number" placeholder="0.00" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading2">pH Level</Label>
                <Input id="reading2" type="number" placeholder="7.00" step="0.01" />
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-4 bg-secondary/20">
              <Checkbox id="witness" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="witness" className="font-medium">
                  Require QA Witness
                </Label>
                <p className="text-sm text-muted-foreground">
                  Check this if the operation requires a second signature.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
            <Button variant="ghost" type="button">Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Signing..." : "Sign & Submit Log"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
