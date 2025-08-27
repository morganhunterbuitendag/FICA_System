import "./globals.css";

export const metadata = {
  title: "Silostrat FICA Upload",
  description: "FICA Document Upload Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}


