---
title: "Why inline ternaries don't belong in your Vue templates"
description: "Inline `? :` in templates costs you readability, testability, and a free layer of caching. Computed properties give all three back."
date: 2026-05-29
draft: false
---

[← back to blog](..)

# Why inline ternaries don't belong in your Vue templates

_A template is a description of UI structure. The moment it starts branching, constructing strings, or calling functions, it stops describing and starts computing — and Vue already has a better place for that._

## TL;DR

Move `? :`, `&&`, string concatenation, and multi-call expressions out of the template and into a `computed`. You get a readable, declarative template, logic you can name, log, and unit-test, and — because computed properties are cached on their reactive dependencies — fewer recalculations during re-render. The template should read like UI; the logic should live in JS/TS.

## The problem with inline template logic

Templates are supposed to read top-to-bottom like the markup they produce. Inline conditions break that. Every one of these is a real cost, not a style preference:

| Problem | Why it hurts |
| --- | --- |
| **Hard to scan** | Templates should read like UI structure, not branching code. Inline conditions interrupt visual comprehension. |
| **Logic duplicates** | Small expressions grow into nested chains like `a ? b : c ? d : e`, then get copy-pasted across components. |
| **i18n gets noisy** | `$t(...) + ' ' + $t(...)` inside a condition turns a one-line label into an unreadable block. |
| **Debugging is worse** | You can't drop a `console.log`, set a breakpoint, or isolate an intermediate value inside a template expression. |
| **Testing is harder** | Inline expressions can't be unit-tested directly — you have to mount the component to exercise them. |
| **Refactoring cost grows** | Hidden logic in templates resists change and spreads by copy-paste. |
| **"Smart templates"** | Templates quietly become business-logic engines instead of declarative views. |
| **Poor naming** | An expression communicates no intent. `validationTooltip` says what it is; `isValidated ? … : …` makes you read the whole thing. |
| **Worse tooling** | Inline expressions are harder for the editor to autocomplete, typecheck, refactor, and navigate. |
| **Performance** | Complex inline expressions re-evaluate on every render cycle. Computed values are cached until a dependency changes. |

## Why computed properties win

The fix is boring and it's been in the framework the whole time:

| Benefit | Why it matters |
| --- | --- |
| Declarative templates | The template stays readable and UI-focused. |
| Separation of concerns | Rendering stays in the template; logic stays in JS/TS. |
| Named intent | `validationTooltip` explains itself at the call site. |
| Reusability | The same logic feeds template, methods, tests, and composables. |
| Easier debugging | You can log and breakpoint inside a computed. |
| Easier testing | Computeds are plain functions of reactive state — unit-test them directly. |
| Easier refactoring | Logic evolves without bloating the template. |
| Better tooling | IDEs understand computed properties far better than inline expressions. |
| Cached automatically | Vue recomputes only when a dependency changes. |
| Scales | Large codebases stay maintainable and consistent. |

## The performance point

This is the part people skip, so it's worth being precise. **A function call or expression in a template runs on every re-render of that component.** Vue can't know whether the result changed, so it runs it again every time the component's render function executes:

```vue
<!-- runs on every re-render, every time -->
{{ expensiveFunction(user) }}
{{ a ? computeA() : computeB() }}
```

A `computed` is cached against its reactive dependencies. It only re-runs when one of the values it read last time actually changes:

```ts
const displayLabel = computed(() => {
  if (isValidated.value) {
    return computeValidatedLabel()
  }
  return computeUnvalidatedLabel()
})
```

Read `displayLabel` ten times in a render and it computes once. Re-render for an unrelated reason and it doesn't recompute at all. The payoff scales with the thing you're rendering:

- fewer recalculations,
- more predictable rendering,
- no accidental expensive work in the hot render path,
- safe for large lists, tables, and frequently-updating components.

## DO vs DON'T

### A conditional label

**DON'T** — branch and concatenate i18n strings inline:

```vue
<q-tooltip
  anchor="center right"
  self="center left"
  :offset="[6, 0]"
  class="sidebar-tooltip"
>
  {{
    isValidated
      ? $t('common_unvalidate_short') + ' ' + $t(type)
      : $t('common_validate_short') + ' ' + $t(type)
  }}
</q-tooltip>
```

**DO** — name the intent, build the string once in a computed:

```ts
const validationTooltip = computed(() => {
  const action = isValidated.value
    ? t('common_unvalidate_short')
    : t('common_validate_short')
  return `${action} ${t(type)}`
})
```

