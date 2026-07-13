"use client"

import Link from "next/link";
import { generateMeta } from "@/lib/utils";

import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import UsersDataTable from "./data-table";
import { useEffect, useState } from "react";





export default  function Page() {
 const [users,setUsers]=useState([])
 
  useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/index`)
        .then((response) => response.json()) 
        .then((result) => {
         if (result && result.data) {
         setUsers(result.data);
         console.log(result.data)
       } else {
         console.error("Data format is unexpected:", result);
       }
        })
        .catch((error) => {
          console.error("Xəta:", error); 
        });
    }, []);


  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/dashboard/pages/users/create">
            <PlusCircledIcon /> Add New User
          </Link>
        </Button>
      </div>
      <UsersDataTable data={users} />
    </>
  );
}
