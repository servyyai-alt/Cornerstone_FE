import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchPublicJson } from '../../lib/serverApi';
import { createPageMetadata, getSiteSettings } from '../../lib/seo';

export async function generateMetadata() {
  return createPageMetadata({ path: '/' });
}

export default async function PublicLayout({ children }) {
  const [logos, siteSettings, publicPages] = await Promise.all([
    fetchPublicJson('/logos?public=1', []),
    getSiteSettings(),
    fetchPublicJson('/pages/public', []),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a href="#main-content" className="skip-link" aria-label="Skip to main content">
        Skip to main content
      </a>
      <Navbar siteSettings={siteSettings} pages={publicPages} />
      <div id="main-content" tabIndex="-1" className="flex-1">
        {children}
      </div>
      <Footer logos={logos} siteSettings={siteSettings} pages={publicPages} />
    </div>
  );
}
