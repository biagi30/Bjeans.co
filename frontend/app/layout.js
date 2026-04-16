import "./globals.css";

export const metadata = {
  title: "BJeans.co",
  description: "Your Denim, Your Way"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
