# Investigate

Investigate is a minimal Chrome extension that explains highlighted text in the context of the page and lets you ask follow-up questions.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository folder.
4. Click the Investigate toolbar icon and save your OpenAI API key.
5. Highlight text on a normal webpage and click **Investigate**.

Chrome blocks content scripts on internal pages such as `chrome://extensions` and on the Chrome Web Store, so test on an ordinary webpage.

## Privacy

The extension sends the selected text, a limited surrounding passage, the page title and URL, and the current investigation's recent chat history to the OpenAI API. API response storage is disabled for these requests. The API key is stored in `chrome.storage.local` and is not committed to this repository.

## Development

This MVP uses plain JavaScript and Manifest V3, with no build step or runtime dependencies. Reload the extension from `chrome://extensions` after editing files.
