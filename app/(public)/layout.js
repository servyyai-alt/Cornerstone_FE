import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchPublicJson } from '../../lib/serverApi';

export const metadata = {
  title: {
    default: 'Cornerstone | International Pathway College',
    template: '%s | Cornerstone',
  },
  description:
    "India's specialist international pathway college. Begin a UK-recognised degree at home, transfer to a partner university abroad, graduate internationally.",
};

export default async function PublicLayout({ children }) {
  const logos = await fetchPublicJson('/logos?public=1', []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer logos={logos} />
    </div>
  );
}
