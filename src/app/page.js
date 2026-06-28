import HomeClient from "@/components/HomeClient";

// The page shell is a Server Component; all interactivity lives in HomeClient
// (a Client Component). The Leaflet map is further isolated and loaded with
// ssr:false inside MapSection, so nothing map-related runs on the server.
export default function Page() {
  return (
    <main id="top" className="min-h-screen">
      <HomeClient />
    </main>
  );
}
