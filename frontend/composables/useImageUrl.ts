export const useImageUrl = () => {
  const config = useRuntimeConfig();

  const getImageUrl = (url?: string | null): string => {
    if (!url) return '';
    if (
      url.startsWith('http://') || 
      url.startsWith('https://') || 
      url.startsWith('blob:') || 
      url.startsWith('data:')
    ) {
      return url;
    }
    const apiBase = config.public?.apiBase || '';
    const base = apiBase.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return {
    getImageUrl
  };
};
