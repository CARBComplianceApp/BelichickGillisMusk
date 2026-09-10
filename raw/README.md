# raw/README.md

Append-only. Never edit files in here.

- raw/claude/ — Claude.ai data export (Settings → Privacy → Export Data). Drop the ZIP or unzipped conversations.json here.
- raw/chatgpt/ — ChatGPT data export (Settings → Data Controls → Export). Same treatment. This is the material that dies when the subscription ends — compile it first.

The nightly compiler reads new files, extracts durable decisions/playbooks, and writes wiki/ pages tagged [claude] or [chatgpt].
