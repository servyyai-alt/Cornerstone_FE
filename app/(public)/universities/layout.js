import { RouteDataProvider } from '../route-data-context';
import { fetchPublicJson } from '../../../lib/serverApi';

export const revalidate = 60;

export default async function UniversitiesLayout({ children }) {
  const universities = await fetchPublicJson('/universities?public=1', []);

  return <RouteDataProvider data={{ universities }}>{children}</RouteDataProvider>;
}
