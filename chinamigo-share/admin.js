const state = {
  overview: null,
  inquiries: [],
  guides: [],
  guideCollections: [],
  cities: [],
  experiences: [],
  templates: [],
  media: [],
  currentGuideId: null,
  currentGuideCollectionId: null,
  currentCityId: null,
  currentExperienceId: null,
  currentTemplateId: null,
  currentExperienceDay: 0,
  currentGuideLang: "en",
  guideDraft: null,
  guideAutosaveTimer: null,
  lastVisualSelection: null,
  editorHistory: {
    en: { undo: [], redo: [], last: "" },
    cn: { undo: [], redo: [], last: "" }
  },
  mediaPicker: null,
  overviewActivityExpanded: false,
  completedFocus: new Set(JSON.parse(localStorage.getItem("chinamigo_completed_focus") || "[]"))
};

let draggedBlock = null;
let draggedCityId = null;
const experienceTagOptions = ["Luxury", "Slow Travel", "Wellness", "First-time Visitor", "Family", "Food & Café", "Shopping", "Local Culture", "Nightlife", "Design Hotels", "Business", "Private"];
const crmTagGroups = {
  "旅行类型": ["Luxury", "Family", "Wellness", "Business", "Shopping"],
  "客户等级": ["VIP", "High Intent", "Returning"],
  "紧急程度": ["Urgent", "Flexible"]
};
const defaultQuickReplyTemplates = {
  welcome: {
    id: "template-welcome",
    icon: "👋",
    label: "欢迎模板",
    category: "欢迎",
    body: "Hi {{name}}, thanks for reaching out to ChinaMigo. We received your travel preferences and will help shape a calm China plan around your timing and cities."
  },
  luxury: {
    id: "template-luxury",
    icon: "✨",
    label: "Luxury 模板",
    category: "欢迎",
    body: "Hi {{name}}, we can curate a quieter luxury China journey with private transport, refined hotels, reservations and local support. Could you share your preferred hotel level and approximate budget?"
  },
  family: {
    id: "template-family",
    icon: "👨‍👩‍👧",
    label: "家庭旅行模板",
    category: "欢迎",
    body: "Hi {{name}}, we can help plan a family-friendly China route with smoother transport, flexible pacing and local support. Could you share the ages of the travelers and your preferred dates?"
  },
  business: {
    id: "template-business",
    icon: "💼",
    label: "商务客户模板",
    category: "欢迎",
    body: "Hi {{name}}, we can support your China business trip with transport, translation, sourcing visits and calm local coordination. Could you share your target city, dates and meeting goals?"
  },
  plan: {
    id: "template-plan",
    icon: "🧭",
    label: "发送行程方案",
    category: "路线发送",
    body: "Hi {{name}}, we can prepare a private route proposal based on your dates, city interests and preferred stay level. Could you confirm your hotel budget range?"
  },
  budget: {
    id: "template-budget",
    icon: "💬",
    label: "请求预算",
    category: "预算确认",
    body: "Hi {{name}}, to plan this properly, could you share your rough total budget or preferred hotel level for this China journey?"
  },
  call: {
    id: "template-call",
    icon: "📞",
    label: "预约电话",
    category: "跟进",
    body: "Hi {{name}}, would you like to schedule a short call so we can understand your travel rhythm and support needs more clearly?"
  }
};
const mediaCategoryLabels = {
  guides: "攻略图片",
  trips: "行程图片",
  cities: "城市图片",
  home: "首页图片",
  about: "About 图片",
  common: "通用素材"
};

const inquiryStatuses = ["new", "replied", "following", "confirmed", "won", "lost", "spam"];
const statusLabels = {
  draft: "草稿",
  published: "已发布",
  scheduled: "定时发布",
  archived: "已归档",
  new: "新咨询",
  replied: "已回复",
  following: "跟进中",
  reviewed: "已回复",
  contacted: "已回复",
  planning: "跟进中",
  quoted: "跟进中",
  confirmed: "已确认",
  won: "已成交",
  lost: "已流失",
  spam: "垃圾"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setStatus(message) {
  $("[data-status]").textContent = message || "";
}

function showToast(message) {
  const toast = $("[data-toast]");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Use the fallback path below.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

async function api(path, options = {}) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(options.method || "GET", path);
    request.withCredentials = true;
    if (!(options.body instanceof FormData)) request.setRequestHeader("Content-Type", "application/json");
    request.onload = () => {
      let data = {};
      try {
        data = JSON.parse(request.responseText || "{}");
      } catch {
        data = {};
      }
      if (request.status >= 200 && request.status < 300 && data.ok !== false) resolve(data);
      else reject(new Error(data.error || "Request failed."));
    };
    request.onerror = () => reject(new Error("Network request failed."));
    request.send(options.body || null);
  });
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function listToCsv(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function csvToList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function mediaCategoryLabel(value) {
  return mediaCategoryLabels[value] || value || "通用素材";
}

function mediaSearchText(item) {
  return [
    item.filename,
    item.alt,
    item.url,
    item.category,
    item.folder,
    ...(item.tags || []),
    ...(item.usage || []).flatMap((usage) => [usage.label, usage.type])
  ].join(" ").toLowerCase();
}

function filterMediaItems(query = "", category = "") {
  const normalizedQuery = String(query || "").toLowerCase();
  let items = [...state.media];
  if (category === "unused") items = items.filter((item) => !(item.usage || []).length);
  else if (category === "recent") items = items.slice(0, 24);
  else if (category) items = items.filter((item) => (item.category || item.folder) === category);
  return items.filter((item) => !normalizedQuery || mediaSearchText(item).includes(normalizedQuery));
}

function parseBlocks(value) {
  if (!String(value || "").trim()) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function parseJsonField(value, fallback) {
  if (!String(value || "").trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function slugify(value, fallback = "item") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `${fallback}-${Date.now()}`;
}

function defaultGuide() {
  const id = `guide-${Date.now()}`;
  return {
    id,
    title: "未命名攻略",
    slug: "",
    city: "",
    category: "Payments",
    tags: [],
    featured: false,
    coverImage: "",
    coverAlt: "",
    mobileCoverImage: "",
    imagePosition: "center center",
    imageScale: 1.02,
    readTime: "5 min read",
    author: "ChinaMigo Editorial",
    status: "draft",
    publishedAt: "",
    scheduledAt: "",
    relatedGuides: [],
    translations: {
      en: { title: "未命名攻略", excerpt: "", htmlContent: "", contentBlocks: [], seo: { title: "", description: "" } },
      cn: { title: "", excerpt: "", htmlContent: "", contentBlocks: [], seo: { title: "", description: "" } }
    },
    seo: { ogImage: "", canonicalUrl: "", noindex: false }
  };
}

function getGuideTranslation(guide, lang = state.currentGuideLang) {
  guide.translations ||= {};
  guide.translations[lang] ||= {
    title: lang === "en" ? (guide.title || "") : "",
    excerpt: lang === "en" ? (guide.excerpt || "") : "",
    contentBlocks: lang === "en" ? (guide.contentBlocks || []) : [],
    seo: { title: "", description: "" }
  };
  if (lang === "en") {
    guide.translations[lang].title ||= guide.title || "";
    guide.translations[lang].excerpt ||= guide.excerpt || "";
    if (!guide.translations[lang].contentBlocks?.length && guide.contentBlocks?.length) {
      guide.translations[lang].contentBlocks = guide.contentBlocks;
    }
  }
  guide.translations[lang].seo ||= { title: "", description: "" };
  guide.translations[lang].contentBlocks ||= [];
  guide.translations[lang].htmlContent ||= "";
  return guide.translations[lang];
}

function blocksToHtml(blocks = []) {
  return blocks.map((block) => {
    if (block.type === "heading") return `<h2>${escapeHtml(block.title || block.body)}</h2>`;
    if (block.type === "quote") return `<blockquote>${escapeHtml(block.body || block.title)}</blockquote>`;
    if (block.type === "image") return block.image ? `<figure><img src="/${escapeHtml(block.image)}" alt="${escapeHtml(block.alt)}"><figcaption>${escapeHtml(block.alt)}</figcaption></figure>` : "";
    if (block.type === "gallery") return `<div class="cms-gallery">${(block.items || []).map((src) => `<img src="/${escapeHtml(src)}" alt="">`).join("")}</div>`;
    if (block.type === "divider") return "<hr>";
    if (block.type === "cta") return `<p><a class="cms-cta" href="${escapeHtml(block.href || "#")}">${escapeHtml(block.label || block.title || "Chat on WhatsApp")}</a></p>`;
    if (block.type === "tip") return `<aside><strong>${escapeHtml(block.title || "Travel Tip")}</strong><p>${escapeHtml(block.body)}</p></aside>`;
    if (["bullet_list", "number_list", "checklist"].includes(block.type)) {
      const tag = block.type === "number_list" ? "ol" : "ul";
      return `<${tag}>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
    }
    return block.body ? `<p>${escapeHtml(block.body)}</p>` : "";
  }).join("");
}

function htmlToPlainDraft(html = "") {
  return String(html)
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gis, "**$1**")
    .replace(/<span[^>]*class=[\"'][^\"']*cms-text-color[^\"']*[\"'][^>]*style=[\"'][^\"']*color:\s*([^;\"']+)[^\"']*[\"'][^>]*>(.*?)<\/span>/gis, "[color:$1]$2[/color]")
    .replace(/<span[^>]*class=[\"'][^\"']*cms-text-size-(small|medium|large|hero)[^\"']*[\"'][^>]*>(.*?)<\/span>/gis, "[size:$1]$2[/size]")
    .replace(/<mark[^>]*style=[\"'][^\"']*background:\s*([^;\"']+)[^\"']*[\"'][^>]*>(.*?)<\/mark>/gis, "[highlight:$1]$2[/highlight]")
    .replace(/<mark[^>]*>(.*?)<\/mark>/gis, "[highlight]$1[/highlight]")
    .replace(/<figure[^>]*class=[\"'][^\"']*cms-audio[^\"']*[\"'][^>]*>[\s\S]*?<figcaption[^>]*>(.*?)<\/figcaption>[\s\S]*?<audio[^>]*src=[\"']\/?([^\"']+)[\"'][^>]*>[\s\S]*?<\/figure>/gis, "Audio: $1 | $2\n\n")
    .replace(/<figure[^>]*class=[\"'][^\"']*cms-video[^\"']*[\"'][^>]*>[\s\S]*?<video[^>]*src=[\"']\/?([^\"']+)[\"'][^>]*>[\s\S]*?<figcaption[^>]*>(.*?)<\/figcaption>[\s\S]*?<\/figure>/gis, "Video: $2 | $1\n\n")
    .replace(/<h1[^>]*>(.*?)<\/h1>/gis, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, "### $1\n\n")
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, "> $1\n\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gis, "- $1\n")
    .replace(/<img[^>]*src=[\"']\/?([^\"']+)[\"'][^>]*alt=[\"']?([^\"']*)[\"']?[^>]*>/gis, "![$2]($1)\n\n")
    .replace(/<img[^>]*src=[\"']\/?([^\"']+)[\"'][^>]*>/gis, "![]($1)\n\n")
    .replace(/<a[^>]*class=[\"']cms-cta[\"'][^>]*href=[\"']([^\"']+)[\"'][^>]*>(.*?)<\/a>/gis, "CTA: $2 | $1\n\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gis, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function inlineMarkdown(text = "") {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[color:([#a-zA-Z0-9(),.\s-]+)]([\s\S]*?)\[\/color]/g, '<span class="cms-text-color" style="color:$1">$2</span>')
    .replace(/\[size:(small|medium|large|hero)]([\s\S]*?)\[\/size]/g, '<span class="cms-text-size cms-text-size-$1">$2</span>')
    .replace(/\[highlight(?::([#a-zA-Z0-9(),.\s-]+))?]([\s\S]*?)\[\/highlight]/g, (_match, color, text) => `<mark class="cms-highlight" style="background:${color || "#F3E7C8"}">${text}</mark>`);
}

function markdownToHtml(markdown = "") {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let bullets = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };
  const flushBullets = () => {
    if (!bullets.length) return;
    html.push(`<ul>${bullets.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    bullets = [];
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushBullets();
      continue;
    }
    const image = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    const audio = trimmed.match(/^Audio:\s*(.*?)\s*\|\s*(.+)$/i);
    const video = trimmed.match(/^Video:\s*(.*?)\s*\|\s*(.+)$/i);
    const cta = trimmed.match(/^CTA:\s*(.*?)\s*\|\s*(.+)$/i);
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      bullets.push(trimmed.slice(2).trim());
    } else if (image) {
      flushParagraph();
      flushBullets();
      html.push(`<figure><img src="/${escapeHtml(image[2].replace(/^\/+/, ""))}" alt="${escapeHtml(image[1])}"><figcaption>${escapeHtml(image[1])}</figcaption></figure>`);
    } else if (audio) {
      flushParagraph();
      flushBullets();
      html.push(`<figure class="cms-media cms-audio"><figcaption>${escapeHtml(audio[1])}</figcaption><audio controls src="/${escapeHtml(audio[2].replace(/^\/+/, ""))}"></audio></figure>`);
    } else if (video) {
      flushParagraph();
      flushBullets();
      html.push(`<figure class="cms-media cms-video"><video controls playsinline src="/${escapeHtml(video[2].replace(/^\/+/, ""))}"></video><figcaption>${escapeHtml(video[1])}</figcaption></figure>`);
    } else if (cta) {
      flushParagraph();
      flushBullets();
      html.push(`<p><a class="cms-cta" href="${escapeHtml(cta[2])}">${escapeHtml(cta[1])}</a></p>`);
    } else if (trimmed === "---") {
      flushParagraph();
      flushBullets();
      html.push("<hr>");
    } else if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushBullets();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushBullets();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushBullets();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(2))}</h2>`);
    } else if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushBullets();
      html.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
    } else {
      paragraph.push(trimmed);
    }
  }
  flushParagraph();
  flushBullets();
  return html.join("");
}

function cleanRenderedFormatArtifacts(html = "") {
  return String(html || "")
    .replace(/\[(?:\/)?highlight(?::[^\]]+)?]/gi, "")
    .replace(/\[(?:\/)?color(?::[^\]]+)?]/gi, "")
    .replace(/\[(?:\/)?size(?::[^\]]+)?]/gi, "");
}

function guideLanguageStatus(guide) {
  const en = getGuideTranslation(guide, "en");
  const cn = getGuideTranslation(guide, "cn");
  return {
    en: Boolean(en.title && (en.excerpt || en.contentBlocks.length || en.rawContent)),
    cn: Boolean(cn.title && (cn.excerpt || cn.contentBlocks.length || cn.rawContent))
  };
}

function guideTranslationSyncLabel(guide) {
  const en = getGuideTranslation(guide, "en");
  const cn = getGuideTranslation(guide, "cn");
  const enText = [en.title, en.excerpt, en.rawContent, en.htmlContent].filter(Boolean).join(" ");
  const cnText = [cn.title, cn.excerpt, cn.rawContent, cn.htmlContent].filter(Boolean).join(" ");
  if (!cnText.trim()) return "中文未创建";
  if (enText.length > 240 && cnText.length < enText.length * 0.18) return "中文缺少 40%+";
  if ((en.rawContent || "").length > 80 && (cn.rawContent || "").length < 30) return "中文待更新";
  return "中英已同步";
}

function updateTranslationSyncPill(guide = state.guideDraft) {
  const node = $("[data-translation-sync]");
  if (!node || !guide) return;
  const label = guideTranslationSyncLabel(guide);
  node.textContent = label;
  node.className = `translation-sync-pill ${label.includes("同步") ? "is-ok" : "needs-work"}`;
}

function fillForm(form, values = {}) {
  [...form.elements].forEach((field) => {
    if (!field.name) return;
    const value = values[field.name];
    if (["contentBlocks", "itineraryDays", "shortDetails"].includes(field.name)) field.value = JSON.stringify(value || (field.name === "shortDetails" ? {} : []), null, 2);
    else if (Array.isArray(value)) field.value = listToCsv(value);
    else if (typeof value === "boolean") field.value = String(value);
    else field.value = value ?? "";
  });
}

function formValues(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  if ("relatedGuides" in payload) payload.relatedGuides = csvToList(payload.relatedGuides);
  if ("categories" in payload) payload.categories = csvToList(payload.categories);
  if ("guideSlugs" in payload) payload.guideSlugs = csvToList(payload.guideSlugs);
  if ("tags" in payload) payload.tags = csvToList(payload.tags);
  if ("galleryImages" in payload) payload.galleryImages = csvToList(payload.galleryImages);
  if ("contentBlocks" in payload) payload.contentBlocks = parseBlocks(payload.contentBlocks);
  if ("itineraryDays" in payload) payload.itineraryDays = parseJsonField(payload.itineraryDays, []);
  if ("shortDetails" in payload) payload.shortDetails = parseJsonField(payload.shortDetails, {});
  if ("sortOrder" in payload) payload.sortOrder = Number(payload.sortOrder || 0);
  if ("active" in payload) payload.active = payload.active === "true";
  if ("showInNavigation" in payload) payload.showInNavigation = payload.showInNavigation === "true";
  if ("published" in payload) payload.published = payload.published === "true";
  return payload;
}

function itemRow({ title, meta, body, actions = "" }) {
  return `
    <article class="list-item">
      <div>
        <strong>${title}</strong>
        <span>${meta || ""}</span>
        ${body ? `<p>${body}</p>` : ""}
      </div>
      <div class="row-actions">${actions}</div>
    </article>
  `;
}

function cityKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function citySlugFromName(value) {
  return cityKey(value);
}

function normalizeCityDraft(city = {}) {
  return {
    active: true,
    showInNavigation: true,
    sortOrder: 0,
    ...city,
    shortDescription: city.shortDescription || city.description || "",
    longDescription: city.longDescription || "",
    bannerImage: city.bannerImage || "",
    cardImage: city.cardImage || "",
    thumbnailImage: city.thumbnailImage || ""
  };
}

function cityMatchesContent(city, value) {
  const citySlug = cityKey(city.slug || city.name);
  const cityName = cityKey(city.name);
  const contentCity = cityKey(value);
  return Boolean(contentCity && (contentCity === citySlug || contentCity === cityName));
}

function cityContentStats(city) {
  const guides = state.guides.filter((guide) => cityMatchesContent(city, guide.city));
  const experiences = state.experiences.filter((experience) => cityMatchesContent(city, experience.city));
  const journeys = experiences.filter((experience) => experience.type === "recommended_journey");
  const shorts = experiences.filter((experience) => experience.type === "short_experience");
  return { guides, experiences, journeys, shorts };
}

function cityImage(city) {
  return city.thumbnailImage || city.cardImage || city.bannerImage || "assets/hero-china-concierge.png";
}

function cityHealth(city) {
  const stats = cityContentStats(city);
  const issues = [];
  if (!city.bannerImage) issues.push({ key: "missing-banner", label: "缺横图" });
  if (!city.cardImage) issues.push({ key: "missing-card", label: "缺封面图" });
  if (!stats.guides.length) issues.push({ key: "missing-guides", label: "缺攻略" });
  if (!stats.experiences.length) issues.push({ key: "missing-experience", label: "缺行程" });
  if (!city.shortDescription || city.shortDescription.length < 32) issues.push({ key: "seo-weak", label: "SEO弱" });
  if (city.showInNavigation && city.active) issues.push({ key: "featured", label: "推荐城市", positive: true });
  const required = 5;
  const missing = issues.filter((item) => !item.positive).length;
  return {
    issues,
    percent: Math.max(0, Math.round(((required - missing) / required) * 100))
  };
}

