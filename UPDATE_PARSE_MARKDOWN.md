This file documents intended fix:

- Current app.js already includes an advanced parseMarkdown (supports links/lists/blockquote).
- If needed, replace parseMarkdown function block entirely with app_new_parseMarkdown.js content.

To apply:
1) Copy the function parseMarkdown from app_new_parseMarkdown.js
2) Replace the existing function parseMarkdown in app.js (between `function parseMarkdown` and the closing `}` right before `// Clipboard copying utility`).

