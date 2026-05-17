'use client';

import React, { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  ssr: boolean;
}

export default function ClientOnly({ children, ssr = false }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return ssr ? <>{children}</> : null;
  }

  return <>{children}</>;
}
