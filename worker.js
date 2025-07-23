addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  const upstreamDoH = 'https://cloudflare-dns.com/dns-query'

  // Only allow GET and POST (per DoH spec)
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const headers = new Headers()
  headers.set('Accept', 'application/dns-message')
  
  let fetchUrl = upstreamDoH
  let fetchOptions = {
    method: request.method,
    headers: headers,
  }

  if (request.method === 'GET') {
    fetchUrl += url.search
  } else if (request.method === 'POST') {
    headers.set('Content-Type', 'application/dns-message')
    const body = await request.arrayBuffer()
    fetchOptions.body = body
  }

  const upstreamResponse = await fetch(fetchUrl, fetchOptions)

  // Copy necessary headers only
  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/dns-message')
  responseHeaders.set('Access-Control-Allow-Origin', '*') // Optional: for CORS

  const responseBody = await upstreamResponse.arrayBuffer()

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders
  })
}
