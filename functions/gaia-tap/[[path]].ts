interface Env {}

/**
 * Cloudflare Pages Function: Transparent proxy for ESA Gaia Archive TAP API.
 * Bypasses browser CORS restrictions by proxying requests server-side.
 */
export async function onRequest(context: {
  request: Request;
  params: { path?: string | string[] };
  env: Env;
}): Promise<Response> {
  const { request, params } = context;

  const pathSegments = Array.isArray(params.path)
    ? params.path.join('/')
    : params.path || '';

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    pathSegments + incomingUrl.search,
    'https://gea.esac.esa.int/tap-server/tap/'
  );

  const init: RequestInit = {
    method: request.method,
    headers: {
      'User-Agent': 'SkyScout-StarPlot/1.0 (https://vilmosioo.dev)',
      Accept: request.headers.get('Accept') || 'application/json',
    },
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), init);

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    // Cache successful TAP query responses at the edge for 1 hour
    if (upstreamResponse.ok) {
      responseHeaders.set(
        'Cache-Control',
        'public, max-age=3600, s-maxage=3600'
      );
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
        error: 'Failed to proxy request to ESA Gaia TAP server',
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
