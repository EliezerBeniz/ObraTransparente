'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('./Header'));

export default function SafeHeader() {
  return <Header />;
}
