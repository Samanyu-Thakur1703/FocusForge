export function AuthCard({ children }: Readonly<{ children: React.ReactNode }>) {
  return <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">{children}</section>;
}
