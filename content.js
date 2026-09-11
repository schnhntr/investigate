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
      button:focus-visible, textarea:focus-visible { outline: 3px solid #8fb5ff; outline-offset: 2px; }
      .trigger { position: fixed; display: none; align-items: center; gap: 7px; padding: 9px 13px 9px 10px; border: 1px solid #ffffff2e; border-radius: 999px; background: #191b22; color: white; font: 650 13px/1 system-ui; letter-spacing: -.01em; box-shadow: 0 8px 24px #0c102034; cursor: pointer; pointer-events: auto; animation: pop .14s ease-out; }
      .trigger::before { content: "✦"; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #7c5cff; font-size: 11px; }
      @keyframes pop { from { opacity: 0; transform: translateY(-3px) scale(.96); } }
      .panel { position: fixed; right: 18px; bottom: 18px; width: min(360px, calc(100vw - 24px)); height: min(490px, calc(100vh - 36px)); min-height: min(330px, calc(100vh - 36px)); display: none; flex-direction: column; overflow: hidden; border: 1px solid #dfe1e7; border-radius: 20px; background: #fff; color: #20222a; font: 14px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; box-shadow: 0 24px 70px #10132226, 0 2px 8px #10132212; pointer-events: auto; animation: enter .18s ease-out; }
      @keyframes enter { from { opacity: 0; transform: translateY(8px) scale(.985); } }
      .panel.open { display: flex; }
      header { display: flex; align-items: center; justify-content: space-between; min-height: 58px; padding: 11px 12px 11px 16px; border-bottom: 1px solid #eceef2; background: #fff; }
      .brand { display: flex; align-items: center; gap: 9px; font-weight: 720; letter-spacing: -.025em; }
      .mark { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 9px; background: linear-gradient(145deg, #7357ff, #527ff5); color: white; font-size: 13px; box-shadow: inset 0 0 0 1px #ffffff30; }
      .actions { display: flex; gap: 5px; }
      .icon { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 10px; background: transparent; color: #656975; cursor: pointer; }
      .icon:hover { background: #f1f2f5; color: #20222a; }
      .icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; }
      .selection { margin: 13px 14px 0; padding: 10px 12px; border: 1px solid #e7e4ff; border-radius: 12px; background: #f7f6ff; color: #59576a; font-size: 12.5px; max-height: 68px; overflow: auto; }
      .selection::before { content: "Selected"; display: block; margin-bottom: 3px; color: #7058d9; font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .chat { flex: 1; overflow: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
      .message { max-width: 92%; white-space: pre-wrap; overflow-wrap: anywhere; }
      .message.user { align-self: flex-end; padding: 9px 12px; border-radius: 14px 14px 5px 14px; background: #252832; color: white; }
      .message.assistant { align-self: flex-start; color: #292c34; }
      .message.error { max-width: 100%; padding: 14px; border: 1px solid #f0d4d0; border-radius: 13px; background: #fff7f5; color: #8e3027; }
      .error-title { margin-bottom: 5px; color: #61231e; font-weight: 700; }
      .settings-cta { margin-top: 12px; padding: 9px 12px; border: 0; border-radius: 9px; background: #242630; color: white; font-weight: 650; cursor: pointer; }
      .thinking { color: #777c88; font-style: italic; }
      form { display: flex; align-items: flex-end; gap: 8px; padding: 11px; border-top: 1px solid #eceef2; background: #fafbfc; }
      textarea { flex: 1; max-height: 100px; resize: none; border: 1px solid #d9dce3; border-radius: 12px; padding: 10px 11px; outline: none; color: #242630; background: #fff; }
      textarea:focus { border-color: #8975e8; box-shadow: 0 0 0 3px #795cff14; }
      .send { display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 12px; background: #6753d8; color: #fff; font-weight: 700; cursor: pointer; }
      .send:hover { background: #5945c7; }
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

  function openSettings() {
    chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" }).catch(() => {
      window.open(chrome.runtime.getURL("options.html"), "_blank");
    });
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
    el.textContent = content;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
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
