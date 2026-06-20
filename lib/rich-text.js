import sanitizeHtml from "sanitize-html";

const options = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "hr",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    }),
    img: sanitizeHtml.simpleTransform("img", {
      loading: "lazy",
    }),
  },
};

export function sanitizeRichText(value) {
  const html = sanitizeHtml(String(value || "").trim(), options).trim();
  return html === "<p></p>" ? "" : html;
}

export function renderRichText(value) {
  const content = String(value || "").trim();
  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return sanitizeRichText(content);

  const escaped = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} });
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
