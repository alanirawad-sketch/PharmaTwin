import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useListMedications, 
  useCreateMedication,
  getListMedicationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  drugClass: z.string().min(2, "Drug class is required"),
  halfLifeHours: z.coerce.number().min(0.1, "Half life must be > 0"),
  dosingFrequency: z.string().min(2, "Dosing frequency is required"),
  description: z.string().min(10, "Description required"),
  indications: z.string().min(5, "Indications required")
});

export default function MedicationsList() {
  const [, setLocation] = useLocation();
  const { data: medications, isLoading } = useListMedications();
  const createMed = useCreateMedication();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      drugClass: "",
      halfLifeHours: 12,
      dosingFrequency: "daily",
      description: "",
      indications: ""
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMed.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Medication added successfully" });
      },
      onError: (err) => {
        toast({ title: "Error creating medication", variant: "destructive" });
      }
    });
  };

  const filtered = medications?.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.drugClass.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
              <Pill className="mr-3 h-8 w-8 text-primary" />
              Medications Registry
            </h1>
            <p className="text-muted-foreground mt-1">Manage formulary configurations and simulation parameters.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register New Medication</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compound Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="drugClass" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drug Class</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="halfLifeHours" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Half-life (Hours)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dosingFrequency" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosing Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="once_daily">Once Daily</SelectItem>
                            <SelectItem value="twice_daily">Twice Daily (BID)</SelectItem>
                            <SelectItem value="three_times_daily">Three Times Daily (TID)</SelectItem>
                            <SelectItem value="four_times_daily">Four Times Daily (QID)</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as_needed">As Needed (PRN)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="indications" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Indications</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinical Description</FormLabel>
                      <FormControl><Textarea className="resize-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createMed.isPending}>
                      {createMed.isPending ? "Registering..." : "Register Compound"}
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
                placeholder="Search by compound name or class..." 
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
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Compound</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="text-right">T½ (hrs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No medications found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered?.map((med) => (
                    <TableRow 
                      key={med.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setLocation(`/medications/${med.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {med.id.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.drugClass}</TableCell>
                      <TableCell className="capitalize">{med.dosingFrequency.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right font-mono">{med.halfLifeHours}</TableCell>
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