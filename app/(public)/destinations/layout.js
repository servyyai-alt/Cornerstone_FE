import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';

export const revalidate = 60;

export default async function DestinationsLayout({ children }) {
  const destinations = await fetchPublicJson('/destinations?public=1', []);

  return <RouteDataProvider data={{ destinations }}>{children}</RouteDataProvider>;
}
