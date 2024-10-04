'use client'
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <main className="flex flex-col min-h-screen p-10 gap-5">
      <section>
        <h1 className="font-bold">
          Hospital Management System
        </h1>
      </section>
      <section className="space-x-6">
        <Button variant="outline" onClick={() => router.push('/login')}>
          Go to Login Page
        </Button>
        <Button variant="outline" onClick={() => router.push('/rooms')}>
          Go to Rooms Page
        </Button>
      </section>
    </main>
  );
}
