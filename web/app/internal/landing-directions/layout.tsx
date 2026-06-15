/**
 * Internal Landing Directions Layout
 * Minimal layout for the concept gallery with no product chrome.
 */
export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#061014]">{children}</div>;
}
