---
title: Design prototype (UX reference)
updated: 2026-05-12
status: current
owner: jaren
---

# Design prototype — the UX reference

The current visual/UX reference is the **Claude Design** handoff bundle at `../../../claude-design-files/` (i.e. `Stride/claude-design-files/`, a sibling of the `stride/` monorepo — not inside it).

## What's authoritative vs not

- **Authoritative:** the **flows**, the **screen inventory** ([`../product/surfaces.md`](../product/surfaces.md)), and the **data model** ([`../product/data-model.md`](../product/data-model.md)). The user's stance, in his words: *"I'm ironing out UX before diving into UI"* / *"your UI kinda sucks in most areas but I'm fine with that as long as it is cheap and fast — I want to nail down experiences before nailing down a design library."*
- **Not authoritative:** the visual style, the layout pixels, and the prototype's internal code structure. The `SketchKit.jsx` primitives (`<T s={16} w={700}>`, `SK.line2`, `<Row>/<Col>`) are terse prototyping shorthand — **not** a design system to copy. The real component library is built fresh in `packages/ui` per `.cursor/rules/ui-components.mdc` (Base UI + CSS Modules + Phosphor + atomic design).

## Where things are

```
claude-design-files/
  PRODUCT.md                         old location of the strategy doc — canonical copy is now docs/PRODUCT.md
  stride/
    README.md                        the handoff "read this first" — says the CHAT is where intent lives
    chats/chat1.md, chat2.md         the design conversation — read for the "why" behind decisions  ← mine these
    project/
      Stride App.html                the current prototype (React UMD + Babel-standalone in browser)
      app/Store.jsx                  the mock data store — the data model lives here
      app/Shell.jsx                  the app shell / left-rail nav
      app/{Today,Backlog,Schedule,SpecModal,Insights,Tray}.jsx   the screens
      components/SketchKit.jsx        the prototype's throwaway primitive kit
      components/Round{2,3,4}.jsx, Refine.jsx, PersonasAndEdges.jsx, ...   iteration artifacts
      Stride Wireframes.html + components/   earlier rough wireframes — superseded
      Stride Prototype.html + proto/         earlier multi-chapter clickable prototype — superseded
      .impeccable/, design-canvas.jsx, tweaks-panel.jsx   impeccable live-mode + design-tool scaffolding
```

## How to use it

- Need to know *what a screen does or how a flow works* → read the relevant `.jsx` in `project/app/` (and the chat for the reasoning). Don't render it in a browser — the README says everything you need is in the source.
- Building that screen for real → translate the *behavior and data*, not the markup, into `apps/web` + `packages/ui` per the conventions. Use `$impeccable craft`.
- The chat transcripts (`chats/chat{1,2}.md`) record what the user actually wanted, what was discarded and why, and the microcopy he rejected — worth a read before any UX call on these screens.

## Status

The prototype is **read-only reference** going forward. Active design iteration moves to `apps/web` (with `$impeccable live` against the TanStack Start dev server) in Phase 2. There's an older, *different* prototype concept in `Figma Make Files/` — see [`archived.md`](archived.md).
