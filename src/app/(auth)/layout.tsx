export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(224,149,24,0.35), transparent 55%), radial-gradient(ellipse at bottom, rgba(74,122,58,0.2), transparent 50%)",
        }}
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
