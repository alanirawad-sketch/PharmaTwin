import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetSimulation, 
  getGetSimulationQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Lightbulb, Beaker, Users, Activity, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export default function SimulationDetail() {
  const [, params] = useRoute("/simulations/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: sim, isLoading } = useGetSimulation(id, { 
    query: { enabled: !!id, queryKey: getGetSimulationQueryKey(id) } 
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-[200px] col-span-2" />
            <Skeleton className="h-[200px] col-span-1" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Layout>
    );
  }

  if (!sim) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Simulation not found.</p>
          <Link href="/simulations">
            <Button variant="link" className="mt-4">Return to Simulations</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/simulations">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              Run SIM-{sim.id.toString().padStart(4, '0')}
              <Badge variant={
                sim.status === 'complete' ? 'default' : 
                sim.status === 'failed' ? 'destructive' : 'secondary'
              } className="text-sm">
                {sim.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Executed on {format(new Date(sim.createdAt), 'MMMM do, yyyy @ HH:mm')}
            </p>
          </div>
          {sim.adherenceScore !== null && sim.adherenceScore !== undefined && (
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Adherence</p>
              <p className={`text-4xl font-bold ${sim.adherenceScore < 70 ? 'text-destructive' : sim.adherenceScore < 85 ? 'text-secondary' : 'text-primary'}`}>
                {sim.adherenceScore.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center">
                <Beaker className="w-4 h-4 mr-2 text-primary" />
                Medication Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/medications/${sim.medicationId}`} className="text-lg font-bold hover:underline text-primary">
                    {sim.medication.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{sim.medication.drugClass}</p>
                </div>
                <Badge variant="outline" className="capitalize">{sim.medication.dosingFrequency.replace('_', ' ')}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded">
                <div><span className="text-muted-foreground">Half-life:</span> <span className="font-mono">{sim.medication.halfLifeHours}h</span></div>
                <div><span className="text-muted-foreground">ID:</span> <span className="font-mono">CMP-{sim.medicationId}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center">
                <Users className="w-4 h-4 mr-2 text-secondary" />
                Lifestyle Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-lg font-bold">{sim.profile.name}</span>
                  <p className="text-sm text-muted-foreground">{sim.profile.demographicGroup}</p>
                </div>
                <Badge variant="outline" className="capitalize">{sim.profile.workSchedule.replace('_', ' ')}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded">
                <div><span className="text-muted-foreground">Sleep:</span> {sim.profile.sleepHours}h</div>
                <div><span className="text-muted-foreground">Diet:</span> <span className="capitalize">{sim.profile.dietType}</span></div>
                <div><span className="text-muted-foreground">Stress:</span> <span className="capitalize">{sim.profile.stressLevel}</span></div>
                <div><span className="text-muted-foreground">Travel:</span> <span className="capitalize">{sim.profile.travelFrequency}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {sim.status === 'complete' && (
          <div className="grid gap-6 md:grid-cols-5">
            {/* Insights Section */}
            <Card className="col-span-3">
              <CardHeader className="bg-muted/20">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                  Adherence Friction Points
                </CardTitle>
                <CardDescription>Identified behavioral and biological conflicts</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {sim.insights.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-primary mb-2 opacity-50" />
                    <p>No significant friction points detected.</p>
                  </div>
                ) : (
                  <div className="divide-y border-t">
                    {sim.insights.map(insight => (
                      <div key={insight.id} className="p-4 hover:bg-muted/10 transition-colors flex gap-4">
                        <div className="mt-1">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            insight.severity === 'critical' ? 'bg-destructive' :
                            insight.severity === 'high' ? 'bg-orange-500' :
                            insight.severity === 'moderate' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {insight.affectedPercentage}% Impact
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          <div className="pt-2">
                            <Badge variant="outline" className="text-[10px] capitalize text-muted-foreground">
                              {insight.category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations Section */}
            <Card className="col-span-2 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Intervention Strategy
                </CardTitle>
                <CardDescription>Suggested mitigation approaches</CardDescription>
              </CardHeader>
              <CardContent>
                {sim.recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recommendations generated.</p>
                ) : (
                  <div className="space-y-4">
                    {sim.recommendations.map(rec => (
                      <div key={rec.id} className="bg-card p-3 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm">{rec.title}</h4>
                          <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'} className="text-[10px]">
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider bg-background">
                          {rec.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {sim.status === 'running' && (
          <Card className="border-primary/50 shadow-md">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <Activity className="w-12 h-12 text-primary animate-pulse mb-4" />
              <h3 className="text-xl font-bold mb-2">Simulation in Progress</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                The digital twin engine is currently evaluating pharmacokinetic interactions against the selected lifestyle variables.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}