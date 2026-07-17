export function onRequest() {
  return new Response(
    "google-site-verification: googlec8d204991ee10018.html",
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}