function formatRelativeDate(value) {
  if (!value) return "未保存";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function setCitySaveStatus(message, stateName = "idle") {
  const node = $("[data-city-save-status]");
  if (!node) return;
  node.textContent = message;
  node.dataset.state = stateName;
}

function cityDraftFromForm() {
  const city = normalizeCityDraft(formValues($("[data-city-form]")));
  city.id = state.currentCityId || city.id;
  return city;
}

function experienceSlugFromTitle(value) {
  return cityKey(value);
}

function defaultExperience(overrides = {}) {
  return {
    id: "",
    title: "新行程",
    slug: "",
    city: state.cities[0]?.slug || "shanghai",
    type: "recommended_journey",
    duration: "3 Days",
    excerpt: "",
    coverImage: "",
    galleryImages: [],
    tags: ["Private"],
    itineraryDays: [
      { title: "Day 1", morning: "", afternoon: "", evening: "", stayNotes: "", image: "" }
    ],
    shortDetails: { location: "", highlights: "", bookingMethod: "", notes: "" },
    contentBlocks: [],
    sortOrder: state.experiences.length + 1,
    published: true,
    ...overrides
  };
}

function normalizeExperienceDraft(experience = {}) {
  const contentBlocks = Array.isArray(experience.contentBlocks) ? experience.contentBlocks : [];
  const dayBlocks = contentBlocks.filter((block) => block.type === "itinerary_day");
  return {
    ...defaultExperience(),
    ...experience,
    tags: Array.isArray(experience.tags) ? experience.tags : csvToList(experience.tags),
    galleryImages: Array.isArray(experience.galleryImages) ? experience.galleryImages : csvToList(experience.galleryImages),
    itineraryDays: Array.isArray(experience.itineraryDays) && experience.itineraryDays.length
      ? experience.itineraryDays
      : (dayBlocks.length ? dayBlocks.map((block, index) => ({
        title: block.title || `Day ${index + 1}`,
        morning: block.morning || "",
        afternoon: block.afternoon || "",
        evening: block.evening || "",
        stayNotes: block.stayNotes || block.body || "",
        image: block.image || ""
      })) : [{ title: "Day 1", morning: "", afternoon: "", evening: "", stayNotes: "", image: "" }]),
    shortDetails: experience.shortDetails || { location: "", highlights: "", bookingMethod: "", notes: "" }
  };
}

function inquirySummary(item) {
  return [
    `ChinaMigo 客户咨询`,
    `姓名：${item.name || ""}`,
    `邮箱：${item.email || ""}`,
    `WhatsApp / 电话：${item.phone || item.whatsapp || ""}`,
    `旅行日期：${item.travelDates || ""}`,
    `人数：${item.travelers || ""}`,
    `感兴趣城市：${item.citiesInterestedIn || item.cities || ""}`,
    `住宿偏好：${item.preferredStayLevel || item.stayLevel || ""}`,
    `旅行风格：${(item.tripStyle || []).join(", ")}`,
    `状态：${zhStatus(item.status || "new")}`,
    `客户备注：${item.notes || ""}`,
    `内部备注：${item.internalNotes || ""}`
  ].join("\n");
}

function compactDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function zhStatus(value) {
  return statusLabels[value] || value || "草稿";
}

function statusClass(status) {
  const value = String(status || "new");
  if (value === "new") return "blue";
  if (["replied", "reviewed", "contacted"].includes(value)) return "orange";
  if (["following", "planning", "quoted"].includes(value)) return "yellow";
  if (value === "confirmed") return "green";
  if (value === "won") return "deep-green";
  if (["lost", "spam", "archived"].includes(value)) return "gray";
  return "gray";
}

function crmStatusValue(status) {
  const value = String(status || "new");
  if (["reviewed", "contacted"].includes(value)) return "replied";
  if (["planning", "quoted"].includes(value)) return "following";
  return value;
}

function inquiryPriority(item) {
  const tags = new Set([...(item.tags || []), ...(item.tripStyle || [])].map((tag) => String(tag).toLowerCase()));
  if (item.priority) return item.priority;
  if (tags.has("vip")) return "VIP";
  if (tags.has("urgent")) return "Urgent";
  if (tags.has("high intent")) return "High Intent";
  if ((item.preferredStayLevel || "").toLowerCase().includes("luxury")) return "Luxury";
  return "";
}

function inquiryPriorityClass(item) {
  const priority = inquiryPriority(item).toLowerCase();
  if (priority.includes("vip")) return "is-vip";
  if (priority.includes("urgent")) return "is-urgent";
  if (priority.includes("high intent")) return "is-high-intent";
  return "";
}

function inquiryNeedSummary(item) {
  const pieces = [
    item.preferredStayLevel,
    (item.tripStyle || []).slice(0, 3).join(" / "),
    item.notes
  ].filter(Boolean);
  return pieces.join(" · ") || "暂无客户需求摘要。";
}

function ownerBadge(owner = "Migo") {
  return `<span class="owner-badge"><i></i>${escapeHtml(owner || "Migo")}</span>`;
}

function applyTemplateVariables(body = "", item = {}) {
  const city = item.citiesInterestedIn || item.cities || "China";
  const values = {
    name: item.name || "",
    city,
    dates: item.travelDates || "",
    travelers: item.travelers || "",
    stayLevel: item.preferredStayLevel || item.stayLevel || "",
    style: (item.tripStyle || []).join(", ")
  };
  return String(body || "").replace(/\{\{\s*(name|city|dates|travelers|stayLevel|style)\s*\}\}/g, (_, key) => values[key] || "");
}

function crmTemplates() {
  const source = state.templates.length
    ? state.templates.filter((template) => template.active !== false)
    : Object.values(defaultQuickReplyTemplates);
  return source
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((template) => ({
      id: template.id || template.slug || template.label,
      key: template.slug || template.id || template.label,
      icon: template.icon || "💬",
      label: template.title || template.label || "未命名模板",
      category: template.category || "通用",
      body: template.body || "",
      text: (item) => applyTemplateVariables(template.body || "", item)
    }));
}

function templateByKey(key) {
  return crmTemplates().find((template) => template.key === key || template.id === key) || crmTemplates()[0];
}

function templateButton(item, key, template, extraClass = "secondary") {
  const preview = template.text(item);
  return `
    <button class="${extraClass} template-action" type="button" data-quick-reply="${escapeHtml(item.id)}" data-reply-template="${escapeHtml(key)}" data-template-preview="${escapeHtml(preview)}">
      <span>${escapeHtml(template.icon || "")}</span>
      <em>${escapeHtml(template.label)}</em>
      <small>${escapeHtml(preview)}</small>
    </button>
  `;
}

function crmTimelineIcon(label = "") {
  if (/模板|WhatsApp|文案/.test(label)) return "📄";
  if (/回复|联系|预约|电话/.test(label)) return "💬";
  if (/负责人|Migo|Alice|Admin/.test(label)) return "👤";
  if (/备注|预算|方案/.test(label)) return "📝";
  if (/状态|成交|流失|跟进/.test(label)) return "🟢";
  if (/提交|咨询/.test(label)) return "📩";
  return "•";
}

function crmTimelineClass(label = "") {
  if (/流失|垃圾|lost|spam/i.test(label)) return "event-lost";
  if (/成交|确认|won|confirmed/i.test(label)) return "event-won";
  if (/模板|WhatsApp|文案/i.test(label)) return "event-template";
  if (/备注|预算|方案/i.test(label)) return "event-note";
  if (/提交|咨询/i.test(label)) return "event-new";
  if (/状态|回复|跟进/i.test(label)) return "event-status";
  return "event-default";
}

function tagPills(items = []) {
  return items.length ? `<div class="detail-tags">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : "—";
}

function whatsappHref(item = {}) {
  const raw = String(item.phone || item.whatsapp || "").replace(/[^\d+]/g, "");
  if (!raw) return "";
  const normalized = raw.startsWith("+") ? raw.slice(1) : raw;
  return `https://wa.me/${normalized}`;
}

function whatsappTextHref(item = {}, text = "") {
  const href = whatsappHref(item);
  if (!href) return "";
  return `${href}?text=${encodeURIComponent(text)}`;
}

function contactValue(label, value, id, field) {
  if (!value) return `<div><dt>${escapeHtml(label)}</dt><dd>—</dd></div>`;
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd class="copyable-field">
        <span>${escapeHtml(value)}</span>
        <button class="mini-copy" type="button" data-copy-field="${escapeHtml(id)}" data-copy-value="${escapeHtml(value)}" data-copy-label="${escapeHtml(label)}">复制</button>
        ${field === "whatsapp" && whatsappHref({ phone: value }) ? `<a class="mini-copy" href="${escapeHtml(whatsappHref({ phone: value }))}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
      </dd>
    </div>
  `;
}

function customerProfileSummary(item = {}) {
  const pieces = [
    inquiryPriority(item) || ((item.preferredStayLevel || "").toLowerCase().includes("luxury") ? "Luxury 倾向" : ""),
    item.travelers ? `${item.travelers} 人出行` : "",
    item.citiesInterestedIn || item.cities ? `${item.citiesInterestedIn || item.cities} 兴趣` : "",
    ...(item.tripStyle || []).slice(0, 2)
  ].filter(Boolean);
  return pieces.length ? pieces : ["需要进一步确认旅行偏好"];
}

function aiCustomerInsights(item = {}) {
  const text = [item.preferredStayLevel, item.notes, ...(item.tags || []), ...(item.tripStyle || [])].join(" ").toLowerCase();
  const insights = [];
  if (/luxury|vip|high intent|design hotel|private/.test(text)) insights.push("高概率 Luxury 客户");
  if (/hotel|stay|suite|aman|spa/.test(text)) insights.push("更关注酒店与恢复体验");
  if (/family|children|kid/.test(text)) insights.push("需要更柔和的亲子节奏");
  if (/business|meeting|sourcing|factory/.test(text)) insights.push("适合商务支持与翻译安排");
  if (daysSince(item.updatedAt || item.createdAt) >= 2 && !["won", "lost", "spam"].includes(crmStatusValue(item.status))) insights.push("建议今天跟进，避免冷却");
  return insights.length ? insights.slice(0, 4) : ["需要补充预算、酒店级别与城市偏好"];
}

function nextStepSuggestion(item = {}) {
  const status = crmStatusValue(item.status);
  if (daysSince(item.updatedAt || item.createdAt) >= 3 && !["won", "lost", "spam"].includes(status)) return "客户超过 3 天未跟进，建议先发送欢迎或预算确认模板。";
  if ((item.preferredStayLevel || "").toLowerCase().includes("luxury") || (item.tags || []).includes("Luxury")) return "建议发送 Luxury 行程模板，确认酒店级别与预算范围。";
  if ((item.tripStyle || []).includes("Family")) return "建议发送家庭旅行模板，确认儿童年龄与节奏偏好。";
  if (status === "new") return "建议先发送欢迎模板，并把客户标记为已回复。";
  return "建议根据客户偏好补充内部备注，保持下一步跟进清晰。";
}

function renderCrmTagGroups(selected = []) {
  const selectedSet = new Set(selected);
  return Object.entries(crmTagGroups).map(([group, tags]) => `
    <div class="crm-tag-group">
      <strong>${escapeHtml(group)}</strong>
      <div>
        ${tags.map((tag) => `
          <label class="crm-tag-check">
            <input type="checkbox" data-detail-tag-option value="${escapeHtml(tag)}" ${selectedSet.has(tag) ? "checked" : ""} />
            <span>${escapeHtml(tag)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function checkedCrmTags() {
  return $$("[data-detail-tag-option]:checked").map((input) => input.value);
}

function daysSince(value) {
  if (!value) return 9999;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 9999;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function contactLine(item) {
  const contacts = [item.email, item.phone || item.whatsapp].filter(Boolean);
  return contacts.length ? contacts.join(" · ") : "<em>联系方式待补充</em>";
}

function latestActivity(item) {
  const activity = item.activity || [];
  return activity.length ? crmActivityLabel(activity[activity.length - 1].label) : "咨询已提交";
}

function crmActivityLabel(label = "") {
  const value = String(label || "");
  if (!value) return "内部操作";
  if (value === "Inquiry submitted") return "提交咨询";
  if (value === "Internal notes updated") return "更新内部备注";
  if (value.startsWith("Status changed")) return "状态发生变化";
  if (value.startsWith("Owner changed to")) return value.replace("Owner changed to", "负责人改为");
  if (value.startsWith("Priority changed to")) return value.replace("Priority changed to", "优先级改为");
  if (value.includes("WhatsApp")) return value;
  return value;
}

function overviewPriorityLabel(priority = "low") {
  if (priority === "urgent") return "紧急";
  if (priority === "normal") return "普通";
  return "低优先级";
}

function overviewActivityIcon(type = "") {
  if (type === "guide") return "📝";
  if (type === "city") return "🏙";
  if (type === "experience") return "🧳";
  if (type === "inquiry") return "📩";
  if (type === "media") return "🖼";
  return "•";
}

function focusKey(item = {}) {
  return `${item.type || "task"}:${item.label || ""}`;
}

function setFocusCompleted(key, completed) {
  if (completed) state.completedFocus.add(key);
  else state.completedFocus.delete(key);
  localStorage.setItem("chinamigo_completed_focus", JSON.stringify([...state.completedFocus]));
}

function activityTypeClass(type = "") {
  if (type === "guide") return "activity-guide";
  if (type === "city") return "activity-city";
  if (type === "experience") return "activity-experience";
  if (type === "inquiry") return "activity-inquiry";
  if (type === "media") return "activity-media";
  return "activity-default";
}

function filteredInquiries() {
  const query = ($("[data-inquiry-search]")?.value || "").toLowerCase();
  const status = $("[data-filter-status]")?.value || "";
  const crmFilter = $("[data-inquiries-list]")?.dataset.crmFilter || "";
  const city = ($("[data-filter-city]")?.value || "").toLowerCase();
  const dates = ($("[data-filter-dates]")?.value || "").toLowerCase();
  const created = ($("[data-filter-created]")?.value || "").toLowerCase();
  const stay = ($("[data-filter-stay]")?.value || "").toLowerCase();
  const travelers = ($("[data-filter-travelers]")?.value || "").toLowerCase();
  return state.inquiries.filter((item) => {
    const haystack = [item.name, item.email, item.phone, item.whatsapp, item.notes].join(" ").toLowerCase();
    const itemTags = [...(item.tags || []), ...(item.tripStyle || [])].join(" ").toLowerCase();
    const itemCity = String(item.citiesInterestedIn || item.cities || "").toLowerCase();
    const itemStatus = crmStatusValue(item.status);
    const matchesCrmFilter = !crmFilter
      || (crmFilter === "needs-reply" && ["new", "replied"].includes(itemStatus))
      || (crmFilter === "stale" && daysSince(item.updatedAt || item.createdAt) >= 3 && !["won", "lost", "spam"].includes(itemStatus))
      || (crmFilter === "high-intent" && /high intent|vip|urgent|luxury/.test(`${itemTags} ${item.priority || ""}`.toLowerCase()))
      || (crmFilter === "luxury" && /luxury/.test(`${itemTags} ${item.preferredStayLevel || ""}`.toLowerCase()))
      || (crmFilter === "shanghai" && itemCity.includes("shanghai"))
      || (crmFilter === "family" && itemTags.includes("family"));
    return matchesCrmFilter
      && (!query || haystack.includes(query))
      && (!status || itemStatus === status || item.status === status)
      && (!city || String(item.citiesInterestedIn || item.cities || "").toLowerCase().includes(city))
      && (!dates || String(item.travelDates || "").toLowerCase().includes(dates))
      && (!created || String(item.createdAt || "").toLowerCase().includes(created))
      && (!stay || String(item.preferredStayLevel || item.stayLevel || "").toLowerCase().includes(stay))
      && (!travelers || String(item.travelers || "").toLowerCase().includes(travelers));
  });
}

function renderInquiryList() {
  const items = filteredInquiries();
  const all = state.inquiries;
  const countStatus = (predicate) => all.filter(predicate).length;
  const won = countStatus((item) => crmStatusValue(item.status) === "won");
  const totalClosed = countStatus((item) => ["won", "lost"].includes(crmStatusValue(item.status)));
  const stats = [
    ["今日新增咨询", countStatus((item) => daysSince(item.createdAt) === 0)],
    ["最近24小时已回复", countStatus((item) => daysSince(item.lastReplyAt) === 0)],
    ["已成交", won],
    ["转化率", totalClosed ? `${Math.round((won / totalClosed) * 100)}%` : "—"]
  ];
  if ($("[data-inquiry-crm-stats]")) {
    $("[data-inquiry-crm-stats]").innerHTML = stats.map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join("");
  }
  $("[data-inquiries-list]").innerHTML = items.map((item) => {
    const tags = [...new Set([inquiryPriority(item), ...(item.tags || []), ...(item.tripStyle || []).slice(0, 2)].filter(Boolean))].slice(0, 5).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const cityLine = [item.citiesInterestedIn || item.cities || "城市待定", item.travelDates || ""].filter(Boolean).join(" · ");
    const status = crmStatusValue(item.status || "new");
    return `
      <article class="inquiry-row ${inquiryPriorityClass(item)} ${status === "new" ? "is-unread" : ""}" data-row-inquiry="${item.id}">
        <button class="inquiry-main" type="button" data-view-inquiry="${item.id}">
          <strong>${status === "new" ? "<b>NEW</b>" : ""}${escapeHtml(item.name || "未命名客户")}</strong>
          <span>${escapeHtml(cityLine)}</span>
          <small>${item.travelers ? `${escapeHtml(String(item.travelers))} 人` : "人数待确认"} · ${ownerBadge(item.owner || "Migo")}</small>
        </button>
        <div class="inquiry-tags">${tags || "<span>未标记</span>"}</div>
        <div class="inquiry-activity">
          <span>最后跟进：${formatRelativeDate(item.updatedAt || item.createdAt)}</span>
          <span>最后回复：${item.lastReplyAt ? formatRelativeDate(item.lastReplyAt) : "暂无记录"}</span>
          <small>${latestActivity(item)}</small>
        </div>
        <div class="inquiry-controls">
          <span class="status-pill ${statusClass(status)}">${zhStatus(status)}</span>
          <button class="secondary" type="button" data-view-inquiry="${item.id}">查看详情</button>
          <details class="more-menu">
            <summary>•••</summary>
            <div>
              <button type="button" data-quick-reply="${item.id}" data-reply-template="welcome">复制欢迎模板</button>
              <button type="button" data-copy-contact="${item.id}">复制联系方式</button>
              <button type="button" data-copy-inquiry="${item.id}">复制客户摘要</button>
              <button type="button" data-quick-reply="${item.id}" data-reply-template="luxury">复制 WhatsApp 文案</button>
              <button type="button" data-quick-note="${item.id}">添加备注</button>
              <button type="button" data-inquiry-status-action="${item.id}" data-status-next="won">标记成交</button>
              <button type="button" data-inquiry-status-action="${item.id}" data-status-next="lost">标记流失</button>
              <button type="button" data-mark-spam="${item.id}">标记垃圾</button>
              <button type="button" data-delete-inquiry="${item.id}">删除</button>
            </div>
          </details>
        </div>
      </article>
    `;
  }).join("") || "<p class='empty'>没有符合筛选条件的客户咨询。</p>";
}

function renderInquiryDetail(item) {
  const detail = $("[data-inquiry-detail]");
  if (!item) {
    detail.classList.add("is-hidden");
    detail.innerHTML = "";
    return;
  }
  detail.classList.remove("is-hidden");
  const timeline = [
    { at: item.createdAt, label: "提交咨询" },
    ...(item.activity || []).map((entry) => ({ at: entry.at, label: crmActivityLabel(entry.label) })),
    ...(item.statusHistory || []).map((entry) => ({ at: entry.at, label: `状态改为 ${zhStatus(entry.to)}` }))
  ].filter((entry) => entry.at || entry.label)
    .filter((entry, index, list) => list.findIndex((other) => other.at === entry.at && other.label === entry.label) === index)
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  const recentFollowups = timeline.slice(0, 5);
  const templates = crmTemplates();
  const primaryTemplate = templates[0];
  const welcomeHref = primaryTemplate ? whatsappTextHref(item, primaryTemplate.text(item)) : "";
  detail.innerHTML = `
    <div class="detail-head">
      <div class="detail-head-top">
        <div>
          <p class="eyebrow">咨询详情</p>
          <h3>${item.name || "未命名客户"}</h3>
          <div class="detail-head-meta">
            <span class="status-pill strong ${statusClass(crmStatusValue(item.status))}">${zhStatus(crmStatusValue(item.status))}</span>
            <label class="owner-switch">
              ${ownerBadge(item.owner || "Migo")}
              <select data-detail-owner-select="${item.id}">
                ${["Migo", "Alice", "Admin"].map((owner) => `<option value="${owner}" ${owner === (item.owner || "Migo") ? "selected" : ""}>${owner}</option>`).join("")}
              </select>
            </label>
            <span class="priority-chip">${escapeHtml(inquiryPriority(item) || "普通优先级")}</span>
          </div>
        </div>
        <button class="secondary" type="button" data-close-inquiry>关闭</button>
      </div>
      <div class="inquiry-detail-tabs">
        <button class="is-active" type="button" data-inquiry-tab="timeline">时间线</button>
        <button type="button" data-inquiry-tab="basic">客户画像</button>
        <button type="button" data-inquiry-tab="notes">内部备注</button>
      </div>
    </div>
    <div class="next-step-card">
      <span>下一步建议</span>
      <strong>${escapeHtml(nextStepSuggestion(item))}</strong>
      <div>
        <button type="button" data-inquiry-status-action="${item.id}" data-status-next="replied">标记已回复</button>
        <button class="secondary" type="button" data-jump-followup>写跟进</button>
        ${whatsappHref(item) ? `<a href="${escapeHtml(whatsappHref(item))}" target="_blank" rel="noreferrer">打开 WhatsApp</a>` : ""}
      </div>
    </div>
    <section class="inquiry-tab-panel is-active" data-inquiry-panel="timeline">
      <div class="follow-composer">
        <label>
          <span>跟进内容</span>
          <textarea rows="4" data-follow-note-text placeholder="记录客户回复、预算、偏好，或粘贴已发送的话术..."></textarea>
        </label>
        <div class="follow-composer-actions">
          <button class="secondary" type="button" data-toggle-templates>插入模板</button>
          <button type="button" data-save-followup="${item.id}">保存跟进</button>
          ${welcomeHref ? `<a href="${escapeHtml(welcomeHref)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
        </div>
        <div class="template-library is-hidden" data-template-library>
          <div>
            <strong>话术模板</strong>
            <small>选择后会复制到剪贴板，并记录到时间线。</small>
          </div>
          <div class="template-grid">
            ${templates.map((template) => templateButton(item, template.key, template)).join("")}
          </div>
        </div>
      </div>
      <div class="detail-block timeline-primary">
        <strong>客户时间线</strong>
        ${timeline.length ? `<ul class="crm-timeline">${timeline.map((entry) => `
          <li class="${crmTimelineClass(entry.label)}">
            <i>${crmTimelineIcon(entry.label)}</i>
            <div>
              <span>${escapeHtml(entry.label)}</span>
              <time>${escapeHtml(formatRelativeDate(entry.at))} · Migo</time>
            </div>
          </li>`).join("")}</ul>` : "<p>暂无时间线。</p>"}
      </div>
    </section>
    <section class="inquiry-tab-panel" data-inquiry-panel="basic">
      <div class="customer-brief">
        <span>客户画像摘要</span>
        <strong>${escapeHtml(customerProfileSummary(item).join(" · "))}</strong>
        <p>${escapeHtml(nextStepSuggestion(item))}</p>
      </div>
      <div class="ai-insight-card">
        <span>AI 客户总结</span>
        <ul>${aiCustomerInsights(item).map((insight) => `<li>${escapeHtml(insight)}</li>`).join("")}</ul>
      </div>
      <dl class="detail-grid">
        ${contactValue("邮箱", item.email, item.id, "email")}
        ${contactValue("WhatsApp / 电话", item.phone || item.whatsapp, item.id, "whatsapp")}
        <div><dt>旅行日期</dt><dd>${item.travelDates || "—"}</dd></div>
        <div><dt>人数</dt><dd>${item.travelers || "—"}</dd></div>
        <div><dt>感兴趣城市</dt><dd>${item.citiesInterestedIn || item.cities || "—"}</dd></div>
        <div><dt>住宿偏好</dt><dd>${item.preferredStayLevel || item.stayLevel || "—"}</dd></div>
        <div><dt>旅行风格</dt><dd>${tagPills(item.tripStyle || [])}</dd></div>
        <div><dt>来源页面</dt><dd>${item.sourcePage ? `<a class="source-link" href="${escapeHtml(item.sourcePage)}" target="_blank" rel="noreferrer">${escapeHtml(item.sourcePage)}</a>` : "—"}</dd></div>
        <div><dt>提交时间</dt><dd>${item.createdAt || "—"}</dd></div>
        <div><dt>状态</dt><dd>${zhStatus(item.status || "new")}</dd></div>
        <div><dt>负责人</dt><dd>${ownerBadge(item.owner || "Migo")}</dd></div>
        <div><dt>优先级</dt><dd>${inquiryPriority(item) || "普通"}</dd></div>
      </dl>
      <div class="detail-block">
        <strong>客户需求摘要</strong>
        <p>${escapeHtml(inquiryNeedSummary(item))}</p>
      </div>
    </section>
    <section class="inquiry-tab-panel" data-inquiry-panel="notes">
      <div class="detail-block">
        <strong>最近跟进</strong>
        ${recentFollowups.length ? `<ul class="crm-timeline compact">${recentFollowups.map((entry) => `
          <li class="${crmTimelineClass(entry.label)}">
            <i>${crmTimelineIcon(entry.label)}</i>
            <div>
              <span>${escapeHtml(entry.label)}</span>
              <time>${escapeHtml(formatRelativeDate(entry.at))} · Migo</time>
            </div>
          </li>`).join("")}</ul>` : "<p>暂无跟进记录。</p>"}
      </div>
      <div class="detail-block">
        <strong>客户备注</strong>
        <p>${item.notes || "暂无备注。"}</p>
      </div>
      <label class="detail-block">
        内部备注
        <textarea rows="6" data-detail-notes>${item.internalNotes || ""}</textarea>
      </label>
      <div class="detail-grid">
        <label>
          负责人
          <input data-detail-owner value="${item.owner || "Migo"}" placeholder="Migo / Alice / Admin" />
        </label>
        <label>
          优先级
          <select data-detail-priority>
            ${["", "High Intent", "VIP", "Urgent", "Luxury"].map((value) => `<option value="${value}" ${value === (item.priority || "") ? "selected" : ""}>${value || "普通"}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="detail-block">
        <strong>客户标签</strong>
        <div class="crm-tag-editor">${renderCrmTagGroups(item.tags || [])}</div>
      </div>
      <div class="form-actions">
        <button type="button" data-save-inquiry-notes="${item.id}">保存备注</button>
        <button class="secondary" type="button" data-copy-inquiry="${item.id}">复制客户摘要</button>
        <button class="secondary" type="button" data-copy-contact="${item.id}">复制联系方式</button>
        <button class="secondary" type="button" data-mark-spam="${item.id}">标记垃圾</button>
      </div>
    </section>
  `;
}

async function loadOverview() {
  state.overview = await api("/api/admin/overview");
  const overviewMeta = {
    guides: { label: "攻略", tab: "guides", lines: (s = {}) => [`${s.published || 0} 已发布`, `${s.draft || 0} 草稿`, `${s.needsWork || 0} 待完善`] },
    cities: { label: "城市", tab: "cities", lines: (s = {}) => [`${s.active || 0} 已启用`, `${s.navigation || 0} 导航显示`, `${s.needsWork || 0} 待完善`] },
    experiences: { label: "行程", tab: "experiences", lines: (s = {}) => [`${s.published || 0} 已发布`, `${s.draft || 0} 草稿`, `${s.needsWork || 0} 待完善`] },
    inquiries: { label: "客户咨询", tab: "inquiries", lines: (s = {}) => [`${s.unhandled || 0} 待回复`, `${s.active || 0} 跟进中`, `${s.confirmed || 0} 已成交`, `${s.lost || 0} 已流失`] },
    media: { label: "素材", tab: "media", lines: (s = {}) => [`${s.used || 0} 使用中`, `${s.unused || 0} 未使用`, `${s.uncategorized || 0} 待分类`] }
  };
  const urgentItems = state.overview.todoItems || [];
  const topTodo = urgentItems[0];
  $("[data-priority-alert]").innerHTML = topTodo ? `
    <div>
      <span class="priority-dot ${escapeHtml(topTodo.priority || "low")}"></span>
      <strong>${escapeHtml(topTodo.label)}</strong>
      <small>${escapeHtml(topTodo.due || "建议尽快处理")}</small>
    </div>
    <button type="button" data-overview-tab="${escapeHtml(topTodo.type)}">${escapeHtml(topTodo.action || "立即处理")}</button>
  ` : `
    <div>
      <span class="priority-dot low"></span>
      <strong>今天没有紧急事项</strong>
      <small>内容与客户跟进状态稳定。</small>
    </div>
    <button class="secondary" type="button" data-overview-tab="inquiries">查看咨询</button>
  `;
  $("[data-continue-edit]").innerHTML = (state.overview.recentlyEdited || []).slice(0, 1).map((item) => `
    <span>最近创建 / 继续编辑</span>
    <button type="button" data-overview-edit="${escapeHtml(item.type)}:${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(item.editor || "Migo")} 编辑 · ${escapeHtml(formatRelativeDate(item.updatedAt))}</small>
      <em>继续编辑</em>
    </button>
  `).join("") || "";
  const focusItems = state.overview.dailyFocus || [];
  const completedFocusCount = focusItems.filter((item) => state.completedFocus.has(focusKey(item))).length;
  $("[data-daily-focus]").innerHTML = (state.overview.dailyFocus || []).length ? `
    <div class="overview-card-head">
      <div>
        <p class="eyebrow">今日重点</p>
        <h3>今天先处理这些</h3>
      </div>
      <span>今日进度 ${completedFocusCount} / ${focusItems.length}</span>
    </div>
    <div class="daily-focus-progress"><i style="width:${focusItems.length ? Math.round((completedFocusCount / focusItems.length) * 100) : 0}%"></i></div>
    <div class="daily-focus-list">
      ${focusItems.map((item) => {
        const key = focusKey(item);
        const completed = state.completedFocus.has(key);
        return `
        <button class="${completed ? "is-complete" : ""}" type="button" data-focus-toggle="${escapeHtml(key)}">
          <i></i>
          <span>${escapeHtml(item.label)}</span>
        </button>
      `; }).join("")}
    </div>
  ` : `
    <div class="overview-card-head">
      <div>
        <p class="eyebrow">今日重点</p>
        <h3>今天没有紧急运营任务</h3>
      </div>
      <span>状态稳定</span>
    </div>
  `;
  $("[data-stats]").innerHTML = Object.entries(overviewMeta).map(([key, meta]) => `
    <button class="stat-card overview-clickable" type="button" data-overview-tab="${meta.tab}">
      <span>${meta.label}</span>
      <strong>${state.overview.counts[key] || 0}</strong>
      <em>${escapeHtml(state.overview.summaries?.[key]?.trend || "")}</em>
      <small>${meta.lines(state.overview.summaries?.[key]).join(" · ")}</small>
    </button>
  `).join("");
  $("[data-operating-status]").innerHTML = (state.overview.operatingStatus || []).map((item) => `
    <article>
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </article>
  `).join("");

  const taskList = (items, emptyText, limit = Infinity) => items?.length
    ? items.slice(0, limit).map((item) => `
      <button class="overview-task ${escapeHtml(item.priority || "low")}" type="button" data-overview-tab="${item.type}">
        <i>${escapeHtml(overviewPriorityLabel(item.priority))}</i>
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.due || "")}${item.due ? " · " : ""}${escapeHtml(item.action || "去处理")}</span>
      </button>
    `).join("")
    : `<p class="empty">${emptyText}</p>`;
  $("[data-todo-items]").innerHTML = taskList(state.overview.todoItems, "目前没有明显待处理事项。", 4);
  $("[data-health-items]").innerHTML = taskList(state.overview.healthItems, "内容健康状态不错。");

  $("[data-latest-inquiries]").innerHTML = state.overview.latestInquiries.map((item) => `
    <article class="overview-inquiry-row">
      <div>
        <strong>${escapeHtml(item.name || "未命名客户")}</strong>
        <span>${escapeHtml([item.citiesInterestedIn || item.cities || "未填城市", item.travelDates || formatRelativeDate(item.createdAt)].filter(Boolean).join(" · "))}</span>
      </div>
      <span class="status-pill ${statusClass(crmStatusValue(item.status))}">${zhStatus(crmStatusValue(item.status || "new"))}</span>
      <div class="overview-row-actions">
        <button class="secondary" type="button" data-view-inquiry="${escapeHtml(item.id)}">查看详情</button>
      </div>
    </article>
  `).join("") || "<p class='empty'>暂无客户咨询。</p>";

  $("[data-recent-edits]").innerHTML = (state.overview.recentlyEdited || []).map((item) => `
    <button type="button" data-overview-edit="${escapeHtml(item.type)}:${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.editor || "Migo")} 编辑 · ${escapeHtml(item.meta || "")} · ${escapeHtml(formatRelativeDate(item.updatedAt))}</span>
    </button>
  `).join("") || "<p class='empty'>暂无最近编辑。</p>";

  $("[data-ai-suggestions]").innerHTML = (state.overview.aiSuggestions || []).map((item) => `
    <button type="button" data-overview-tab="${escapeHtml(item.type)}">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.detail)}</span>
      <em>${escapeHtml(item.action || "去处理")}</em>
    </button>
  `).join("") || "<p class='empty'>目前没有明显运营建议。</p>";

  const systemStatusLabel = { ok: "正常运行", warning: "需人工跟进", manual: "手动流程", error: "出现错误" };
  $("[data-system-status]").innerHTML = (state.overview.systemStatus || []).map((item) => `
    <article class="${escapeHtml(item.status)}">
      <i></i>
      <div>
        <strong>${escapeHtml(item.label)} · ${escapeHtml(systemStatusLabel[item.status] || "状态未知")}</strong>
        <span>${escapeHtml(item.detail)} · 刚刚更新</span>
      </div>
    </article>
  `).join("");

  const activities = state.overview.recentActivities || [];
  const visibleActivities = state.overviewActivityExpanded ? activities : activities.slice(0, 5);
  $("[data-recent-activity]").innerHTML = visibleActivities.map((item) => `
    <button class="${activityTypeClass(item.type)}" type="button" data-overview-edit="${escapeHtml(item.type)}:${escapeHtml(item.target || "")}">
      <b>${escapeHtml(item.icon || overviewActivityIcon(item.type))}</b>
      <time>${escapeHtml(formatRelativeDate(item.at))}</time>
      <span>${escapeHtml(item.label)}</span>
    </button>
  `).join("") + (activities.length > 5 ? `<button class="overview-more" type="button" data-toggle-activity>${state.overviewActivityExpanded ? "收起活动" : `查看更多 ${activities.length - 5} 条`}</button>` : "") || "<p class='empty'>暂无最近活动。</p>";
}

async function loadInquiries() {
  state.inquiries = (await api("/api/admin/inquiries")).data;
  renderInquiryList();
}

async function loadGuides() {
  state.guides = (await api("/api/admin/guides")).data;
  renderGuideFilters();
  renderGuideList();
  renderGuideCollections();
  if (state.guideDraft) renderGuideEditor();
  if (state.cities.length) renderCitiesCms();
}

function defaultGuideCollection() {
  return {
    id: "",
    title: "New Guide Collection",
    description: "",
    categories: [],
    guideSlugs: [],
    image: "",
    sortOrder: state.guideCollections.length + 1,
    active: true
  };
}

async function loadGuideCollections() {
  state.guideCollections = (await api("/api/admin/guide-collections")).data;
  if (!state.currentGuideCollectionId && state.guideCollections.length) {
    selectGuideCollection(state.guideCollections[0]);
    return;
  }
  renderGuideCollections();
}

function guideCollectionDraftFromForm() {
  updateGuideCollectionGuideSlugs();
  const payload = formValues($("[data-guide-collection-form]"));
  payload.categories = csvToList(payload.categories);
  payload.guideSlugs = csvToList(payload.guideSlugs);
  return payload;
}

function selectGuideCollection(collection = defaultGuideCollection()) {
  state.currentGuideCollectionId = collection.id || "";
  fillForm($("[data-guide-collection-form]"), {
    ...collection,
    categories: collection.categories || [],
    guideSlugs: collection.guideSlugs || []
  });
  renderGuideCollectionImage(collection.image);
  renderGuideCollectionGuidePicker(collection.guideSlugs || []);
  renderGuideCollections();
}

function renderGuideCollectionImage(image) {
  const preview = $("[data-guide-collection-image-preview]");
  if (preview) preview.src = `/${image || "assets/guide-first-time-china.png"}`;
}

function selectedGuideCollectionSlugs() {
  return csvToList($("[data-guide-collection-form] [name='guideSlugs']")?.value || "");
}

function updateGuideCollectionGuideSlugs() {
  const selected = $$("[data-guide-collection-guide]:checked").map((input) => input.value);
  const input = $("[data-guide-collection-form] [name='guideSlugs']");
  if (input) input.value = listToCsv(selected);
}

function renderGuideCollectionGuidePicker(selectedSlugs = selectedGuideCollectionSlugs()) {
  const picker = $("[data-guide-collection-guide-picker]");
  if (!picker) return;
  const formCategories = csvToList($("[data-guide-collection-form] [name='categories']")?.value || "");
  const publishedGuides = state.guides.filter((guide) => guide.status === "published");
  const categorySlugs = publishedGuides
    .filter((guide) => formCategories.includes(guide.category))
    .map((guide) => guide.slug);
  const selected = new Set(selectedSlugs.length ? selectedSlugs : categorySlugs);
  picker.innerHTML = publishedGuides.map((guide) => `
    <label class="guide-pick-row">
      <input type="checkbox" value="${escapeHtml(guide.slug)}" data-guide-collection-guide ${selected.has(guide.slug) ? "checked" : ""} />
      <img src="/${escapeHtml(guide.coverImage || "assets/guide-first-time-china.png")}" alt="" />
      <span>
        <strong>${escapeHtml(guide.title || guide.translations?.en?.title || "未命名攻略")}</strong>
        <small>${escapeHtml([guide.category, guide.city].filter(Boolean).join(" · ") || "已发布攻略")}</small>
      </span>
    </label>
  `).join("") || "<p class='empty'>还没有已发布攻略。发布攻略后就可以在这里勾选。</p>";
  const input = $("[data-guide-collection-form] [name='guideSlugs']");
  if (input && !selectedSlugs.length && categorySlugs.length) input.value = listToCsv(categorySlugs);
}

function renderGuideCollections() {
  const list = $("[data-guide-collections-list]");
  if (!list) return;
  list.innerHTML = state.guideCollections.map((collection) => {
    const matchedBySlug = (collection.guideSlugs || []).filter((slug) => state.guides.some((guide) => guide.slug === slug && guide.status === "published"));
    const matchedByCategory = state.guides.filter((guide) => guide.status === "published" && (collection.categories || []).includes(guide.category));
    const count = new Set([...matchedBySlug, ...matchedByCategory.map((guide) => guide.slug)]).size;
    return `
      <article class="guide-collection-row ${collection.id === state.currentGuideCollectionId ? "is-active" : ""} ${collection.active === false ? "is-muted" : ""}">
        <img src="/${escapeHtml(collection.image || "assets/guide-first-time-china.png")}" alt="" />
        <button type="button" data-edit-guide-collection="${escapeHtml(collection.id)}">
          <strong>${escapeHtml(collection.title)}</strong>
          <span>${escapeHtml((collection.categories || []).join(" · ") || "手动勾选攻略")}</span>
          <small>${count} 篇 · 排序 ${Number(collection.sortOrder || 0)}</small>
        </button>
        <em>${collection.active === false ? "隐藏" : "启用"}</em>
      </article>
    `;
  }).join("") || "<p class='empty'>还没有精选合集。可以新建一个合集，或让首页继续按分类自动生成。</p>";

  if (!state.currentGuideCollectionId && state.guideCollections[0]) {
    selectGuideCollection(state.guideCollections[0] || defaultGuideCollection());
  } else {
    renderGuideCollectionGuidePicker();
  }
}

function renderGuideFilters() {
  const citySelect = $("[data-guide-filter-city]");
  const categorySelect = $("[data-guide-filter-category]");
  if (citySelect && citySelect.options.length <= 1) {
    [...new Set(state.guides.map((guide) => guide.city).filter(Boolean))].forEach((city) => citySelect.insertAdjacentHTML("beforeend", `<option>${escapeHtml(city)}</option>`));
  }
  if (categorySelect && categorySelect.options.length <= 1) {
    [...new Set(state.guides.map((guide) => guide.category).filter(Boolean))].forEach((category) => categorySelect.insertAdjacentHTML("beforeend", `<option>${escapeHtml(category)}</option>`));
  }
}

function filteredGuides() {
  const query = ($("[data-guide-search]")?.value || "").toLowerCase();
  const city = $("[data-guide-filter-city]")?.value || "";
  const category = $("[data-guide-filter-category]")?.value || "";
  const language = $("[data-guide-filter-language]")?.value || "";
  const status = $("[data-guide-filter-status]")?.value || "";
  const date = ($("[data-guide-filter-date]")?.value || "").toLowerCase();
  const sort = $("[data-guide-sort]")?.value || "updated";
  const quick = $("[data-guides-list]")?.dataset.quickFilter || "";
  return [...state.guides].filter((guide) => {
    const langs = guideLanguageStatus(guide);
    const health = guideHealth(guide);
    const updatedDays = daysSince(guide.updatedAt || guide.publishedAt || guide.createdAt);
    const createdDays = daysSince(guide.createdAt || guide.publishedAt || guide.updatedAt);
    const haystack = [guide.title, guide.slug, guide.category, guide.city, ...(guide.tags || [])].join(" ").toLowerCase();
    return (!query || haystack.includes(query))
      && (!city || guide.city === city)
      && (!category || guide.category === category)
      && (!status || guide.status === status)
      && (!date || String(guide.publishedAt || "").toLowerCase().includes(date))
      && (!language || (language === "en" && langs.en) || (language === "cn" && langs.cn) || (language === "missing-cn" && !langs.cn))
      && (!quick
        || (quick === "draft" && guide.status !== "published")
        || (quick === "recent" && updatedDays <= 7)
        || (quick === "weekly" && createdDays <= 7)
        || (quick === "missing-cn" && health.some((item) => item.key === "missing-cn"))
        || (quick === "missing-cover" && health.some((item) => item.key === "missing-cover"))
        || (quick === "incomplete" && health.length));
  }).sort((a, b) => {
    if (sort === "title") return String(a.title).localeCompare(String(b.title));
    if (sort === "published") return String(b.publishedAt || "").localeCompare(String(a.publishedAt || ""));
    return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
  });
}

function guideHealth(guide) {
  const en = getGuideTranslation(guide, "en");
  const cn = getGuideTranslation(guide, "cn");
  const html = [en.rawContent, cn.rawContent, en.htmlContent, cn.htmlContent].filter(Boolean).join(" ");
  const textLength = html.replace(/<[^>]+>/g, " ").trim().length;
  const issues = [];
  if (!guide.coverImage) issues.push({ key: "missing-cover", label: "缺封面图", note: "前台攻略卡片缺少视觉图" });
  if (!cn.title && !cn.rawContent && !cn.htmlContent) issues.push({ key: "missing-cn", label: "缺中文", note: "中文版尚未创建，影响中文用户阅读" });
  if (!en.seo?.description && !guide.seo?.description && !guide.metaDescription) issues.push({ key: "missing-seo", label: "SEO 未完成", note: "SEO 描述未填写，建议 120–160 字" });
  if (!guide.coverImage) issues.push({ key: "missing-card-image", label: "封面图未设置", note: "缺少 China Guides 首页封面图" });
  if (textLength > 0 && textLength < 600) issues.push({ key: "short", label: "内容过短", note: "正文内容偏短，建议补充实用说明和 FAQ" });
  if (!/faq|question|常见问题|问题/i.test(html)) issues.push({ key: "missing-faq", label: "缺 FAQ", note: "建议加入 3–5 个游客常见问题" });
  return issues;
}

function guideCompletion(guide) {
  const en = getGuideTranslation(guide, "en");
  const cn = getGuideTranslation(guide, "cn");
  const content = [en.rawContent, cn.rawContent, en.htmlContent, cn.htmlContent].filter(Boolean).join("\n");
  const checks = [
    { key: "card-image", label: "封面图", ok: Boolean(guide.coverImage), note: "缺少封面图" },
    { key: "category", label: "分类与城市", ok: Boolean(guide.category && guide.city), note: "未关联分类或城市" },
    { key: "intro", label: "标题与简介", ok: Boolean(en.title && en.excerpt), note: "英文标题或简介未完成" },
    { key: "cn", label: "中文版", ok: Boolean(cn.title && (cn.rawContent || cn.excerpt)), note: "中文版本未创建" },
    { key: "seo", label: "SEO", ok: Boolean(en.seo?.description || guide.seo?.description || guide.metaDescription || en.excerpt), note: "SEO 描述未填写" },
    { key: "faq", label: "FAQ", ok: /FAQ|Q:|问：|常见问题|问题/i.test(content), note: "缺少 FAQ" },
    { key: "cta", label: "CTA", ok: /CTA:/i.test(content), note: "缺少联系按钮" }
  ];
  const completed = checks.filter((item) => item.ok).length;
  return {
    percent: Math.round((completed / checks.length) * 100),
    missing: checks.filter((item) => !item.ok),
    checks
  };
}

function renderGuideWorkflowStatus(guide = state.guideDraft) {
  if (!guide) return;
  const completion = guideCompletion(guide);
  const completionNode = $("[data-editor-completion]");
  if (completionNode) {
    const missingText = completion.missing.length ? `还差 ${completion.missing.length} 项可发布` : "已准备发布";
    completionNode.innerHTML = `<strong>内容完整度 ${completion.percent}%</strong><span>${missingText}</span>`;
  }
  const hintNode = $("[data-content-settings-hint]");
  if (hintNode) {
    hintNode.innerHTML = completion.missing.length
      ? completion.missing.slice(0, 3).map((item) => `<span title="${escapeHtml(item.note)}">${escapeHtml(item.label)}</span>`).join("")
      : "<span class='ready'>内容设置健康</span>";
  }
}

function renderGuideList() {
  const items = filteredGuides();
  $("[data-guides-list]").innerHTML = items.map((guide) => {
    const health = guideHealth(guide);
    const completion = guideCompletion(guide);
    return `
      <article class="guide-row ${guide.id === state.currentGuideId ? "is-active" : ""}">
        <button class="guide-title-cell" type="button" data-edit-guide="${guide.id}">
          <img src="/${guide.coverImage || "assets/guide-first-time-china.png"}" alt="" style="object-position:${escapeHtml(guide.imagePosition || "center center")};transform:scale(${Math.min(1.35, Math.max(1, Number(guide.imageScale || 1.02)))})" />
          <span>
            <strong>${escapeHtml(guide.title)}</strong>
            <small>${escapeHtml(guide.category || "未分类")} · ${escapeHtml(compactDate(guide.updatedAt || guide.publishedAt || guide.createdAt))}</small>
          </span>
        </button>
        <div class="guide-status-stack">
          <span class="status-pill ${guide.status === "published" ? "green" : "gray"}">${zhStatus(guide.status)}</span>
          <small>完整度 ${completion.percent}%</small>
        </div>
        <div class="guide-health">${health.length ? health.slice(0, 4).map((item) => `<span title="${escapeHtml(item.note || item.label)}">${escapeHtml(item.label)}</span>`).join("") : "<span class='ready'>健康</span>"}</div>
        <div class="guide-row-meta">
          <span>${guide.publishedAt || "未发布"}</span>
          ${guide.featured ? "<span class='ready'>精选</span>" : ""}
          <span>${escapeHtml(guide.city || "无城市")}</span>
        </div>
        <div class="row-actions">
          <button class="secondary" data-edit-guide="${guide.id}" type="button">继续编辑</button>
          <details class="more-menu">
            <summary>•••</summary>
            <div>
              <button type="button" data-preview-row-guide="${guide.id}">预览</button>
              <button type="button" data-duplicate-row-guide="${guide.id}">复制</button>
              <button type="button" data-delete-guide="${guide.id}">删除</button>
            </div>
          </details>
        </div>
      </article>
    `;
  }).join("") || "<p class='empty'>没有找到符合条件的攻略。</p>";
}

function selectGuide(guide) {
  state.guideDraft = JSON.parse(JSON.stringify(guide || defaultGuide()));
  state.currentGuideId = state.guideDraft.id;
  state.currentGuideLang = "en";
  $("[data-panel='guides']")?.classList.add("is-editor-open");
  renderGuideEditor();
  renderGuideList();
}

function renderGuideEditor() {
  const guide = state.guideDraft || defaultGuide();
  const form = $("[data-guide-form]");
  fillForm(form, {
    id: guide.id,
    slug: guide.slug,
    status: guide.status || "draft",
    author: guide.author || "ChinaMigo Editorial",
    city: guide.city,
    category: guide.category,
    readTime: guide.readTime,
    featured: String(Boolean(guide.featured)),
    publishedAt: guide.publishedAt,
    tags: guide.tags || [],
    coverImage: guide.coverImage,
    mobileCoverImage: guide.mobileCoverImage,
    coverAlt: guide.coverAlt,
    imagePosition: guide.imagePosition || "center center",
    imageScale: guide.imageScale || 1.02,
    titleEn: getGuideTranslation(guide, "en").title,
    excerptEn: getGuideTranslation(guide, "en").excerpt,
    titleCn: getGuideTranslation(guide, "cn").title,
    excerptCn: getGuideTranslation(guide, "cn").excerpt,
    seoTitleEn: getGuideTranslation(guide, "en").seo.title,
    seoTitleCn: getGuideTranslation(guide, "cn").seo.title,
    metaDescriptionEn: getGuideTranslation(guide, "en").seo.description,
    metaDescriptionCn: getGuideTranslation(guide, "cn").seo.description,
    ogImage: guide.seo?.ogImage,
    canonicalUrl: guide.seo?.canonicalUrl,
    noindex: String(Boolean(guide.seo?.noindex))
  });
  renderGuideCardImagePreview(guide);
  ["en", "cn"].forEach((lang) => {
    const translation = getGuideTranslation(guide, lang);
    const raw = $(`[data-raw-editor="${lang}"]`);
    if (raw) raw.value = translation.rawContent || htmlToPlainDraft(translation.htmlContent || blocksToHtml(translation.contentBlocks));
  });
  syncVisualEditorsFromRaw();
  autoSizeEditors();
  updateWordCounts();
  renderRelatedList();
  renderRelatedSelect();
  renderGuideMediaPicker();
  renderTranslationStatus();
  renderGuidePreview();
  renderEditorChecks();
  renderGuideWorkflowStatus(guide);
  updateTranslationSyncPill(guide);
  $("[data-editor-title]").textContent = guide.title || "未命名攻略";
  if ($("[data-editor-status]")) $("[data-editor-status]").textContent = zhStatus(guide.status || "draft");
  if ($("[data-editor-lang]")) $("[data-editor-lang]").textContent = state.currentGuideLang === "cn" ? "中文" : "英文";
  setGuideEditorMode("edit");
  showReviewPanel(false);
  setUnsaved(false);
}

function renderGuideCardImagePreview(guide = state.guideDraft || {}) {
  const img = $("[data-cover-preview]");
  if (!img) return;
  const src = guide.coverImage ? `/${String(guide.coverImage).replace(/^\/+/, "")}` : "/assets/guide-first-time-china.png";
  const position = guide.imagePosition || $("[name='imagePosition']")?.value || "center center";
  const scale = Math.min(1.35, Math.max(1, Number(guide.imageScale || $("[name='imageScale']")?.value || 1.02)));
  img.src = src;
  img.style.objectPosition = position;
  img.style.transform = `scale(${scale})`;
  const positionInput = $("[name='imagePosition']");
  const scaleInput = $("[name='imageScale']");
  if (positionInput) positionInput.value = position;
  if (scaleInput) scaleInput.value = String(scale);
  $$("[data-card-focus]").forEach((button) => button.classList.toggle("is-active", button.dataset.cardFocus === position));
}

function setUnsaved(value) {
  const node = $("[data-unsaved-state]");
  if (!node) return;
  node.textContent = value ? "有未保存修改" : `已自动保存 · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  node.classList.toggle("is-unsaved", value);
}

function blockTemplate(block, lang, index) {
  const blockTitle = block.title || block.body || "Untitled section";
  const mediaPreview = block.image ? `<img src="/${escapeHtml(block.image)}" alt="" />` : "";
  const itemCount = (block.items || []).length;
  return `
    <article class="content-block ${block.collapsed ? "is-collapsed" : ""}" data-block="${lang}" data-index="${index}" draggable="true">
      <header>
        <div class="block-identity">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${escapeHtml(block.type || "paragraph")}</strong>
            <em>${escapeHtml(blockTitle).slice(0, 80)}</em>
          </div>
        </div>
        <div>
          <button class="secondary" type="button" data-collapse-block>${block.collapsed ? "Expand" : "Collapse"}</button>
          <button class="secondary" type="button" data-duplicate-block>Duplicate</button>
          <button class="secondary" type="button" data-move-block="up">↑</button>
          <button class="secondary" type="button" data-move-block="down">↓</button>
          <button class="secondary" type="button" data-remove-block>Remove</button>
        </div>
      </header>
      <input data-block-field="collapsed" type="hidden" value="${block.collapsed ? "true" : "false"}" />
      <div class="block-preview">
        ${mediaPreview}
        <div>
          <span>${escapeHtml(block.type || "paragraph")} ${itemCount ? `· ${itemCount} items` : ""}</span>
          <p>${escapeHtml(block.body || block.title || "Add content for this section.")}</p>
        </div>
      </div>
      <div class="block-fields">
        <label>Section type<select data-block-field="type">
          ${["heading", "paragraph", "divider", "bullet_list", "number_list", "image", "gallery", "quote", "checklist", "tip", "cta", "faq", "video", "map", "table", "callout"].map((type) => `<option ${block.type === type ? "selected" : ""}>${type}</option>`).join("")}
        </select></label>
        <label>Heading / Question / CTA title<input data-block-field="title" value="${escapeHtml(block.title)}" /></label>
        <label>Body / Answer<textarea data-block-field="body" rows="3">${escapeHtml(block.body)}</textarea></label>
        <div class="form-grid">
          <label>Image from Media Library<input data-block-field="image" value="${escapeHtml(block.image)}" placeholder="assets/uploads/..." /></label>
          <label>Alt text<input data-block-field="alt" value="${escapeHtml(block.alt)}" /></label>
        </div>
        <label>List / Gallery items <small>one per line</small><textarea data-block-field="items" rows="3">${escapeHtml((block.items || []).join("\\n"))}</textarea></label>
        <div class="form-grid">
          <label>Button label<input data-block-field="label" value="${escapeHtml(block.label)}" /></label>
          <label>Button URL<input data-block-field="href" value="${escapeHtml(block.href)}" /></label>
        </div>
      </div>
    </article>
  `;
}

function renderBlockEditors() {
  ["en", "cn"].forEach((lang) => {
    const blocks = getGuideTranslation(state.guideDraft, lang).contentBlocks;
    $(`[data-blocks="${lang}"]`).innerHTML = blocks.map((block, index) => blockTemplate(block, lang, index)).join("") || "<p class='empty'>No blocks yet. Add a heading or paragraph to start writing.</p>";
  });
}

function readBlockElement(element) {
  const value = (field) => element.querySelector(`[data-block-field="${field}"]`)?.value || "";
  return {
    id: state.guideDraft.translations[element.dataset.block].contentBlocks[Number(element.dataset.index)]?.id || `block-${Date.now()}`,
    type: value("type") || "paragraph",
    title: value("title"),
    body: value("body"),
    image: value("image"),
    alt: value("alt"),
    items: value("items").split("\\n").map((item) => item.trim()).filter(Boolean),
    label: value("label"),
    href: value("href"),
    collapsed: value("collapsed") === "true"
  };
}

function syncBlocksFromDom(lang) {
  getGuideTranslation(state.guideDraft, lang).contentBlocks = $$(`[data-block="${lang}"]`).map(readBlockElement);
}

function syncGuideFromForm() {
  const form = $("[data-guide-form]");
  syncRawFromVisualEditors();
  const values = Object.fromEntries(new FormData(form).entries());
  const guide = state.guideDraft || defaultGuide();
  guide.id = values.id || guide.id;
  guide.slug = values.slug;
  guide.status = values.status;
  guide.author = values.author || "ChinaMigo Editorial";
  guide.city = values.city;
  guide.category = values.category || guide.category || "Lifestyle";
  guide.readTime = values.readTime;
  guide.featured = values.featured === "true";
  guide.publishedAt = values.publishedAt;
  guide.tags = csvToList(values.tags);
  guide.coverImage = values.coverImage;
  guide.mobileCoverImage = values.mobileCoverImage;
  guide.coverAlt = values.coverAlt;
  guide.imagePosition = values.imagePosition || guide.imagePosition || "center center";
  guide.imageScale = Math.min(1.35, Math.max(1, Number(values.imageScale || guide.imageScale || 1.02)));
  guide.seo = {
    ogImage: values.ogImage,
    canonicalUrl: values.canonicalUrl,
    noindex: values.noindex === "true"
  };
  getGuideTranslation(guide, "en").title = values.titleEn;
  getGuideTranslation(guide, "en").excerpt = values.excerptEn;
  getGuideTranslation(guide, "en").rawContent = $(`[data-raw-editor="en"]`)?.value || "";
  getGuideTranslation(guide, "en").htmlContent = markdownToHtml(getGuideTranslation(guide, "en").rawContent);
  getGuideTranslation(guide, "en").seo = { title: values.seoTitleEn, description: values.metaDescriptionEn };
  getGuideTranslation(guide, "cn").title = values.titleCn;
  getGuideTranslation(guide, "cn").excerpt = values.excerptCn;
  getGuideTranslation(guide, "cn").rawContent = $(`[data-raw-editor="cn"]`)?.value || "";
  getGuideTranslation(guide, "cn").htmlContent = markdownToHtml(getGuideTranslation(guide, "cn").rawContent);
  getGuideTranslation(guide, "cn").seo = { title: values.seoTitleCn, description: values.metaDescriptionCn };
  if ($(`[data-block="en"]`)) syncBlocksFromDom("en");
  if ($(`[data-block="cn"]`)) syncBlocksFromDom("cn");
  guide.title = getGuideTranslation(guide, "en").title || getGuideTranslation(guide, "cn").title || "Untitled Guide";
  guide.excerpt = getGuideTranslation(guide, "en").excerpt || getGuideTranslation(guide, "cn").excerpt || "";
  guide.contentBlocks = getGuideTranslation(guide, "en").contentBlocks;
  guide.readTime = estimateGuideReadTime(guide);
  if ($("[name='readTime']")) $("[name='readTime']").value = guide.readTime;
  updateTranslationSyncPill(guide);
  return guide;
}

function estimateGuideReadTime(guide) {
  const text = [
    getGuideTranslation(guide, "en").rawContent,
    getGuideTranslation(guide, "cn").rawContent,
    getGuideTranslation(guide, "en").htmlContent?.replace(/<[^>]+>/g, " "),
    getGuideTranslation(guide, "cn").htmlContent?.replace(/<[^>]+>/g, " "),
    guide.excerpt
  ].filter(Boolean).join(" ");
  const latinWords = (text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g) || []).length;
  const cjkChars = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const minutes = Math.max(1, Math.ceil((latinWords + cjkChars / 2) / 220));
  return `${minutes} min read`;
}

function renderRelatedSelect() {
  if (!$("[data-related-select]")) return;
  const query = ($("[data-related-search]")?.value || "").toLowerCase();
  const current = state.guideDraft;
  $("[data-related-select]").innerHTML = state.guides
    .filter((guide) => guide.id !== current.id)
    .filter((guide) => !query || [guide.title, guide.slug].join(" ").toLowerCase().includes(query))
    .map((guide) => `<option value="${guide.slug}">${escapeHtml(guide.title)}</option>`)
    .join("");
}

function renderGuideMediaPicker() {
  const picker = $("[data-guide-media-picker]");
  if (!picker) return;
  picker.innerHTML = state.media.slice(0, 18).map((item) => `
    <button type="button" data-pick-cover="${escapeHtml(item.url)}">
      <img src="/${escapeHtml(item.url)}" alt="" />
      <span>${escapeHtml(mediaCategoryLabel(item.category || item.folder))}</span>
    </button>
  `).join("") || "<p class='empty'>先上传素材，再在这里复用。</p>";
}

function renderTranslationStatus() {
  const node = $("[data-translation-status]");
  if (!node || !state.guideDraft) return;
  const status = guideLanguageStatus(state.guideDraft);
  const enBlocks = getGuideTranslation(state.guideDraft, "en").contentBlocks.length;
  const cnBlocks = getGuideTranslation(state.guideDraft, "cn").contentBlocks.length;
  node.innerHTML = `
    <article><strong>${status.en ? "英文已完成" : "需要英文内容"}</strong><span>英文 · ${enBlocks} 个段落</span></article>
    <article><strong>${status.cn ? "中文已完成" : "需要中文版本"}</strong><span>中文 · ${cnBlocks} 个段落</span></article>
  `;
  updateTranslationSyncPill(state.guideDraft);
}

function renderRelatedList() {
  if (!$("[data-related-list]")) return;
  const related = state.guideDraft.relatedGuides || [];
  $("[data-related-list]").innerHTML = related.map((slug) => {
    const guide = state.guides.find((item) => item.slug === slug);
    return `
      <span>
        ${guide?.coverImage ? `<img src="/${escapeHtml(guide.coverImage)}" alt="" />` : ""}
        <strong>${escapeHtml(guide?.title || slug)}</strong>
        <button type="button" data-remove-related="${escapeHtml(slug)}">×</button>
      </span>
    `;
  }).join("") || "<p class='empty'>暂未选择相关阅读。</p>";
}

function renderGuidePreview() {
  const guide = syncGuideFromForm();
  ["en", "cn"].forEach((lang) => {
    const translation = getGuideTranslation(guide, lang);
    const preview = $(`[data-fast-preview="${lang}"]`);
    if (!preview) return;
    const contentHtml = translation.htmlContent || "";
    preview.innerHTML = `
      <img src="/${escapeHtml(guide.coverImage || "assets/guide-first-time-china.png")}" alt="" style="object-position:${escapeHtml(guide.imagePosition || "center center")};transform:scale(${Math.min(1.35, Math.max(1, Number(guide.imageScale || 1.02)))})" />
      <p>${escapeHtml([guide.category, guide.author, guide.publishedAt].filter(Boolean).join(" · "))}</p>
      <h2>${escapeHtml(translation.title || guide.title)}</h2>
      <p>${escapeHtml(translation.excerpt || guide.excerpt)}</p>
      ${contentHtml}
    `;
  });
  const lang = state.currentGuideLang;
  const translation = getGuideTranslation(guide, lang);
  const blockHtml = translation.htmlContent || translation.contentBlocks.map((block) => {
    if (block.type === "heading") return `<h3>${escapeHtml(block.title)}</h3>`;
    if (block.type === "quote") return `<blockquote>${escapeHtml(block.body || block.title)}</blockquote>`;
    if (block.type === "image") return `<img src="/${escapeHtml(block.image)}" alt="${escapeHtml(block.alt)}" />`;
    if (block.type === "gallery") return `<div class="preview-gallery">${(block.items || []).map((src) => `<img src="/${escapeHtml(src)}" alt="" />`).join("")}</div>`;
    if (block.type === "divider") return `<hr />`;
    if (block.type === "tip") return `<aside><strong>${escapeHtml(block.title || "Travel Tip")}</strong><p>${escapeHtml(block.body)}</p></aside>`;
    if (block.type === "cta") return `<aside><strong>${escapeHtml(block.title)}</strong><p>${escapeHtml(block.body)}</p><span>${escapeHtml(block.label)}</span></aside>`;
    if (block.type === "faq") return `<details open><summary>${escapeHtml(block.title)}</summary><p>${escapeHtml(block.body)}</p></details>`;
    if (["bullet_list", "number_list", "checklist"].includes(block.type)) {
      const tag = block.type === "number_list" ? "ol" : "ul";
      return `<${tag}>${(block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
    }
    return `<p>${escapeHtml(block.body || block.title)}</p>`;
  }).join("");
  $("[data-guide-preview]").innerHTML = `
    <img src="/${escapeHtml(guide.coverImage || "assets/guide-first-time-china.png")}" alt="" />
    <p>${escapeHtml([guide.category, guide.author, guide.publishedAt].filter(Boolean).join(" · "))}</p>
    <h2>${escapeHtml(translation.title || guide.title)}</h2>
    <p>${escapeHtml(translation.excerpt || guide.excerpt)}</p>
    ${blockHtml}
  `;
  renderEditorChecks();
}

function setGuideEditorMode(mode = "edit") {
  $$("[data-editor-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.editorMode === mode);
  });
  $$("[data-editor-mode-panel]").forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.editorModePanel !== mode);
  });
  $(".simple-editor-shell")?.classList.toggle("is-preview-mode", mode === "preview");
  if (mode === "preview") renderGuidePreview();
}

function showReviewPanel(show = true) {
  $("[data-review-panel]")?.classList.toggle("is-collapsed", !show);
  $("[data-toggle-review-panel]")?.classList.toggle("is-active", show);
}

function autoSizeEditor(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.max(520, textarea.scrollHeight + 4)}px`;
}

function autoSizeEditors() {
  $$("[data-raw-editor]").forEach(autoSizeEditor);
}

function renderEditorChecks() {
  const node = $("[data-editor-checks]");
  if (!node || !state.guideDraft) return;
  const guide = syncGuideFromForm();
  const en = getGuideTranslation(guide, "en");
  const cn = getGuideTranslation(guide, "cn");
  const content = `${en.rawContent || ""}\n${cn.rawContent || ""}`;
  const checks = [
    { key: "card-image", label: "封面图", ok: Boolean(guide.coverImage), note: guide.coverImage ? "已设置封面图" : "建议添加封面图" },
    { key: "faq", label: "常见问题", ok: /FAQ|Q:|问：|常见问题/i.test(content), note: /FAQ|Q:|问：|常见问题/i.test(content) ? "已包含信任问答" : "游客常问支付、接机和翻译，建议添加 3–5 个 FAQ" },
    { key: "cta", label: "联系按钮", ok: /CTA:/i.test(content), note: /CTA:/i.test(content) ? "已添加联系按钮" : "缺少联系按钮" },
    { key: "language", label: "中文版本", ok: Boolean(cn.title || cn.rawContent), note: (cn.title || cn.rawContent) ? "中文版已准备" : "尚未添加中文版" },
    { key: "seo", label: "SEO 基础", ok: Boolean(en.title && en.excerpt), note: (en.title && en.excerpt) ? "SEO 标题和简介已完成" : "建议补充标题和简介" },
    { key: "readability", label: "阅读体验", ok: (en.rawContent || "").length > 300 || (cn.rawContent || "").length > 120, note: "阅读节奏自动检查" }
  ];
  renderGuideWorkflowStatus(guide);
  node.innerHTML = checks.map((check) => `
    <article class="${check.ok ? "is-ok" : "needs-work"}" data-jump-section="${check.key}">
      <span>${check.ok ? "✓" : "!"}</span>
      <div><strong>${check.label}</strong><small>${check.note}</small></div>
    </article>
  `).join("");
}

async function uploadAdminImage(file, folder = "guides", tags = []) {
  const dataUrl = await fileToDataUrl(file);
  const response = await api("/api/upload", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, alt: file.name.replace(/\.[^.]+$/, ""), folder, category: folder, tags, dataUrl })
  });
  await loadMedia();
  return response.media || { url: response.path };
}

function jumpToEditorSection(section) {
  setGuideEditorMode("edit");
  showReviewPanel(true);
  $("[data-edit-panel]")?.classList.remove("is-hidden");
  let target = null;
  if (section === "hero") {
    $("[data-hero-settings]")?.setAttribute("open", "");
    target = $("[data-cover-dropzone]");
  }
  if (section === "intro" || section === "seo") target = $(`[name="excerpt${state.currentGuideLang === "cn" ? "Cn" : "En"}"]`);
  if (section === "faq" || section === "cta" || section === "readability") target = $(`[data-raw-editor="${state.currentGuideLang}"]`);
  if (section === "language") {
    state.currentGuideLang = "cn";
    $$("[data-lang-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.langTab === "cn"));
    $$("[data-lang-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.langPanel !== "cn"));
    $$("[data-source-lang-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.sourceLangPanel !== "cn"));
    target = $("[name='titleCn']");
  }
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  target?.focus?.();
  target?.classList.add("is-highlighted");
  window.setTimeout(() => target?.classList.remove("is-highlighted"), 1200);
}

function addMissingSection(section) {
  const editor = $(`[data-raw-editor="${state.currentGuideLang}"]`);
  if (!editor) return;
  if (section === "faq") insertTextIntoTextarea(editor, "\n\n## FAQ 常见问题\n\nQ: 游客可以使用支付宝吗？\n\nA: 可以，建议出发前完成绑定和测试。\n\nQ: 是否提供翻译协助？\n\nA: 可以，ChinaMigo 可协助沟通、预约和现场支持。\n\n");
  if (section === "cta") insertTextIntoTextarea(editor, "\n\nCTA: Chat on WhatsApp | https://wa.me/\n\n");
  if (section === "seo") $(`[name="excerpt${state.currentGuideLang === "cn" ? "Cn" : "En"}"]`)?.focus();
  renderGuidePreview();
  setUnsaved(true);
}

function applySlashCommand(textarea) {
  const value = textarea.value;
  const commandMap = {
    "/faq": "## FAQ 常见问题\n\nQ: 游客最常问什么？\n\nA: 可以在这里写一个简短、安心的回答。\n\n",
    "/cta": "CTA: Chat on WhatsApp | https://wa.me/\n\n",
    "/quote": "> 写一句适合作为文章重点摘录的话。\n\n",
    "/image": "![图片说明](assets/uploads/your-image.jpg)\n\n"
  };
  const command = Object.keys(commandMap).find((key) => new RegExp(`(^|\\n)${key.replace("/", "\\/")}$`).test(value));
  if (!command) return false;
  textarea.value = value.replace(new RegExp(`(^|\\n)${command.replace("/", "\\/")}$`), `$1${commandMap[command]}`);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

function getActiveRawEditor() {
  if (document.activeElement?.matches?.("[data-raw-editor]")) return document.activeElement;
  return $(`[data-raw-editor="${state.currentGuideLang}"]`);
}

function getActiveVisualEditor() {
  if (document.activeElement?.matches?.("[data-visual-editor]")) return document.activeElement;
  return $(`[data-visual-editor="${state.currentGuideLang}"]`);
}

function rememberVisualSelection() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;
  const node = selection.anchorNode;
  const visual = node?.nodeType === 1
    ? node.closest?.("[data-visual-editor]")
    : node?.parentElement?.closest?.("[data-visual-editor]");
  if (!visual || !visual.contains(selection.focusNode)) return;
  state.lastVisualSelection = {
    lang: visual.dataset.visualEditor || state.currentGuideLang,
    range: selection.getRangeAt(0).cloneRange()
  };
}

function syncVisualEditorFromRaw(lang = state.currentGuideLang) {
  const raw = $(`[data-raw-editor="${lang}"]`);
  const visual = $(`[data-visual-editor="${lang}"]`);
  if (!raw || !visual) return;
  visual.innerHTML = raw.value ? cleanRenderedFormatArtifacts(markdownToHtml(raw.value)) : "";
  resetEditorHistory(lang);
}

function syncVisualEditorsFromRaw() {
  ["en", "cn"].forEach(syncVisualEditorFromRaw);
}

function syncRawFromVisualEditor(lang = state.currentGuideLang) {
  const raw = $(`[data-raw-editor="${lang}"]`);
  const visual = $(`[data-visual-editor="${lang}"]`);
  if (!raw || !visual) return;
  const cleanedHtml = cleanRenderedFormatArtifacts(visual.innerHTML);
  if (cleanedHtml !== visual.innerHTML) visual.innerHTML = cleanedHtml;
  raw.value = htmlToPlainDraft(cleanedHtml);
  autoSizeEditor(raw);
  updateWordCount(raw);
}

function syncRawFromVisualEditors() {
  ["en", "cn"].forEach(syncRawFromVisualEditor);
}

function getEditorHistory(lang = state.currentGuideLang) {
  if (!state.editorHistory[lang]) state.editorHistory[lang] = { undo: [], redo: [], last: "" };
  return state.editorHistory[lang];
}

function resetEditorHistory(lang = state.currentGuideLang) {
  const visual = $(`[data-visual-editor="${lang}"]`);
  const history = getEditorHistory(lang);
  history.undo = [];
  history.redo = [];
  history.last = visual?.innerHTML || "";
}

function pushEditorHistory(lang, beforeHtml, afterHtml) {
  const history = getEditorHistory(lang);
  if (beforeHtml === afterHtml) return;
  if (history.undo[history.undo.length - 1] !== beforeHtml) history.undo.push(beforeHtml);
  if (history.undo.length > 80) history.undo.shift();
  history.redo = [];
  history.last = afterHtml;
}

function recordVisualInputHistory(lang = state.currentGuideLang) {
  const visual = $(`[data-visual-editor="${lang}"]`);
  if (!visual) return;
  const history = getEditorHistory(lang);
  const current = visual.innerHTML;
  if (history.last === current) return;
  pushEditorHistory(lang, history.last, current);
}

function applyEditorHistory(command) {
  const visual = getActiveVisualEditor();
  if (!visual) return;
  const lang = visual.dataset.visualEditor || state.currentGuideLang;
  const history = getEditorHistory(lang);
  const current = visual.innerHTML;
  if (command === "undo") {
    const previous = history.undo.pop();
    if (previous == null) {
      showToast("没有可撤回的内容");
      return;
    }
    history.redo.push(current);
    visual.innerHTML = previous;
    history.last = previous;
    showToast("已撤回");
  }
  if (command === "redo") {
    const next = history.redo.pop();
    if (next == null) {
      showToast("没有可恢复的内容");
      return;
    }
    history.undo.push(current);
    visual.innerHTML = next;
    history.last = next;
    showToast("已恢复");
  }
  visual.focus();
  syncRawFromVisualEditor(lang);
  renderGuidePreview();
  renderGuideWorkflowStatus(syncGuideFromForm());
  setUnsaved(true);
}

function getSelectedEditorText(editor = getActiveRawEditor()) {
  const visual = getActiveVisualEditor();
  const selection = window.getSelection();
  if (visual && selection && selection.rangeCount && visual.contains(selection.anchorNode)) return selection.toString();
  if (!editor) return "";
  return editor.value.slice(editor.selectionStart || 0, editor.selectionEnd || 0);
}

function replaceSelectedEditorText(editor, text) {
  if (!editor) return;
  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  editor.value = `${editor.value.slice(0, start)}${text}${editor.value.slice(end)}`;
  editor.selectionStart = start;
  editor.selectionEnd = start + text.length;
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.focus();
}

function replaceSelectedVisualText(text) {
  const visual = getActiveVisualEditor();
  if (!visual) return false;
  const beforeHtml = visual.innerHTML;
  const selection = window.getSelection();
  let range = null;
  if (selection?.rangeCount && visual.contains(selection.anchorNode)) {
    range = selection.getRangeAt(0);
  } else if (state.lastVisualSelection?.range && state.lastVisualSelection.lang === visual.dataset.visualEditor) {
    range = state.lastVisualSelection.range.cloneRange();
  }
  if (!range || !visual.contains(range.commonAncestorContainer)) return false;
  const fragment = document.createDocumentFragment();
  String(text || "")
    .split(/\n{2,}/)
    .forEach((chunk) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = chunk.trim();
      fragment.appendChild(paragraph);
    });
  range.deleteContents();
  range.insertNode(fragment);
  visual.focus();
  pushEditorHistory(visual.dataset.visualEditor || state.currentGuideLang, beforeHtml, visual.innerHTML);
  syncRawFromVisualEditor(visual.dataset.visualEditor);
  rememberVisualSelection();
  return true;
}

function updateSelectionAiToolbar() {
  const toolbar = $("[data-selection-ai-toolbar]");
  const selected = getSelectedEditorText(getActiveRawEditor()).trim();
  if (!toolbar) return;
  toolbar.classList.toggle("is-hidden", !selected);
}

function runSelectionAiAction(action) {
  const editor = getActiveRawEditor();
  const selected = getSelectedEditorText(editor);
  const visual = getActiveVisualEditor();
  if ((!editor && !visual) || !selected.trim()) {
    showToast("请先选中一段文字");
    return;
  }
  const clean = selected.trim();
  const sentence = clean.replace(/\s+/g, " ");
  const transforms = {
    improve: clean.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n"),
    shorten: sentence.length > 160 ? `${sentence.slice(0, 154).trim()}...` : sentence,
    expand: `${clean}\n\n补充说明：这里可以加入更具体的场景、注意事项或游客常见问题。`,
    translate: state.currentGuideLang === "cn" ? `English draft: ${sentence}` : `中文翻译草稿：${sentence}`,
    faq: `## FAQ 常见问题\n\nQ: ${sentence.replace(/[。.!?？]+$/g, "")}？\n\nA: ${clean}\n`,
    extract: clean.split(/\n+/).filter(Boolean).slice(0, 4).map((line) => `- ${line.replace(/^[-*]\s*/, "").trim()}`).join("\n")
  };
  if (document.activeElement?.matches?.("[data-visual-editor]") || state.lastVisualSelection?.lang === state.currentGuideLang) {
    replaceSelectedVisualText(transforms[action] || clean);
  } else {
    replaceSelectedEditorText(editor, transforms[action] || clean);
  }
  updateSelectionAiToolbar();
  renderGuidePreview();
  renderGuideWorkflowStatus(syncGuideFromForm());
  setUnsaved(true);
  showToast({
    improve: "选区表达已优化",
    shorten: "选区已缩短",
    expand: "选区已扩写",
    translate: "已生成翻译草稿",
    faq: "选区已转成 FAQ",
    extract: "已提取重点"
  }[action] || "选区已更新");
}

function insertHtmlAtCursor(html) {
  document.execCommand("insertHTML", false, html);
}

function wrapSelectedMarkdown(editor, before, after = "") {
  if (!editor) return;
  const start = editor.selectionStart ?? 0;
  const end = editor.selectionEnd ?? 0;
  const selected = editor.value.slice(start, end) || "重点文字";
  const replacement = `${before}${selected}${after}`;
  editor.value = `${editor.value.slice(0, start)}${replacement}${editor.value.slice(end)}`;
  editor.selectionStart = start + before.length;
  editor.selectionEnd = start + before.length + selected.length;
  autoSizeEditor(editor);
  editor.dispatchEvent(new Event("input", { bubbles: true }));
  editor.focus();
}

function wrapVisualSelection(tagName, attributes = {}) {
  const visual = getActiveVisualEditor();
  if (!visual) return false;
  const beforeHtml = visual.innerHTML;
  visual.focus();
  const selection = window.getSelection();
  let range = null;
  if (selection?.rangeCount && visual.contains(selection.anchorNode)) {
    range = selection.getRangeAt(0);
  } else if (state.lastVisualSelection?.range && state.lastVisualSelection.lang === visual.dataset.visualEditor) {
    range = state.lastVisualSelection.range.cloneRange();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  if (!range || !visual.contains(range.commonAncestorContainer)) return false;
  const wrapper = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "class") wrapper.className = value;
    else if (key === "style") wrapper.setAttribute("style", value);
    else wrapper.setAttribute(key, value);
  });
  try {
    if (range.collapsed) wrapper.textContent = "重点文字";
    else wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.addRange(nextRange);
    rememberVisualSelection();
  } catch {
    document.execCommand("insertHTML", false, wrapper.outerHTML);
  }
  pushEditorHistory(visual.dataset.visualEditor || state.currentGuideLang, beforeHtml, visual.innerHTML);
  syncRawFromVisualEditor(visual.dataset.visualEditor);
  renderGuidePreview();
  setUnsaved(true);
  return true;
}

