import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Cornerstone — International Pathway College',
  description: "India's specialist international pathway college. Begin a UK-recognised degree at home, transfer to a partner university abroad, graduate internationally."
};

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}