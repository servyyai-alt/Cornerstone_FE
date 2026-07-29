import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';

export const revalidate = 60;

export default async function SuccessLayout({ children }) {
  const stories = await fetchPublicJson('/success-stories?public=1', []);

  return <RouteDataProvider data={{ stories }}>{children}</RouteDataProvider>;
}
