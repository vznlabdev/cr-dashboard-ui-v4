export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Settings layout is now handled by the main sidebar
  // This just renders the content
  return <>{children}</>;
}
