(() => {
  if (window.__investigateLoaded) return;
  window.__investigateLoaded = true;

  const host = document.createElement("div");
  host.id = "investigate-root";
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      button, textarea { font: inherit; }
      button:focus-visible { outline: 2px solid #222; outline-offset: 2px; }
      .trigger { position: fixed; display: none; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid #303030; border-radius: 999px; background: #181818; color: white; font: 620 12px/1 system-ui; letter-spacing: -.01em; box-shadow: 0 6px 18px #0002; cursor: pointer; pointer-events: auto; animation: pop .14s ease-out; }
      .trigger::before { content: "✦"; font-size: 10px; }
      @keyframes pop { from { opacity: 0; transform: translateY(-3px) scale(.96); } }
      .panel { position: fixed; right: 16px; bottom: 16px; width: min(350px, calc(100vw - 24px)); height: min(480px, calc(100vh - 32px)); min-height: min(320px, calc(100vh - 32px)); display: none; flex-direction: column; overflow: hidden; border: 1px solid #dedede; border-radius: 16px; background: #fff; color: #242424; font: 14px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; box-shadow: 0 18px 55px #0000001c, 0 2px 7px #0000000d; pointer-events: auto; animation: enter .18s ease-out; }
      @keyframes enter { from { opacity: 0; transform: translateY(8px) scale(.985); } }
      .panel.open { display: flex; }
      header { display: flex; align-items: center; justify-content: space-between; min-height: 52px; padding: 9px 10px 9px 15px; border-bottom: 1px solid #ededed; background: #fff; }
      .brand { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 680; letter-spacing: -.02em; }
      .mark { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; background: #1f1f1f; color: white; font-size: 10px; }
      .actions { display: flex; gap: 5px; }
      .icon { display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: 8px; background: transparent; color: #737373; cursor: pointer; }
      .icon:hover { background: #f3f3f3; color: #191919; }
      .icon svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.75; }
      .selection { margin: 11px 14px 0; padding: 8px 10px; border: 1px solid #e7e7e7; border-radius: 9px; background: #f7f7f7; color: #4d4d4d; font-size: 12px; max-height: 56px; overflow: auto; }
      .selection::before { content: "Selection  ·  "; color: #999; font-size: 9px; font-weight: 720; letter-spacing: .09em; text-transform: uppercase; }
      .chat { flex: 1; overflow: auto; padding: 15px; display: flex; flex-direction: column; gap: 14px; }
      .message { max-width: 94%; overflow-wrap: anywhere; }
      .message.user { align-self: flex-end; padding: 9px 12px; border-radius: 14px 14px 5px 14px; background: #252832; color: white; }
      .message.assistant { align-self: stretch; max-width: 100%; color: #292929; }
      .message.assistant p { margin: 0 0 11px; }
      .message.assistant p:last-child { margin-bottom: 0; }
      .message.assistant h1, .message.assistant h2, .message.assistant h3 { margin: 15px 0 6px; color: #181818; font-size: 14px; line-height: 1.35; }
      .message.assistant h1:first-child, .message.assistant h2:first-child, .message.assistant h3:first-child { margin-top: 0; }
      .message.assistant strong { color: #171717; font-weight: 680; }
      .message.assistant em { color: #555; }
      .message.assistant code { padding: 1px 5px; border: 1px solid #e2e2e2; border-radius: 5px; background: #f5f5f5; font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .message.assistant ul, .message.assistant ol { margin: 4px 0 11px; padding-left: 20px; }
      .message.assistant li { margin: 4px 0; padding-left: 1px; }
      .message.error { max-width: 100%; padding: 14px; border: 1px solid #f0d4d0; border-radius: 13px; background: #fff7f5; color: #8e3027; }
      .error-title { margin-bottom: 5px; color: #61231e; font-weight: 700; }
      .settings-cta { margin-top: 12px; padding: 9px 12px; border: 0; border-radius: 9px; background: #242630; color: white; font-weight: 650; cursor: pointer; }
      .thinking { color: #777c88; font-style: italic; }
      form { display: flex; align-items: flex-end; gap: 7px; padding: 10px; border-top: 1px solid #ededed; background: #fafafa; }
      textarea { flex: 1; max-height: 100px; resize: none; border: 1px solid #d6d6d6; border-radius: 10px; padding: 9px 10px; outline: none; color: #242424; background: #fff; }
      textarea:focus { border-color: #8c8c8c; box-shadow: 0 0 0 2px #00000009; }
      .send { display: grid; place-items: center; width: 38px; height: 38px; border: 0; border-radius: 10px; background: #202020; color: #fff; font-weight: 700; cursor: pointer; }
      .send:hover { background: #000; }
      .send:disabled { opacity: .45; }
    </style>
    <button class="trigger" type="button">Investigate</button>
    <section class="panel" aria-label="Investigate chat">
      <header><span class="brand"><span class="mark">✦</span>Investigate</span><span class="actions"><button class="icon settings" type="button" title="Open settings" aria-label="Open settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg></button><button class="icon close" type="button" title="Close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></span></header>
      <div class="selection"></div>
      <div class="chat"></div>
      <form><textarea rows="1" placeholder="Ask a follow-up…" aria-label="Message"></textarea><button class="send" title="Send">↑</button></form>
    </section>`;

  const trigger = root.querySelector(".trigger");
  const panel = root.querySelector(".panel");
  const quote = root.querySelector(".selection");
  const chat = root.querySelector(".chat");
  const form = root.querySelector("form");
  const input = root.querySelector("textarea");
  const send = root.querySelector(".send");
  let investigation = null;
  let busy = false;

  document.addEventListener("pointerup", (event) => {
    if (!event.composedPath().includes(host)) setTimeout(showTrigger, 0);
  }, true);
  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift" || event.key.startsWith("Arrow")) showTrigger();
  }, true);

  function showTrigger() {
    const snapshot = getSelectionSnapshot();
    if (!snapshot || snapshot.text.length > 3000) {
      trigger.style.display = "none";
      return;
    }
    const { text, context, rect } = snapshot;
    if (!rect.width && !rect.height) return;
    investigation = {
      selection: text,
      context,
      page: { title: document.title, url: location.href },
      messages: []
    };
    trigger.style.left = `${Math.min(innerWidth - 110, Math.max(8, rect.left + rect.width / 2 - 48))}px`;
    trigger.style.top = `${Math.min(innerHeight - 42, Math.max(8, rect.bottom + 8))}px`;
    trigger.style.display = "flex";
  }

  function getSelectionSnapshot() {
    const active = document.activeElement;
    if (active && (active.tagName === "TEXTAREA" || (active.tagName === "INPUT" && /^(text|search|url|email|tel)$/i.test(active.type)))) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      const text = active.value.slice(start, end).trim();
      if (!text) return null;
      const rect = active.getBoundingClientRect();
      return { text, context: active.value.slice(Math.max(0, start - 1800), end + 1800), rect };
    }

    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || !selection.rangeCount || root.contains(selection.anchorNode)) return null;
    const range = selection.getRangeAt(0);
    return { text, context: extractContext(range, text), rect: range.getBoundingClientRect() };
  }

  function extractContext(range, selected) {
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const block = node?.closest?.("p, li, blockquote, article, section, main, td") || node;
    const text = (block?.innerText || block?.textContent || selected).replace(/\s+/g, " ").trim();
    if (text.length <= 4000) return text;
    const at = Math.max(0, text.indexOf(selected));
    return text.slice(Math.max(0, at - 1800), at + selected.length + 1800);
  }

  trigger.addEventListener("click", () => {
    trigger.style.display = "none";
    panel.classList.add("open");
    quote.textContent = `“${investigation.selection}”`;
    chat.replaceChildren();
    investigation.messages = [{ role: "user", content: "Explain this in context." }];
    requestAnswer();
  });

  root.querySelector(".close").addEventListener("click", () => panel.classList.remove("open"));
  root.querySelector(".settings").addEventListener("click", openSettings);

  async function openSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
      if (!response?.ok) throw new Error(response?.error || "Could not open settings.");
    } catch {
      window.open(chrome.runtime.getURL("options.html"), "_blank");
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const content = input.value.trim();
    if (!content || busy) return;
    investigation.messages.push({ role: "user", content });
    addMessage("user", content);
    input.value = "";
    requestAnswer();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  async function requestAnswer() {
    busy = true;
    send.disabled = true;
    const loading = addMessage("assistant thinking", "Investigating…");
    try {
      const response = await chrome.runtime.sendMessage({ type: "INVESTIGATE_CHAT", payload: investigation });
      loading.remove();
      if (!response?.ok) throw new Error(response?.error || "Something went wrong.");
      investigation.messages.push({ role: "assistant", content: response.answer });
      addMessage("assistant", response.answer);
    } catch (error) {
      loading.remove();
      addError(error.message);
    } finally {
      busy = false;
      send.disabled = false;
      input.focus();
    }
  }

  function addMessage(kind, content) {
    const el = document.createElement("div");
    el.className = `message ${kind}`;
    if (kind === "assistant") renderMarkdown(el, content);
    else el.textContent = content;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
  }

  function renderMarkdown(container, markdown) {
    const lines = markdown.replace(/\r/g, "").split("\n");
    let list = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        list = null;
        continue;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const bullet = line.match(/^[-*]\s+(.+)$/);
      const numbered = line.match(/^\d+[.)]\s+(.+)$/);

      if (heading) {
        list = null;
        const el = document.createElement(`h${heading[1].length}`);
        appendInline(el, heading[2]);
        container.appendChild(el);
      } else if (bullet || numbered) {
        const tag = numbered ? "ol" : "ul";
        if (!list || list.tagName.toLowerCase() !== tag) {
          list = document.createElement(tag);
          container.appendChild(list);
        }
        const item = document.createElement("li");
        appendInline(item, (bullet || numbered)[1]);
        list.appendChild(item);
      } else {
        list = null;
        const paragraph = document.createElement("p");
        appendInline(paragraph, line);
        container.appendChild(paragraph);
      }
    }
  }

  function appendInline(parent, text) {
    const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      parent.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      const token = match[0];
      let element;
      if (token.startsWith("**") || token.startsWith("__")) {
        element = document.createElement("strong");
        element.textContent = token.slice(2, -2);
      } else if (token.startsWith("`")) {
        element = document.createElement("code");
        element.textContent = token.slice(1, -1);
      } else {
        element = document.createElement("em");
        element.textContent = token.slice(1, -1);
      }
      parent.appendChild(element);
      cursor = match.index + token.length;
    }
    parent.appendChild(document.createTextNode(text.slice(cursor)));
  }

  function addError(content) {
    const el = document.createElement("div");
    el.className = "message error";
    const title = document.createElement("div");
    title.className = "error-title";
    title.textContent = "Investigate needs your attention";
    const detail = document.createElement("div");
    detail.textContent = content;
    el.append(title, detail);
    if (/API key|settings/i.test(content)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "settings-cta";
      button.textContent = "Open settings";
      button.addEventListener("click", openSettings);
      el.appendChild(button);
    }
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }
})();
