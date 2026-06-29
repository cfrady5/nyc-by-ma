import BuildYourDayClient from "@/components/build/BuildYourDayClient";

export const metadata = {
  title: "Build Your Day — NYC by MA",
  description:
    "Choose your favorite NYC spots, set how long you want to stay, and let NYC by MA map the prettiest route between them.",
};

export default function BuildPage() {
  return (
    <main id="top" className="min-h-screen">
      <BuildYourDayClient />
    </main>
  );
}
