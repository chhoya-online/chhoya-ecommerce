import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CHHOYA - Online Shopping Store",
  description: "Shop online with CHHOYA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
