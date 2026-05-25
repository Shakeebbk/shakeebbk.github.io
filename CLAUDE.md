# CLAUDE.md — shakeebbk.github.io

## Security: Zero secrets in source or history

This is a **public GitHub Pages repo**. Every file — and every git commit — is visible to the world.

### Rules

1. **Never embed plaintext secrets** in any file: no API keys, passwords, tokens, hashes, Google Sheet IDs, or Apps Script deployment URLs.
2. **Never embed secrets in CLI commands** (e.g. `echo -n 'password' | sha256sum`). If encryption is needed, write a standalone script that reads from stdin or a prompt.
3. **All sensitive config must be AES-256-GCM encrypted** using PBKDF2 (200k+ iterations, SHA-256) and decrypted client-side at login with the master password. See `travel-vault/assets/auth.js` for the reference implementation.
4. **Auth is client-side master key → decrypt**. Successful decryption IS the auth check. No hash comparisons in source, no plaintext key checks.
5. **Backend APIs (Apps Script) must validate a key hash** on every `doGet`/`doPost` request. The key hash is derived client-side after decryption and sent with each request. See `expense-ammi/Code.gs` for the pattern.
6. **Before any commit or push**, scan staged files for secrets:
   - API URLs (`script.google.com/macros`, `AKfycb*`)
   - Hashes that could be key hashes (64-char hex strings)
   - Plaintext passwords or tokens
   - Google Sheet IDs
   - Any string that looks like a credential
7. **If secrets are found in git history**, rewrite history with `git filter-repo --replace-text` and force-push. Re-add the remote after (filter-repo removes it).
8. **Encryption workflow** for new secrets:
   - Write a Node.js script (e.g. `encrypt-secrets.mjs`) that prompts for the password via stdin — never hardcode it
   - Encrypt the secrets JSON blob with AES-256-GCM + PBKDF2
   - Embed only the `{ salt, iv, ct, kdf, cipher }` object in the HTML/JS
   - Delete or `.gitignore` any plaintext secret files

### Subpage apps

| App | Path | Auth | Backend |
|-----|------|------|---------|
| expense-ammi | `/expense-ammi/` | AES-GCM encrypted config, decrypted at login | Code.gs with key validation |
| kyn-fund | `/kyn-fund/` | AES-GCM encrypted config, decrypted at login | Code.gs with key validation |
| travel-vault | `/travel-vault/` | AES-GCM encrypted data, decrypted at login | Static (no backend) |

### Quick checklist before push

- [ ] `grep -rn 'AKfycb\|script.google.com/macros' .` returns nothing
- [ ] No 64-char hex strings in source (other than inside encrypted blobs)
- [ ] No plaintext passwords anywhere
- [ ] `git log --all -p | grep -c 'AKfycb\|Winning'` returns 0