function applyInlineFormat(format, value = "") {
  const visual = getActiveVisualEditor();
  const hasVisualSelection = visual && (
    document.activeElement?.matches?.("[data-visual-editor]")
    || state.lastVisualSelection?.lang === visual.dataset.visualEditor
  );
  if (hasVisualSelection) {
    if (format === "bold") wrapVisualSelection("strong");
    if (format === "color") wrapVisualSelection("span", { class: "cms-text-color", style: `color:${value || "#8A5A2B"}` });
    if (format === "size") wrapVisualSelection("span", { class: "cms-text-size cms-text-size-large" });
    if (format === "highlight") wrapVisualSelection("mark", { class: "cms-highlight", style: `background:${value || "#F3E7C8"}` });
    syncRawFromVisualEditor(visual.dataset.visualEditor);
    renderGuidePreview();
    renderGuideWorkflowStatus(syncGuideFromForm());
    setUnsaved(true);
    return;
  }
  const editor = getActiveRawEditor();
  if (!editor) return;
  const formats = {
    bold: ["**", "**"],
    color: [`[color:${value || "#8A5A2B"}]`, "[/color]"],
    size: ["[size:large]", "[/size]"],
    highlight: [`[highlight:${value || "#F3E7C8"}]`, "[/highlight]"]
  };
  const pair = formats[format];
  if (!pair) return;
  wrapSelectedMarkdown(editor, pair[0], pair[1]);
  renderGuidePreview();
  renderGuideWorkflowStatus(syncGuideFromForm());
  setUnsaved(true);
}

