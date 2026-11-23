BRAND KIT v1
Made with the brand-kit skill. Keep the section names as they are: post-graphic and post-animator read them.

## Who
- Name: {{NAME}}
- What I do: {{ROLE}}
- Handle: {{HANDLE or "none"}}
- Profile photo: {{file name, or "none"}}

## Style
- Default style: {{light | dark}}
- Also allowed: {{dark | light | none}}
- Feel in three words: {{e.g. clear, calm, premium}}

## Colours (light)
- Background: {{#hex}}
- Card: {{#hex}}, border {{#hex}}
- Text: {{#hex}}
- Muted text: {{#hex}}
- Primary: {{#hex}} (headline key words, number pills)
- Accent: {{#hex}} (highlights, lines, frame)

## Colours (dark)
{{Fill only if dark is allowed, same keys as above. Otherwise write "not used".}}

## Fonts
- Heading: {{Google Font name}} ({{weights, e.g. 700, 800}})
- Body: {{Google Font name}} ({{weights, e.g. 400, 500, 600}})
- Google Fonts link: {{<link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">}}

## Sizes
- Default: {{portrait 1080x1350 | square 1080x1080}}
- Also allowed: {{square | portrait | none}}
- Margins: 90 px
- Minimum text: 26 px. Headline: at least 80 px.

## Background
- Pattern: {{grid | dots | lines | shapes}}
- Pattern colour: {{rgba(...) primary at 8-10%}}
- Corner shapes: {{#hex light tint}}, a few outlined squares tilted about 30 degrees, partly off the top-left and bottom-right edges
- Frame: a thin outline in the accent colour, 2 px, about 50 px out from the main card
- Never a plain flat background.

## Do
{{one line each}}

## Don't
{{one line each}}

## References (style only, never copy text, faces or logos)
{{file: what I like / what I don't, or "none"}}

## CSS tokens
Paste this block into the templates where they say BRAND TOKENS.
```css
:root {
  --bg: {{#hex}};
  --card: {{#hex}};
  --card-border: {{#hex}};
  --text: {{#hex}};
  --muted: {{#hex}};
  --primary: {{#hex}};
  --accent: {{#hex}};
  --on-primary: {{#FFFFFF or #000000, whichever reads better on primary}};
  --pattern: {{rgba(...)}};
  --deco: {{#hex}};
  --font-heading: '{{Heading font}}', sans-serif;
  --font-body: '{{Body font}}', sans-serif;
  --shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
```

## Change log
- {{DD/MM/YYYY}}: created.
