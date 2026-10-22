import axios from 'axios';

/**
 * Parses YouTube or Vimeo URL to extract source and video ID
 * @param {string} url 
 * @returns {object|null} { source, id } or null
 */
export const parseVideoUrl = (url) => {
  if (!url) return null;
  const cleanUrl = String(url).trim();
  if (!cleanUrl) return null;

  // Direct YouTube 11-char Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return { source: 'youtube', id: cleanUrl };
  }

  // YouTube Patterns:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/live/VIDEO_ID
  const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i;
  const ytMatch = cleanUrl.match(youtubeRegex);
  if (ytMatch) {
    return { source: 'youtube', id: ytMatch[1] };
  }

  // Fallback for any youtube URL having ?v= or &v=
  if (cleanUrl.includes('youtube.com')) {
    const vMatch = cleanUrl.match(/[?&]v=([\w-]{11})/i);
    if (vMatch) {
      return { source: 'youtube', id: vMatch[1] };
    }
  }

  // Direct Vimeo numeric ID
  if (/^[0-9]{6,12}$/.test(cleanUrl)) {
    return { source: 'vimeo', id: cleanUrl };
  }

  // Vimeo Patterns
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
  const vMatch = cleanUrl.match(vimeoRegex);
  if (vMatch) {
    return { source: 'vimeo', id: vMatch[1] };
  }

  return null;
};

/**
 * Fetches video metadata via oEmbed
 * @param {string} source 'youtube' | 'vimeo'
 * @param {string} id Video ID
 * @returns {object} { title, thumbnail_url, duration }
 */
export const fetchVideoMetadata = async (source, id) => {
  try {
    let oEmbedUrl = '';
    if (source === 'youtube') {
      oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    } else if (source === 'vimeo') {
      oEmbedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`;
    }

    if (!oEmbedUrl) return null;

    const response = await axios.get(oEmbedUrl);
    const data = response.data;

    return {
      title: data.title || '',
      thumbnail_url: data.thumbnail_url || (source === 'youtube' ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''),
      // oEmbed doesn't always provide duration, especially YouTube.
      // Vimeo provides duration in seconds.
      duration: data.duration || 0 
    };
  } catch (error) {
    console.error('Error fetching video metadata:', error.message);
    if (source === 'youtube') {
      return {
        title: '',
        thumbnail_url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        duration: 0
      };
    }
    return null;
  }
};
