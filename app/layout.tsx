import type { Metadata } from "next";
import "./globals.css";
import { MockStoreProvider } from "@/lib/mock/store";

export const metadata: Metadata = {
  title: "Runna (frontend-only preview)",
  description: "Get anything from campus, brought to you by someone already headed that way.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        {/* Everything below MockStoreProvider runs entirely on in-memory
            client state — see lib/mock/store.tsx. There is no server, no
            database, no auth: refreshing the page resets everything back
            to the seed data in lib/mock/data.ts, exactly like the original
            prototype did. */}
        <MockStoreProvider>
          <div className="mx-auto max-w-md h-screen bg-paper flex flex-col overflow-hidden">{children}</div>
        </MockStoreProvider>
      </body>
    </html>
  );
}
