import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchPublicJson } from '../../lib/serverApi';
import { createPageMetadata, siteConfig } from '../../lib/seo';

export const metadata = createPageMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: '/',
});

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
