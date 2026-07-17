const GOOGLE_VERIFICATION_PATH = "/googlec8d204991ee10018.html";
const GOOGLE_VERIFICATION_CONTENT =
  "google-site-verification: googlec8d204991ee10018.html";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === GOOGLE_VERIFICATION_PATH) {
      return new Response(GOOGLE_VERIFICATION_CONTENT, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
