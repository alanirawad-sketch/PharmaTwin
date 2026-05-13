import { useState } from "react";
import { Layout } from "@/components/layout";
import { 
  useListProfiles, 
  useCreateProfile,
  useDeleteProfile,
  getListProfilesQueryKey,
  CreateProfileBodyWorkSchedule,
  CreateProfileBodyDietType,
  CreateProfileBodyExerciseFrequency,
  CreateProfileBodyCaffeineIntake,
  CreateProfileBodySmokingStatus,
  CreateProfileBodyFastingPractice,
  CreateProfileBodyTravelFrequency,
  CreateProfileBodyStressLevel
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

const formSchema = z.object({
  name: z.string().min(2),
  workSchedule: z.nativeEnum(CreateProfileBodyWorkSchedule),
  sleepHours: z.coerce.number().min(2).max(16),
  dietType: z.nativeEnum(CreateProfileBodyDietType),
  exerciseFrequency: z.nativeEnum(CreateProfileBodyExerciseFrequency),
  caffeineIntake: z.nativeEnum(CreateProfileBodyCaffeineIntake),
  smokingStatus: z.nativeEnum(CreateProfileBodySmokingStatus),
  fastingPractice: z.nativeEnum(CreateProfileBodyFastingPractice),
  travelFrequency: z.nativeEnum(CreateProfileBodyTravelFrequency),
  stressLevel: z.nativeEnum(CreateProfileBodyStressLevel),
  demographicGroup: z.string().min(2)
});

export default function ProfilesList() {
  const [, setLocation] = useLocation();
  const { data: profiles, isLoading } = useListProfiles();
  const createProf = useCreateProfile();
  const deleteProf = useDeleteProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      workSchedule: "day_shift",
      sleepHours: 8,
      dietType: "omnivore",
      exerciseFrequency: "moderate",
      caffeineIntake: "moderate",
      smokingStatus: "never",
      fastingPractice: "none",
      travelFrequency: "occasional",
      stressLevel: "moderate",
      demographicGroup: "Adults 25-45"
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createProf.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Profile created successfully" });
      },
      onError: () => {
        toast({ title: "Error creating profile", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!confirm("Delete this profile?")) return;
    deleteProf.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
        toast({ title: "Profile deleted" });
      }
    });
  };

  const filtered = profiles?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.demographicGroup.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              <Users className="mr-3 h-8 w-8 text-primary" />
              Patient Lifestyle Profiles
            </h1>
            <p className="text-muted-foreground mt-1">Behavioral synthetics for realistic medication testing.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configure Synthetic Patient Profile</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Name</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Shift Worker Diabetic" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="demographicGroup" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demographic Group</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Adults 40-60" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <FormField control={form.control} name="workSchedule" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Schedule</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodyWorkSchedule).map(v => (
                              <SelectItem key={v} value={v}>{v.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sleepHours" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sleep (Hours)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dietType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diet</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodyDietType).map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="exerciseFrequency" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodyExerciseFrequency).map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="caffeineIntake" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caffeine</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodyCaffeineIntake).map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="smokingStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Smoking</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodySmokingStatus).map(v => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField control={form.control} name="fastingPractice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fasting</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodyFastingPractice).map(v => (
                              <SelectItem key={v} value={v}>{v.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="travelFrequency" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodyTravelFrequency).map(v => (
                              <SelectItem key={v} value={v}>{v.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stressLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stress Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.values(CreateProfileBodyStressLevel).map(v => (
                              <SelectItem key={v} value={v}>{v.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createProf.isPending}>
                      {createProf.isPending ? "Building..." : "Generate Profile"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search profiles..." 
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
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Profile Name</TableHead>
                  <TableHead>Demographic</TableHead>
                  <TableHead>Work/Sleep</TableHead>
                  <TableHead>Diet</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      No profiles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered?.map((prof) => (
                    <TableRow 
                      key={prof.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setLocation(`/profiles/${prof.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {prof.id.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell className="font-medium">{prof.name}</TableCell>
                      <TableCell>{prof.demographicGroup}</TableCell>
                      <TableCell>
                        <span className="capitalize">{prof.workSchedule.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground block">{prof.sleepHours} hrs/night</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{prof.dietType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(prof.id, e)} disabled={deleteProf.isPending}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
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