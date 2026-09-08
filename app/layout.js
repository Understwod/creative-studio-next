import './globals.css';
import { Inter, Montserrat } from 'next/font/google';
import { LanguageProvider } from './LanguageContext'; // Создадим этот файл чуть ниже

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '700'] });

export const metadata = {
  title: 'Creative Studio | Fotograf și Videograf de Nuntă',
  description: 'Studio foto-video de nuntă în Moldova și România.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className={`${inter.className} ${montserrat.className} antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}