async function uploadAdminMedia(file, folder = "guides", tags = []) {
  const dataUrl = await fileToDataUrl(file);
  const response = await api("/api/upload", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, alt: file.name.replace(/\.[^.]+$/, ""), folder, category: folder, tags, dataUrl })
  });
  await loadMedia();
  return response.media || { url: response.path, alt: file.name.replace(/\.[^.]+$/, ""), type: file.type.split("/")[0], mimeType: file.type };
}

function mediaMarkdown(item, kind) {
  const url = item.url || "";
  const label = item.alt || item.filename || (kind === "audio" ? "音频说明" : kind === "video" ? "视频说明" : "图片说明");
  if (kind === "audio") return `Audio: ${label} | ${url}\n\n`;
  if (kind === "video") return `Video: ${label} | ${url}\n\n`;
  return `![${label}](${url})\n\n`;
}

async function insertMediaFiles(files, kind = "image") {
  const acceptMap = {
    image: (file) => file.type.startsWith("image/") && file.type !== "image/gif",
    gif: (file) => file.type === "image/gif",
    audio: (file) => file.type.startsWith("audio/"),
    video: (file) => file.type.startsWith("video/")
  };
  const validFiles = [...files].filter(acceptMap[kind] || acceptMap.image);
  if (!validFiles.length) {
    showToast("请选择匹配的文件类型");
    return;
  }
  setStatus("正在上传素材...");
  const uploaded = [];
  for (const file of validFiles) uploaded.push(await uploadAdminMedia(file, "guides", [kind]));
  const visual = getActiveVisualEditor();
  if (visual && (
    document.activeElement?.matches?.("[data-visual-editor]")
    || state.lastVisualSelection?.lang === visual.dataset.visualEditor
  )) {
    const beforeHtml = visual.innerHTML;
    const html = uploaded.map((item) => {
      const url = `/${String(item.url || "").replace(/^\/+/, "")}`;
      const label = escapeHtml(item.alt || item.filename || "");
      if (kind === "audio") return `<figure class="cms-media cms-audio"><figcaption>${label}</figcaption><audio controls src="${escapeHtml(url)}"></audio></figure>`;
      if (kind === "video") return `<figure class="cms-media cms-video"><video controls playsinline src="${escapeHtml(url)}"></video><figcaption>${label}</figcaption></figure>`;
      return `<figure><img src="${escapeHtml(url)}" alt="${label}"><figcaption>${label}</figcaption></figure>`;
    }).join("");
    visual.focus();
    document.execCommand("insertHTML", false, html);
    pushEditorHistory(visual.dataset.visualEditor || state.currentGuideLang, beforeHtml, visual.innerHTML);
    syncRawFromVisualEditor(visual.dataset.visualEditor);
  } else {
    const target = getActiveRawEditor();
    if (target) insertTextIntoTextarea(target, uploaded.map((item) => mediaMarkdown(item, kind)).join(""));
  }
  renderGuidePreview();
  setUnsaved(true);
  setStatus("素材已插入。");
}

