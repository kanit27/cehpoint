"use client";

import Landing from "./(pages)/landing/page";
import ClientOnly from "./components/ClientOnly";

export default function HomePage() {
  return (
    <ClientOnly>
      <Landing />
    </ClientOnly>
  );
}

