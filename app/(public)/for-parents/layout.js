import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';

export const revalidate = 60;

export default async function ForParentsLayout({ children }) {
  const pageData = await fetchPublicJson('/pages/for-parents?public=1', null);

  return <RouteDataProvider data={{ pageData }}>{children}</RouteDataProvider>;
}
