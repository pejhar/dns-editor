# DoH Proxy / DoH Bypasser

This is a lightweight Cloudflare Workers script that acts as a DNS-over-HTTPS (DoH) proxy. It forwards DNS queries to Cloudflare's DoH endpoint, allowing clients to bypass DNS restrictions or censorship by tunneling DNS queries over HTTPS.

## Features

- Supports both GET and POST DNS queries as per DoH specification.
- Forwards DNS requests to Cloudflare's DoH resolver (`https://cloudflare-dns.com/dns-query`).
- Returns DNS responses with appropriate headers.
- Enables CORS with `Access-Control-Allow-Origin: *` for cross-origin requests.

## Usage

Deploy this script as a Cloudflare Worker (or similar edge worker environment).

### Handling Requests

- For GET requests, the DNS query is sent via the URL query string.
- For POST requests, the DNS query is sent as a binary DNS message in the request body.
- for Android Usage install Intra App.

## Code Overview

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const upstreamDoH = 'https://cloudflare-dns.com/dns-query'

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

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/dns-message')
  responseHeaders.set('Access-Control-Allow-Origin', '*')

  const responseBody = await upstreamResponse.arrayBuffer()

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders
  })
}


After deploying, **users must configure their DNS-over-HTTPS client or browser to use the worker URL as the DoH endpoint**. The URL should follow this structure:
 ``` https://workerURL.testaccount.workers.dev/dns-query ```

## سلب مسئولیت

این نرم‌افزار صرفاً به منظور یادگیری و استفاده‌های قانونی و اخلاقی توسعه یافته است. استفاده نادرست یا سوءاستفاده از این ابزار برای دور زدن محدودیت‌ها یا قوانین کشوری ممکن است تبعات قانونی داشته باشد. نویسنده و منتشرکننده این کد هیچ‌گونه مسئولیتی در قبال استفاده غیرقانونی یا سوءاستفاده احتمالی از این نرم‌افزار نمی‌پذیرند. لطفاً همیشه قوانین محلی و سیاست‌های سرویس‌دهنده‌ها را رعایت کنید.

