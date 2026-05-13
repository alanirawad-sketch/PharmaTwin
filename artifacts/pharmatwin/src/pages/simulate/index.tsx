import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useListMedications,
  useListProfiles,
  useCreateSimulation
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlayCircle, Beaker, Users, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Simulate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: medications, isLoading: medsLoading } = useListMedications();
  const { data: profiles, isLoading: profsLoading } = useListProfiles();
  
  const createSim = useCreateSimulation();
  
  const [medicationId, setMedicationId] = useState<string>("");
  const [profileId, setProfileId] = useState<string>("");

  const handleRun = () => {
    if (!medicationId || !profileId) return;

    createSim.mutate({
      data: {
        medicationId: parseInt(medicationId),
        profileId: parseInt(profileId)
      }
    }, {
      onSuccess: (sim) => {
        toast({ title: "Simulation initiated" });
        setLocation(`/simulations/${sim.id}`);
      },
      onError: () => {
        toast({ title: "Failed to start simulation", variant: "destructive" });
      }
    });
  };

  const selectedMed = medications?.find(m => m.id.toString() === medicationId);
  const selectedProf = profiles?.find(p => p.id.toString() === profileId);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 mt-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Configure Simulation</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Cross-reference medication pharmacokinetics with real-world patient behavior.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative">
          <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
            <div className="bg-background border rounded-full p-2">
              <ArrowRight className="text-muted-foreground w-6 h-6" />
            </div>
          </div>

          <Card className={`transition-all ${medicationId ? 'border-primary shadow-sm' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Beaker className="w-5 h-5 mr-2 text-primary" />
                Select Compound
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Medication Formulation</Label>
                <Select value={medicationId} onValueChange={setMedicationId} disabled={medsLoading}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a medication..." />
                  </SelectTrigger>
                  <SelectContent>
                    {medications?.map(med => (
                      <SelectItem key={med.id} value={med.id.toString()}>
                        {med.name} <span className="text-muted-foreground ml-2">({med.drugClass})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMed && (
                <div className="bg-muted/40 p-4 rounded-lg space-y-2 mt-4 animate-in fade-in">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Half-life:</span>
                    <span className="font-mono">{selectedMed.halfLifeHours} hrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dosing:</span>
                    <span className="capitalize">{selectedMed.dosingFrequency.replace('_', ' ')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`transition-all ${profileId ? 'border-secondary shadow-sm' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="w-5 h-5 mr-2 text-secondary" />
                Select Lifestyle Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Synthetic Patient Cohort</Label>
                <Select value={profileId} onValueChange={setProfileId} disabled={profsLoading}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a profile..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map(prof => (
                      <SelectItem key={prof.id} value={prof.id.toString()}>
                        {prof.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProf && (
                <div className="bg-muted/40 p-4 rounded-lg space-y-2 mt-4 animate-in fade-in grid grid-cols-2 gap-x-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground block text-xs mb-0.5">Schedule</span>
                    <span className="capitalize">{selectedProf.workSchedule.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground block text-xs mb-0.5">Diet</span>
                    <span className="capitalize">{selectedProf.dietType}</span>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground block text-xs mb-0.5">Travel</span>
                    <span className="capitalize">{selectedProf.travelFrequency.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground block text-xs mb-0.5">Stress</span>
                    <span className="capitalize">{selectedProf.stressLevel}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            size="lg" 
            className="w-full md:w-auto md:min-w-[300px] h-14 text-lg"
            disabled={!medicationId || !profileId || createSim.isPending}
            onClick={handleRun}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            {createSim.isPending ? "Initializing Engine..." : "Execute Simulation"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}