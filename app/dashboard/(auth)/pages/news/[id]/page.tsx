"use client";


import { useForm } from "react-hook-form";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronsUpDown,
  Plus, X
} from "lucide-react";

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import dynamic from 'next/dynamic'
const TiptapEditor = dynamic(() => import('@/components/editor'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full border animate-pulse bg-muted rounded-md" />
});


const FormSchema = z.object({
  title: z.string().min(5, {
    message: "Product name must be at least 5 characters."
  }),
  content: z.string(),
 image: z
    .any()
    .optional() 
    .refine((file) => {
      
      if (!file || file.length === 0) return true;
     
      return file[0]?.size <= 5000000;
    }, "Maksimum ölçü 5MB olmalıdır.")
    .refine((file) => {
      if (!file || file.length === 0) return true;
     
      return ["image/jpeg", "image/png", "image/jpg","image/webp"].includes(file[0]?.type);
    }, "Yalnız .jpg, .jpeg və .png formatları qəbul edilir."),
    tags: z.array(z.coerce.number()).min(1, "En azı bir etiket seçilməlidir"),
    category_id:z.coerce.number(),
    status_id:z.coerce.number()
});

export default function Page(){
      const [values,setValues]=useState([]);
      const [categories,setCategories]=useState([]);
      const [allstatus,setAllStatus]=useState([]);
      const [alltags,setAllTags]=useState([]);
          const [open, setOpen] = useState(false)
        const [inputValue, setInputValue] =useState("")
        const params = useParams();
        const id = params.id;
     useEffect(()=>{
         fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}/edit`)
         .then((response) => response.json()) 
         .then((result) => {
           setValues(result.data.news); 
           setAllStatus(result.data.allStatus)
           setAllTags(result.data.allTags)
           setCategories(result.data.allCategory)
         })
         .catch((error) => {
           console.error("Xəta:", error); 
         });
     },[]) 
  
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        title: "",
        content: "",
        tags:[],
        image: undefined,
        category_id:undefined,
        status_id:undefined
      }
    });
  

const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  
  if (values && Object.keys(values).length > 0 && !isInitialized) {
    
    const formattedTags = values.tags 
      ? values.tags.map((tag: any) => (typeof tag === 'object' ? tag.id : tag)) 
      : [];

    form.reset({
      title: values.title || "",
      content: values.content || "",
      category_id: values.category_id ? Number(values.category_id) : undefined,
      status_id: values.status_id ? Number(values.status_id) : undefined,
      tags: formattedTags,
    });

    
    setIsInitialized(true);
  }
}, [values, isInitialized, form]);

     async function onSubmit(data: z.infer<typeof FormSchema>) {
            const formData = new FormData();
  
        
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const authorId = Number(user.id);
  
        if (!authorId) {
          console.error("İstifadəçi tapılmadı! Yenidən giriş edin.");
          return;
        }
       
        formData.append("title", data.title);
        formData.append("content", data.content);
        formData.append("category_id", data.category_id.toString());
        formData.append("status_id", data.status_id.toString());
        data.tags.forEach((tagId) => {
      formData.append("tags[]", tagId.toString());
    });
        
       console.log(data.status_id)
        formData.append("author_id", authorId.toString());
  
        if (data.image && data.image[0]) {
          formData.append("image", data.image[0]);
        }
        if (data.image && data.image.length > 0) {
    formData.append("newImage", data.image[0]);
  } else {
    formData.append("currentImage", values.image);
  }
          
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${id}/update`, {
          method: "POST",
          headers: {
              'Accept': 'application/json'
          },
          body: formData,
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
    return(
        <>
            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit,onError)}>
        <div className="mb-4 flex flex-col justify-between space-y-4 lg:flex-row lg:items-center lg:space-y-2">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/pages/news">
                <ChevronLeft />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Update News</h1>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Update</Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>News title</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
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
               <Card>
              <CardHeader>
                <CardTitle>News Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                     <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xəbər Məzmunu</FormLabel>
                        <FormControl>
                          <TiptapEditor
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>News Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img className="w-[150px] h-[150px] object-cover" src={`http://127.0.0.1:8000/storage/uploads/${values.image}`} alt="newsImage" />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <Input {...field} type="file" accept="image/*"
                         onChange={(event) => {
           
                         onChange(event.target.files);
                           }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
                        <Card>
              <CardHeader>
                <CardTitle>News Category</CardTitle>
              </CardHeader>
              <CardContent >
                <div className="space-y-4 ">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                                <Select
                                 onValueChange={field.onChange} 
                              value={field.value?.toString()}
                                >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                             {
                                categories?.map((selectItem)=>(
                               
                             <SelectItem key={selectItem.id} value={selectItem.id.toString()}>{selectItem.title}</SelectItem>
                                
                                ))
                             }
                            </SelectGroup>
                            </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      
                    )}
                  />
                </div>
                  <div className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="status_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                                <Select
                                 onValueChange={field.onChange} 
                             value={field.value?.toString()}
                                >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                             {
                                allstatus?.map((selectItem)=>(
                               
                             <SelectItem key={selectItem.id} value={selectItem.id.toString()}>{selectItem.name}</SelectItem>
                                
                                ))
                             }
                            </SelectGroup>
                            </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      
                    )}
                  />
                </div>
                <div className="space-y-4 mt-4">
                  <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-base">Tags</FormLabel>
          
          {/* Seçilmiş teqləri göstərən sahə (Badge-lər) */}
