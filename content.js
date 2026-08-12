// content.js — 核心交互: 选中 AI 回复 -> 悬浮按钮 -> 复制为 Word 格式
// v3: 架构修复 — 提取选区真实 DOM(cloneContents), 不再 sel.toString() 抹掉结构
(() => {
  if (window.__ai2wordInjected) return;
  window.__ai2wordInjected = true;

  let btn = null;      // 悬浮按钮
  let toast = null;    // 提示浮层
  let hideTimer = null;

  // ---------- 样式(内联, 防网站样式干扰) ----------
  const btnStyle = [
    'position:fixed', 'z-index:2147483647', 'display:none',
    'padding:6px 12px', 'font:12px/1.5 "Microsoft YaHei",sans-serif',
    'color:#fff', 'background:#2f6fed', 'border:none', 'border-radius:6px',
    'cursor:pointer', 'box-shadow:0 2px 8px rgba(0,0,0,.25)',
    'user-select:none'
  ].join(';');

  function createBtn() {
    btn = document.createElement('div');
    btn.textContent = '📋 复制为 Word 格式';
    btn.setAttribute('style', btnStyle);
    btn.addEventListener('mousedown', (e) => e.preventDefault()); // 防止夺走选区
    btn.addEventListener('click', onCopyClick);
    document.documentElement.appendChild(btn);
  }

  function showBtn(x, y) {
    if (!btn) createBtn();
    btn.style.display = 'block';
    btn.style.left = Math.min(x, window.innerWidth - 170) + 'px';
    btn.style.top = Math.min(y, window.innerHeight - 40) + 'px';
  }

  function hideBtn() {
    if (btn) btn.style.display = 'none';
  }

  // ---------- 选区监听 ----------
  document.addEventListener('mouseup', (e) => {
    // 点击按钮本身不处理
    if (btn && btn.contains(e.target)) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      hideBtn();
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 5) { hideBtn(); return; } // 太短不显示
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    showBtn(rect.right + 4, rect.top - 6);
  });

  document.addEventListener('scroll', hideBtn, true);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideBtn();
  });

  // ---------- 选区提取: 真实 DOM -> Word 友好 HTML ----------
  // 核心修复: 克隆选区 DOM, 保留 AI 页面已渲染的标题/列表/表格/加粗结构;
  // 只有纯文本时才回退到 Markdown 解析(兼容从别处粘贴的 md 文本)
  function extractSelectionHTML() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    const frag = range.cloneContents();
    const text = (frag.textContent || '').trim();
    if (!text) return null;

    sanitizeFragment(frag);

    const probe = document.createElement('div');
    probe.appendChild(frag);
    const hasBlock = !!probe.querySelector(
      'h1,h2,h3,h4,h5,h6,p,div,ul,ol,table,pre,blockquote,hr'
    );
    if (hasBlock) {
      return { html: probe.innerHTML, text, mode: 'dom' };
    }
    // 纯文本/简单行内: Markdown 兜底
    const mdHtml = window.md2html(text);
    return { html: mdHtml, text, mode: 'md' };
  }

  // 清理网页脚本/样式/无关属性, 重新施加 Word 友好的内联样式
  function sanitizeFragment(frag) {
    const REMOVE = 'script,style,template,iframe,object,embed,link,meta,button,input,textarea,select,form,canvas,svg,video,audio,source,noscript,title,path';
    const els = Array.prototype.slice.call(frag.querySelectorAll('*'));
    const toRemove = [];
    for (const el of els) {
      const tag = el.tagName.toLowerCase();
      if (REMOVE.split(',').indexOf(tag) >= 0) { toRemove.push(el); continue; }
      el.removeAttribute('class');
      el.removeAttribute('style');
      const attrs = Array.prototype.slice.call(el.attributes || []);
      for (const attr of attrs) {
        const n = attr.name.toLowerCase();
        if (n.indexOf('on') === 0 || n.indexOf('data-') === 0 ||
            n === 'contenteditable' || n === 'draggable' || n === 'spellcheck') {
          el.removeAttribute(attr.name);
        }
      }
    }
    for (const el of toRemove) el.remove();

    // 重新施加 Word 友好内联样式
    frag.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((el) => {
      const lv = parseInt(el.tagName.charAt(1), 10);
      const size = [20, 16, 14, 12, 11, 10.5][lv - 1] || 12;
      el.setAttribute('style', 'font-size:' + size + 'pt;font-weight:bold;margin:10pt 0 6pt 0;');
    });
    frag.querySelectorAll('p').forEach((el) =>
      el.setAttribute('style', 'margin:4pt 0;line-height:1.6;'));
    frag.querySelectorAll('ul,ol').forEach((el) =>
      el.setAttribute('style', 'margin:6pt 0;padding-left:24pt;'));
    frag.querySelectorAll('li').forEach((el) =>
      el.setAttribute('style', 'margin:2pt 0;'));
    frag.querySelectorAll('table').forEach((el) =>
      el.setAttribute('style', 'border-collapse:collapse;margin:6pt 0;'));
    frag.querySelectorAll('th,td').forEach((el) =>
      el.setAttribute('style', 'border:1px solid #a7a7a7;padding:4pt 8pt;'));
    frag.querySelectorAll('th').forEach((el) =>
      el.setAttribute('style', 'border:1px solid #a7a7a7;padding:4pt 8pt;font-weight:bold;background:#f2f2f2;'));
    frag.querySelectorAll('pre').forEach((el) =>
      el.setAttribute('style', 'font-family:Consolas,Menlo,monospace;font-size:10.5pt;background:#f6f8fa;border:1px solid #d0d7de;border-radius:4px;padding:10px;white-space:pre-wrap;word-break:break-word;margin:6pt 0;'));
    frag.querySelectorAll('code').forEach((el) =>
      el.setAttribute('style', 'font-family:Consolas,Menlo,monospace;background:#f6f8fa;border-radius:3px;padding:0 3px;font-size:10pt;'));
    frag.querySelectorAll('blockquote').forEach((el) =>
      el.setAttribute('style', 'border-left:3px solid #d0d7de;margin:6pt 0;padding:2pt 10pt;color:#57606a;'));
    frag.querySelectorAll('a').forEach((el) =>
      el.setAttribute('style', 'color:#0563c1;text-decoration:underline;'));
    frag.querySelectorAll('img').forEach((el) =>
      el.setAttribute('style', 'max-width:100%;'));
    frag.querySelectorAll('hr').forEach((el) =>
      el.setAttribute('style', 'border:none;border-top:1px solid #d0d7de;margin:8pt 0;'));

    // b/i 规范化
    frag.querySelectorAll('b').forEach((el) => {
      const s = document.createElement('strong');
      s.innerHTML = el.innerHTML;
      el.replaceWith(s);
    });
    frag.querySelectorAll('i').forEach((el) => {
      const s = document.createElement('em');
      s.innerHTML = el.innerHTML;
      el.replaceWith(s);
    });
  }

  // ---------- 复制核心 ----------
  async function onCopyClick() {
    const extracted = extractSelectionHTML();
    if (!extracted) return;
    const { html, text, mode } = extracted;
    const fullHtml =
      '<div style="font-family:\'Microsoft YaHei\',Calibri,sans-serif;font-size:11pt;">' +
      html + '</div>';

    const res = await writeClipboard(fullHtml, text, mode);
    showToast(res.msg);
    hideBtn();
    window.getSelection().removeAllRanges();
  }

  // 富文本复制: 三层方案, 逐级降级 (返回 {ok, msg})
  async function writeClipboard(html, text, mode) {
    let errA = '', errB = '';
    const modeTag = mode === 'dom' ? 'DOM结构' : 'Markdown';

    // 方案 A(首选): contenteditable + copy 事件注入
    // 修复假成功: 必须 execCommand 返回 true 且 onCopy 注入成功(injected=true)才算成功
    try {
      let injected = false;
      const onCopy = (e) => {
        try {
          e.clipboardData.setData('text/html', html);
          e.clipboardData.setData('text/plain', text);
          e.preventDefault();
          injected = true;
        } catch (err) {
          injected = false;
          try { e.preventDefault(); } catch (_) { /* noop */ }
        }
      };
      document.addEventListener('copy', onCopy, true);

      const container = document.createElement('div');
      container.innerHTML = html;
      container.setAttribute('contenteditable', 'true');
      container.setAttribute('tabindex', '-1');
      container.style.cssText =
        'position:fixed;top:0;left:0;width:60px;height:60px;opacity:0.01;' +
        'pointer-events:none;overflow:hidden;';
      document.body.appendChild(container);
      container.focus({ preventScroll: true });
      const range = document.createRange();
      range.selectNodeContents(container);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      const ok = document.execCommand('copy');
      sel.removeAllRanges();
      container.remove();
      document.removeEventListener('copy', onCopy, true);
      if (ok && injected) {
        return { ok: true, msg: '✅ 已复制 v3(' + modeTag + ')，去 Word 里 Ctrl+V 即可(默认保留源格式)' };
      }
      errA = 'ok=' + ok + ' injected=' + injected;
    } catch (e) { errA = String(e && e.message || e); }

    // 方案 B: ClipboardItem API (带 1.5 秒超时, 防止挂起)
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        });
        const p = navigator.clipboard.write([item]);
        await Promise.race([
          p,
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1500))
        ]);
        return { ok: true, msg: '✅ 已复制 v3(B:' + modeTag + ')，去 Word 里 Ctrl+V 即可' };
      }
      errB = '无 ClipboardItem';
    } catch (e) { errB = String(e && e.message || e); }

    // 方案 C(最终降级): 纯文本
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;right:0;opacity:0.01;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (ok) return { ok: true, msg: '⚠️ 只能复制纯文本(方案C)。A:' + errA + ' | B:' + errB };
    } catch (e) { /* fallthrough */ }
    return { ok: false, msg: '❌ 复制失败。A:' + errA + ' | B:' + errB };
  }

  // ---------- 提示浮层 ----------
  function showToast(msg) {
    if (!toast) {
      toast = document.createElement('div');
      toast.setAttribute('style', [
        'position:fixed', 'z-index:2147483647', 'left:50%', 'bottom:60px',
        'transform:translateX(-50%)', 'padding:10px 18px',
        'font:13px/1.5 "Microsoft YaHei",sans-serif', 'color:#fff',
        'background:rgba(0,0,0,.82)', 'border-radius:8px',
        'box-shadow:0 4px 16px rgba(0,0,0,.3)', 'max-width:80%',
        'text-align:center', 'transition:opacity .3s'
      ].join(';'));
      document.documentElement.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, 5000);
  }

  // ---------- 来自 background 的右键菜单消息 ----------
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'AI2WORD_COPY') {
      onCopyClick().then(() => sendResponse({ ok: true }));
      return true; // 异步响应
    }
  });
})();
