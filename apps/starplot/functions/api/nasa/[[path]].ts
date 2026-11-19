interface Env {}

/**
 * Computes a deterministic SHA-256 cache key URL for a POST request body.
 */
async function getCacheKeyUrl(requestUrl: string, bodyText: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(bodyText || ''));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const url = new URL(requestUrl);
  return `${url.origin}/_cf_cache/nasa-tap/${hashHex}`;
}

/**
 * Cloudflare Pages Function: High-performance caching proxy for NASA astronomical archives:
 * - NASA IPAC / IRSA TAP: 2MASS All-Sky Point Source Catalog & AllWISE
 * - STScI MAST TAP: TESS Input Catalog (TIC) & Hubble Source Catalog
 *
 * Provides CORS bypass and edge-caches immutable astronomical survey queries for 7 days.
 */
export async function onRequest(context: {
  request: Request;
  params: { path?: string | string[] };
  env: Env;
}): Promise<Response> {
  const { request, params } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const pathSegments = Array.isArray(params.path)
    ? params.path.join('/')
    : params.path || '';

  const incomingUrl = new URL(request.url);

  // Route to MAST TAP if path begins with 'mast', otherwise default to IPAC TAP
  let targetUrl: URL;
  if (pathSegments.startsWith('mast')) {
    const subPath = pathSegments.replace(/^mast\/?/, '');
    targetUrl = new URL(subPath + incomingUrl.search, 'https://mast.stsci.edu/api/v0/tap/');
  } else {
    const subPath = pathSegments.replace(/^ipac\/?/, '');
    targetUrl = new URL(subPath + incomingUrl.search, 'https://irsa.ipac.caltech.edu/TAP/');
  }

  let bodyText = '';
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    bodyText = await request.text();
  }

  // Cloudflare Cache API lookup
  const cfCache =
    typeof caches !== 'undefined' && 'default' in caches
      ? (caches as unknown as { default: Cache }).default
      : null;
  let cacheKey: Request | null = null;

  if (cfCache && request.method === 'POST' && bodyText) {
    try {
      const cacheUrl = await getCacheKeyUrl(request.url, bodyText);
      cacheKey = new Request(cacheUrl, { method: 'GET' });
      const cached = await cfCache.match(cacheKey);
      if (cached) {
        const cachedHeaders = new Headers(cached.headers);
        cachedHeaders.set('X-SkyScout-Cache', 'HIT');
        cachedHeaders.set('CF-Cache-Status', 'HIT');
        cachedHeaders.set('Access-Control-Allow-Origin', '*');
        return new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: cachedHeaders,
        });
      }
    } catch {
      // Fall through on cache lookup exception
    }
  }

  const forwardHeaders = new Headers();
  forwardHeaders.set('User-Agent', 'SkyScout-NasaProxy/1.0 (https://vilmosioo.dev)');
  forwardHeaders.set('Accept', request.headers.get('Accept') || 'application/json, text/plain, */*');

  const contentType = request.headers.get('Content-Type');
  if (contentType) {
    forwardHeaders.set('Content-Type', contentType);
  } else if (bodyText) {
    forwardHeaders.set('Content-Type', 'application/x-www-form-urlencoded');
  }

  const init: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
    body: bodyText || undefined,
  };

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), init);

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete('set-cookie');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept'
    );
    responseHeaders.set('X-SkyScout-Cache', 'MISS');

    // Cache successful TAP responses for 7 days (2MASS and TIC catalogs are immutable)
    if (upstreamResponse.ok) {
      responseHeaders.set('Cache-Control', 'public, max-age=604800, s-maxage=604800');

      if (cfCache && cacheKey) {
        const responseToCache = new Response(upstreamResponse.clone().body, {
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          headers: responseHeaders,
        });
        try {
          await cfCache.put(cacheKey, responseToCache);
        } catch {
          // Ignore cache write errors
        }
      }
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        error: 'Failed to proxy request to NASA TAP server',
        details: message,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
