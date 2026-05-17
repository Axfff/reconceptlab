# Bilingual UI Notes

ReConcept Lab starts with English and Simplified Chinese.

## Language identity

- English route prefix: `/en`
- Simplified Chinese route prefix: `/zh`
- Use stable language-independent concept IDs.
- Do not duplicate visual component logic per language.

## Typography

Use a font stack that supports English and Simplified Chinese:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Noto Sans SC",
  "PingFang SC",
  "Microsoft YaHei",
  sans-serif;
```

## Layout concerns

Chinese text can be denser than English. Do not set overly small line heights.

Recommended:
- body line-height: 1.65 for articles
- UI line-height: 1.4-1.5
- concept page max width around 720-780px for main prose

## UI string handling

Use shared dictionaries for UI chrome:

```ts
const ui = {
  en: {
    explore: "Explore",
    graph: "Graph",
    roadmaps: "Roadmaps",
    startExploring: "Start Exploring"
  },
  zh: {
    explore: "探索",
    graph: "图谱",
    roadmaps: "路线图",
    startExploring: "开始探索"
  }
}
```

## Content handling

For concept pages:
- Keep each language as independent MDX content.
- Use the same `conceptId` in frontmatter.
- Let both pages share interactive components and trace data.

Example:

```text
src/content/nodes/en/bfs.mdx
src/content/nodes/zh/bfs.mdx
```
