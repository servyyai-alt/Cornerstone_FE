import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';

export const revalidate = 60;

export default async function ContactLayout({ children }) {
  const [contactSettings, websiteSettings] = await Promise.all([
    fetchPublicJson('/settings/contact?public=1', null),
    fetchPublicJson('/settings/website?public=1', null),
  ]);

  return <RouteDataProvider data={{ contactSettings, websiteSettings }}>{children}</RouteDataProvider>;
}
