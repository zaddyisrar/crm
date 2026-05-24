import './globals.css';

export const metadata = {
  title: 'CRM by LeadsRift',
  description: 'Premium CRM Dashboard for Sales Teams',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
