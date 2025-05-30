'use client';


import { useRouter } from "next/navigation";



export default function DashboardPage() {
    const router = useRouter();
    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={() => {router.push('/dashboard/courses')}}>go to courses</button>
            <button onClick={() => {router.push('/dashboard/students')}}>go to students</button>
            <button onClick={() => {router.push('/dashboard/groups')}}>go to groups</button>
            <button onClick={() => {router.push('/dashboard/subscriptions')}}>go to subscriptions</button>
            
            
        </div>
    );
}