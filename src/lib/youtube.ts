// Server-side YouTube Data API v3 client. Public data only, read-only, API-key auth.
// Nothing in this console can upload, edit or post to YouTube.
const API = "https://www.googleapis.com/youtube/v3";

export class YouTubeError extends Error {
  constructor(message: string, public status = 500) { super(message); }
}

async function get<T>(path: string, params: Record<string, string>, key: string): Promise<T> {
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", key);
  const res = await fetch(url, { next: { revalidate: 600 } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || `YouTube API returned ${res.status}`;
    throw new YouTubeError(msg.replace(/<[^>]+>/g, ""), res.status === 403 || res.status === 400 ? res.status : 502);
  }
  return body as T;
}

/** "PT1H2M3S" -> 3723 */
export function isoDuration(iso: string) {
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 86400 + (+(m[2] || 0)) * 3600 + (+(m[3] || 0)) * 60 + (+(m[4] || 0));
}

export type Video = {
  id: string; title: string; published: string; thumb: string; duration: number;
  views: number; likes: number; comments: number; short: boolean; url: string;
};
export type Channel = {
  id: string; title: string; handle: string; description: string; thumb: string; country?: string;
  subscribers: number | null; views: number; videoCount: number; created: string; videos: Video[];
};

type ChannelItem = {
  id: string;
  snippet: { title: string; description: string; customUrl?: string; publishedAt: string; country?: string;
    thumbnails: Record<string, { url: string }> };
  statistics: { viewCount: string; subscriberCount?: string; hiddenSubscriberCount: boolean; videoCount: string };
  contentDetails: { relatedPlaylists: { uploads: string } };
};

/** Accepts @handle, a channel URL, or a UC... id. */
export function parseChannelRef(raw: string): { forHandle?: string; id?: string } {
  const s = raw.trim();
  const url = s.match(/youtube\.com\/(?:(@[\w.-]+)|channel\/(UC[\w-]{22}))/i);
  if (url) return url[1] ? { forHandle: url[1] } : { id: url[2] };
  if (/^UC[\w-]{22}$/.test(s)) return { id: s };
  return { forHandle: s.startsWith("@") ? s : `@${s}` };
}

export async function fetchChannel(ref: string, key: string, max = 50): Promise<Channel> {
  const q = parseChannelRef(ref);
  const ch = await get<{ items?: ChannelItem[] }>("channels", { part: "snippet,statistics,contentDetails", ...q } as Record<string, string>, key);
  const c = ch.items?.[0];
  if (!c) throw new YouTubeError(`No channel found for "${ref}"`, 404);

  const ids: string[] = [];
  let pageToken = "";
  while (ids.length < max) {
    const pl = await get<{ items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string }>("playlistItems", {
      part: "contentDetails", playlistId: c.contentDetails.relatedPlaylists.uploads,
      maxResults: String(Math.min(50, max - ids.length)), ...(pageToken ? { pageToken } : {}),
    }, key).catch((e) => {
      // A channel with no uploads has no uploads playlist.
      if (e instanceof YouTubeError && e.status === 404) return { items: [], nextPageToken: undefined };
      throw e;
    });
    ids.push(...(pl.items || []).map((i) => i.contentDetails.videoId));
    if (!pl.nextPageToken) break;
    pageToken = pl.nextPageToken;
  }

  const videos: Video[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const vs = await get<{ items?: {
      id: string;
      snippet: { title: string; publishedAt: string; thumbnails: Record<string, { url: string }> };
      contentDetails: { duration: string };
      statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    }[] }>("videos", { part: "snippet,contentDetails,statistics", id: ids.slice(i, i + 50).join(",") }, key);
    for (const v of vs.items || []) {
      const duration = isoDuration(v.contentDetails.duration);
      videos.push({
        id: v.id, title: v.snippet.title, published: v.snippet.publishedAt,
        thumb: (v.snippet.thumbnails.medium || v.snippet.thumbnails.default)?.url || "",
        duration, views: +(v.statistics.viewCount || 0), likes: +(v.statistics.likeCount || 0),
        comments: +(v.statistics.commentCount || 0),
        // The API has no Shorts flag; three minutes is YouTube's current Shorts ceiling.
        short: duration > 0 && duration <= 180, url: `https://www.youtube.com/watch?v=${v.id}`,
      });
    }
  }
  videos.sort((a, b) => b.published.localeCompare(a.published));

  return {
    id: c.id, title: c.snippet.title, handle: c.snippet.customUrl || "", description: c.snippet.description,
    thumb: (c.snippet.thumbnails.medium || c.snippet.thumbnails.default)?.url || "", country: c.snippet.country,
    subscribers: c.statistics.hiddenSubscriberCount ? null : +(c.statistics.subscriberCount || 0),
    views: +c.statistics.viewCount, videoCount: +c.statistics.videoCount, created: c.snippet.publishedAt, videos,
  };
}
