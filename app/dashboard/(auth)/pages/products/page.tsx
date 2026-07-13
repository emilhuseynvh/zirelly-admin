 "use client"

import { promises as fs } from "fs";
import path from "path";
import { generateMeta } from "@/lib/utils";
import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductList from "@/app/dashboard/(auth)/pages/products/product-list";
import { useEffect, useState } from "react";




export default  function Page() {
   const [data, setData] = useState([]);
    useEffect(() => {
   fetch("http://127.0.0.1:8000/api/category",{ 
  cache: "no-store"
})
     .then((response) => response.json()) 
     .then((result) => {
       setData(result.data); 
       console.log(result.data)
     })
     .catch((error) => {
       console.error("Xəta:", error); 
     });
 }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <Button asChild>
          <Link href="/dashboard/pages/products/create">
            <PlusIcon /> Add Category
          </Link>
        </Button>
      </div>
      <div className="pt-4">
        <ProductList data={data} />
      </div>
    </div>
  );
}
