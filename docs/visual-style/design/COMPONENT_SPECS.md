# Component Specs

## Card

Purpose: base container for notebook/lab panels.

Visual:
- white or dark surface
- 1px border
- large radius
- soft shadow
- optional subtle graph-paper background in hero/lab use only

Variants:
- default
- elevated
- lab
- interactive
- compact

## Callout

Base props:

```ts
type CalloutVariant = "intuition" | "try" | "pitfall" | "invariant" | "note";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}
```

Visual semantics:

```text
Intuition -> blue, lightbulb/spark icon
Try It    -> orange, experiment/play icon
Pitfall   -> red-orange, warning icon
Invariant -> green, check/anchor icon
Note      -> neutral blue-gray
```

## LabPanel

Purpose: consistent shell for interactive demos.

Required regions:
- title
- one-sentence instruction
- controls slot
- visualization slot
- state/trace slot
- current-step explanation slot
- optional quiz/prediction slot

Desktop layout:
- controls left or top-left
- visualization center
- state trace right
- explanation bottom

Mobile layout:
- title/instruction
- visualization
- controls
- state trace
- explanation

Do not rely on color alone:
- active node should have both color and stroke/label
- visited node should have label or distinct outline
- queue/stack entries should be text-visible

## ConceptNodeBadge

Purpose: small badge for concept metadata.

Examples:
- Algorithm
- Graph
- Beginner
- Interactive
- Draft
- Reviewed

## SectionHeader

Purpose: consistent headers in concept pages.

Should support:
- numeric section index
- title
- short subtitle
- optional right-side badge

## ProgressRail

Purpose: show concept page structure and current section.

Desktop:
- sticky sidebar
- section list
- prerequisites/completion status

Mobile:
- collapsible top progress component

## ThemeToggle

Requirement:
- supports system/light/dark if project already has theme logic
- otherwise implement light/dark minimally
- persist preference in localStorage
- avoid flashing theme if possible

## LanguageToggle

Requirement:
- switches between `/en/...` and `/zh/...` for the same concept ID when available
- if translated page does not exist, show disabled state or fallback clearly
