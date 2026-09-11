# Investigate

Investigate is a minimal Chrome extension that explains highlighted text in the context of the page and lets you ask follow-up questions.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository folder.
4. Click the Investigate toolbar icon and save your OpenAI API key.
5. Choose a model from the dropdown. GPT-5.6 Sol is the default.
6. Highlight text on a normal webpage and click **Investigate**.

Chrome blocks content scripts on internal pages such as `chrome://extensions` and on the Chrome Web Store, so test on an ordinary webpage.

Investigate supports normal page text, editable text fields, dynamically rendered pages, and embedded frames. Browser-protected pages, some built-in PDF viewers, and closed shadow DOM cannot be accessed by Chrome extensions.

## Privacy

The extension sends the selected text, a limited surrounding passage, the page title and URL, and the current investigation's recent chat history to the OpenAI API. API response storage is disabled for these requests. The API key is stored in `chrome.storage.local` and is not committed to this repository.

## Development

This MVP uses plain JavaScript and Manifest V3, with no build step or runtime dependencies. Reload the extension from `chrome://extensions` after editing files.
