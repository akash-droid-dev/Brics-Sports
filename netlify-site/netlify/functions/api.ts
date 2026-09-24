// Netlify host: the shared API as a Function, with the live state in Netlify Blobs.
// Netlify Functions can't hold connections open, so /api/stream answers once and tells the
// browser's EventSource to reconnect a few seconds later. The response is cached on Netlify's
// CDN and purged on every change, so thousands of visitors cost only a trickle of invocations.
import { getStore } from '@netlify/blobs';
import { purgeCache, type Config, type Context } from '@netlify/functions';
import { Conflict, createApi, type Doc, type MediaStore, type Store } from '../../server/core.ts';

const KEY = 'live-state';
const TAG = 'live-state';
const RECONNECT_MS = 5000;

const blobStore = (): Store => {
  const blobs = getStore({ name: 'live-hub', consistency: 'strong' });
  return {
    async load() {
      const r = await blobs.getWithMetadata(KEY, { type: 'json' });
      return r ? { doc: r.data as Doc, tag: r.etag } : { doc: null, tag: null };
    },
    async save(doc, tag) {
      const cond = typeof tag === 'string' ? { onlyIfMatch: tag } : tag === null ? { onlyIfNew: true } : {};
      const res = await blobs.setJSON(KEY, doc, cond);
      if (res && 'modified' in res && res.modified === false) throw new Conflict('changed meanwhile');
    },
  };
};

const blobMedia = (): MediaStore => {
  const files = getStore({ name: 'live-hub-media', consistency: 'strong' });
  return {
    async put(id, data, type) { await files.set(id, data.slice().buffer as ArrayBuffer, { metadata: { type } }); },
    async get(id) {
      const r = await files.getWithMetadata(id, { type: 'arrayBuffer' });
      return r ? { data: new Uint8Array(r.data), type: String(r.metadata.type ?? 'application/octet-stream') } : null;
    },
    async remove(id) { await files.delete(id); },
  };
};

const CDN = {
  'Netlify-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30, durable',
  'Netlify-Cache-Tag': TAG,
};

export default async (req: Request, context: Context) => {
  const env = { ...process.env, NODE_ENV: 'production' };
  const api = createApi({ store: blobStore(), media: blobMedia(), env, stateHeaders: CDN, onChange: async () => {
    // A failed purge only delays pages by the cache time; the change itself is already saved.
    await purgeCache({ tags: [TAG] }).catch((e: unknown) => console.warn('[live-hub] cache purge failed', e));
  } });
  const path = new URL(req.url).pathname;

  if (req.method === 'GET' && path === '/api/stream') {
    const state = await (await api(new Request(new URL('/api/state', req.url)))).text();
    return new Response(`retry: ${RECONNECT_MS}\nevent: state\ndata: ${state}\n\n`, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', ...CDN },
    });
  }
  return api(req, context.ip);
};

export const config: Config = { path: '/api/*' };
