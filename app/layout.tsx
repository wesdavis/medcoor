import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { logout } from './actions/auth';

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
      
      {/* LEFT: Logo Section (flex-1 ensures it takes exactly 1/3 of the space) */}
      <div className="flex-1 flex items-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/pfhw_logo.png" alt="PFHW Logo" className="h-12 w-auto object-contain" />
        </Link>
      </div>

      {/* CENTER: Navigation Links */}
      <div className="flex justify-center space-x-4">
        <Link href="/tracker" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
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
      </div>

      {/* RIGHT: Sign Out Button */}
              <div className="flex-1 flex justify-end">
                <form action={logout}>
                  <button type="submit" className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2">
                    Sign Out
                  </button>
                </form>
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