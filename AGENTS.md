# Project rules
- Keep receipt HTML and physical paper dimensions in `src/lib/nota.ts`, shared by preview, printing and PDF export, so every order uses the same layout.
- PDF export captures the scoped receipt document with its own stylesheet and paper margins; never rely on the application theme or a fixed A4 height for thermal receipts.