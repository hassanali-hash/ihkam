import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ihkam | إحكام - Financial Governance Platform',
  description: 'Bilingual enterprise financial governance platform for assessing internal controls, managing risks and gaps, and creating personalized governance roadmaps.',
  openGraph: {
    title: 'Ihkam | إحكام - Financial Governance Platform',
    description: 'Bilingual enterprise financial governance platform for assessing internal controls, managing risks and gaps, and creating personalized governance roadmaps.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ihkam | إحكام - Financial Governance Platform',
    description: 'Bilingual enterprise financial governance platform for assessing internal controls, managing risks and gaps, and creating personalized governance roadmaps.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-slate-900 bg-[#F5F7FA] font-sans selection:bg-teal-100 selection:text-teal-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
