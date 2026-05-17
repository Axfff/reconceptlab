# Page Specs

## Home page

Goal: instantly communicate "interactive visual CS knowledge graph."

Required sections:
1. Navbar
2. Hero
3. "How it works" four-step explanation
4. Featured concept cards
5. Graph preview
6. Roadmap preview
7. Footer

Hero visual:
- subtle graph-paper background
- lab flask / connected nodes motif
- small floating cards:
  - code snippet
  - mini graph
  - "try a naive approach" annotation
- CTA buttons:
  - Start Exploring
  - Explore the Graph

Hero copy:
- EN: Re-invent computer science visually.
- ZH: 用可视化和交互，重新发明计算机科学概念。

## Knowledge graph page

Goal: make the graph useful, not merely decorative.

Required:
- title and subtitle
- filter panel
- graph canvas or placeholder visualization
- edge legend
- concept preview card
- mini map or fit/reset controls if already feasible

Node states:
- current path
- available
- locked / prerequisite missing
- completed
- draft

Edge styles:
- prerequisite: solid arrow
- generalizes: blue line
- contrasts: dashed
- used-in: green
- related: neutral

## Roadmaps page

Goal: curated paths through the graph.

Cards:
- CS Foundations
- Data Structures & Algorithms
- Systems Basics
- Theory Foundations

Each card:
- visual icon
- short description
- concept count
- progress bar placeholder
- CTA

## Concept page

Goal: make one idea easy to reconstruct.

Required layout:
- breadcrumb
- title
- short description
- badges
- language toggle
- progress indicator
- left/main content
- right sidebar on desktop
- interactive lab section
- connections section

Default section structure:
1. The Problem
2. Naive Approach
3. Where It Fails
4. The Idea
5. Interactive Lab
6. Implementation
7. Complexity
8. Connections
9. Exercise

## Design system demo page

Create an internal route if useful:

```text
/en/design-system
```

It should show:
- colors
- typography
- buttons
- badges
- callouts
- cards
- lab panel shell
- graph nodes
- dark mode preview if easy
