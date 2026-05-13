import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useListSimulations } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart, Search, PlayCircle } from "lucide-react";
import { format } from "date-fns";

export default function SimulationsList() {
  const [, setLocation] = useLocation();
  const { data: simulations, isLoading } = useListSimulations();
  const [search, setSearch] = useState("");

  // Quick filter on ID or status
  const filtered = simulations?.filter(s => 
    s.id.toString().includes(search) || 
    s.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              <BarChart className="mr-3 h-8 w-8 text-primary" />
              Simulation Runs
            </h1>
            <p className="text-muted-foreground mt-1">Review digital twin execution results and adherence analytics.</p>
          </div>
          
          <Link href="/simulate">
            <Button>
              <PlayCircle className="mr-2 h-4 w-4" />
              New Simulation
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID or status..." 
                className="max-w-sm" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Run ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Compound ID</TableHead>
                  <TableHead>Profile ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Adherence Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      No simulation runs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered?.map((sim) => (
                    <TableRow 
                      key={sim.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setLocation(`/simulations/${sim.id}`)}
                    >
                      <TableCell className="font-mono font-medium">SIM-{sim.id.toString().padStart(4, '0')}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(sim.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-xs">CMP-{sim.medicationId}</TableCell>
                      <TableCell className="font-mono text-xs">PRF-{sim.profileId}</TableCell>
                      <TableCell>
                        <Badge variant={
                          sim.status === 'complete' ? 'default' : 
                          sim.status === 'failed' ? 'destructive' : 
                          sim.status === 'running' ? 'secondary' : 'outline'
                        }>
                          {sim.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {sim.adherenceScore !== null && sim.adherenceScore !== undefined 
                          ? `${sim.adherenceScore.toFixed(1)}%` 
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}