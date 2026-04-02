'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: () => <div className="h-20" />,
});

export default function SafeHeader() {
  return <Header />;
}
