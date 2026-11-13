---
title: "Fractal Patterns: SVG backgrounds with contrast you can trust"
description: "Repeating SVG tiles from seeded math or your own image. A WCAG 2.2 worst-case contrast check. The bytes and CO₂ of every export."
draft: true
---

[← back to blog](..)

# Fractal Patterns: SVG backgrounds with contrast you can trust

*Project notes. [Fractal Patterns](https://patterns.pierreguilbert.com) is a free tool that I built. Its code has the MIT license. The numbers below come from its README.*

## Summary

Fractal Patterns makes repeating SVG background tiles from seeded math or from your own image. A seed is a number that gives the same pattern each time you use it. The tool tests the text on top against the WCAG 2.2 contrast thresholds, in the worst case over the pattern. It also shows the bytes and the CO₂ estimate of the export. The export is plain CSS with the tile inside it as an SVG data URI.

## The itch

Hero Patterns gives you good tiles from a fixed list. I like it, and I wanted more than a list. I also wanted the tool to tell me two things about each tile: the contrast of the text on top, and the weight.

I wanted three things:

1. Patterns from math with a seed, so that I can get a new pattern and get the same pattern back.
2. Text that stays readable on top, by the rules of WCAG 2.2 and not by my eyes on a good screen.
3. The cost on the page, in bytes and CO₂, for every design.

## What it does

The page draws 76 pattern kinds in six families: Fractals (8), Line art (4), Surfaces (13), Symmetry groups (17), Themes (27) and Quasicrystals (7).

The Symmetry family has all 17 wallpaper groups. These are the 17 ways to repeat a motif over a plane with mirrors, turns and glides. The Themes include Topography, Maze, Knotwork and Chladni figures. The Quasicrystals family has Penrose rhombs and arcs, and tilings with eightfold and twelvefold order.

You can also trace your own image. The page has seven edge detectors. Canny is the default, and XDoG is good for ink lines. The page turns the edge pixels into lines, and an option replaces the lines with Bézier curves. The image stays in your browser. The page uploads nothing.

A repeating tile has one problem: the eye finds the grid. The Repetition tab has three answers:

- Reduce repetition builds one larger tile from several seeded variants. No two neighbor cells are the same, also across the tile edge.
- Second layer puts a second copy on top at a different size. The two layers line up again only at a much larger distance.
- Parallax on scroll: during a page scroll, the two layers move at different speeds.

The parallax CSS sits inside a `prefers-reduced-motion: no-preference` query. Visitors who ask for less motion get none.

The export is a CSS class. This is its shape, from `src/export.ts`, with the values and the data URI shortened:

```css
.fp-pattern {
  --fp-bg: …;
  --fp-ink: …;
  --fp-tile: url("data:image/svg+xml,…");
  --fp-size: …px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background-color: var(--fp-bg);
  color: var(--fp-ink);
}
```

The pattern sits on a `::before` layer, so it can turn or drift while the text stays still. If you put a plate behind the text, the export adds an `.fp-plate` class. A plate is a box of solid color between the pattern and the text.

## Three things I learned

### 1. Contrast over a pattern is a worst-case question

A contrast checker takes two colors. Text over a pattern has at least three surfaces under it. These are the plain background, the strokes, and the optional fill of closed shapes. A letter crosses all of them.

So the page computes two ratios. The first is text on the background. The second is text on the pattern, blended over the background at its opacity. The page uses the lower ratio. A second layer makes it worse. Where both layers cross, the stroke opacity becomes `1 - (1 - o) × (1 - o × p)`. Here `o` is the pattern opacity and `p` is the strength of the second layer.

If the contrast fails, the page shows two buttons: "Fix contrast for AA (4.5:1)" and "Fix contrast for AAA (7:1)". Without a plate, the fix moves the text toward black or white. Then it lowers the pattern opacity in steps of 0.05. With a plate, it raises the plate opacity first. After a fix, the page names each change. If it cannot reach the target, it applies the best result and tells you.

### 2. A seamless tile is a torus

In a tile that repeats without a seam, the left edge joins the right edge, and the top joins the bottom. That shape is a torus, the surface of a ring. Every line that leaves the tile on one side must come back in on the opposite side. The generators cut and wrap each line by that rule.

Quasicrystals are the hard case. A Penrose tiling has fivefold order and never repeats. A CSS background must repeat. So the page draws a periodic approximant: a tile that repeats exactly and looks like the tiling that never repeats. The Penrose kinds come from the pentagrid method of de Bruijn and use a rectangular tile. The eightfold and twelvefold kinds use a square tile.

The hexagonal wallpaper groups have the same limit. Their tile is 1 wide by √3 high, because a hexagonal lattice repeats in that rectangle.

### 3. Bytes are a design material

The Export tab shows the size of the tile SVG, the gzipped size of the exported CSS, and the footprint. The browser computes the gzipped size itself with `CompressionStream`.

The CO₂ estimate is a straight line from the gzipped size. It uses the same constant as the footer of this site: one websitecarbon.com measurement of pierreguilbert.com, 5.76 KB for 0.001144 g. The estimate is rough. The page names the things that it does not count: the rest of your page, caching, and the energy to draw the pattern.

Drift, a slow continuous movement of the pattern, has its own line. Drift paints the layer again on every frame. The page assumes 0.5 W of extra power and 480 g CO₂ per kWh, which gives about 4 mg per minute. These are assumptions, not measurements.

A small tile is the goal, but it is a soft goal. Most kinds stay near or under 20,000 characters of SVG at their deepest level. The hexagonal groups go up to about 70,000. The page permits heavier designs. It shows the cost, and you decide.

## Palettes and APCA

The palettes follow two studies of color preference by Palmer and Schloss, from 2010 and 2011. People prefer hues that are close together, cool grounds, and saturated figures on calm grounds. The palettes keep those rules, and a button draws a random palette inside them. The numbers in the rules are my own choices, not values from the studies.

WCAG 2.2 stays the rule that the tool tests against. Next to it, the page shows the APCA value as information. APCA, the Accessible Perceptual Contrast Algorithm, is a candidate method for WCAG 3. The page uses the official `apca-w3` package without changes. That package has its own license, which is not MIT.

A "Second opinion" panel adds three more checks. It gives the CIE L* lightness difference. If the lightness of the text is between the lightness of the two surfaces, it warns you. It shows the colors for protan, deutan and tritan color vision, after Machado, Oliveira and Fernandes (2009).

## How I built it

The stack is TypeScript, Vue and Vite. The page ships two libraries, Vue and `apca-w3`. The other entries in `package.json` are development tools (oxlint, oxfmt, vue-tsc). The tests use plain `node --test`, with one test file next to each logic module. GitHub Actions runs the lint, the format check, the type check, the tests and the build. Then it publishes the site to GitHub Pages.

I built it with an AI coding agent and a ticket system. Each ticket had a check that a machine can run. The check, not the agent, decided that a ticket was done.

## The Wallpaper Studio

The second page is the [Wallpaper Studio](https://patterns.pierreguilbert.com/studio.html). It makes botanical wallpapers in three themes: Floral, Sea and Orchard. Each theme has six motif families. The page grows each wallpaper from a seed, as stems, motifs, twigs and small filler shapes. It builds every motif from plain geometry and contains no copy of an existing design.

You can also turn your own drawing, image or SVG file into a motif. Your image stays in your browser. Use only images that you own or have a license for.

## Try it

- The tool: [patterns.pierreguilbert.com/fractal-patterns](https://patterns.pierreguilbert.com/)
- The studio: [patterns.pierreguilbert.com/studio.html](https://patterns.pierreguilbert.com/studio.html)
- The source: [github.com/guilbep/fractal-patterns](https://github.com/guilbep/fractal-patterns)

The tool is free. If it saves you time, you can [sponsor the work on GitHub](https://github.com/sponsors/guilbep).

Pierre
