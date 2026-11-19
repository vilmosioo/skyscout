interface Env {}

/**
 * Cloudflare Pages Function: High-performance caching proxy for IVOA CDS hips2fits cutouts.
 * - Proxies astronomical image cutouts (DSS2, Pan-STARRS, 2MASS) from CDS Strasbourg.
 * - Injects `Access-Control-Allow-Origin: *` to prevent tainted canvas errors during 300 DPI poster exports.
 * - Caches immutable survey image cutouts at Cloudflare edge for 30 days.
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
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const pathSegments = Array.isArray(params.path)
    ? params.path.join('/')
    : params.path || '';

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    pathSegments + incomingUrl.search,
    'https://alasky.cds.unistra.fr/hips-image-services/hips2fits'
  );

  const forwardHeaders = new Headers();
  forwardHeaders.set('User-Agent', 'SkyScout-HipsProxy/1.0 (https://vilmosioo.dev)');
  forwardHeaders.set('Accept', request.headers.get('Accept') || 'image/jpeg, image/png, image/fits, */*');

  const init: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
  };

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), init);

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete('set-cookie');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('X-SkyScout-Cache', 'PROXIED');

    // Cache image cutouts at the edge for 30 days
    if (upstreamResponse.ok) {
      responseHeaders.set('Cache-Control', 'public, max-age=2592000, s-maxage=2592000');
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
        error: 'Failed to proxy request to CDS hips2fits server',
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
