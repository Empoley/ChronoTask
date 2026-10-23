import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { GameProvider } from '@/context/GameContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthModal } from '@/components/AuthModal';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'ChronoTasks — Workload & Task Manager',
  description: 'Manage deadlines, track project milestones, and eliminate workload bottlenecks with proactive horizon radar.',
  keywords: ['task manager', 'productivity', 'nextjs', 'deadline radar', 'workload management'],
  authors: [{ name: 'ChronoTasks' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable} data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <GameProvider>
              {children}
              <AuthModal />
            </GameProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
