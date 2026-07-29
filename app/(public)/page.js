import Home from './Home';

export const revalidate = 60;

const getBackendBaseUrl = () => {
  const rawUrl =
    process.env.API_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000');
  return rawUrl.replace(/\/+$/, '');
};

async function getHomepageData() {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/homepage?public=1`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error loading homepage data on the server:', error);
    return null;
  }
}

export default async function Page() {
  const initialData = await getHomepageData();
  return <Home initialData={initialData} />;
}
