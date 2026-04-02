'use client';

import { usePathname } from 'next/navigation';

export default function PageContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
      {children}
    </main>
  );
}
