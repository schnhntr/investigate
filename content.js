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
      .trigger { position: fixed; display: none; padding: 8px 12px; border: 0; border-radius: 999px; background: #171717; color: white; font: 600 13px/1 system-ui; box-shadow: 0 5px 20px #0004; cursor: pointer; pointer-events: auto; }
      .panel { position: fixed; right: 20px; bottom: 20px; width: min(390px, calc(100vw - 24px)); height: min(570px, calc(100vh - 40px)); display: none; flex-direction: column; overflow: hidden; border: 1px solid #deddd9; border-radius: 18px; background: #fbfaf7; color: #1e1e1c; font: 14px/1.5 system-ui, sans-serif; box-shadow: 0 20px 60px #0003; pointer-events: auto; }
      .panel.open { display: flex; }
      header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #e6e4de; }
      .brand { font-weight: 700; letter-spacing: -.2px; }
      .actions { display: flex; gap: 5px; }
      .icon { width: 30px; height: 30px; border: 0; border-radius: 9px; background: transparent; color: #666; cursor: pointer; }
      .icon:hover { background: #ebe9e3; color: #111; }
      .selection { margin: 12px 14px 0; padding: 10px 12px; border-left: 3px solid #8a6d3b; border-radius: 4px 10px 10px 4px; background: #f1eee5; color: #555049; font-size: 12px; max-height: 70px; overflow: auto; }
      .chat { flex: 1; overflow: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
      .message { max-width: 92%; white-space: pre-wrap; overflow-wrap: anywhere; }
      .message.user { align-self: flex-end; padding: 9px 12px; border-radius: 14px 14px 4px 14px; background: #252522; color: white; }
      .message.assistant { align-self: flex-start; }
      .message.error { color: #a22; }
      .thinking { color: #777; font-style: italic; }
      form { display: flex; align-items: flex-end; gap: 8px; padding: 12px; border-top: 1px solid #e6e4de; background: white; }
      textarea { flex: 1; max-height: 110px; resize: none; border: 1px solid #d8d6d0; border-radius: 12px; padding: 10px 11px; outline: none; color: #222; background: #fff; }
      textarea:focus { border-color: #777; }
      .send { width: 38px; height: 38px; border: 0; border-radius: 11px; background: #1d1d1b; color: #fff; cursor: pointer; }
      .send:disabled { opacity: .45; }
    </style>
    <button class="trigger" type="button">Investigate</button>
    <section class="panel" aria-label="Investigate chat">
      <header><span class="brand">Investigate</span><span class="actions"><button class="icon settings" title="Settings">⚙</button><button class="icon close" title="Close">✕</button></span></header>
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

  document.addEventListener("mouseup", () => setTimeout(showTrigger, 0));
  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift" || event.key.startsWith("Arrow")) showTrigger();
  });

  function showTrigger() {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || text.length > 3000 || !selection.rangeCount || root.contains(selection.anchorNode)) {
      trigger.style.display = "none";
      return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    investigation = {
      selection: text,
      context: extractContext(range, text),
      page: { title: document.title, url: location.href },
      messages: []
    };
    trigger.style.left = `${Math.min(innerWidth - 110, Math.max(8, rect.left + rect.width / 2 - 48))}px`;
    trigger.style.top = `${Math.min(innerHeight - 42, Math.max(8, rect.bottom + 8))}px`;
    trigger.style.display = "block";
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
  root.querySelector(".settings").addEventListener("click", () => chrome.runtime.openOptionsPage());

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
      addMessage("assistant error", error.message);
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
})();
