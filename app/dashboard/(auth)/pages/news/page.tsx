"use client"

import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsDataTable from "./data-table";
import { useEffect, useState } from "react";



export default function Page() {
  const [news,setNews]=useState([]);
   const [userPermissions, setUserPermissions] = useState([])
   const [isClient, setIsClient] = useState(false);

    useEffect(() => {
     fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`)
       .then((response) => response.json()) 
       .then((result) => {
        if (result && result.data) {
        setNews(result.data);
      } else {
        console.error("Data format is unexpected:", result);
      }
       })
       .catch((error) => {
         console.error("Xəta:", error); 
       });
   }, []);

  useEffect(() => {
    setIsClient(true);
    const data = JSON.parse(localStorage.getItem("user") || "{}")
    setUserPermissions(data.permissions || [])
  }, []);

  const hasEditPermission = userPermissions.includes("news-create")

  if (!isClient) return null;
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">News</h1>
       {
        hasEditPermission && (
           <Button asChild>
          <Link href="/dashboard/pages/news/create">
            <PlusIcon /> Create News
          </Link>
        </Button>
        )
       }
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <NewsDataTable data={news}  />
      </Tabs>
    </div>
  );
}
