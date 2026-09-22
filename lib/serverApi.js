const getBackendBaseUrl = () => {
  const rawUrl =
    process.env.API_URL ||
    (process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000');
  return rawUrl.replace(/\/+$/, '');
};

export async function fetchPublicJson(path, fallbackValue = null, fetchOptions = {}) {
  try {
    const requestInit = { ...fetchOptions };

    if (!requestInit.cache && !requestInit.next) {
      requestInit.cache = 'no-store';
    }

    const response = await fetch(`${getBackendBaseUrl()}/api${path}`, requestInit);

    if (!response.ok) {
      return fallbackValue;
    }

    return response.json();
  } catch (error) {
    const isExpectedDynamicFetch =
      error?.digest === 'DYNAMIC_SERVER_USAGE' ||
      String(error?.message || '').includes('Dynamic server usage');

    if (!isExpectedDynamicFetch) {
      console.error(`Error fetching public data for ${path}:`, error);
    }

    return fallbackValue;
  }
}
