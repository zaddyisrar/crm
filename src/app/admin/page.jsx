"use client";

import AdminShell from "@/components/admin/AdminShell";

export default function AdminPage(){

return(

<AdminShell
title="Dashboard"
subtitle="Manage CRM operations and team activity."
>

<div className="grid gap-4 md:grid-cols-4">

{["Agents","Campaigns","Attendance","Meetings"].map((x)=>(

<div
key={x}
className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.03] p-6"
>

<p className="text-4xl font-black">
32
</p>

<p className="mt-2 text-slate-500">
{x}
</p>

</div>

))}

</div>

</AdminShell>

)

}