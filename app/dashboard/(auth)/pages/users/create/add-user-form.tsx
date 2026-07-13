"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ChevronLeft
} from "lucide-react";


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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";


const FormSchema = z.object({
  name: z.string().min(3, {
    message: "Product name must be at least 3 characters."
  }),
  email:z.string().min(1, { message: "Email mütləq daxil edilməlidir." })
    .email({ message: "Düzgün bir email ünvanı daxil edin." }),
    password: z
    .string()
    .min(8, { message: "Şifrə ən az 8 simvoldan ibarət olmalıdır." }) 
    .max(50, { message: "Şifrə çox uzundur." }),
  roles: z.array(z.string()).min(1, "Minimum bir rol seçilməlidir")
});

export default function AddUserForm() {
    const [userRoles,setUserRoles]=useState([]);

    useEffect(()=>{
       fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/role/index`)
        .then((response) => response.json()) 
        .then((result) => {
         if (result && result.data) {
         setUserRoles(result.data);
       } else {
         console.error("Data format is unexpected:", result);
       }
        })
        .catch((error) => {
          console.error("Xəta:", error); 
        });
    },[])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roles: [],
    }
  });


   async function onSubmit(data: z.infer<typeof FormSchema>) {
  
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/store`, {
  method: "POST",
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
const onError = (errors: any) => {
  console.log("Validasiya xətaları:", errors);
};
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit,onError)}>
        <div className="mb-4 flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-2">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/pages/users">
                <ChevronLeft />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Add User</h1>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Add</Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Username</CardTitle>
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
                          <Input {...field} placeholder="name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4 mt-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4 mt-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4 mt-3">
                  <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol Seçin</FormLabel>
              <Select
                onValueChange={(value) => field.onChange([value])} 
                defaultValue={field.value?.[0]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Bir rol seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    userRoles.map((role)=>(
                         <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
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
  );
}
