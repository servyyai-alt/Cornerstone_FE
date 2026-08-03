import './globals.css';
import Script from 'next/script';
import SeoJsonLd from '../components/SeoJsonLd';
import {
  createOrganizationSchema,
  createWebsiteSchema,
  createPageMetadata,
  getSiteSettings,
  resolveSiteUrl,
} from '../lib/seo';

export async function generateMetadata() {
  return createPageMetadata({ path: '/' });
}

const themeBootstrapScript = `
  (function () {
    try {
      var theme = localStorage.getItem('cornerstone-theme') || 'dark';
      var resolved = theme;
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var root = document.documentElement;
      root.classList.toggle('dark', resolved === 'dark');
      root.style.colorScheme = resolved;
    } catch (error) {}
  })();
`;

export default async function RootLayout({ children }) {
  const siteSettings = await getSiteSettings();
  const gaId = siteSettings.googleAnalyticsId;
  const gtmId = siteSettings.googleTagManagerId;
  const organizationSchema = createOrganizationSchema({
    name: siteSettings.siteName,
    url: siteSettings.siteUrl,
    logo: siteSettings.siteLogo ? resolveSiteUrl(siteSettings.siteLogo, siteSettings.siteUrl) : resolveSiteUrl('/assets/hero.png', siteSettings.siteUrl),
  });
  const websiteSchema = createWebsiteSchema({
    name: siteSettings.siteName,
    url: siteSettings.siteUrl,
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrapScript}
        </Script>

        {gtmId ? (
          <>
            <Script id="gtm-loader" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){
                  w[l]=w[l]||[];
                  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                  var f=d.getElementsByTagName(s)[0],
                      j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                  j.async=true;
                  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                  f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
                title="Google Tag Manager"
              />
            </noscript>
          </>
        ) : null}

        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}

        <SeoJsonLd data={[organizationSchema, websiteSchema]} />
        {children}
      </body>
    </html>
  );
}
