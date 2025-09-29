"use client";
import dynamic from "next/dynamic";

const ArcGISMap = dynamic(() => import("./component/map"), {
  ssr: false, // ✅ disable server-side rendering
});

export default function Page() {
  return <ArcGISMap />;
}