async function insertImageFiles(files, gallery = false) {
  const validFiles = [...files].filter((file) => file.type.startsWith("image/"));
  if (!validFiles.length) return;
  setStatus("正在上传图片...");
  const uploaded = [];
  for (const file of validFiles) uploaded.push(await uploadAdminImage(file, "guides"));
  if (gallery && uploaded.length > 1) {
    const target = document.activeElement?.matches?.("[data-raw-editor]") ? document.activeElement : null;
    if (target) {
      insertTextIntoTextarea(target, uploaded.map((item) => `![${item.alt || ""}](${item.url})`).join("\n") + "\n\n");
    } else {
      insertHtmlAtCursor(`<div class="cms-gallery">${uploaded.map((item) => `<img src="/${item.url}" alt="${escapeHtml(item.alt || "")}">`).join("")}</div><p><br></p>`);
    }
  } else {
    const target = document.activeElement?.matches?.("[data-raw-editor]") ? document.activeElement : null;
    if (target) {
      insertTextIntoTextarea(target, uploaded.map((item) => `![${item.alt || ""}](${item.url})`).join("\n") + "\n\n");
    } else {
      uploaded.forEach((item) => insertHtmlAtCursor(`<figure><img src="/${item.url}" alt="${escapeHtml(item.alt || "")}"><figcaption>${escapeHtml(item.alt || "")}</figcaption></figure><p><br></p>`));
    }
  }
  renderGuidePreview();
  setUnsaved(true);
  setStatus("图片已上传。");
}

function insertTextIntoTextarea(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  textarea.value = `${textarea.value.slice(0, start)}${text}${textarea.value.slice(end)}`;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  autoSizeEditor(textarea);
  updateWordCount(textarea);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function wordStats(value = "") {
  const clean = String(value || "").replace(/[#*_>`\[\]()/|:-]/g, " ").trim();
  const chinese = (clean.match(/[\u4e00-\u9fff]/g) || []).length;
  const latin = clean.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) || [];
  const count = chinese + latin.length;
  return {
    count,
    label: `${count.toLocaleString()} 字`
  };
}

function updateWordCount(textarea) {
  if (!textarea) return;
  const lang = textarea.dataset.rawEditor;
  const node = $(`[data-word-count="${lang}"]`);
  if (node) node.textContent = wordStats(textarea.value).label;
}

function updateWordCounts() {
  $$("[data-raw-editor]").forEach(updateWordCount);
}

function scheduleGuideAutosave() {
  window.clearTimeout(state.guideAutosaveTimer);
  state.guideAutosaveTimer = window.setTimeout(async () => {
    if (!state.guideDraft) return;
    syncGuideFromForm();
    const hasTitle = getGuideTranslation(state.guideDraft, "en").title || getGuideTranslation(state.guideDraft, "cn").title;
    if (!hasTitle || hasTitle === "Untitled Guide" || hasTitle === "未命名攻略") return;
    try {
      if ($("[data-unsaved-state]")) $("[data-unsaved-state]").textContent = "正在自动保存...";
      await api("/api/admin/guides", { method: "POST", body: JSON.stringify(state.guideDraft) });
      await loadGuides();
      setUnsaved(false);
      setStatus("攻略已自动保存。");
    } catch (error) {
      setStatus(`自动保存失败：${error.message}`);
    }
  }, 4200);
}

async function loadCities() {
  state.cities = (await api("/api/admin/cities")).data;
  if (!state.currentCityId && state.cities[0]) state.currentCityId = state.cities[0].id;
  renderExperienceCityOptions();
  renderCitiesCms();
}

function renderCitiesCms() {
  renderCityList();
  const city = state.cities.find((item) => item.id === state.currentCityId) || state.cities[0];
  if (city) selectCity(city, { keepList: true });
  else renderEmptyCityEditor();
}

function renderCityList() {
  const list = $("[data-cities-list]");
  if (!list) return;
  const query = ($("[data-city-search]")?.value || "").toLowerCase();
  const filter = $("[data-city-filter]")?.value || "";
  const cities = [...state.cities]
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .filter((city) => {
      const haystack = [city.name, city.slug, city.shortDescription || city.description].join(" ").toLowerCase();
      return (!query || haystack.includes(query))
        && (!filter || (filter === "active" ? city.active : city.showInNavigation));
    });

  list.innerHTML = cities.map((city) => {
    const stats = cityContentStats(city);
    const health = cityHealth(city);
    return `
      <button class="city-row ${city.id === state.currentCityId ? "is-active" : ""}" type="button" draggable="true" data-city-order-id="${city.id}" data-edit-city="${city.id}">
        <img src="/${escapeHtml(String(cityImage(city)).replace(/^\/+/, ""))}" alt="" />
        <span>
          <strong>${escapeHtml(city.name)}</strong>
          <small>${stats.guides.length} 攻略 · ${stats.experiences.length} 行程</small>
          <em>${city.active ? "已启用" : "已停用"}${city.showInNavigation ? " · 导航显示" : ""}</em>
          <span class="city-health-badges">
            ${health.issues.slice(0, 3).map((item) => `<b class="${item.positive ? "is-good" : ""}">${escapeHtml(item.label)}</b>`).join("")}
          </span>
        </span>
      </button>
    `;
  }).join("") || "<p class='empty'>没有找到城市。</p>";
}

function renderEmptyCityEditor() {
  $("[data-current-city-title]").textContent = "请选择城市";
  $("[data-city-page-preview]").textContent = "最终页面地址：/cities/";
  setCitySaveStatus("请选择左侧城市");
  $("[data-city-linked-summary]").innerHTML = "";
  $("[data-city-linked-list]").innerHTML = "";
  $("[data-city-image-preview]").innerHTML = "";
  $("[data-city-card-preview]").innerHTML = "";
}

function selectCity(city, options = {}) {
  const current = normalizeCityDraft(city);
  state.currentCityId = current.id;
  $("[data-city-form]")?.classList.toggle("is-new-city", !current.id);
  fillForm($("[data-city-form]"), current);
  const slugInput = $("[data-city-form] [name='slug']");
  if (slugInput) slugInput.dataset.autoSlug = current.slug ? "false" : "true";
  $("[data-current-city-title]").textContent = current.name || "未命名城市";
  $("[data-city-page-preview]").textContent = `最终页面地址：/cities/${current.slug || ""}`;
  setCitySaveStatus(current.id ? `已保存 · ${formatRelativeDate(current.updatedAt)}` : "新城市 · 保存后进入完整编辑");
  renderCityAssociations(current);
  renderCityImagePreview(current);
  renderCityCardPreview(current);
  if (!options.keepList) renderCityList();
}

function renderCityCardPreview(city) {
  const node = $("[data-city-card-preview]");
  if (!node) return;
  const image = String(cityImage(city)).replace(/^\/+/, "");
  const health = cityHealth(city);
  node.innerHTML = `
    <div class="city-preview-copy">
      <p class="eyebrow">实时预览</p>
      <h5>城市卡片预览</h5>
      <p>这会用于前台城市选择、城市推荐和移动端小卡片。</p>
      <div class="city-health-meter">
        <span>内容完整度</span>
        <strong>${health.percent}%</strong>
        <i><b style="width:${health.percent}%"></b></i>
      </div>
    </div>
    <article class="city-card-mockup">
      <img src="/${escapeHtml(image)}" alt="" />
      <div>
        <strong>${escapeHtml(city.name || "城市名称")}</strong>
        <span>${escapeHtml(city.shortDescription || city.description || "这里会显示城市短描述。")}</span>
        <em>${escapeHtml(city.slug ? `/cities/${city.slug}` : "/cities/")}</em>
      </div>
    </article>
  `;
}

function renderCityImagePreview(city) {
  const preview = $("[data-city-image-preview]");
  if (!preview) return;
  const usageFor = (value) => {
    const normalized = String(value || "").replace(/^\/+/, "");
    if (!normalized) return [];
    const matches = [];
    state.cities.forEach((item) => {
      if ([item.bannerImage, item.cardImage, item.thumbnailImage].map((image) => String(image || "").replace(/^\/+/, "")).includes(normalized)) {
        matches.push(`${item.name || "城市"} 页面`);
      }
    });
    state.experiences.forEach((item) => {
      if ([item.coverImage, ...(item.galleryImages || [])].map((image) => String(image || "").replace(/^\/+/, "")).includes(normalized)) {
        matches.push(item.title || "行程方案");
      }
    });
    state.guides.forEach((item) => {
      if ([item.coverImage, item.mobileCoverImage].map((image) => String(image || "").replace(/^\/+/, "")).includes(normalized)) {
        matches.push(item.title || "攻略");
      }
    });
    return [...new Set(matches)].slice(0, 3);
  };
  const images = [
    { field: "bannerImage", label: "城市横幅图", ratio: "16:9", scene: "用于城市页 Hero / 详情页顶部", hint: "用于城市页面顶部的大图。", size: "建议尺寸：1600 × 900", value: city.bannerImage },
    { field: "cardImage", label: "城市封面图", ratio: "4:3", scene: "用于首页城市卡 / 推荐城市", hint: "用于前台城市卡片和推荐模块。", size: "建议尺寸：1200 × 900", value: city.cardImage },
    { field: "thumbnailImage", label: "城市缩略图", ratio: "1:1", scene: "用于左侧列表 / 移动端小卡片", hint: "用于城市列表、小卡片和移动端展示。", size: "建议尺寸：800 × 800", value: city.thumbnailImage }
  ];

  preview.innerHTML = images.map((item) => `
    <article class="city-upload-card ${item.value ? "has-image" : ""}" data-city-image-drop="${item.field}">
      <div class="city-image-usage">
        <span>${escapeHtml(item.ratio)}</span>
        <em>${escapeHtml(item.scene)}</em>
      </div>
      ${item.value
        ? `<img src="/${escapeHtml(String(item.value).replace(/^\/+/, ""))}" alt="${escapeHtml(item.label)}" />`
        : `<div class="city-upload-empty"><span>+</span><strong>${item.label}</strong><small>${item.hint}</small><em>${item.size}</em></div>`}
      ${item.value ? `<div class="city-image-state">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(String(item.value).split("/").pop())}</span>
        <small>${escapeHtml(item.size)}</small>
        <em>${usageFor(item.value).length ? `使用中：${escapeHtml(usageFor(item.value).join("、"))}` : "当前未检测到前台引用"}</em>
      </div>` : ""}
      <div class="city-upload-actions">
        <button class="secondary" type="button" data-open-media-picker="city:${item.field}">${item.value ? "从素材库替换" : "从素材中心选择"}</button>
        <button class="secondary" type="button" data-upload-city-image="${item.field}">${item.value ? "本地替换" : "本地上传到素材中心"}</button>
        ${item.value ? `<button class="secondary" type="button" data-clear-city-image="${item.field}">删除</button>` : ""}
      </div>
    </article>
  `).join("");
}

function renderCityAssociations(city) {
  const summary = $("[data-city-linked-summary]");
  const list = $("[data-city-linked-list]");
  if (!summary || !list) return;
  const stats = cityContentStats(city);
  summary.innerHTML = `
    <div><strong>${stats.guides.length}</strong><span>篇攻略</span></div>
    <div><strong>${stats.journeys.length}</strong><span>个 Journeys</span></div>
    <div><strong>${stats.shorts.length}</strong><span>个 Experiences</span></div>
  `;

  const latestGuides = stats.guides
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 4);
  const latestExperiences = stats.experiences
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 4);

  list.innerHTML = `
    <div>
      <h5>最新攻略</h5>
      ${latestGuides.map((guide) => `
        <button type="button" data-edit-city-guide="${guide.id}">
          <span>${escapeHtml(guide.title || "未命名攻略")}</span>
          <small>${escapeHtml([guide.category, zhStatus(guide.status), formatRelativeDate(guide.updatedAt)].filter(Boolean).join(" · "))}</small>
        </button>
      `).join("") || `<div class="city-empty-action"><p>还没有 ${escapeHtml(city.name || "这个城市")} 攻略。</p><div><button type="button" data-ai-guide-outline-for-city="${escapeHtml(city.slug || city.name || "")}">AI生成攻略大纲</button><button type="button" data-template-guide-for-city="${escapeHtml(city.slug || city.name || "")}">从模板生成</button><button type="button" data-new-guide-for-city="${escapeHtml(city.slug || city.name || "")}">为 ${escapeHtml(city.name || "这个城市")} 新建攻略</button></div></div>`}
    </div>
    <div>
      <h5>最近行程</h5>
      ${latestExperiences.map((experience) => `
        <button type="button" data-edit-experience="${experience.id}">
          <span>${escapeHtml(experience.title || "未命名行程")}</span>
          <small>${escapeHtml([experience.type === "short_experience" ? "短体验" : "推荐行程", experience.duration, formatRelativeDate(experience.updatedAt)].filter(Boolean).join(" · "))}</small>
        </button>
      `).join("") || `<div class="city-empty-action"><p>这个城市还没有关联行程。</p><button type="button" data-new-experience-for-city="${escapeHtml(city.slug || city.name || "")}">为 ${escapeHtml(city.name || "这个城市")} 新建行程</button></div>`}
    </div>
  `;
}

function jumpToCitySection(section) {
  const target = $(`[data-city-section="${section}"]`);
  if (!target) return;
  $$("[data-city-jump]").forEach((button) => button.classList.toggle("is-active", button.dataset.cityJump === section));
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.classList.add("is-highlighted");
  window.setTimeout(() => target.classList.remove("is-highlighted"), 1200);
}

async function reorderCities(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const sorted = [...state.cities].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const from = sorted.findIndex((city) => city.id === sourceId);
  const to = sorted.findIndex((city) => city.id === targetId);
  if (from < 0 || to < 0) return;
  const [moved] = sorted.splice(from, 1);
  sorted.splice(to, 0, moved);
  state.cities = sorted.map((city, index) => ({ ...city, sortOrder: index + 1 }));
  renderCityList();
  setCitySaveStatus("正在保存排序...", "saving");
  setStatus("正在保存城市排序...");
  try {
    for (const city of state.cities) {
      await api("/api/admin/cities", { method: "POST", body: JSON.stringify(city) });
    }
    await loadCities();
    setCitySaveStatus("排序已保存 · 刚刚", "saved");
    setStatus("城市排序已保存。");
    showToast("城市排序已保存");
  } catch (error) {
    setCitySaveStatus("排序保存失败", "error");
    setStatus(`排序保存失败：${error.message}`);
  }
}

async function loadExperiences() {
  state.experiences = (await api("/api/admin/experiences")).data;
  if (!state.currentExperienceId && state.experiences[0]) state.currentExperienceId = state.experiences[0].id;
  renderExperienceCityOptions();
  renderExperienceList();
  const current = state.experiences.find((item) => item.id === state.currentExperienceId) || state.experiences[0];
  renderExperienceEditor(current || defaultExperience());
  if (state.cities.length) renderCitiesCms();
}

function renderExperienceCityOptions() {
  const select = $("[data-experience-city-select]");
  if (!select) return;
  const current = select.value;
  select.innerHTML = state.cities
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .map((city) => `<option value="${escapeHtml(city.slug)}">${escapeHtml(city.name)}</option>`)
    .join("");
  if (current) select.value = current;
}

function renderExperienceList() {
  const list = $("[data-experiences-list]");
  if (!list) return;
  const query = ($("[data-experience-search]")?.value || "").toLowerCase();
  const type = $("[data-experience-filter-type]")?.value || "";
  const experiences = [...state.experiences]
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    .filter((item) => {
      const haystack = [item.title, item.city, item.duration, item.excerpt, ...(item.tags || [])].join(" ").toLowerCase();
      return (!query || haystack.includes(query)) && (!type || item.type === type);
    });
  list.innerHTML = experiences.map((item) => `
    <button class="experience-row ${item.id === state.currentExperienceId ? "is-active" : ""}" type="button" data-edit-experience="${item.id}">
      <span>
        <strong>${escapeHtml(item.title || "未命名行程")}</strong>
        <small>${escapeHtml([item.city, item.type === "short_experience" ? "短体验" : "推荐行程", item.duration].filter(Boolean).join(" · "))}</small>
      </span>
      <em>${item.published ? "已发布" : "草稿"}</em>
    </button>
  `).join("") || "<p class='empty'>暂无行程方案。</p>";
}

function renderExperienceEditor(experience) {
  const item = normalizeExperienceDraft(experience);
  state.currentExperienceId = item.id;
  fillForm($("[data-experience-form]"), item);
  $("[name='itineraryDays']").value = JSON.stringify(item.itineraryDays || []);
  $("[name='shortDetails']").value = JSON.stringify(item.shortDetails || {});
  $("[name='galleryImages']").value = listToCsv(item.galleryImages || []);
  $("[name='tags']").value = listToCsv(item.tags || []);
  const slugInput = $("[data-experience-form] [name='slug']");
  if (slugInput) slugInput.dataset.autoSlug = item.slug ? "false" : "true";
  $("[data-current-experience-title]").textContent = item.title || "未命名行程";
  $("[data-experience-page-preview]").textContent = `最终页面地址：/trips/${item.slug || ""}`;
  $("[data-experience-save-status]").textContent = item.id ? `已保存 · ${formatRelativeDate(item.updatedAt)}` : "新行程 · 尚未保存";
  state.currentExperienceDay = 0;
  renderExperienceTypeEditor();
  renderExperienceImages(item);
  renderExperienceTags(item.tags || []);
  renderJourneyCardPreview(item);
  renderExperienceWorkflowStatus(item);
  renderItineraryPreview(item.itineraryDays || []);
  renderExperienceList();
}

function experienceCompletion(item = syncExperienceForm()) {
  const days = item.itineraryDays || [];
  const checks = [
    { label: "Hero 图", ok: Boolean(item.coverImage), note: "缺少行程封面" },
    { label: "基础信息", ok: Boolean(item.title && item.city && item.duration && item.excerpt), note: "标题、城市、时长或简介未完成" },
    { label: "标签", ok: Boolean((item.tags || []).length), note: "缺少标签" },
    { label: "Day 内容", ok: item.type !== "recommended_journey" || days.some((day) => day.morning || day.afternoon || day.evening), note: "缺少 Day 行程内容" },
    { label: "Day 图片", ok: item.type !== "recommended_journey" || days.every((day) => Boolean(day.image)), note: "有 Day 缺少图片" }
  ];
  const completed = checks.filter((check) => check.ok).length;
  return { percent: Math.round((completed / checks.length) * 100), missing: checks.filter((check) => !check.ok), checks };
}

function renderExperienceWorkflowStatus(item = syncExperienceForm()) {
  const node = $("[data-experience-completion]");
  if (!node) return;
  const completion = experienceCompletion(item);
  node.textContent = `完成度 ${completion.percent}%${completion.missing.length ? ` · 缺 ${completion.missing.length} 项` : " · 可发布"}`;
  node.dataset.state = completion.missing.length ? "dirty" : "saved";
}

function renderExperienceTypeEditor() {
  const type = $("[data-experience-type]")?.value || "recommended_journey";
  $("[data-journey-editor]")?.classList.toggle("is-hidden", type !== "recommended_journey");
  $("[data-short-editor]")?.classList.toggle("is-hidden", type !== "short_experience");
  if (type === "recommended_journey") renderDayEditor();
  else renderShortEditor();
}

function readItineraryDays() {
  const existing = parseJsonField($("[name='itineraryDays']")?.value, []);
  const fields = $$("[data-day-field]");
  if (!fields.length) return existing.length ? existing : [{ title: "Day 1", morning: "", afternoon: "", evening: "", stayNotes: "", image: "" }];
  const index = state.currentExperienceDay;
  const next = existing.length ? existing : [{ title: "Day 1", morning: "", afternoon: "", evening: "", stayNotes: "", image: "" }];
  next[index] ||= { title: `Day ${index + 1}` };
  fields.forEach((field) => {
    next[index][field.dataset.dayField] = field.value;
  });
  return next;
}

function renderDayEditor() {
  const days = readItineraryDays();
  $("[name='itineraryDays']").value = JSON.stringify(days);
  if (state.currentExperienceDay >= days.length) state.currentExperienceDay = 0;
  renderDayListTitles(days);
  const day = days[state.currentExperienceDay] || {};
  $("[data-day-fields]").innerHTML = `
    <label class="day-title-field">Day 标题<input data-day-field="title" value="${escapeHtml(day.title || `Day ${state.currentExperienceDay + 1}`)}" /></label>
    ${dayMomentField("🌅", "Morning", "morning", day.morning)}
    ${dayMomentField("📍", "Afternoon", "afternoon", day.afternoon)}
    ${dayMomentField("🍷", "Evening", "evening", day.evening)}
    ${dayMomentField("🏨", "Stay / Notes", "stayNotes", day.stayNotes)}
    <input data-day-field="image" type="hidden" value="${escapeHtml(day.image || "")}" />
    <div class="day-image-preview day-image-sidebar ${day.image ? "" : "is-empty"}">
      <span>Day 图片</span>
      ${day.image ? `<img src="/${escapeHtml(String(day.image).replace(/^\/+/, ""))}" alt="">` : "<p class='empty'>这个 Day 还没有图片。</p>"}
      <div class="day-image-actions">
        <button class="secondary" type="button" data-open-media-picker="experience-day">素材库</button>
        <button class="secondary" type="button" data-upload-day-image>上传</button>
        ${day.image ? `<button class="secondary" type="button" data-clear-day-image>删除</button>` : ""}
      </div>
    </div>
  `;
  renderItineraryPreview(days);
}

function dayMomentField(icon, label, key, value = "") {
  return `
    <label class="day-moment-field">
      <span><i>${icon}</i>${escapeHtml(label)}<button class="secondary" type="button" title="AI 优化这一段" data-ai-day-field="${escapeHtml(key)}">✨</button></span>
      <textarea data-day-field="${escapeHtml(key)}" rows="2">${escapeHtml(value || "")}</textarea>
    </label>
  `;
}

function renderDayListTitles(days = parseJsonField($("[name='itineraryDays']")?.value, [])) {
  const list = $("[data-day-list]");
  if (!list) return;
  list.innerHTML = days.map((day, index) => `
    <button class="${index === state.currentExperienceDay ? "is-active" : ""}" type="button" data-select-day="${index}">
      <strong>Day ${index + 1}</strong>
      <small>${escapeHtml((day.title || `Day ${index + 1}`).replace(/^Day\s*\d+\s*[-—:]?\s*/i, "") || "未命名")}</small>
      <em>${[day.morning, day.afternoon, day.evening].filter(Boolean).length}/3</em>
    </button>
  `).join("");
}

