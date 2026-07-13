"use client";

import { generateMeta } from "@/lib/utils";
import ProductImageGallery from "./product-image-gallery";
import {
  CircleDollarSign,
  Edit3Icon,
  HandCoinsIcon,
  HeartIcon,
  Layers2Icon,
  ShoppingCart,
  StarIcon,
  Trash2Icon,
  TruckIcon
} from "lucide-react";


import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  ChevronLeft,
  CirclePlusIcon,
  ImageIcon,
  UploadIcon,
  XIcon
} from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";

import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import ProductReviewList from "./reviews";
import SubmitReviewForm from "./submit-review-form";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";



const FormSchema = z.object({
  title: z.string().min(5, {
    message: "Category name must be at least 5 characters."
  })
});



export default function Page() {
  const [data,setData]=useState([]);
  const params = useParams();
  const id = params.id;

        useEffect(() => {
       fetch(`http://127.0.0.1:8000/api/category/${id}/edit`)
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
        title: ""
      }
    });

    useEffect(() => {
    if (data) {
      
      form.reset({
        title: data.title || "",
      })
    }
  }, [data, form])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
      
      await fetch(`http://127.0.0.1:8000/api/category/${id}/update`, {
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
    <div className="space-y-4">
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)}>
               <div className="mb-4 flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-2">
                 <div className="flex items-center gap-4">
                   <Button variant="outline" asChild>
                     <Link href="/dashboard/pages/products">
                       <ChevronLeft />
                     </Link>
                   </Button>
                   <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
                 </div>
                 <div className="flex gap-2">
                   <Button type="submit">Update</Button>
                 </div>
               </div>
               <div className="grid gap-4 lg:grid-cols-6">
                 <div className="space-y-4 lg:col-span-4">
                   <Card>
                     <CardHeader>
                       <CardTitle>Category</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-4">
                         <FormField
                           control={form.control}
                           name="title"
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
