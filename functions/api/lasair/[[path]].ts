interface Env {
  LASAIR_TOKEN?: string;
}

/**
 * Computes a deterministic SHA-256 cache key URL for request caching.
 */
async function getCacheKeyUrl(requestUrl: string, bodyText: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(bodyText || ''));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const url = new URL(requestUrl);
  return `${url.origin}/_cf_cache/lasair/${hashHex}`;
}

/**
 * Cloudflare Pages Function: High-performance secure proxy for the Lasair Rubin LSST Alert Broker API.
 * - Injects the secret `LASAIR_TOKEN` server-side to prevent token leakage in client-side bundles.
 * - Resolves browser CORS restrictions by proxying API requests with permissive CORS headers.
 * - Caches immutable historical object light curves and Sherlock classifications at Cloudflare edge.
 */
export async function onRequest(context: {
  request: Request;
  params: { path?: string | string[] };
  env: Env;
}): Promise<Response> {
  const { request, params, env } = context;

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
  // Ensure trailing slash for Lasair Django REST endpoints if path segment exists
  const normalizedPath = pathSegments ? (pathSegments.endsWith('/') ? pathSegments : `${pathSegments}/`) : '';
  const targetUrl = new URL(normalizedPath + incomingUrl.search, 'https://api.lasair.lsst.ac.uk/api/');

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

  if (cfCache) {
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
      // Fall through to live origin fetch if cache match encounters an exception
    }
  }

  const forwardHeaders = new Headers();
  forwardHeaders.set('User-Agent', 'SkyScout-LasairProxy/1.0 (https://vilmosioo.dev)');
  forwardHeaders.set('Accept', request.headers.get('Accept') || 'application/json');

  const contentType = request.headers.get('Content-Type');
  if (contentType) {
    forwardHeaders.set('Content-Type', contentType);
  } else if (bodyText) {
    forwardHeaders.set('Content-Type', 'application/json');
  }

  // Server-side authentication: prioritize secret environment token, fallback to incoming header
  const token = env.LASAIR_TOKEN?.trim() || request.headers.get('Authorization')?.replace(/^Token\s+/i, '')?.trim();
  if (token) {
    forwardHeaders.set('Authorization', `Token ${token}`);
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

    // Cache historical object light curves and Sherlock classifications for 24 hours
    const isHistorical = pathSegments.includes('objects') || pathSegments.includes('sherlock');
    if (upstreamResponse.ok && isHistorical) {
      responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

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
        error: 'Failed to proxy request to Lasair alert broker API',
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
