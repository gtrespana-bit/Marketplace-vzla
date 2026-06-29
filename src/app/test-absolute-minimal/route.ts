export async function GET() {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Absolute Minimal</title>
      </head>
      <body>
        <h1>Absolute Minimal Test</h1>
        <p>No Next.js, no intl, no components, no nothing.</p>
      </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}