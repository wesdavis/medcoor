import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedCoor Referral Manager',
  description: 'Custom referral management and eFax tool.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900 font-sans">
        
        {/* Global Navigation Bar */}
        <nav className="bg-slate-900 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              
              <div className="flex items-center space-x-8">
                <span className="font-bold text-xl tracking-wide text-blue-400">MedCoor</span>
                <div className="flex space-x-1">
                  <Link href="tracker" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Referral Tracker
                  </Link>

                  
                  <Link href="/" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Provider Directory
                  </Link>
                  <Link href="/intake" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    New Referral
                  </Link>
                  <Link href="/dashboard" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Outbox
                  </Link>
                  <Link href="/admin" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
  Admin
</Link>
                </div>
              </div>

              <div className="text-sm text-slate-300 font-medium">
                Care Coordination
              </div>
              
            </div>
          </div>
        </nav>

        {/* Dynamic Page Content */}
        <div className="py-6">
          {children}
        </div>

      </body>
    </html>
  );
}