<div className="flex flex-wrap gap-2 mb-2">
  {field.value?.map((tagValue: any, index: number) => {
    
    const tag = alltags.find((t) => Number(t.id) === Number(tagValue));
    
    return (
      <Badge key={`${tagValue}-${index}`} variant="secondary" className="flex items-center gap-1">
        {tag ? tag.name : tagValue}
        <X
          className="h-3 w-3 cursor-pointer hover:text-destructive"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newValue = field.value.filter((val: any) => Number(val) !== Number(tagValue));
            field.onChange(newValue);
          }}
        />
      </Badge>
    );
  })}
</div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  Teq əlavə et...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput
                  placeholder="Axtar və ya yeni teq yaz..." 
                  onValueChange={setInputValue}
                />
                <CommandList>
                  <CommandEmpty className="p-0">
                    {inputValue && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-none text-blue-600"
                        onClick={async() => {
                         if (inputValue) {
                                  
                                  const response = await fetch("http://127.0.0.1:8000/api/tags/store", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json",
                                        'Accept': 'application/json' },
                                    body: JSON.stringify({ name: inputValue }),
                                  });

                                  if (response.ok) {
                                    const newTag = await response.json(); 

                                    
                                    const currentValue = field.value || [];
                                    field.onChange([...currentValue, newTag.data.id]); 

                                   
                                    setInputValue("");
                                    setOpen(false);
                        }}}
                        }>
                        <Plus className="mr-2 h-4 w-4" />
                        Yarat: "{inputValue}"
                      </Button>
                    )}
                  </CommandEmpty>
                  <CommandGroup title="Mövcud Teqlər">
                    {alltags.map((tag) => (
                    <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      const currentValue = field.value || [];
                      const isSelected = currentValue.some((val: any) => Number(val) === Number(tag.id));
                      
                      if (isSelected) {
                        
                        field.onChange(currentValue.filter((val: any) => Number(val) !== Number(tag.id)));
                      } else {
                      
                        field.onChange([...currentValue, tag.id]);
                      }
                    
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        field.value?.some((val: any) => Number(val) === Number(tag.id)) 
                          ? "opacity-100" 
                          : "opacity-0"
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
        
    {/* <div className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-xl tracking-tight lg:text-2xl"></h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Edit3Icon />
            <span className="hidden lg:inline">Update</span>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3 my-3">
        <div className="min-w-0 xl:col-span-1">
          <ProductImageGallery />
        </div>
        <div className="space-y-4 xl:col-span-2">

          <Card>
            <CardContent className="space-y-4">
              <div className="grid items-start gap-8 xl:grid-cols-3">
                <div className="space-y-8 xl:col-span-2">
                  <div>
                    <h3 className="mb-2 font-semibold">Content:</h3>
                    <p className="text-muted-foreground">
                      Tommy Hilfiger men striped pink sweatshirt. Crafted with cotton. Material
                      composition is 100% organic cotton.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Key Features:</h3>
                    <ul className="text-muted-foreground list-inside list-disc">
                      <li>Industry-leading noise cancellation</li>
                      <li>30-hour battery life</li>
                      <li>Touch sensor controls</li>
                      <li>Speak-to-chat technology</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-md border xl:col-span-1">

                </div>
              </div>
              <div className="grid auto-cols-max grid-flow-row gap-8">

              </div>
              <div className="flex gap-3 pt-4">
                <Button>
                  <ShoppingCart /> Add to Card
                </Button>
                <Button variant="outline">
                  <HeartIcon /> Wishlist
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>  */}
        
        </>
    )
}




