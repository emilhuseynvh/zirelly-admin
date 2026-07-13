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
import { useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";


const FormSchema = z.object({
  name: z.string().min(3, {
    message: "Product name must be at least 3 characters."
  }),
  permissions:z.array(z.string()).min(1, "Minimum bir icaze seçilməlidir")
});

export default function UpdateUserForm() {
    const [userRoles,setUserRoles]=useState([]);
    const [editUser,setEditUser]=useState([]);
     const params = useParams();
     const id = params.id;

    useEffect(()=>{
       fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/role/${id}/edit`)
        .then((response) => response.json()) 
        .then((result) => {
         if (result && result.data) {
          setEditUser(result.data.role)
         setUserRoles(result.data.allpermissions);
        
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
      permissions:[]
    }
  });

  useEffect(() => {
          if (editUser && editUser.permissions?.length > 0) {
            
            form.reset({
              name: editUser.name || "",
              permissions: editUser.permissions ? editUser.permissions.map((permission) => (typeof permission === 'object' ? permission.name : permission)) : []
            })
          }
        }, [editUser, editUser.permissions, form])




   async function onSubmit(data: z.infer<typeof FormSchema>) {
  
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/role/${id}/update`, {
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Role</h1>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Update</Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Role</CardTitle>
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
                  <div className="space-y-4 mt-4">
                    <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Permissions</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {userRoles.map((tag) => (
                          <FormField
                            key={tag.id}
                            control={form.control}
                            name="permissions"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tag.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                checked={field.value?.includes(tag.name)} 
                                  
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || []; 
                                    return checked
                                      ? field.onChange([...currentValues, tag.name]) 
                                      : field.onChange(currentValues.filter((v) => v !== tag.name)); 
                                  }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {tag.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
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
