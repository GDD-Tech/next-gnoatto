'use client';
import dynamic from "next/dynamic";

const Main = dynamic(() => import("@/components/main/Main"), { ssr: false });

export default function Home() {
  return <Main />;
}
