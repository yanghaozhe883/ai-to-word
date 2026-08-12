// md2html.js — 轻量 Markdown -> HTML 转换器(纯 JS, 无外部依赖)
// 输出为 Word/WPS 友好的 HTML 片段(内联样式优先, 粘贴保真)。
// 全局暴露 md2html(markdownText) -> html 字符串

function md2html(md) {
  if (!md) return '';
  md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines = md.split('\n');
  const blocks = [];       // 输出块 {type, html}
  let i = 0;

  // ---------- 块级解析 ----------
  while (i < lines.length) {
    const line = lines[i];

    // 代码块 ```lang ... ```
    if (/^```/.test(line.trim())) {
      const lang = line.trim().replace(/^```/, '').trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++; // 跳过结束 ```
      blocks.push({
        type: 'pre',
        html: '<pre style="font-family:Consolas,Menlo,monospace;font-size:10.5pt;background:#f6f8fa;border:1px solid #d0d7de;border-radius:4px;padding:10px;white-space:pre-wrap;word-break:break-word;">' +
              esc(buf.join('\n')) + '</pre>'
      });
      continue;
    }

    // 表格 | a | b |
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', html: tableToHtml(rows) });
      continue;
    }

    // 标题 # ~ ######
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const size = [26, 22, 18, 15, 13, 11.5][level - 1];
      blocks.push({
        type: 'h',
        html: '<h' + level + ' style="font-size:' + size + 'pt;font-weight:bold;margin:10pt 0 6pt 0;">' +
              inline(h[2]) + '</h' + level + '>'
      });
      i++;
      continue;
    }

    // 水平线
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: 'hr', html: '<hr style="border:none;border-top:1px solid #d0d7de;margin:8pt 0;">' });
      i++;
      continue;
    }

    // 引用 >
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'quote',
        html: '<blockquote style="border-left:3px solid #d0d7de;margin:6pt 0;padding:2pt 10pt;color:#57606a;">' +
              inline(buf.join('\n')) + '</blockquote>'
      });
      continue;
    }

    // 无序列表 - / * / +
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*[-*+]\s+/, '')));
        i++;
      }
      blocks.push({ type: 'ul', html: '<ul style="margin:6pt 0;padding-left:24pt;">' + items.map(x => '<li>' + x + '</li>').join('') + '</ul>' });
      continue;
    }

    // 有序列表 1. 2. 3.
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*\d+[.)]\s+/, '')));
        i++;
      }
      blocks.push({ type: 'ol', html: '<ol style="margin:6pt 0;padding-left:24pt;">' + items.map(x => '<li>' + x + '</li>').join('') + '</ol>' });
      continue;
    }

    // 空行
    if (!line.trim()) {
      i++;
      continue;
    }

    // 普通段落(合并连续非空行)
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() &&
           !/^(#{1,6})\s/.test(lines[i]) &&
           !/^```/.test(lines[i].trim()) &&
           !/^\s*\|.*\|\s*$/.test(lines[i]) &&
           !/^\s*[-*+]\s+/.test(lines[i]) &&
           !/^\s*\d+[.)]\s+/.test(lines[i]) &&
           !/^\s*>\s?/.test(lines[i]) &&
           !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'p', html: '<p style="margin:4pt 0;line-height:1.6;">' + inline(buf.join('\n')) + '</p>' });
  }

  return blocks.map(b => b.html).join('\n');
}

// ---------- 行内解析(粗体/斜体/删除线/行内代码/链接/公式占位) ----------
function inline(text) {
  let t = esc(text);

  // 行内代码 `...`
  t = t.replace(/`([^`]+)`/g, (m, code) =>
    '<code style="font-family:Consolas,Menlo,monospace;background:#f6f8fa;border-radius:3px;padding:0 3px;font-size:10pt;">' + code + '</code>');

  // 图片 ![alt](url) -> 保留为链接文本(MVP 不下载图片)
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) =>
    '<a href="' + esc(url) + '">[' + (alt || '图片') + ']</a>');

  // 链接 [text](url)
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, url) =>
    '<a href="' + esc(url) + '">' + txt + '</a>');

  // 粗体 **x** 或 __x__
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  // 斜体 *x* 或 _x_
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');
  // 删除线 ~~x~~
  t = t.replace(/~~([^~]+)~~/g, '<del style="color:#8b949e;">$1</del>');

  // LaTeX 公式 $x$ / $$x$$: MVP 原样保留, 防止被上面规则误伤
  // (注意: 上面的规则已处理完, 公式符号不会被再破坏)
  return t;
}

function tableToHtml(rows) {
  const parseRow = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const header = parseRow(rows[0]);
  const cells = rows.slice(2).map(parseRow); // 跳过第 2 行(分隔线)
  let html = '<table style="border-collapse:collapse;margin:6pt 0;">';
  html += '<thead><tr>' + header.map(c =>
    '<th style="border:1px solid #d0d7de;padding:4pt 8pt;background:#f6f8fa;font-weight:bold;">' + inline(c) + '</th>'
  ).join('') + '</tr></thead>';
  html += '<tbody>' + cells.map(row => {
    const trs = header.map((_, idx) =>
      '<td style="border:1px solid #d0d7de;padding:4pt 8pt;">' + inline(row[idx] || '') + '</td>');
    return '<tr>' + trs.join('') + '</tr>';
  }).join('') + '</tbody>';
  return html + '</table>';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 导出: content script 直接用全局函数 md2html
window.md2html = md2html;
