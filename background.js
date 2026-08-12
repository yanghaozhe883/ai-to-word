// background.js — Service Worker: 注册右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ai2word-copy',
    title: '复制为 Word 格式',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ai2word-copy' && tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: 'AI2WORD_COPY' }).catch(() => {});
  }
});
