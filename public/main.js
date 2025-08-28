// Get ?slug=... from the URL
const params = new URLSearchParams(location.search);
const SLUG = params.get("slug") || "the-internet-s-own-boy";

// Same-origin fetch to your cloud API (no CORS issues)
const API = `/api/articles?filters[slug][$eq]=${encodeURIComponent(SLUG)}&populate=*`;

// Render a few common block types from the Blog template
function renderBlocks(blocks = []) {
  const el = document.getElementById("content");
  el.innerHTML = "";
  for (const b of blocks) {
    if (b.__component === "shared.rich-text" && b.body) {
      const p = document.createElement("p");
      p.textContent = b.body.replace(/\n{2,}/g, "\n").trim();
      el.appendChild(p);
    }
    if (b.__component === "shared.media" && b.media?.url) {
      const img = document.createElement("img");
      img.src = b.media.url;
      img.alt = b.media.alternativeText || "";
      el.appendChild(img);
    }
    if (b.__component === "shared.quote" && b.body) {
      const q = document.createElement("blockquote");
      q.textContent = b.body;
      el.appendChild(q);
    }
    // Add more cases if you use other block types
  }
}

async function load() {
  const res = await fetch(API);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const a = json.data?.[0];
  if (!a) throw new Error("Article not found or not published.");

  // Strapi Cloud blog template stores attributes at top level in v5 templates
  document.getElementById("title").textContent = a.title || "(untitled)";
  document.getElementById("description").textContent = a.description || "";

  const cover = a.cover;
  const coverUrl =
    cover?.formats?.large?.url ||
    cover?.formats?.medium?.url ||
    cover?.url;
  if (coverUrl) document.getElementById("cover").src = coverUrl;

  renderBlocks(a.blocks || []);
}

load().catch(err => {
  document.getElementById("title").textContent = "Failed to load";
  document.getElementById("description").textContent = err.message;
});
