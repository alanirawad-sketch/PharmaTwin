import { useRoute, Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetMedication, 
  getGetMedicationQueryKey,
  useListSimulations,
  useDeleteMedication,
  getListMedicationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pill, Clock, Activity, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function MedicationDetail() {
  const [, params] = useRoute("/medications/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: med, isLoading } = useGetMedication(id, { 
    query: { enabled: !!id, queryKey: getGetMedicationQueryKey(id) } 
  });
  
  const { data: allSims, isLoading: isLoadingSims } = useListSimulations();
  const sims = allSims?.filter(s => s.medicationId === id) || [];
  
  const deleteMed = useDeleteMedication();

  const handleDelete = () => {
    deleteMed.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Compound deregistered" });
        queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey() });
        setLocation("/medications");
      },
      onError: () => {
        toast({ title: "Failed to deregister compound", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!med) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Compound not found.</p>
          <Link href="/medications">
            <Button variant="link" className="mt-4">Return to Registry</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/medications">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              {med.name}
            </h1>
            <p className="text-muted-foreground flex items-center space-x-2 mt-1">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">ID: {med.id.toString().padStart(4, '0')}</span>
              <span>•</span>
              <span>{med.drugClass}</span>
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Deregister
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently deregister {med.name} and remove it from our servers.
                  Simulations relying on this compound may be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Clinical Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> Half-life
                  </span>
                  <p className="text-xl font-semibold">{med.halfLifeHours} hrs</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Dosing
                  </span>
                  <p className="text-xl font-semibold capitalize">{med.dosingFrequency.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Indications
                </span>
                <p className="text-sm leading-relaxed border-l-2 border-primary/50 pl-4">{med.indications}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p className="text-sm bg-muted/30 p-4 rounded-md leading-relaxed">{med.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Simulations ({sims.length})</CardTitle>
              <CardDescription>Recent test runs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSims ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : sims.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No simulations run for this compound yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {sims.slice(0, 8).map(sim => (
                    <Link key={sim.id} href={`/simulations/${sim.id}`}>
                      <div className="flex items-center justify-between p-2 rounded border border-border hover:bg-accent/50 cursor-pointer text-sm">
                        <span className="font-mono text-muted-foreground">SIM-{sim.id}</span>
                        <div className="flex items-center gap-2">
                          {sim.adherenceScore !== null && sim.adherenceScore !== undefined && (
                            <span className="font-medium text-xs">{sim.adherenceScore.toFixed(0)}%</span>
                          )}
                          <Badge variant={sim.status === 'complete' ? 'default' : 'secondary'} className="text-[10px] px-1">
                            {sim.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}