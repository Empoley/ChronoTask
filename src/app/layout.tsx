import type { Metadata } from 'next';
import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { GameProvider } from '@/context/GameContext';

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900']
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'ChronoQuest',
  description: 'Conquer deadlines, earn XP, forge legendary equipment, and eliminate high-workload threats in an immersive RPG task realm.',
  keywords: ['task manager', 'gamification', 'rpg tasks', 'productivity', 'nextjs', 'deadline radar'],
  authors: [{ name: 'ChronoQuest Guild' }],
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
    <html lang="en" className={`${cinzel.variable} ${jakarta.variable}`}>
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
