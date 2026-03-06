const BASE = "/UPC-LLM/"; // GitHub Pages 子路径（仓库名）

function absPath(rel) {
  return BASE + String(rel || "").replace(/^\/+/, "");
}

function stripBase(pathname) {
  const p = pathname || "/";
  if (p.startsWith(BASE)) return p.slice(BASE.length);
  return p.replace(/^\//, "");
}

function isZh() {
  return stripBase(location.pathname).startsWith("zh/");
}
function lang() {
  return isZh() ? "zh" : "en";
}

function ensureIndex(p) {
  if (!p) return "index.html";
  if (p.endsWith(".html")) return p;
  if (p.endsWith("/")) return p + "index.html";
  return p + "/index.html";
}

function pairPath(toLang) {
  const p = stripBase(location.pathname);

  if (p.startsWith("en/")) return (toLang === "zh") ? p.replace(/^en\//, "zh/") : p;
  if (p.startsWith("zh/")) return (toLang === "en") ? p.replace(/^zh\//, "en/") : p;

  return `${toLang}/`;
}

async function inject(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    el.innerHTML = ""; // 避免把 404 页面注入进来
    return;
  }
  el.innerHTML = await res.text();
}

function setNav() {
  const L = lang();
  const labels = {
    en: { news: "News", people: "People", publications: "Publications", join: "Join Us", toggle: "中文" },
    zh: { news: "新闻", people: "成员", publications: "论文", join: "加入我们", toggle: "EN" }
  };

  // // Brand -> 课题组主页
  // const brand = document.getElementById("brand-link");
  // if (brand) brand.href = absPath(`${L}/index.html`);

  // Nav
  document.querySelectorAll(".nav-link").forEach(a => {
    const key = a.getAttribute("data-key");
    if (!key) return;
    a.textContent = labels[L][key] ?? a.textContent;
    a.href = absPath(`${L}/${key}/index.html`);
  });

  // Language toggle
  const t = document.getElementById("lang-toggle");
  if (t) {
    t.textContent = labels[L].toggle;
    const targetLang = (L === "en") ? "zh" : "en";
    t.href = absPath(ensureIndex(pairPath(targetLang)));
  }

  // Active highlight
  const p = stripBase(location.pathname);
  let active = "";
  if (p.includes("news/")) active = "news";
  else if (p.includes("people/")) active = "people";
  else if (p.includes("publications/")) active = "publications";
  else if (p.includes("join/")) active = "join";
  if (active) document.querySelector(`.nav-link[data-key="${active}"]`)?.classList.add("active");
}

(async function () {
  // 注意：partials 在根目录，必须用 absPath
  await inject("#site-header", absPath("partials/header.html"));
  await inject("#site-footer", absPath("partials/footer.html"));
  setNav();
})();