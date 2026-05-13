import { useRoute, Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetProfile, 
  getGetProfileQueryKey,
  useListSimulations,
  useDeleteProfile,
  getListProfilesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Activity, Trash2, Clock, MapPin, Coffee, Utensils } from "lucide-react";
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

export default function ProfileDetail() {
  const [, params] = useRoute("/profiles/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useGetProfile(id, { 
    query: { enabled: !!id, queryKey: getGetProfileQueryKey(id) } 
  });
  
  const { data: allSims, isLoading: isLoadingSims } = useListSimulations();
  const sims = allSims?.filter(s => s.profileId === id) || [];
  
  const deleteProf = useDeleteProfile();

  const handleDelete = () => {
    deleteProf.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Profile deleted" });
        queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
        setLocation("/profiles");
      },
      onError: () => {
        toast({ title: "Failed to delete profile", variant: "destructive" });
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

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found.</p>
          <Link href="/profiles">
            <Button variant="link" className="mt-4">Return to Profiles</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/profiles">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              {profile.name}
            </h1>
            <p className="text-muted-foreground flex items-center space-x-2 mt-1">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">PRF-{profile.id.toString().padStart(4, '0')}</span>
              <span>•</span>
              <span>{profile.demographicGroup}</span>
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {profile.name}.
                  Simulations relying on this profile may be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Behavioral Synthetic Parameters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Work Schedule
                </span>
                <p className="text-lg capitalize">{profile.workSchedule.replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Activity className="w-4 h-4 mr-2" /> Sleep
                </span>
                <p className="text-lg">{profile.sleepHours} hours / night</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Utensils className="w-4 h-4 mr-2" /> Diet Type
                </span>
                <p className="text-lg capitalize">{profile.dietType}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Activity className="w-4 h-4 mr-2" /> Exercise
                </span>
                <p className="text-lg capitalize">{profile.exerciseFrequency}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Coffee className="w-4 h-4 mr-2" /> Caffeine
                </span>
                <p className="text-lg capitalize">{profile.caffeineIntake}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Activity className="w-4 h-4 mr-2" /> Stress Level
                </span>
                <p className="text-lg capitalize">{profile.stressLevel}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Travel Frequency
                </span>
                <p className="text-lg capitalize">{profile.travelFrequency.replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center">
                  <Activity className="w-4 h-4 mr-2" /> Smoking
                </span>
                <p className="text-lg capitalize">{profile.smokingStatus}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Profile Simulations ({sims.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSims ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : sims.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No simulations run for this profile yet.
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