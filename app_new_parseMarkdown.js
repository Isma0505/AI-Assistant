// Replace parseMarkdown with this robust implementation (copy into app.js)
function parseMarkdown(md) {
    md = String(md ?? '');

    // Escape HTML first
    let html = md
        .replace(/&/g, '&amp;')
        .replace(/</g, '<')
        .replace(/>/g, '>');

    // Fenced code blocks
    html = html.replace(/```([a-zA-Z0-9+#-]+)?\n([\s\S]+?)\n```/g, (match, lang, code) => {
        const language = (lang ? lang.trim() : 'code');
        const cleanCode = code.replace(/\n+$/, '').trim();
        return `
            <div class="code-block-container">
                <div class="code-block-header">
                    <span>${language}</span>
                    <button class="copy-code-btn" onclick="copyCode(this)">
                        <i class="fa-regular fa-copy"></i> Salin Kode
                    </button>
                </div>
                <pre><code>${cleanCode}</code></pre>
            </div>
        `;
    });

    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Links [text](http(s)://...)
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (m, text, url) => {
        return `<a class="md-link" href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // Blockquotes per line: > ...
    html = html.replace(/^\s*>\s?(.+?)\s*$/gm, (m, content) => {
        return `<blockquote>${content}</blockquote>`;
    });

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Ordered lists
    html = html.replace(/^(?:\s*)(\d+)\.\s+(.+)$/gm, '<li data-list-ordered="$1">$2</li>');
    // Unordered lists
    html = html.replace(/^(?:\s*[-*])\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items
    html = html.replace(/((?:<li(?:[^>]*)?>[\s\S]*?<\/li>\s*)+)/g, (m) => {
        const hasOrdered = m.includes('data-list-ordered');
        return hasOrdered ? `<ol>${m}</ol>` : `<ul>${m}</ul>`;
    });

    // Remove possible nested list container merges
    html = html.replace(/<\/(ul|ol)>\s*<\/(ul|ol)>/g, '');

    // Paragraph splitting
    const parts = html.split(/\n\n+/);
    const out = parts.map(p => {
        const t = p.trim();
        if (!t) return '';
        if (t.startsWith('<div') || t.startsWith('<ul') || t.startsWith('<ol') || t.startsWith('<pre') || t.startsWith('<blockquote')) {
            return t;
        }
        return `<p>${t.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean);

    return out.join('');
}

