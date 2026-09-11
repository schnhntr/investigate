const form = document.querySelector("form");
const apiKey = document.querySelector("#apiKey");
const model = document.querySelector("#model");
const status = document.querySelector("#status");

chrome.storage.local.get(["apiKey", "model"], (saved) => {
  apiKey.value = saved.apiKey || "";
  model.value = saved.model || "gpt-4.1-mini";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await chrome.storage.local.set({ apiKey: apiKey.value.trim(), model: model.value.trim() || "gpt-4.1-mini" });
  status.textContent = "Saved";
  setTimeout(() => (status.textContent = ""), 1800);
});
