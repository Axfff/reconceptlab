import type { Locale } from "./locales";

export const ui = {
  en: {
    siteTitle: "CS Knowledge Graph",
    siteDescription: "A visual, interactive map for learning computer science concepts by reinvention.",
    home: "Home",
    graph: "Graph",
    concepts: "Concepts",
    language: "Language",
    draft: "Draft",
    published: "Published",
    archived: "Archived",
    readMore: "Read more",
    step: "Step",
    reset: "Reset",
    queue: "Queue",
    frontier: "Frontier",
    prerequisites: "Prerequisites",
    next: "Next",
    graphConnections: "Graph connections",
    unavailable: "Page coming soon",
    selectedNode: "Selected node",
    visualGraph: "Visual concept graph",
    accessibleGraphList: "Accessible graph list",
    currentState: "Current state",
    none: "None"
  },
  zh: {
    siteTitle: "CS 知识图谱",
    siteDescription: "用可视化和互动方式，从问题出发重新发明计算机科学概念。",
    home: "首页",
    graph: "图谱",
    concepts: "概念",
    language: "语言",
    draft: "草稿",
    published: "已发布",
    archived: "已归档",
    readMore: "继续阅读",
    step: "下一步",
    reset: "重置",
    queue: "队列",
    frontier: "前沿",
    prerequisites: "前置概念",
    next: "后续概念",
    graphConnections: "图谱连接",
    unavailable: "页面即将补充",
    selectedNode: "选中的节点",
    visualGraph: "可视化概念图",
    accessibleGraphList: "可访问图谱列表",
    currentState: "当前状态",
    none: "无"
  }
} as const;

export function t(lang: Locale, key: keyof typeof ui.en): string {
  return ui[lang][key];
}
