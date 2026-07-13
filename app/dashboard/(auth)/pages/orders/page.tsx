"use client"

import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersDataTable from "./data-table";
import { useEffect, useState } from "react";



export default function Page() {
  const [tags,setTags]=useState([]);
    useEffect(() => {
     fetch("http://127.0.0.1:8000/api/tags",{ 
    cache: "no-store"
  })
       .then((response) => response.json()) 
       .then((result) => {
         setTags(result.data); 
       })
       .catch((error) => {
         console.error("Xəta:", error); 
       });
   }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Tags</h1>
        <Button asChild>
          <Link href="/dashboard/pages/orders/create">
            <PlusIcon /> Create Tag
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <OrdersDataTable data={tags} />
      </Tabs>
    </div>
  );
}
