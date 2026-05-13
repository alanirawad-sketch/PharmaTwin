import { Layout } from "@/components/layout";
import { 
  useGetDashboardSummary, 
  useGetFrictionHeatmap, 
  useListSimulations,
  useListInsights,
  useListRecommendations 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Pill, Users, AlertTriangle, PlayCircle, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: heatmapData, isLoading: isLoadingHeatmap } = useGetFrictionHeatmap();
  const { data: simulations, isLoading: isLoadingSimulations } = useListSimulations();
  const { data: recentInsights } = useListInsights();
  const { data: recentRecommendations } = useListRecommendations();

  const recentSimulations = simulations?.slice(0, 5) || [];
  const topInsights = recentInsights?.slice(0, 5) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">
            Clinical intelligence and real-world adherence analytics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Adherence</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {summary?.averageAdherenceScore ? `${summary.averageAdherenceScore.toFixed(1)}%` : "N/A"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Across all completed simulations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Risk Factor</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold truncate capitalize" title={summary?.topAdherenceRisk?.replace('_', ' ')}>
                  {summary?.topAdherenceRisk ? summary.topAdherenceRisk.replace('_', ' ') : "None"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Most frequent insight category</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Simulations</CardTitle>
              <PlayCircle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{summary?.totalSimulations || 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{summary?.completedSimulations || 0} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {summary?.totalMedications || 0} <span className="text-sm font-normal text-muted-foreground">Meds</span>
                  {" / "}
                  {summary?.totalProfiles || 0} <span className="text-sm font-normal text-muted-foreground">Profiles</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Monitored configurations</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Heatmap Chart */}
          <Card className="col-span-4 flex flex-col">
            <CardHeader>
              <CardTitle>Friction Heatmap Overview</CardTitle>
              <CardDescription>Average friction score by demographic group</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {isLoadingHeatmap ? (
                <Skeleton className="h-full w-full" />
              ) : heatmapData && heatmapData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="demographicGroup" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="frictionScore" radius={[4, 4, 0, 0]}>
                      {heatmapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--${entry.frictionScore > 7 ? 'destructive' : entry.frictionScore > 4 ? 'secondary' : 'primary'}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground text-sm flex flex-col items-center">
                  <BarChart className="h-8 w-8 mb-2 opacity-50" />
                  <p>Not enough data for heatmap visualization.</p>
                </div>
              )}
            </CardContent>
            
            <div className="mt-auto border-t px-6 py-4 bg-muted/20">
              <div className="flex items-center text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 mr-2 text-primary" />
                <span><span className="font-semibold text-foreground">{recentRecommendations?.length || 0}</span> global interventions generated across all simulations</span>
              </div>
            </div>
          </Card>

          {/* Recent Simulations */}
          <div className="col-span-3 space-y-6 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle>Recent Simulations</CardTitle>
                <CardDescription>Latest execution runs</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {isLoadingSimulations ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : recentSimulations.length > 0 ? (
                  <div className="space-y-4">
                    {recentSimulations.map(sim => (
                      <Link key={sim.id} href={`/simulations/${sim.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm group-hover:text-primary transition-colors">
                              SIM-{sim.id.toString().padStart(4, '0')}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(sim.createdAt), 'MMM d, HH:mm')}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={
                              sim.status === 'complete' ? 'default' : 
                              sim.status === 'failed' ? 'destructive' : 
                              'secondary'
                            } className="text-[10px] px-1.5 py-0">
                              {sim.status}
                            </Badge>
                            {sim.adherenceScore !== undefined && sim.adherenceScore !== null && (
                              <span className="text-xs font-semibold">
                                {sim.adherenceScore.toFixed(1)}% Score
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center">
                      <p>No simulations found.</p>
                      <Link href="/simulate" className="text-primary hover:underline mt-1 inline-block">
                        Run your first simulation
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {topInsights.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
                    Latest Global Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topInsights.slice(0, 3).map(insight => (
                      <div key={insight.id} className="text-sm border-l-2 border-primary/50 pl-3">
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{insight.category.replace('_', ' ')} • {insight.affectedPercentage}% Impact</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}