function renderItineraryPreview(days = parseJsonField($("[name='itineraryDays']")?.value, [])) {
  const node = $("[data-itinerary-preview]");
  if (!node) return;
  node.innerHTML = `
    <div class="preview-drawer-head">
      <div>
        <p class="eyebrow">Preview</p>
        <h5>用户看到的行程节奏</h5>
      </div>
      <button class="secondary" type="button" data-close-itinerary-preview>关闭</button>
    </div>
    <div class="itinerary-preview-list">
      ${days.map((day, index) => `
        <article class="${index === state.currentExperienceDay ? "is-active" : ""}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${escapeHtml(day.title || `Day ${index + 1}`)}</strong>
            ${day.morning ? `<p><b>Morning</b>${escapeHtml(day.morning)}</p>` : ""}
            ${day.afternoon ? `<p><b>Afternoon</b>${escapeHtml(day.afternoon)}</p>` : ""}
            ${day.evening ? `<p><b>Evening</b>${escapeHtml(day.evening)}</p>` : ""}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function readShortDetails() {
  const details = {};
  $$("[data-short-field]").forEach((field) => {
    details[field.dataset.shortField] = field.value;
  });
  return Object.keys(details).length ? details : parseJsonField($("[name='shortDetails']")?.value, {});
}

function renderShortEditor() {
  const details = parseJsonField($("[name='shortDetails']")?.value, {});
  $$("[data-short-field]").forEach((field) => {
    field.value = details[field.dataset.shortField] || "";
  });
}

function getSelectedExperienceTags() {
  return $$("[data-experience-tag] input:checked").map((input) => input.value);
}

function renderExperienceTags(tags = []) {
  const allTags = [...new Set([...experienceTagOptions, ...tags])];
  $("[data-experience-tags]").innerHTML = allTags.map((tag) => `
    <label data-experience-tag>
      <input type="checkbox" value="${escapeHtml(tag)}" ${tags.includes(tag) ? "checked" : ""} />
      <span>${escapeHtml(tag)}</span>
    </label>
  `).join("");
}

function renderExperienceImages(experience) {
  const cover = experience.coverImage;
  $("[data-experience-cover-preview]").innerHTML = cover
    ? `<img src="/${escapeHtml(String(cover).replace(/^\/+/, ""))}" alt="">`
    : `<div class="city-upload-empty"><span>+</span><strong>封面图</strong><small>用于 Journey Card 和详情页视觉。</small></div>`;
  const gallery = experience.galleryImages || [];
  $("[data-experience-gallery]").innerHTML = gallery.map((src, index) => `
    <figure>
      <img src="/${escapeHtml(String(src).replace(/^\/+/, ""))}" alt="" />
      <button class="secondary" type="button" data-remove-experience-gallery="${index}">删除</button>
    </figure>
  `).join("") || "<p class='empty'>暂无图片组。</p>";
}

function renderJourneyCardPreview(item = syncExperienceForm()) {
  const title = item.title || "未命名行程";
  const image = item.coverImage || "assets/guide-first-time-china.png";
  const tags = item.tags || [];
  const mode = $("[data-journey-card-preview]")?.dataset.previewMode || "desktop";
  $("[data-journey-card-preview]").innerHTML = `
    <article class="journey-preview-card ${mode}">
      <img src="/${escapeHtml(String(image).replace(/^\/+/, ""))}" alt="" />
      <div>
        <span>${escapeHtml(item.duration || (item.type === "short_experience" ? "Short Experience" : "Private Journey"))}</span>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(item.excerpt || "这里会显示前台卡片简介。")}</p>
        ${tags.length ? `<small>${tags.map(escapeHtml).join(" · ")}</small>` : ""}
      </div>
    </article>
  `;
}

function syncExperienceForm() {
  const form = $("[data-experience-form]");
  const values = formValues(form);
  values.itineraryDays = readItineraryDays();
  values.shortDetails = readShortDetails();
  values.tags = getSelectedExperienceTags();
  values.galleryImages = csvToList(form.galleryImages.value);
  values.contentBlocks = values.itineraryDays.map((day, index) => ({
    id: `day-${index + 1}`,
    type: "itinerary_day",
    title: day.title || `Day ${index + 1}`,
    morning: day.morning || "",
    afternoon: day.afternoon || "",
    evening: day.evening || "",
    stayNotes: day.stayNotes || "",
    image: day.image || ""
  }));
  form.itineraryDays.value = JSON.stringify(values.itineraryDays);
  form.shortDetails.value = JSON.stringify(values.shortDetails);
  form.contentBlocks.value = JSON.stringify(values.contentBlocks);
  form.tags.value = listToCsv(values.tags);
  return values;
}

async function loadMedia() {
  state.media = (await api("/api/admin/media")).data;
  const query = $("[data-media-search]")?.value || "";
  const category = $("[data-media-category-filter]")?.value || "";
  const items = filterMediaItems(query, category);
  const list = $("[data-media-list]");
  if (!list) return;
  list.innerHTML = items.map((item) => `
    <article class="media-item">
      ${mediaPreviewMarkup(item)}
      <strong>${escapeHtml(item.filename)}</strong>
      <div class="media-meta">
        <span>${escapeHtml(mediaCategoryLabel(item.category || item.folder))}</span>
        <span>${escapeHtml(formatRelativeDate(item.createdAt))}</span>
      </div>
      ${(item.tags || []).length ? `<div class="media-tags">${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <div class="media-usage">
        <strong>${(item.usage || []).length ? "使用中" : "未使用"}</strong>
        ${(item.usage || []).slice(0, 3).map((usage) => `<button class="media-usage-link" type="button" data-media-usage-target="${escapeHtml(usage.editTarget || "")}">${escapeHtml(usage.label)}</button>`).join("")}
      </div>
      <code>${escapeHtml(item.url)}</code>
      <button class="secondary" data-copy-media="${item.url}" type="button">复制链接</button>
      <button class="secondary" data-delete-media="${item.id}" type="button">删除</button>
    </article>
  `).join("") || "<p class='empty'>暂无上传素材。</p>";
  renderGuideMediaPicker();
  renderMediaPicker();
}

function mediaPreviewMarkup(item = {}) {
  const type = item.type || (item.mimeType || "").split("/")[0] || (/\.(mp4|webm|mov|ogg)$/i.test(item.url || "") ? "video" : /\.(mp3|wav|m4a)$/i.test(item.url || "") ? "audio" : "image");
  if (type === "audio") return `<div class="media-file-preview audio"><span>Audio</span><strong>音频素材</strong></div>`;
  if (type === "video") return `<div class="media-file-preview video"><span>Video</span><strong>视频素材</strong></div>`;
  return `<img src="/${escapeHtml(item.url)}" alt="${escapeHtml(item.alt || "")}" />`;
}

function defaultTemplate() {
  return {
    id: "",
    title: "新话术模板",
    slug: "",
    category: "欢迎",
    channel: "WhatsApp",
    language: "EN",
    icon: "💬",
    body: "Hi {{name}}, thanks for reaching out. We can shape a calmer China journey around {{city}} and your timing.",
    sortOrder: state.templates.length + 1,
    active: true
  };
}

async function loadTemplates() {
  try {
    state.templates = (await api("/api/admin/templates")).data;
  } catch {
    state.templates = Object.values(defaultQuickReplyTemplates).map((template, index) => ({
      ...template,
      title: template.label,
      slug: Object.keys(defaultQuickReplyTemplates)[index],
      sortOrder: index + 1,
      active: true
    }));
  }
  if (!state.currentTemplateId && state.templates[0]) state.currentTemplateId = state.templates[0].id;
  renderTemplateCenter();
}

function renderTemplateCenter() {
  renderTemplateCategories();
  renderTemplateList();
  const current = state.templates.find((template) => template.id === state.currentTemplateId) || state.templates[0];
  renderTemplateEditor(current || defaultTemplate());
}

function renderTemplateCategories() {
  const node = $("[data-template-categories]");
  if (!node) return;
  const active = node.dataset.category || "";
  const categories = [...new Set(state.templates.map((template) => template.category || "通用"))];
  node.innerHTML = [`<button class="${!active ? "is-active" : ""}" type="button" data-template-category="">全部模板</button>`]
    .concat(categories.map((category) => `<button class="${active === category ? "is-active" : ""}" type="button" data-template-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`))
    .join("");
}

function renderTemplateList() {
  const node = $("[data-template-list]");
  if (!node) return;
  const query = ($("[data-template-search]")?.value || "").toLowerCase();
  const category = $("[data-template-categories]")?.dataset.category || "";
  const templates = state.templates
    .filter((template) => !category || template.category === category)
    .filter((template) => !query || [template.title, template.category, template.channel, template.language, template.body].join(" ").toLowerCase().includes(query))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  node.innerHTML = templates.map((template) => `
    <button class="template-row ${template.id === state.currentTemplateId ? "is-active" : ""}" type="button" data-edit-template="${escapeHtml(template.id)}">
      <span>${escapeHtml(template.icon || "💬")}</span>
      <strong>${escapeHtml(template.title || "未命名模板")}</strong>
      <small>${escapeHtml([template.category, template.channel, template.language].filter(Boolean).join(" · "))}</small>
    </button>
  `).join("") || "<p class='empty'>暂无模板。</p>";
}

function renderTemplateEditor(template = defaultTemplate()) {
  const form = $("[data-template-form]");
  if (!form) return;
  state.currentTemplateId = template.id || "";
  fillForm(form, template);
  $("[data-current-template-title]").textContent = template.title || "新话术模板";
  $("[data-template-save-status]").textContent = template.id ? `已保存 · ${formatRelativeDate(template.updatedAt)}` : "新模板 · 尚未保存";
  renderTemplatePreview();
  renderTemplateList();
}

function templateDraftFromForm() {
  const form = $("[data-template-form]");
  const fields = form.elements;
  return {
    id: fields.id.value,
    title: fields.title.value,
    slug: slugify(fields.title.value || "template"),
    category: fields.category.value,
    channel: fields.channel.value,
    language: fields.language.value,
    icon: fields.icon.value,
    body: fields.body.value,
    sortOrder: Number(fields.sortOrder.value || 0),
    active: true
  };
}

function renderTemplatePreview() {
  const node = $("[data-template-preview]");
  if (!node) return;
  const draft = templateDraftFromForm();
  const sample = {
    name: "Hy",
    citiesInterestedIn: "Shanghai",
    travelDates: "June 12-16",
    travelers: "3",
    preferredStayLevel: "Luxury",
    tripStyle: ["Slow Travel"]
  };
  node.textContent = applyTemplateVariables(draft.body, sample) || "模板内容为空。";
}

function openMediaPicker(target, options = {}) {
  state.mediaPicker = {
    target,
    category: options.category || "",
    title: options.title || "选择图片"
  };
  const modal = $("[data-media-modal]");
  if (!modal) return;
  modal.classList.remove("is-hidden");
  $("[data-media-picker-title]").textContent = state.mediaPicker.title;
  if ($("[data-picker-category]")) $("[data-picker-category]").value = state.mediaPicker.category || "";
  if ($("[data-picker-search]")) $("[data-picker-search]").value = "";
  renderMediaPicker();
}

function closeMediaPicker() {
  state.mediaPicker = null;
  $("[data-media-modal]")?.classList.add("is-hidden");
}

function renderMediaPicker() {
  const grid = $("[data-picker-grid]");
  if (!grid || !state.mediaPicker) return;
  const query = $("[data-picker-search]")?.value || "";
  const category = $("[data-picker-category]")?.value || state.mediaPicker.category || "";
  const items = filterMediaItems(query, category);
  grid.innerHTML = items.map((item) => `
    <button class="media-choice" type="button" data-pick-media="${escapeHtml(item.url)}">
      ${mediaPreviewMarkup(item)}
      <strong>${escapeHtml(item.alt || item.filename)}</strong>
      <span>${escapeHtml(mediaCategoryLabel(item.category || item.folder))}${(item.tags || []).length ? ` · ${escapeHtml(item.tags.slice(0, 2).join(" · "))}` : ""}</span>
      <span>${(item.usage || []).length ? `使用中 · ${escapeHtml(item.usage[0].label)}` : "未使用"}</span>
    </button>
  `).join("") || "<p class='empty'>没有找到合适的图片，可以直接上传新图片。</p>";
}

function applyPickedMedia(url) {
  if (!state.mediaPicker || !url) return;
  const target = state.mediaPicker.target;

  if (target === "guide-cover") {
    state.guideDraft.coverImage = url;
    state.guideDraft.coverAlt = state.media.find((item) => item.url === url)?.alt || "";
    $("[name='coverImage']").value = url;
    $("[name='coverAlt']").value = state.guideDraft.coverAlt;
    renderGuideCardImagePreview(state.guideDraft);
    renderGuidePreview();
    setUnsaved(true);
  } else if (target === "guide-inline") {
    const lang = state.currentGuideLang || "en";
    const editor = $(`[data-raw-editor="${lang}"]`);
    const media = state.media.find((item) => item.url === url);
    insertTextIntoTextarea(editor, `![${media?.alt || "ChinaMigo image"}](${url})\n\n`);
    editor?.dispatchEvent(new Event("input", { bubbles: true }));
  } else if (target === "guide-collection-image") {
    const input = $("[data-guide-collection-form] [name='image']");
    if (input) input.value = url;
    renderGuideCollectionImage(url);
  } else if (target.startsWith("city:")) {
    const field = target.split(":")[1];
    const input = $(`[name="${field}"]`);
    if (input) input.value = url;
    renderCityImagePreview(cityDraftFromForm());
    setCitySaveStatus("未保存", "dirty");
    showToast("图片已从素材中心应用");
  } else if (target === "experience-cover") {
    $("[name='coverImage']").value = url;
    renderExperienceImages(syncExperienceForm());
    renderJourneyCardPreview();
    $("[data-experience-save-status]").textContent = "未保存";
  } else if (target === "experience-gallery") {
    const gallery = csvToList($("[name='galleryImages']").value);
    if (!gallery.includes(url)) gallery.push(url);
    $("[name='galleryImages']").value = listToCsv(gallery);
    renderExperienceImages(syncExperienceForm());
    $("[data-experience-save-status]").textContent = "未保存";
  } else if (target === "experience-day") {
    const days = readItineraryDays();
    if (days[state.currentExperienceDay]) days[state.currentExperienceDay].image = url;
    $("[name='itineraryDays']").value = JSON.stringify(days);
    renderDayEditor();
    $("[data-experience-save-status]").textContent = "未保存";
  }

  closeMediaPicker();
  showToast("图片已应用");
}

async function refreshAll() {
  await Promise.all([loadOverview(), loadTemplates(), loadInquiries(), loadGuides(), loadGuideCollections(), loadCities(), loadExperiences(), loadMedia()]);
}

function showDashboard() {
  $("[data-login]").classList.add("is-hidden");
  $("[data-dashboard]").classList.remove("is-hidden");
}

function showLogin() {
  $("[data-dashboard]").classList.add("is-hidden");
  $("[data-login]").classList.remove("is-hidden");
}

function switchTab(name) {
  $$("[data-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === name));
  $$("[data-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.panel !== name));
}

$("[data-login-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = $("[data-login-status]");
  status.textContent = "正在登录...";
  try {
    await api("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    showDashboard();
    await refreshAll();
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
  }
});

$("[data-logout]").addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  showLogin();
});

$$("[data-tab]").forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));

$("[data-guide-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  syncGuideFromForm();
  setStatus("正在保存攻略...");
  if ($("[data-unsaved-state]")) $("[data-unsaved-state]").textContent = "正在保存...";
  await api("/api/admin/guides", { method: "POST", body: JSON.stringify(state.guideDraft) });
  await loadGuides();
  await loadOverview();
  setUnsaved(false);
  setStatus("攻略已保存。");
  showToast("攻略已保存");
});

$("[data-guide-collection-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = guideCollectionDraftFromForm();
  setStatus("正在保存精选合集...");
  try {
    const response = await api("/api/admin/guide-collections", { method: "POST", body: JSON.stringify(payload) });
    await loadGuideCollections();
    selectGuideCollection(response.data);
    setStatus("精选合集已保存，并已同步首页。");
    showToast("精选合集已保存");
  } catch (error) {
    setStatus(`精选合集保存失败：${error.message}`);
    showToast(`保存失败：${error.message}`);
  }
});


$("[data-city-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  setCitySaveStatus("正在保存...", "saving");
  setStatus("正在保存城市内容...");
  try {
    const response = await api("/api/admin/cities", { method: "POST", body: JSON.stringify(formValues(event.currentTarget)) });
    state.currentCityId = response.data.id;
    $("[data-city-form]")?.classList.remove("is-new-city");
    await loadCities();
    await loadOverview();
    setCitySaveStatus("已保存 · 刚刚", "saved");
    setStatus(`${response.data.name || "城市内容"} 已保存，并已同步前台。`);
    showToast(`✓ ${response.data.name || "城市内容"} 已保存`);
  } catch (error) {
    setCitySaveStatus("保存失败，请重试", "error");
    setStatus(`城市保存失败：${error.message}`);
    showToast(`保存失败：${error.message}`);
  }
});

$("[data-experience-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = syncExperienceForm();
  $("[data-experience-save-status]").textContent = "正在保存...";
  setStatus("正在保存行程方案...");
  try {
    const response = await api("/api/admin/experiences", { method: "POST", body: JSON.stringify(payload) });
    state.currentExperienceId = response.data.id;
    await loadExperiences();
    await loadOverview();
    $("[data-experience-save-status]").textContent = "已保存 · 刚刚";
    setStatus("行程方案已保存。");
    showToast("行程方案已保存");
  } catch (error) {
    $("[data-experience-save-status]").textContent = "保存失败，请重试";
    setStatus(`行程保存失败：${error.message}`);
  }
});

$("[data-media-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const files = [...form.file.files].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;
  setStatus("正在上传素材...");
  for (const file of files) {
    const dataUrl = await fileToDataUrl(file);
    await api("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        alt: form.alt.value || file.name.replace(/\.[^.]+$/, ""),
        folder: form.category.value,
        category: form.category.value,
        tags: csvToList(form.tags.value),
        dataUrl
      })
    });
  }
  form.reset();
  await loadMedia();
  await loadOverview();
  setStatus("素材已上传。");
  showToast(`已上传 ${files.length} 张素材`);
});

$("[data-template-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = templateDraftFromForm();
  $("[data-template-save-status]").textContent = "正在保存...";
  setStatus("正在保存话术模板...");
  try {
    const response = await api("/api/admin/templates", { method: "POST", body: JSON.stringify(payload) });
    state.currentTemplateId = response.data.id;
    await loadTemplates();
    setStatus("话术模板已保存。");
    showToast("话术模板已保存");
  } catch (error) {
    $("[data-template-save-status]").textContent = "保存失败";
    setStatus(`模板保存失败：${error.message}`);
  }
});

$("[data-new-guide]").addEventListener("click", () => selectGuide(defaultGuide()));
$("[data-new-city]").addEventListener("click", () => {
  const nextCity = normalizeCityDraft({
    id: "",
    name: "新城市",
    slug: "",
    active: true,
    showInNavigation: false,
    sortOrder: state.cities.length + 1
  });
  state.currentCityId = "";
  fillForm($("[data-city-form]"), nextCity);
  $("[data-city-form]")?.classList.add("is-new-city");
  const slugInput = $("[data-city-form] [name='slug']");
  if (slugInput) slugInput.dataset.autoSlug = "true";
  $("[data-current-city-title]").textContent = "新城市";
  $("[data-city-page-preview]").textContent = "最终页面地址：/cities/";
  setCitySaveStatus("新城市 · 保存后进入完整编辑");
  renderCityAssociations(nextCity);
  renderCityImagePreview(nextCity);
  renderCityCardPreview(nextCity);
  renderCityList();
});
$("[data-new-experience]").addEventListener("click", () => renderExperienceEditor(defaultExperience()));

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button, [data-focus-toggle], [data-toggle-activity], [data-crm-filter], [data-guide-quick-filter], [data-inquiry-tab], [data-jump-followup], [data-overview-tab], [data-overview-action], [data-overview-edit], [data-overview-inquiry-status], [data-inquiry-status-action], [data-quick-reply], [data-quick-note], [data-save-quick-note], [data-save-followup], [data-toggle-templates], [data-template-category], [data-edit-template], [data-new-template], [data-ai-polish-template], [data-duplicate-template], [data-delete-template], [data-cancel-quick-note], [data-editor-mode], [data-toggle-review-panel], [data-jump-section], [data-cover-dropzone], [data-card-focus], [data-editor-tab], [data-edit-guide], [data-edit-guide-collection], [data-new-guide-collection], [data-edit-city-guide], [data-new-guide-for-city], [data-ai-guide-outline-for-city], [data-template-guide-for-city], [data-new-experience-for-city], [data-copy-city-url], [data-open-city-page], [data-preview-row-guide], [data-duplicate-row-guide], [data-lang-tab], [data-open-edit-panel], [data-close-edit-panel], [data-close-guide-editor], [data-format-inline], [data-insert-media], [data-add-block], [data-collapse-block], [data-duplicate-block], [data-remove-block], [data-move-block], [data-remove-related], [data-preview-device], [data-pick-cover], [data-open-media-picker], [data-close-media-picker], [data-pick-media], [data-media-usage-target], [data-upload-guide-cover], [data-upload-city-image], [data-clear-city-image], [data-edit-city], [data-edit-experience], [data-journey-preview-mode], [data-toggle-itinerary-preview], [data-close-itinerary-preview], [data-select-day], [data-add-day], [data-ai-optimize-day], [data-ai-day-field], [data-upload-day-image], [data-clear-day-image], [data-upload-experience-cover], [data-clear-experience-cover], [data-upload-experience-gallery], [data-remove-experience-gallery], [data-add-experience-tag], [data-ai-suggest-tags], [data-view-inquiry], [data-close-inquiry], [data-export-inquiries], [data-copy-contact], [data-copy-field], [data-copy-inquiry], [data-save-inquiry-notes], [data-mark-spam], [data-archive-inquiry], [data-delete-guide], [data-delete-city], [data-delete-experience], [data-delete-inquiry], [data-delete-media], [data-copy-media]") || event.target;
  if (target.matches("[data-focus-toggle]")) {
    const key = target.dataset.focusToggle;
    const completed = !state.completedFocus.has(key);
    setFocusCompleted(key, completed);
    target.classList.toggle("is-complete", completed);
    await loadOverview();
    showToast(completed ? "今日重点已完成" : "已恢复为待处理");
  }
  if (target.matches("[data-toggle-activity]")) {
    state.overviewActivityExpanded = !state.overviewActivityExpanded;
    await loadOverview();
    showToast(state.overviewActivityExpanded ? "已展开最近活动" : "已收起最近活动");
  }
  if (target.matches("[data-edit-guide-collection]")) {
    const collection = state.guideCollections.find((item) => item.id === target.dataset.editGuideCollection);
    if (collection) selectGuideCollection(collection);
  }
  if (target.matches("[data-new-guide-collection]")) {
    selectGuideCollection(defaultGuideCollection());
    showToast("可以开始新建精选合集");
  }
  if (target.matches("[data-city-jump]")) {
    jumpToCitySection(target.dataset.cityJump);
  }
  if (target.matches("[data-copy-city-url]")) {
    const city = cityDraftFromForm();
    const path = `/cities/${city.slug || ""}`;
    const copied = await copyText(path);
    showToast(copied ? `已复制城市链接：${path}` : "复制失败，请手动复制链接");
  }
  if (target.matches("[data-open-city-page]")) {
    const city = cityDraftFromForm();
    if (!city.slug) {
      showToast("请先填写 URL 标识");
      return;
    }
    window.open(`/cities/${city.slug}`, "_blank");
  }
  if (target.matches("[data-inquiry-tab]")) {
    const tabName = target.dataset.inquiryTab;
    $$("[data-inquiry-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.inquiryTab === tabName));
    $$("[data-inquiry-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.inquiryPanel === tabName));
  }
  if (target.matches("[data-jump-followup]")) {
    $$("[data-inquiry-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.inquiryTab === "timeline"));
    $$("[data-inquiry-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.inquiryPanel === "timeline"));
    $("[data-follow-note-text]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    $("[data-follow-note-text]")?.focus();
  }
  if (target.matches("[data-crm-filter]")) {
    const list = $("[data-inquiries-list]");
    if (list) list.dataset.crmFilter = target.dataset.crmFilter || "";
    $$("[data-crm-filter]").forEach((button) => button.classList.toggle("is-active", button === target && Boolean(target.dataset.crmFilter)));
    renderInquiryList();
  }
  if (target.matches("[data-template-category]")) {
    const node = $("[data-template-categories]");
    if (node) node.dataset.category = target.dataset.templateCategory || "";
    renderTemplateCategories();
    renderTemplateList();
  }
  if (target.matches("[data-edit-template]")) {
    renderTemplateEditor(state.templates.find((template) => template.id === target.dataset.editTemplate));
  }
  if (target.matches("[data-new-template]")) {
    state.currentTemplateId = "";
    renderTemplateEditor(defaultTemplate());
  }
  if (target.matches("[data-ai-polish-template]")) {
    const form = $("[data-template-form]");
    if (form?.body) {
      form.body.value = form.body.value
        .replace(/\s+/g, " ")
        .replace(/\\s+([,.?])/g, "$1")
        .trim();
      if (!/ChinaMigo/i.test(form.body.value)) form.body.value = `${form.body.value} ChinaMigo can help keep the journey calm and well coordinated.`;
      renderTemplatePreview();
      $("[data-template-save-status]").textContent = "未保存 · AI 已润色";
      showToast("AI 已润色模板");
    }
  }
  if (target.matches("[data-duplicate-template]")) {
    const draft = templateDraftFromForm();
    draft.id = "";
    draft.title = `${draft.title || "模板"} Copy`;
    state.currentTemplateId = "";
    renderTemplateEditor(draft);
    showToast("已复制为新模板，保存后生效");
  }
  if (target.matches("[data-delete-template]")) {
    const id = $("[data-template-form]")?.elements?.id?.value;
    if (!id) return;
    if (!window.confirm("确认删除这个话术模板？")) return;
    await api(`/api/admin/templates?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    state.currentTemplateId = "";
    await loadTemplates();
    showToast("话术模板已删除");
  }
  if (target.matches("[data-guide-quick-filter]")) {
    const list = $("[data-guides-list]");
    if (list) list.dataset.quickFilter = target.dataset.guideQuickFilter || "";
    $$("[data-guide-quick-filter]").forEach((button) => button.classList.toggle("is-active", button === target && Boolean(target.dataset.guideQuickFilter)));
    renderGuideList();
  }
  if (target.matches("[data-overview-tab]")) {
    switchTab(target.dataset.overviewTab);
  }
  if (target.matches("[data-overview-action]")) {
    const action = target.dataset.overviewAction;
    if (action === "new-guide") {
      switchTab("guides");
      selectGuide(defaultGuide());
    }
    if (action === "new-city") {
      switchTab("cities");
      $("[data-new-city]")?.click();
    }
    if (action === "new-experience") {
      switchTab("experiences");
      renderExperienceEditor(defaultExperience());
    }
    if (action === "upload-media") switchTab("media");
  }
  if (target.matches("[data-overview-edit]")) {
    const [type, id] = String(target.dataset.overviewEdit || "").split(":");
    if (type === "guide") {
      switchTab("guides");
      const guide = state.guides.find((item) => item.id === id || item.slug === id);
      if (guide) selectGuide(guide);
    }
    if (type === "city") {
      switchTab("cities");
      const city = state.cities.find((item) => item.id === id || item.slug === id);
      if (city) selectCity(city);
    }
    if (type === "experience") {
      switchTab("experiences");
      const experience = state.experiences.find((item) => item.id === id || item.slug === id);
      if (experience) renderExperienceEditor(experience);
    }
    if (type === "inquiry") {
      switchTab("inquiries");
      const inquiry = state.inquiries.find((item) => item.id === id);
      if (inquiry) renderInquiryDetail(inquiry);
    }
    if (type === "media") switchTab("media");
  }
  if (target.matches("[data-overview-inquiry-status]")) {
    await api("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: target.dataset.overviewInquiryStatus, status: target.dataset.statusNext }) });
    await loadInquiries();
    await loadOverview();
    showToast("咨询状态已更新");
  }
  if (target.matches("[data-inquiry-status-action]")) {
    await api("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: target.dataset.inquiryStatusAction, status: target.dataset.statusNext }) });
    await loadInquiries();
    await loadOverview();
    showToast("咨询状态已更新");
  }
  if (target.matches("[data-quick-reply]")) {
    const item = state.inquiries.find((inquiry) => inquiry.id === target.dataset.quickReply);
    const template = templateByKey(target.dataset.replyTemplate);
    if (!template) return;
    const text = template.text(item);
    const original = target.innerHTML;
    let copiedTemplate = false;
    try {
      const copied = await copyText(text);
      if (!copied) throw new Error("Copy failed");
      copiedTemplate = true;
      target.classList.add("is-copied");
      target.innerHTML = `<span>✓</span><em>已复制</em>`;
      target.disabled = true;
      window.setTimeout(() => {
        target.innerHTML = original;
        target.disabled = false;
        target.classList.remove("is-copied");
      }, 1500);
      showToast(`✓ 已复制 ${template.label} WhatsApp 模板`);
    } catch {
      showToast("复制失败，请手动复制模板内容。");
      window.prompt("复制快捷回复", text);
    }
    if (copiedTemplate) {
      await api("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: target.dataset.quickReply, status: "replied", lastReplyAt: new Date().toISOString(), activityLabel: `复制 WhatsApp ${template.label}` }) });
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      await loadInquiries();
      renderInquiryDetail(state.inquiries.find((inquiry) => inquiry.id === target.dataset.quickReply));
    }
  }
  if (target.matches("[data-quick-note]")) {
    const item = state.inquiries.find((inquiry) => inquiry.id === target.dataset.quickNote);
    renderInquiryDetail(item);
    $$("[data-inquiry-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.inquiryTab === "timeline"));
    $$("[data-inquiry-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.inquiryPanel === "timeline"));
    $("[data-follow-note-text]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    $("[data-follow-note-text]")?.focus();
    showToast("请填写跟进备注");
  }
  if (target.matches("[data-cancel-quick-note]")) {
    $("[data-quick-note-composer]")?.classList.add("is-hidden");
    if ($("[data-quick-note-text]")) $("[data-quick-note-text]").value = "";
  }
  if (target.matches("[data-toggle-templates]")) {
    const library = $("[data-template-library]");
    library?.classList.toggle("is-hidden");
    target.classList.toggle("is-active", !library?.classList.contains("is-hidden"));
  }
  if (target.matches("[data-save-followup]")) {
    const item = state.inquiries.find((inquiry) => inquiry.id === target.dataset.saveFollowup);
    const note = ($("[data-follow-note-text]")?.value || "").trim();
    if (!note) {
      showToast("请先输入跟进内容");
      return;
    }
    const previousNotes = item?.internalNotes ? `${item.internalNotes}\n\n` : "";
    const noteLine = `Migo · ${new Date().toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}\n${note}`;
    await api("/api/admin/inquiries", {
      method: "PATCH",
      body: JSON.stringify({
        id: target.dataset.saveFollowup,
        internalNotes: `${previousNotes}${noteLine}`,
        activityLabel: `新增跟进：${note.slice(0, 60)}`
      })
    });
    await loadInquiries();
    await loadOverview();
    renderInquiryDetail(state.inquiries.find((inquiry) => inquiry.id === target.dataset.saveFollowup));
    setStatus("跟进内容已保存。");
    showToast("✓ 跟进内容已保存");
  }
  if (target.matches("[data-save-quick-note]")) {
    const item = state.inquiries.find((inquiry) => inquiry.id === target.dataset.saveQuickNote);
    const note = ($("[data-quick-note-text]")?.value || "").trim();
    if (!note) {
      showToast("请先输入备注内容");
      return;
    }
    const previousNotes = item?.internalNotes ? `${item.internalNotes}\n\n` : "";
    const noteLine = `Migo · ${new Date().toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}\n${note}`;
    await api("/api/admin/inquiries", {
      method: "PATCH",
      body: JSON.stringify({
        id: target.dataset.saveQuickNote,
        internalNotes: `${previousNotes}${noteLine}`,
        activityLabel: `新增跟进备注：${note.slice(0, 60)}`
      })
    });
    await loadInquiries();
    await loadOverview();
    renderInquiryDetail(state.inquiries.find((inquiry) => inquiry.id === target.dataset.saveQuickNote));
    setStatus("跟进备注已保存。");
    showToast("✓ 跟进备注已保存");
  }
  if (target.matches("[data-editor-mode]")) {
    setGuideEditorMode(target.dataset.editorMode);
    return;
  }
  if (target.matches("[data-toggle-review-panel]")) {
    const panel = $("[data-review-panel]");
    showReviewPanel(panel?.classList.contains("is-collapsed"));
    return;
  }
  if (target.matches("[data-jump-section]")) {
    const section = target.dataset.jumpSection;
    if (target.classList.contains("needs-work")) addMissingSection(section);
    jumpToEditorSection(section);
    return;
  }
  if (target.matches("[data-selection-ai]")) {
    runSelectionAiAction(target.dataset.selectionAi);
    return;
  }
  if (target.matches("[data-card-focus]")) {
    syncGuideFromForm();
    state.guideDraft.imagePosition = target.dataset.cardFocus || "center center";
    $("[name='imagePosition']").value = state.guideDraft.imagePosition;
    renderGuideCardImagePreview(state.guideDraft);
    renderGuidePreview();
    renderGuideWorkflowStatus(state.guideDraft);
    setUnsaved(true);
    scheduleGuideAutosave();
    return;
  }
  if (target.matches("[data-editor-command]")) {
    const visual = getActiveVisualEditor();
    visual?.focus();
    applyEditorHistory(target.dataset.editorCommand);
    return;
  }
  if (target.matches("[data-format-inline]")) {
    applyInlineFormat(target.dataset.formatInline, target.dataset.formatValue || "");
    return;
  }
  if (target.matches("[data-insert-media]")) {
    const kind = target.dataset.insertMedia || "image";
    state.currentGuideLang = target.dataset.mediaLang || state.currentGuideLang || "en";
    $(`[data-visual-editor="${state.currentGuideLang}"]`)?.focus();
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = kind === "image" || kind === "gif";
    input.accept = {
      image: "image/png,image/jpeg,image/webp",
      gif: "image/gif",
      audio: "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/mp4",
      video: "video/mp4,video/webm,video/ogg,video/quicktime"
    }[kind] || "image/png,image/jpeg,image/webp";
    input.onchange = () => insertMediaFiles(input.files || [], kind);
    input.click();
    return;
  }
  if (target.matches("[data-edit-guide]")) selectGuide(state.guides.find((item) => item.id === target.dataset.editGuide));
  if (target.matches("[data-edit-city-guide]")) {
    switchTab("guides");
    selectGuide(state.guides.find((item) => item.id === target.dataset.editCityGuide));
  }
  if (target.matches("[data-new-guide-for-city]")) {
    const guide = defaultGuide();
    guide.city = cityKey(target.dataset.newGuideForCity);
    guide.category = "Lifestyle";
    guide.tags = [guide.city, "city guide"].filter(Boolean);
    guide.translations.en.title = "未命名攻略";
    switchTab("guides");
    selectGuide(guide);
  }
  if (target.matches("[data-ai-guide-outline-for-city], [data-template-guide-for-city]")) {
    const citySlug = cityKey(target.dataset.aiGuideOutlineForCity || target.dataset.templateGuideForCity);
    const city = state.cities.find((item) => cityMatchesContent(item, citySlug)) || { name: citySlug.replace(/-/g, " "), slug: citySlug };
    const guide = defaultGuide();
    guide.city = city.slug || citySlug;
    guide.category = "Lifestyle";
    guide.coverImage = city.cardImage || city.bannerImage || city.thumbnailImage || "";
    guide.tags = [city.name || citySlug, "First-time visitor", "Lifestyle"].filter(Boolean);
    guide.translations.en.title = `${city.name || "City"} Travel Guide`;
    guide.translations.en.excerpt = `A calm starter guide for experiencing ${city.name || "this city"}.`;
    guide.translations.en.rawContent = `# ${city.name || "City"} Travel Guide\n\n## Overview\n\n${city.longDescription || city.shortDescription || `A practical guide for international visitors exploring ${city.name || "this city"}.`}\n\n## What to Know First\n\n- Best arrival areas\n- Local transport rhythm\n- Payment and translation notes\n- Neighborhoods worth exploring\n\n## Local Tips\n\nAdd practical advice for first-time visitors here.\n\n## FAQ 常见问题\n\nQ: What should visitors prepare before arriving?\n\nA: Add a clear answer here.\n\nCTA: Chat on WhatsApp | https://wa.me/\n`;
    guide.translations.en.htmlContent = markdownToHtml(guide.translations.en.rawContent);
    switchTab("guides");
    selectGuide(guide);
    showToast(`已为 ${city.name || citySlug} 生成攻略大纲`);
  }
  if (target.matches("[data-new-experience-for-city]")) {
    switchTab("experiences");
    renderExperienceEditor(defaultExperience({
      city: cityKey(target.dataset.newExperienceForCity),
      type: "recommended_journey",
      published: true,
      sortOrder: 0
    }));
  }
  if (target.matches("[data-close-guide-editor]")) {
    $("[data-panel='guides']")?.classList.remove("is-editor-open");
  }
  if (target.matches("[data-open-edit-panel]")) {
    setGuideEditorMode("edit");
    if (target.dataset.openEditPanel === "hero") {
      $("[data-hero-settings]")?.setAttribute("open", "");
      $("[data-cover-dropzone]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      $(`[data-raw-editor="${state.currentGuideLang}"]`)?.focus();
    }
  }
  if (target.matches("[data-close-edit-panel]")) {
    showReviewPanel(false);
    renderGuidePreview();
  }
  if (target.matches("[data-editor-tab]")) {
    $$("[data-editor-tab]").forEach((button) => button.classList.toggle("is-active", button === target));
    $$("[data-editor-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.editorPanel !== target.dataset.editorTab));
  }
  if (target.matches("[data-preview-row-guide]")) {
    selectGuide(state.guides.find((item) => item.id === target.dataset.previewRowGuide));
    setGuideEditorMode("preview");
  }
  if (target.matches("[data-duplicate-guide], [data-duplicate-row-guide]")) {
    const source = target.dataset.duplicateRowGuide
      ? state.guides.find((item) => item.id === target.dataset.duplicateRowGuide)
      : syncGuideFromForm();
    const copy = JSON.parse(JSON.stringify(source || defaultGuide()));
    copy.id = `guide-${Date.now()}`;
    copy.slug = `${copy.slug || "guide"}-copy`;
    copy.title = `${copy.title || "未命名攻略"} 副本`;
    copy.status = "draft";
    copy.createdAt = "";
    copy.updatedAt = "";
    selectGuide(copy);
    setUnsaved(true);
  }
  if (target.matches("[data-preview-guide]")) {
    renderGuidePreview();
    showToast("预览已刷新");
  }
  if (target.matches("[data-rich-command]")) {
    const command = target.dataset.richCommand;
    const editor = $(`[data-rich-editor="${state.currentGuideLang}"]`);
    editor?.focus();
    if (command === "h2") document.execCommand("formatBlock", false, "h2");
    if (command === "p") document.execCommand("formatBlock", false, "p");
    if (command === "bold") document.execCommand("bold");
    if (command === "ul") document.execCommand("insertUnorderedList");
    if (command === "cta") insertHtmlAtCursor('<p><a class="cms-cta" href="https://wa.me/">Chat on WhatsApp</a></p><p><br></p>');
    if (command === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/webp,image/gif";
      input.multiple = true;
      input.onchange = () => insertImageFiles(input.files, input.files.length > 1);
      input.click();
    }
    renderGuidePreview();
    setUnsaved(true);
  }
  if (target.matches("[data-insert-image]")) {
    state.currentGuideLang = target.dataset.insertImage || state.currentGuideLang || "en";
    $(`[data-raw-editor="${state.currentGuideLang}"]`)?.focus();
    openMediaPicker("guide-inline", { category: "guides", title: "插入攻略正文图片" });
  }
  if (target.matches("[data-docx-upload]") || target.matches("[data-docx-dropzone]")) {
    if (target.dataset.importDocxNew !== undefined || !$("[data-panel='guides']")?.classList.contains("is-editor-open")) {
      selectGuide(defaultGuide());
    } else if (!state.guideDraft) {
      selectGuide(defaultGuide());
    }
    $("[data-docx-file]")?.click();
  }
  if (target.matches("[data-ai-action]")) {
    const editor = $(`[data-raw-editor="${state.currentGuideLang}"]`);
    if (!editor) return;
    if (target.dataset.aiAction === "translate-cn") {
      const enEditor = $(`[data-raw-editor="en"]`);
      const sourceTitle = $("[name='titleEn']")?.value || "";
      const sourceExcerpt = $("[name='excerptEn']")?.value || "";
      if (!enEditor?.value.trim() && !sourceTitle.trim()) {
        showToast("请先填写英文内容");
        return;
      }
      const previous = target.textContent;
      target.textContent = "生成中...";
      target.disabled = true;
      setStatus("AI 正在生成中文版本...");
      try {
        const response = await api("/api/ai/beautify", {
          method: "POST",
          body: JSON.stringify({
            title: sourceTitle,
            content: `请把以下 ChinaMigo 英文攻略翻译成自然、适合中文游客阅读的中文版本，保留 Markdown 标题、列表、CTA 和图片语法：\n\n${sourceExcerpt ? `${sourceExcerpt}\n\n` : ""}${enEditor.value}`,
            language: "zh-CN"
          })
        });
        const cnEditor = $(`[data-raw-editor="cn"]`);
        const titleField = $("[name='titleCn']");
        const excerptField = $("[name='excerptCn']");
        const translated = response.beautifiedContent || response.rawContent || response.content || "";
        if (titleField) titleField.value = response.suggestedTitle || sourceTitle;
        if (excerptField) excerptField.value = response.suggestedExcerpt || sourceExcerpt;
        if (cnEditor && translated) {
          cnEditor.value = translated;
          cnEditor.dispatchEvent(new Event("input", { bubbles: true }));
        }
        state.currentGuideLang = "cn";
        $$("[data-lang-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.langTab === "cn"));
        $$("[data-lang-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.langPanel !== "cn"));
        $$("[data-source-lang-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.sourceLangPanel !== "cn"));
        setStatus("AI 已生成中文版本。");
        showToast("AI 已生成中文版本");
      } catch (error) {
        setStatus(error.message);
        showToast(error.message || "AI 翻译失败");
      } finally {
        target.textContent = previous;
        target.disabled = false;
      }
      return;
    }
    if (target.dataset.aiAction === "beautify") {
      const previous = target.textContent;
      target.textContent = "整理中...";
      target.disabled = true;
      setStatus("AI 正在优化排版...");
      try {
        const response = await api("/api/ai/beautify", {
          method: "POST",
          body: JSON.stringify({
            title: $(`[name="title${state.currentGuideLang === "en" ? "En" : "Cn"}"]`)?.value || "",
            content: editor.value,
            language: state.currentGuideLang
          })
        });
        editor.value = response.beautifiedContent || editor.value;
        const titleField = $(`[name="title${state.currentGuideLang === "en" ? "En" : "Cn"}"]`);
        const excerptField = $(`[name="excerpt${state.currentGuideLang === "en" ? "En" : "Cn"}"]`);
        if (response.suggestedTitle && titleField) titleField.value = response.suggestedTitle;
        if (response.suggestedExcerpt && excerptField) excerptField.value = response.suggestedExcerpt;
        editor.dispatchEvent(new Event("input", { bubbles: true }));
        setStatus("AI 排版已完成。");
        showToast("AI 已优化排版");
      } catch (error) {
        setStatus(error.message);
        showToast(error.message);
      } finally {
        target.textContent = previous;
        target.disabled = false;
      }
      return;
    }
    if (target.dataset.aiAction === "spacing") {
      editor.value = editor.value
        .replace(/\n{3,}/g, "\n\n")
        .replace(/([^\n])\n(#{1,3}\s)/g, "$1\n\n$2")
        .replace(/([^\n])\n(-\s)/g, "$1\n\n$2");
      showToast("间距已优化");
    }
    if (target.dataset.aiAction === "format" && !/^#{1,3}\s/m.test(editor.value)) {
      editor.value = `## What to know first\n\n${editor.value}`;
      showToast("已转成攻略结构");
    }
    if (target.dataset.aiAction === "images") {
      editor.value = editor.value.replace(/!\[\]\(([^)]+)\)/g, "![请补充图片说明]($1)").replace(/\n{3,}(!\[)/g, "\n\n$1");
      showToast("图片说明和间距已整理");
    }
    editor.dispatchEvent(new Event("input", { bubbles: true }));
    renderGuidePreview();
    setUnsaved(true);
  }
  if (target.matches("[data-publish-guide]")) {
    syncGuideFromForm();
    const completion = guideCompletion(state.guideDraft);
    if (completion.missing.length) {
      const checklist = completion.checks.map((item) => `${item.ok ? "✓" : "✗"} ${item.label}${item.ok ? "" : `：${item.note}`}`).join("\n");
      const shouldPublish = window.confirm(`发布检查\n\n${checklist}\n\n仍然发布？`);
      if (!shouldPublish) {
        showReviewPanel(true);
        renderEditorChecks();
        setStatus("已取消发布，请先处理发布检查项。");
        return;
      }
    }
    state.guideDraft.status = "published";
    state.guideDraft.publishedAt ||= new Date().toISOString().slice(0, 10);
    $("[name='status']").value = "published";
    $("[name='publishedAt']").value = state.guideDraft.publishedAt;
    await api("/api/admin/guides", { method: "POST", body: JSON.stringify(state.guideDraft) });
    await loadGuides();
    await loadOverview();
    setUnsaved(false);
    setStatus(`攻略已发布 · 已同步前台 · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    showToast("攻略已发布，已同步前台");
  }
  if (target.matches("[data-lang-tab]")) {
    state.currentGuideLang = target.dataset.langTab;
    $$("[data-lang-tab]").forEach((button) => button.classList.toggle("is-active", button === target));
    $$("[data-lang-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.langPanel !== state.currentGuideLang));
    $$("[data-source-lang-panel]").forEach((panel) => panel.classList.toggle("is-hidden", panel.dataset.sourceLangPanel !== state.currentGuideLang));
    if ($("[data-editor-lang]")) $("[data-editor-lang]").textContent = state.currentGuideLang === "cn" ? "中文" : "英文";
    renderGuidePreview();
  }
  if (target.matches("[data-add-block]")) {
    syncGuideFromForm();
    getGuideTranslation(state.guideDraft, target.dataset.addBlock).contentBlocks.push({
      id: `block-${Date.now()}`,
      type: target.dataset.type,
      title: target.dataset.type === "heading" ? "New heading" : "",
      body: target.dataset.type === "paragraph" ? "Start writing..." : "",
      image: "",
      alt: "",
      items: [],
      href: "",
      label: ""
    });
    renderBlockEditors();
    renderTranslationStatus();
    renderGuidePreview();
    setUnsaved(true);
  }
  if (target.matches("[data-collapse-block], [data-duplicate-block], [data-remove-block], [data-move-block]")) {
    const blockEl = target.closest("[data-block]");
    const lang = blockEl.dataset.block;
    const index = Number(blockEl.dataset.index);
    syncBlocksFromDom(lang);
    const blocks = getGuideTranslation(state.guideDraft, lang).contentBlocks;
    if (target.matches("[data-collapse-block]")) blocks[index].collapsed = !blocks[index].collapsed;
    if (target.matches("[data-duplicate-block]")) blocks.splice(index + 1, 0, { ...blocks[index], id: `block-${Date.now()}`, collapsed: false });
    if (target.matches("[data-remove-block]")) blocks.splice(index, 1);
    if (target.dataset.moveBlock === "up" && index > 0) [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    if (target.dataset.moveBlock === "down" && index < blocks.length - 1) [blocks[index + 1], blocks[index]] = [blocks[index], blocks[index + 1]];
    renderBlockEditors();
    renderTranslationStatus();
    renderGuidePreview();
    setUnsaved(true);
  }
  if (target.matches("[data-add-related]")) {
    syncGuideFromForm();
    const slug = $("[data-related-select]").value;
    if (slug && !state.guideDraft.relatedGuides.includes(slug)) state.guideDraft.relatedGuides.push(slug);
    renderRelatedList();
    renderTranslationStatus();
    setUnsaved(true);
  }
  if (target.matches("[data-remove-related]")) {
    state.guideDraft.relatedGuides = (state.guideDraft.relatedGuides || []).filter((slug) => slug !== target.dataset.removeRelated);
    renderRelatedList();
    setUnsaved(true);
  }
  if (target.matches("[data-pick-cover]")) {
    syncGuideFromForm();
    state.guideDraft.coverImage = target.dataset.pickCover;
    $("[name='coverImage']").value = target.dataset.pickCover;
    renderGuideCardImagePreview(state.guideDraft);
    renderGuidePreview();
    setUnsaved(true);
    showToast("封面图已选择");
  }
  if (target.matches("[data-cover-dropzone]")) {
    $("[data-cover-file]")?.click();
  }
  if (target.matches("[data-upload-guide-cover]")) {
    $("[data-cover-file]")?.click();
  }
  if (target.matches("[data-open-media-picker]")) {
    const pickerTarget = target.dataset.openMediaPicker;
    const category = pickerTarget?.startsWith("city:")
      ? "cities"
      : pickerTarget?.startsWith("experience")
        ? "trips"
        : pickerTarget?.startsWith("guide")
          ? "guides"
          : "";
    const titles = {
      "guide-cover": "选择封面图",
      "guide-inline": "插入攻略正文图片",
      "guide-collection-image": "选择精选合集图片",
      "experience-cover": "选择行程封面图",
      "experience-gallery": "添加行程图片",
      "experience-day": "选择 Day 图片"
    };
    openMediaPicker(pickerTarget, { category, title: titles[pickerTarget] || "选择城市图片" });
  }
  if (target.matches("[data-close-media-picker]")) closeMediaPicker();
  if (target.matches("[data-pick-media]")) applyPickedMedia(target.dataset.pickMedia);
  if (target.matches("[data-media-usage-target]")) {
    const [type, id] = String(target.dataset.mediaUsageTarget || "").split(":");
    if (type === "guide") {
      switchTab("guides");
      const guide = state.guides.find((item) => item.id === id || item.slug === id);
      if (guide) selectGuide(guide);
    }
    if (type === "city") {
      switchTab("cities");
      const city = state.cities.find((item) => item.id === id || item.slug === id);
      if (city) selectCity(city);
    }
    if (type === "experience") {
      switchTab("experiences");
      const experience = state.experiences.find((item) => item.id === id || item.slug === id);
      if (experience) renderExperienceEditor(experience);
    }
  }
  if (target.matches("[data-upload-city-image]")) {
    const fileInput = $("[data-city-image-file]");
    fileInput.dataset.cityImageField = target.dataset.uploadCityImage;
    fileInput.click();
  }
  if (target.matches("[data-clear-city-image]")) {
    const field = target.dataset.clearCityImage;
    const input = $(`[name="${field}"]`);
    if (input) input.value = "";
    const city = cityDraftFromForm();
    renderCityImagePreview(city);
    setCitySaveStatus("未保存", "dirty");
    setStatus("城市图片已删除，保存后生效。");
    showToast("城市图片已删除，保存后生效");
  }
  if (target.matches("[data-preview-device]")) {
    const preview = $("[data-guide-preview]");
    preview.className = `guide-preview ${target.dataset.previewDevice}`;
  }
  if (target.matches("[data-copy-media]")) {
    try {
      const copied = await copyText(target.dataset.copyMedia);
      if (!copied) throw new Error("Copy failed");
      const previous = target.textContent;
      target.textContent = "✓ 已复制";
      target.disabled = true;
      window.setTimeout(() => {
        target.textContent = previous;
        target.disabled = false;
      }, 1100);
      showToast("素材链接已复制");
    } catch {
      window.prompt("复制素材链接", target.dataset.copyMedia);
    }
  }
  if (target.matches("[data-edit-city]")) selectCity(state.cities.find((item) => item.id === target.dataset.editCity));
  if (target.matches("[data-edit-experience]")) {
    switchTab("experiences");
    renderExperienceEditor(state.experiences.find((item) => item.id === target.dataset.editExperience));
  }
  if (target.matches("[data-journey-preview-mode]")) {
    $$("[data-journey-preview-mode]").forEach((button) => button.classList.toggle("is-active", button === target));
    const preview = $("[data-journey-card-preview]");
    if (preview) preview.dataset.previewMode = target.dataset.journeyPreviewMode;
    renderJourneyCardPreview(syncExperienceForm());
  }
  if (target.matches("[data-toggle-itinerary-preview]")) {
    renderItineraryPreview(readItineraryDays());
    $("[data-itinerary-preview]")?.classList.add("is-open");
  }
  if (target.matches("[data-close-itinerary-preview]")) {
    $("[data-itinerary-preview]")?.classList.remove("is-open");
  }
  if (target.matches("[data-select-day]")) {
    const days = readItineraryDays();
    state.currentExperienceDay = Number(target.dataset.selectDay);
    $("[name='itineraryDays']").value = JSON.stringify(days);
    renderDayEditor();
  }
  if (target.matches("[data-add-day]")) {
    const days = readItineraryDays();
    days.push({ title: `Day ${days.length + 1}`, morning: "", afternoon: "", evening: "", stayNotes: "", image: "" });
    state.currentExperienceDay = days.length - 1;
    $("[name='itineraryDays']").value = JSON.stringify(days);
    renderDayEditor();
    $("[data-experience-save-status]").textContent = "未保存";
  }
  if (target.matches("[data-ai-optimize-day]")) {
    const days = readItineraryDays();
    const day = days[state.currentExperienceDay];
    if (day) {
      day.morning ||= "Slow breakfast, hotel pickup and a calm start shaped around the guest's pace.";
      day.afternoon ||= "Neighborhood time, local cafés, shopping or cultural stops with private support.";
      day.evening ||= "Dinner reservation, skyline moment or quiet wellness recovery.";
      day.stayNotes ||= "Keep timing flexible and adjust around energy, weather and hotel location.";
      $("[name='itineraryDays']").value = JSON.stringify(days);
      renderDayEditor();
      $("[data-experience-save-status]").textContent = "未保存";
      showToast("AI 已优化当前 Day 节奏");
    }
  }
  if (target.matches("[data-ai-day-field]")) {
    const field = $(`[data-day-field="${target.dataset.aiDayField}"]`);
    if (field && !field.value.trim()) {
      field.value = {
        morning: "Slow breakfast, hotel pickup and a calm city entry.",
        afternoon: "Local neighborhoods, cafés, shopping support and flexible private transport.",
        evening: "Dinner reservation, rooftop view or quiet recovery arranged around the guest's pace.",
        stayNotes: "Keep timing soft, confirm transport windows and adjust around energy."
      }[target.dataset.aiDayField] || "";
    } else if (field) {
      field.value = field.value.replace(/\s+/g, " ").trim();
    }
    field?.dispatchEvent(new Event("input", { bubbles: true }));
    showToast("AI 已处理当前段落");
  }
  if (target.matches("[data-upload-experience-cover]")) {
    const input = $("[data-experience-image-file]");
    input.dataset.experienceImageTarget = "cover";
    input.click();
  }
  if (target.matches("[data-upload-experience-gallery]")) {
    const input = $("[data-experience-image-file]");
    input.dataset.experienceImageTarget = "gallery";
    input.click();
  }
  if (target.matches("[data-upload-day-image]")) {
    const input = $("[data-experience-image-file]");
    input.dataset.experienceImageTarget = "day";
    input.click();
  }
  if (target.matches("[data-clear-experience-cover]")) {
    $("[name='coverImage']").value = "";
    renderExperienceImages(syncExperienceForm());
    renderJourneyCardPreview();
  }
  if (target.matches("[data-remove-experience-gallery]")) {
    const gallery = csvToList($("[name='galleryImages']").value);
    gallery.splice(Number(target.dataset.removeExperienceGallery), 1);
    $("[name='galleryImages']").value = listToCsv(gallery);
    renderExperienceImages(syncExperienceForm());
  }
  if (target.matches("[data-clear-day-image]")) {
    const days = readItineraryDays();
    if (days[state.currentExperienceDay]) days[state.currentExperienceDay].image = "";
    $("[name='itineraryDays']").value = JSON.stringify(days);
    renderDayEditor();
  }
  if (target.matches("[data-add-experience-tag]")) {
    const input = $("[data-new-experience-tag]");
    const value = input.value.trim();
    if (!value) return;
    const tags = [...new Set([...getSelectedExperienceTags(), value])];
    input.value = "";
    renderExperienceTags(tags);
    $("[name='tags']").value = listToCsv(tags);
    renderJourneyCardPreview();
  }
  if (target.matches("[data-ai-suggest-tags]")) {
    const draft = syncExperienceForm();
    const text = [draft.title, draft.excerpt, draft.duration, draft.city].join(" ").toLowerCase();
    const suggestions = ["Private"];
    if (/luxury|hotel|skyline|premium/.test(text)) suggestions.push("Luxury", "Design Hotels");
    if (/wellness|spa|beauty|recovery/.test(text)) suggestions.push("Wellness");
    if (/family|kid|children/.test(text)) suggestions.push("Family");
    if (/food|cafe|coffee|dinner/.test(text)) suggestions.push("Food & Café");
    if (/shopping|market|sourcing/.test(text)) suggestions.push("Shopping");
    if (/business|tech|factory|founder/.test(text)) suggestions.push("Business");
    suggestions.push("Slow Travel");
    const tags = [...new Set([...(draft.tags || []), ...suggestions])];
    renderExperienceTags(tags);
    $("[name='tags']").value = listToCsv(tags);
    renderJourneyCardPreview(syncExperienceForm());
    renderExperienceWorkflowStatus(syncExperienceForm());
    showToast("AI 已推荐标签");
  }
  if (target.matches("[data-view-inquiry]")) renderInquiryDetail(state.inquiries.find((item) => item.id === target.dataset.viewInquiry));
  if (target.matches("[data-close-inquiry]")) renderInquiryDetail(null);
  if (target.matches("[data-export-inquiries]")) window.open("/api/admin/inquiries/export", "_blank");
  if (target.matches("[data-copy-inquiry]")) {
    const item = state.inquiries.find((inquiry) => inquiry.id === target.dataset.copyInquiry);
    const text = inquirySummary(item || {});
    try {
      const copied = await copyText(text);
      if (!copied) throw new Error("Copy failed");
      const previous = target.textContent;
      target.textContent = "✓ 已复制";
      target.disabled = true;
      target.classList.add("is-copied");
      window.setTimeout(() => {
        target.textContent = previous;
        target.disabled = false;
        target.classList.remove("is-copied");
      }, 1200);
      showToast("客户咨询摘要已复制");
      setStatus("客户咨询摘要已复制。");
    } catch {
      window.prompt("复制客户咨询摘要", text);
    }
  }
  if (target.matches("[data-copy-contact]")) {
    const item = state.inquiries.find((inquiry) => inquiry.id === target.dataset.copyContact);
    const text = [`姓名：${item?.name || ""}`, `邮箱：${item?.email || ""}`, `WhatsApp / 电话：${item?.phone || item?.whatsapp || ""}`].join("\n");
    try {
      const copied = await copyText(text);
      if (!copied) throw new Error("Copy failed");
      showToast("联系方式已复制");
    } catch {
      window.prompt("复制联系方式", text);
    }
  }
  if (target.matches("[data-copy-field]")) {
    const text = target.dataset.copyValue || "";
    try {
      const copied = await copyText(text);
      if (!copied) throw new Error("Copy failed");
      const previous = target.textContent;
      target.textContent = "已复制";
      target.classList.add("is-copied");
      window.setTimeout(() => {
        target.textContent = previous;
        target.classList.remove("is-copied");
      }, 1200);
      showToast(`${target.dataset.copyLabel || "内容"}已复制`);
    } catch {
      window.prompt("复制内容", text);
    }
  }
  if (target.matches("[data-save-inquiry-notes]")) {
    await api("/api/admin/inquiries", {
      method: "PATCH",
      body: JSON.stringify({
        id: target.dataset.saveInquiryNotes,
        internalNotes: $("[data-detail-notes]").value,
        tags: checkedCrmTags(),
        owner: $("[data-detail-owner]")?.value || "Migo",
        priority: $("[data-detail-priority]")?.value || "",
        activityLabel: "保存内部备注"
      })
    });
    await loadInquiries();
    await loadOverview();
    renderInquiryDetail(state.inquiries.find((item) => item.id === target.dataset.saveInquiryNotes));
    setStatus("内部备注已保存。");
    showToast("✓ 内部备注已保存");
  }
  if (target.matches("[data-mark-spam]")) {
    await api("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: target.dataset.markSpam, status: "spam" }) });
    await loadInquiries();
    renderInquiryDetail(state.inquiries.find((item) => item.id === target.dataset.markSpam));
    setStatus("已标记为垃圾咨询。");
  }
  if (target.matches("[data-archive-inquiry]")) {
    await api("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: target.dataset.archiveInquiry, status: "lost" }) });
    await loadInquiries();
    renderInquiryDetail(state.inquiries.find((item) => item.id === target.dataset.archiveInquiry));
    setStatus("咨询已归档。");
  }

  const deleteMap = [
    ["deleteGuide", "/api/admin/guides", loadGuides],
    ["deleteCity", "/api/admin/cities", loadCities],
    ["deleteExperience", "/api/admin/experiences", loadExperiences],
    ["deleteInquiry", "/api/admin/inquiries", loadInquiries],
    ["deleteMedia", "/api/admin/media", loadMedia]
  ];
  for (const [key, path, loader] of deleteMap) {
    if (target.dataset[key]) {
      if (key === "deleteMedia") {
        const item = state.media.find((media) => media.id === target.dataset[key]);
        const usage = item?.usage || [];
        if (usage.length) {
          const message = `这张图片正在被以下内容使用：\n${usage.map((entry) => `- ${entry.label}`).join("\n")}\n\n删除后可能影响页面显示。确认删除？`;
          if (!window.confirm(message)) return;
        } else if (!window.confirm("确认删除这张未使用图片？")) {
          return;
        }
      }
      await api(`${path}?id=${encodeURIComponent(target.dataset[key])}`, { method: "DELETE" });
      await loader();
      await loadOverview();
      setStatus("已删除。");
    }
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s" && state.guideDraft && !$("[data-panel='guides']")?.classList.contains("is-hidden")) {
    event.preventDefault();
    $("[data-guide-form]")?.requestSubmit();
  }
});

window.addEventListener("beforeunload", (event) => {
  if ($("[data-unsaved-state]")?.classList.contains("is-unsaved")) {
    event.preventDefault();
    event.returnValue = "";
  }
});

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (target.matches("[data-guide-collection-guide]")) {
    updateGuideCollectionGuideSlugs();
  }
  if (target.matches("[data-inquiry-status]")) {
    await api("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: target.dataset.inquiryStatus, status: target.value }) });
    await loadInquiries();
    await loadOverview();
    renderInquiryDetail(state.inquiries.find((item) => item.id === target.dataset.inquiryStatus));
    setStatus("咨询状态已更新。");
  }
  if (target.matches("[data-detail-owner-select]")) {
    await api("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: target.dataset.detailOwnerSelect, owner: target.value }) });
    await loadInquiries();
    renderInquiryDetail(state.inquiries.find((item) => item.id === target.dataset.detailOwnerSelect));
    showToast("负责人已更新");
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches("[data-guide-collection-form] [name='categories']")) {
    const input = $("[data-guide-collection-form] [name='guideSlugs']");
    if (input) input.value = "";
    renderGuideCollectionGuidePicker([]);
  }
});

document.addEventListener("dragstart", (event) => {
  const cityRow = event.target.closest("[data-city-order-id]");
  if (cityRow) {
    draggedCityId = cityRow.dataset.cityOrderId;
    cityRow.classList.add("is-dragging");
    event.dataTransfer?.setData("text/plain", draggedCityId);
    return;
  }
  const block = event.target.closest("[data-block]");
  if (!block) return;
  draggedBlock = { lang: block.dataset.block, index: Number(block.dataset.index) };
  block.classList.add("is-dragging");
});

document.addEventListener("dragend", (event) => {
  event.target.closest("[data-city-order-id]")?.classList.remove("is-dragging");
  draggedCityId = null;
  event.target.closest("[data-block]")?.classList.remove("is-dragging");
});

document.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-block], [data-city-order-id], [data-city-image-drop], [data-media-form], [data-media-modal], [data-visual-editor]")) event.preventDefault();
});

document.addEventListener("dragenter", (event) => {
  event.target.closest("[data-city-image-drop]")?.classList.add("is-drag-over");
});

document.addEventListener("dragleave", (event) => {
  const dropCard = event.target.closest("[data-city-image-drop]");
  if (dropCard && !dropCard.contains(event.relatedTarget)) dropCard.classList.remove("is-drag-over");
});

document.addEventListener("drop", async (event) => {
  const cityImageDrop = event.target.closest("[data-city-image-drop]");
  if (cityImageDrop && event.dataTransfer?.files?.length) {
    event.preventDefault();
    cityImageDrop.classList.remove("is-drag-over");
    await uploadCityImageFile(event.dataTransfer.files[0], cityImageDrop.dataset.cityImageDrop);
    return;
  }
  const mediaDrop = event.target.closest("[data-media-form], [data-media-modal]");
  if (mediaDrop && event.dataTransfer?.files?.length) {
    event.preventDefault();
    const files = [...event.dataTransfer.files].filter((file) => file.type.startsWith("image/"));
    const category = mediaDrop.matches("[data-media-modal]")
      ? ($("[data-picker-category]")?.value || state.mediaPicker?.category || "common")
      : ($("[data-media-form] [name='category']")?.value || "common");
    for (const file of files) await uploadAdminImage(file, category === "unused" ? "common" : category);
    await loadMedia();
    renderMediaPicker();
    showToast(`已上传 ${files.length} 张素材`);
    return;
  }
  const cityRow = event.target.closest("[data-city-order-id]");
  if (draggedCityId && cityRow) {
    event.preventDefault();
    await reorderCities(draggedCityId, cityRow.dataset.cityOrderId);
    return;
  }
  const rawEditor = event.target.closest("[data-raw-editor]");
  if (rawEditor && event.dataTransfer?.files?.length) {
    event.preventDefault();
    rawEditor.focus();
    insertImageFiles(event.dataTransfer.files, event.dataTransfer.files.length > 1);
    return;
  }
  const visualEditor = event.target.closest("[data-visual-editor]");
  if (visualEditor && event.dataTransfer?.files?.length) {
    event.preventDefault();
    visualEditor.focus();
    const file = event.dataTransfer.files[0];
    const kind = file.type.startsWith("audio/") ? "audio" : file.type.startsWith("video/") ? "video" : file.type === "image/gif" ? "gif" : "image";
    insertMediaFiles(event.dataTransfer.files, kind);
    return;
  }
  const richEditor = event.target.closest("[data-rich-editor]");
  if (richEditor && event.dataTransfer?.files?.length) {
    event.preventDefault();
    richEditor.focus();
    insertImageFiles(event.dataTransfer.files, event.dataTransfer.files.length > 1);
    return;
  }
  const coverZone = event.target.closest("[data-cover-dropzone]");
  if (coverZone && event.dataTransfer?.files?.length) {
    event.preventDefault();
    uploadCoverFile(event.dataTransfer.files[0]);
    return;
  }
  const docxZone = event.target.closest("[data-docx-dropzone]");
  if (docxZone && event.dataTransfer?.files?.length) {
    event.preventDefault();
    importDocxFile(event.dataTransfer.files[0]);
    return;
  }
  const targetBlock = event.target.closest("[data-block]");
  if (!draggedBlock || !targetBlock || targetBlock.dataset.block !== draggedBlock.lang) return;
  event.preventDefault();
  const nextIndex = Number(targetBlock.dataset.index);
  if (Number.isNaN(nextIndex) || nextIndex === draggedBlock.index) return;
  syncBlocksFromDom(draggedBlock.lang);
  const blocks = getGuideTranslation(state.guideDraft, draggedBlock.lang).contentBlocks;
  const [moved] = blocks.splice(draggedBlock.index, 1);
  blocks.splice(nextIndex, 0, moved);
  draggedBlock = null;
  renderBlockEditors();
  renderTranslationStatus();
  renderGuidePreview();
  setUnsaved(true);
  scheduleGuideAutosave();
});

document.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-raw-editor], [data-rich-editor], [data-cover-dropzone], [data-docx-dropzone], [data-city-image-drop], [data-media-form], [data-media-modal]")) event.preventDefault();
});

async function uploadCoverFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  setStatus("正在上传封面图...");
  const media = await uploadAdminImage(file, "guides");
  syncGuideFromForm();
  state.guideDraft.coverImage = media.url;
  state.guideDraft.coverAlt = media.alt || file.name;
  $("[name='coverImage']").value = media.url;
  $("[name='coverAlt']").value = media.alt || file.name;
  renderGuideCardImagePreview(state.guideDraft);
  renderGuidePreview();
  setUnsaved(true);
  setStatus("封面图已上传。");
}

async function uploadCityImageFile(file, field) {
  if (!file || !file.type.startsWith("image/") || !field) return;
  setStatus("正在上传城市图片...");
  try {
    setCitySaveStatus("正在上传图片...", "saving");
    const media = await uploadAdminImage(file, "cities");
    const input = $(`[name="${field}"]`);
    if (input) input.value = media.url;
    const city = cityDraftFromForm();
    renderCityImagePreview(city);
    setCitySaveStatus("未保存", "dirty");
    setStatus("城市图片已上传，记得保存城市。");
    showToast("✓ 图片已上传到素材中心");
  } catch (error) {
    setCitySaveStatus("上传失败，请重试", "error");
    setStatus(`城市图片上传失败：${error.message}`);
    showToast(error.message);
  }
}

async function uploadExperienceImageFile(file, target) {
  if (!file || !file.type.startsWith("image/") || !target) return;
  setStatus("正在上传行程图片...");
  try {
    const media = await uploadAdminImage(file, "trips");
    if (target === "cover") {
      $("[name='coverImage']").value = media.url;
    }
    if (target === "gallery") {
      const gallery = csvToList($("[name='galleryImages']").value);
      gallery.push(media.url);
      $("[name='galleryImages']").value = listToCsv(gallery);
    }
    if (target === "day") {
      const days = readItineraryDays();
      days[state.currentExperienceDay] ||= { title: `Day ${state.currentExperienceDay + 1}` };
      days[state.currentExperienceDay].image = media.url;
      $("[name='itineraryDays']").value = JSON.stringify(days);
      renderDayEditor();
    }
    const draft = syncExperienceForm();
    renderExperienceImages(draft);
    renderJourneyCardPreview(draft);
    renderExperienceWorkflowStatus(draft);
    renderItineraryPreview(draft.itineraryDays || []);
    $("[data-experience-save-status]").textContent = "未保存";
    setStatus("行程图片已上传，记得保存。");
    showToast("行程图片已上传");
  } catch (error) {
    setStatus(`行程图片上传失败：${error.message}`);
    showToast(error.message);
  }
}

async function importDocxFile(file) {
  if (!file || !file.name.toLowerCase().endsWith(".docx")) {
    showToast("请上传 .docx 文件");
    return;
  }
  setStatus("正在导入 Word 攻略...");
  const dataUrl = await fileToDataUrl(file);
  try {
    const response = await api("/api/import/docx", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, dataUrl })
    });
    syncGuideFromForm();
    const translation = getGuideTranslation(state.guideDraft, state.currentGuideLang);
    translation.rawContent = response.data.rawContent;
    translation.htmlContent = response.data.htmlContent;
    if (!translation.title || translation.title === "Untitled Guide" || translation.title === "未命名攻略") translation.title = response.data.title;
    if (!translation.excerpt) translation.excerpt = response.data.excerpt;
    if (response.data.coverImage && !state.guideDraft.coverImage) {
      state.guideDraft.coverImage = response.data.coverImage;
      state.guideDraft.coverAlt = response.data.title;
    }
    renderGuideEditor();
    setUnsaved(true);
    setStatus("Word 攻略已导入。");
    showToast("Word 攻略已导入");
  } catch (error) {
    setStatus(error.message);
    showToast(error.message);
  }
}

["input", "change"].forEach((eventName) => {
  document.addEventListener(eventName, (event) => {
    if (event.target.matches("[data-inquiry-search], [data-filter-status], [data-filter-city], [data-filter-dates], [data-filter-created], [data-filter-stay], [data-filter-travelers]")) {
      renderInquiryList();
    }
    if (event.target.matches("[data-guide-search], [data-guide-filter-city], [data-guide-filter-category], [data-guide-filter-language], [data-guide-filter-status], [data-guide-filter-date], [data-guide-sort]")) {
      renderGuideList();
    }
    if (event.target.matches("[data-city-search], [data-city-filter]")) {
      renderCityList();
    }
    if (event.target.matches("[data-experience-search], [data-experience-filter-type]")) {
      renderExperienceList();
    }
    if (event.target.matches("[data-template-search]")) {
      renderTemplateList();
    }
    if (event.target.closest("[data-template-form]")) {
      const draft = templateDraftFromForm();
      $("[data-current-template-title]").textContent = draft.title || "未命名模板";
      $("[data-template-save-status]").textContent = "未保存";
      renderTemplatePreview();
    }
    if (event.target.closest("[data-city-form]")) {
      if (event.target.name === "name") {
        const slugInput = $("[data-city-form] [name='slug']");
        if (slugInput && (!slugInput.value || slugInput.dataset.autoSlug === "true")) {
          slugInput.value = citySlugFromName(event.target.value);
          slugInput.dataset.autoSlug = "true";
        }
      }
      if (event.target.name === "slug") {
        event.target.value = citySlugFromName(event.target.value);
        event.target.dataset.autoSlug = event.target.value ? "false" : "true";
      }
      const city = cityDraftFromForm();
      $("[data-current-city-title]").textContent = city.name || "未命名城市";
      $("[data-city-page-preview]").textContent = `最终页面地址：/cities/${city.slug || ""}`;
      renderCityAssociations(city);
      renderCityImagePreview(city);
      renderCityCardPreview(city);
      setCitySaveStatus("未保存", "dirty");
    }
    if (event.target.closest("[data-experience-form]")) {
      if (event.target.name === "title") {
        const slugInput = $("[data-experience-form] [name='slug']");
        if (slugInput && (!slugInput.value || slugInput.dataset.autoSlug === "true")) {
          slugInput.value = experienceSlugFromTitle(event.target.value);
          slugInput.dataset.autoSlug = "true";
        }
      }
      if (event.target.name === "slug") {
        event.target.value = experienceSlugFromTitle(event.target.value);
        event.target.dataset.autoSlug = event.target.value ? "false" : "true";
      }
      if (event.target.matches("[data-experience-type]")) renderExperienceTypeEditor();
      if (event.target.matches("[data-day-field]")) {
        const days = readItineraryDays();
        $("[name='itineraryDays']").value = JSON.stringify(days);
        renderDayListTitles(days);
        renderItineraryPreview(days);
      }
      if (event.target.matches("[data-short-field]")) {
        $("[name='shortDetails']").value = JSON.stringify(readShortDetails());
      }
      if (event.target.closest("[data-experience-tag]")) {
        $("[name='tags']").value = listToCsv(getSelectedExperienceTags());
      }
      const draft = syncExperienceForm();
      $("[data-current-experience-title]").textContent = draft.title || "未命名行程";
      $("[data-experience-page-preview]").textContent = `最终页面地址：/trips/${draft.slug || ""}`;
      renderJourneyCardPreview(draft);
      renderExperienceWorkflowStatus(draft);
      renderItineraryPreview(draft.itineraryDays || []);
      $("[data-experience-save-status]").textContent = "未保存";
    }
    if (event.target.matches("[data-related-search]")) {
      renderRelatedSelect();
    }
    if (event.target.matches("[data-raw-editor]")) {
      applySlashCommand(event.target);
      autoSizeEditor(event.target);
      updateWordCount(event.target);
      updateSelectionAiToolbar();
    }
    if (event.target.matches("[data-visual-editor]")) {
      state.currentGuideLang = event.target.dataset.visualEditor || state.currentGuideLang;
      recordVisualInputHistory(state.currentGuideLang);
      syncRawFromVisualEditor(state.currentGuideLang);
      updateSelectionAiToolbar();
    }
    if (event.target.matches("[data-card-scale]")) {
      syncGuideFromForm();
      renderGuideCardImagePreview(state.guideDraft);
      renderGuidePreview();
      setUnsaved(true);
      scheduleGuideAutosave();
    }
    if (event.target.closest("[data-guide-form]")) {
      syncGuideFromForm();
      $("[data-editor-title]").textContent = state.guideDraft.title || "未命名攻略";
      if ($("[data-editor-status]")) $("[data-editor-status]").textContent = zhStatus(state.guideDraft.status);
      if (event.target.name === "coverImage") {
        renderGuideCardImagePreview(state.guideDraft);
      }
      renderGuidePreview();
      renderTranslationStatus();
      renderGuideWorkflowStatus(state.guideDraft);
      setUnsaved(true);
      scheduleGuideAutosave();
    }
    if (event.target.matches("[data-cover-file]")) {
      uploadCoverFile(event.target.files?.[0]);
    }
    if (event.target.matches("[data-city-image-file]")) {
      uploadCityImageFile(event.target.files?.[0], event.target.dataset.cityImageField);
      event.target.value = "";
    }
    if (event.target.matches("[data-experience-image-file]")) {
      uploadExperienceImageFile(event.target.files?.[0], event.target.dataset.experienceImageTarget);
      event.target.value = "";
    }
    if (event.target.matches("[data-docx-file]")) {
      importDocxFile(event.target.files?.[0]);
    }
    if (event.target.matches("[data-picker-search], [data-picker-category]")) {
      renderMediaPicker();
    }
    if (event.target.matches("[data-picker-upload]")) {
      const category = $("[data-picker-category]")?.value || state.mediaPicker?.category || "common";
      const files = [...(event.target.files || [])].filter((file) => file.type.startsWith("image/"));
      (async () => {
        for (const file of files) await uploadAdminImage(file, category === "unused" ? "common" : category);
        await loadMedia();
        renderMediaPicker();
        showToast(`已上传 ${files.length} 张素材`);
        event.target.value = "";
      })();
    }
    if (event.target.matches("[data-media-search], [data-media-category-filter]")) {
      loadMedia();
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (event.target.closest("[data-format-inline], [data-editor-command]")) {
      rememberVisualSelection();
      event.preventDefault();
    }
  });

  document.addEventListener("selectionchange", () => {
    rememberVisualSelection();
    if (document.activeElement?.matches?.("[data-raw-editor], [data-visual-editor]")) updateSelectionAiToolbar();
  });

  document.addEventListener("keyup", (event) => {
    if (event.target?.matches?.("[data-raw-editor], [data-visual-editor]")) {
      rememberVisualSelection();
      updateSelectionAiToolbar();
    }
  });

  document.addEventListener("mouseup", (event) => {
    if (event.target?.matches?.("[data-raw-editor], [data-visual-editor]")) {
      rememberVisualSelection();
      updateSelectionAiToolbar();
    }
  });
});

api("/api/auth/session")
  .then(async (session) => {
    if (session.authenticated) {
      showDashboard();
      await refreshAll();
    } else {
      showLogin();
    }
  })
  .catch(() => showLogin());
