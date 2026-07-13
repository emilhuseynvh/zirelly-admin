"use client"
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  EditIcon,
  Package,
  Pencil,
  Printer,
  Truck
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";


const FormSchema = z.object({
  name: z.string().min(5, {
    message: "Tag name must be at least 5 characters."
  })
});


export default function Page() {
  const [data,setData]=useState([]);
  const params = useParams();
  const slug = params.slug;

        useEffect(() => {
       fetch(`http://127.0.0.1:8000/api/tags/${slug}/edit`)
         .then((response) => response.json()) 
         .then((result) => {
           setData(result.data); 
         
         })
         .catch((error) => {
           console.error("Xəta:", error); 
         });
     }, []);

    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        name: ""
      }
    });

    useEffect(() => {
    if (data) {
      
      form.reset({
        name: data.name || "",
      })
    }
  }, [data, form])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
      
      await fetch(`http://127.0.0.1:8000/api/tags/${slug}/update`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())  
    .then(data => {
       toast("You submitted the following values:", {
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(data.message, null, 2)}</code>
            </pre>
          )
        });
    })
    .catch(error => {
      console.error('Error:', error);
    });
      
      }
  return (
    <div className="mx-auto max-w-screen-lg space-y-4 lg:mt-10">
               <Form {...form}>
                   <form onSubmit={form.handleSubmit(onSubmit)}>
                     <div className="mb-4 flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-2">
                       <div className="flex items-center gap-4">
                         <Button variant="outline" asChild>
                           <Link href="/dashboard/pages/orders">
                             <ChevronLeft />
                           </Link>
                         </Button>
                         <h1 className="text-2xl font-bold tracking-tight">Edit Tag</h1>
                       </div>
                       <div className="flex gap-2">
                         <Button type="submit">Update</Button>
                       </div>
                     </div>
                     <div className="grid gap-4 lg:grid-cols-6">
                       <div className="space-y-4 lg:col-span-4">
                         <Card>
                           <CardHeader>
                             <CardTitle>Tag</CardTitle>
                           </CardHeader>
                           <CardContent>
                             <div className="space-y-4">
                               <FormField
                                 control={form.control}
                                 name="name"
                                 render={({ field }) => (
                                   <FormItem>
                                     <FormLabel>Name</FormLabel>
                                     <FormControl>
                                       <Input {...field} placeholder="title" />
                                     </FormControl>
                                     <FormMessage />
                                   </FormItem>
                                 )}
                               />
                             </div>
                           </CardContent>
                         </Card>
             
                       </div>
                     </div>
                   </form>
                 </Form>
    </div>
  );
}
