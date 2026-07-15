import './globals.css';
import { AuthProvider } from '../services/auth';

export const metadata = {
  title: 'Cornerstone',
  description: 'Cornerstone Application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
