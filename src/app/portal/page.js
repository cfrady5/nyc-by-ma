import PortalClient from "@/components/portal/PortalClient";

export const metadata = {
  title: "Creator Portal — NYC by MA",
  description: "Password-protected studio for building themed location slideshows.",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return <PortalClient />;
}
