export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-emerald-50 via-white to-rose-50">
      {children}
    </div>
  );
}

