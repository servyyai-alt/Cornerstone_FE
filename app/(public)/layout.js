import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchPublicJson } from '../../lib/serverApi';
import { createPageMetadata, getSiteSettings } from '../../lib/seo';

export async function generateMetadata() {
  return createPageMetadata({ path: '/' });
}

export default async function PublicLayout({ children }) {
  const [logos, siteSettings] = await Promise.all([
    fetchPublicJson('/logos?public=1', []),
    getSiteSettings(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar siteSettings={siteSettings} />
      <div className="flex-1">{children}</div>
      <Footer logos={logos} siteSettings={siteSettings} />
    </div>
  );
}