```vue
<q-tooltip
  anchor="center right"
  self="center left"
  :offset="[6, 0]"
  class="sidebar-tooltip"
>
  {{ validationTooltip }}
</q-tooltip>
```

The template now reads as "a tooltip showing the validation tooltip." The string-building is testable in isolation, and the `$t` noise is gone from the markup.

### A conditional `:style`

**DON'T** — return whole style objects from a ternary in the template:

```vue
:style="
  props.moduleType === MODULES.Buildings
    ? {
        '--row-alt-color': '#f8fafc',
        '--table-header-bg': moduleColors.bgColorLighter,
      }
    : { '--row-alt-color': '#f8fafc' }
"
```

```vue
:style="
  isValidated
    ? {
        borderColor: moduleColors.buttonTextColor,
        color: moduleColors.buttonTextColor,
      }
    : {
        background: moduleColors.bgColorLighter,
        color: moduleColors.buttonTextColor,
        border: `1px solid ${moduleColors.buttonTextColor}`,
      }
"
```

**DO** — prefer a class for the *variant*, and let CSS custom properties (computed once) carry the dynamic values. Branch with `:class`, theme with `--vars`:

```ts
const tableVars = computed(() => ({
  '--row-alt-color': '#f8fafc',
  '--table-header-bg': moduleColors.value.bgColorLighter,
}))
```

```vue
<table
  :class="{ 'is-buildings': props.moduleType === MODULES.Buildings }"
  :style="tableVars"
>
```

```css
.is-buildings {
  /* variant-specific rules live in CSS, where they belong */
}
```

For the button, the same move — one class toggle, the colours as variables:

```ts
const buttonVars = computed(() => ({
  '--btn-fg': moduleColors.value.buttonTextColor,
  '--btn-bg': moduleColors.value.bgColorLighter,
}))
```

```vue
<button :class="{ 'is-validated': isValidated }" :style="buttonVars">
```

```css
.is-validated {
  border-color: var(--btn-fg);
  color: var(--btn-fg);
}
button:not(.is-validated) {
  background: var(--btn-bg);
  color: var(--btn-fg);
  border: 1px solid var(--btn-fg);
}
```

Styling rules go to the stylesheet, dynamic theme values flow through cached custom properties, and the template just says "this button is validated or it isn't." (If you'd rather keep the whole object in JS, a single `computed` returning the style object still beats an inline ternary — the point is to get the branch out of the template.)

## The heuristic

You don't need a rule per case. One test covers almost all of it. If a template expression contains:

- `? :`
- `&&` (used to compute, not just to gate `v-if`)
- string concatenation
- more than one function call

→ move it to a computed property.

And the inverse — what's fine to leave in the template:

- property access (`user.name`)
- simple bindings (`:href="url"`)
- loops (`v-for`)
- visibility conditions (`v-if="isOpen"`)

## When not to bother

Computed properties aren't free — they carry dependency-tracking overhead — and the goal is readable code, not maximal indirection. Leave it inline when:

- The expression is genuinely trivial: `{{ count + 1 }}`, `{{ items.length }}`, `:disabled="loading"`. Wrapping these in a computed adds a name to read with no benefit.
- A single boolean gates a `v-if`/`v-show`. That *is* a visibility condition; it belongs in the template.
- The value depends on `v-for` scope (the loop item). You can't lift a per-row expression into a component-level computed without restructuring — extract a child component or a small helper function instead, and let the child's computed cache per instance.

The line is "does this branch, build, or compute?" — not "is there any logic at all?" A template with zero expressions is its own kind of unreadable.

## References

- Vue docs, [Computed Properties](https://vuejs.org/guide/essentials/computed.html) — the canonical "don't put complex logic in templates" guidance, including the caching contract vs. methods.
- Vue docs, [Template Syntax — JavaScript expressions](https://vuejs.org/guide/essentials/template-syntax.html#using-javascript-expressions) — what templates are *meant* to hold; expressions are restricted by design.
- Vue docs, [Class and Style Bindings](https://vuejs.org/guide/essentials/class-and-style.html) — prefer object/array `:class` for variants over inline style ternaries.
- Vue style guide, [Simple expressions in templates](https://vuejs.org/style-guide/rules-strongly-recommended.html#simple-expressions-in-templates) — official "strongly recommended" rule that says exactly this.
- MDN, [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) — why pushing dynamic values through `--vars` keeps the styling in CSS. See also [Why CSS variables beat SCSS variables](why-css-variables-beat-scss-variables).

— Pierre
