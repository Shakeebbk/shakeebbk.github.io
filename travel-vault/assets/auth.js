/*
 * Travel Vault — auth & decryption gate.
 *
 * The vault data is AES-256-GCM-encrypted at rest in assets/data.js
 * (window.VAULT_ENC = { v, kdf, cipher, salt, iv, ct }). This script
 * derives an AES key from the user's master password via PBKDF2 and
 * decrypts on login. Successful decryption IS the auth check — there
 * is no separate hash comparison, no way to bypass.
 *
 * On success, the decrypted payload is published as window.VAULT,
 * the #vault element is revealed, and a `vault:unlocked` event is
 * dispatched so renderers can run.
 *
 * The master password is cached in localStorage under
 * `travel_vault_mk` for transparent re-decrypt on subsequent visits.
 * (Same trust boundary as the sibling expense-ammi app, which caches
 *  a SHA-256 hash of the same key in `expense_key`.)
 */

const STORAGE_KEY = 'travel_vault_mk';

const _enc = new TextEncoder();
const _dec = new TextDecoder();

function _b64decode(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function _deriveKey(password) {
  const enc = window.VAULT_ENC;
  if (!enc || !enc.salt || !enc.iv || !enc.ct) {
    throw new Error('Missing encrypted payload');
  }
  const salt = _b64decode(enc.salt);
  const baseKey = await crypto.subtle.importKey(
    'raw', _enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: enc.kdf.name, salt, iterations: enc.kdf.iterations, hash: enc.kdf.hash },
    baseKey,
    { name: enc.cipher, length: 256 },
    false,
    ['decrypt']
  );
}

async function _tryDecrypt(password) {
  try {
    const enc = window.VAULT_ENC;
    const aesKey = await _deriveKey(password);
    const iv = _b64decode(enc.iv);
    const ct = _b64decode(enc.ct);
    const ptBuf = await crypto.subtle.decrypt({ name: enc.cipher, iv }, aesKey, ct);
    const json = _dec.decode(ptBuf);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function _showVault(payload) {
  window.VAULT = payload;
  document.getElementById('login-screen').hidden = true;
  document.getElementById('vault').hidden = false;
  document.dispatchEvent(new CustomEvent('vault:unlocked'));
}

function _showLogin() {
  document.getElementById('login-screen').hidden = false;
  const vault = document.getElementById('vault');
  if (vault) vault.hidden = true;
}

async function attemptLogin() {
  const input = document.getElementById('key-input');
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  errEl.hidden = true;
  if (!input.value) { errEl.hidden = false; errEl.textContent = 'Enter the master key.'; return; }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Unlocking…';

  const payload = await _tryDecrypt(input.value);

  btn.disabled = false;
  btn.textContent = originalText;

  if (payload) {
    localStorage.setItem(STORAGE_KEY, input.value);
    _showVault(payload);
  } else {
    errEl.hidden = false;
    errEl.textContent = "That key didn't match. Try again.";
    input.focus();
    input.select();
  }
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  delete window.VAULT;
  const input = document.getElementById('key-input');
  if (input) input.value = '';
  _showLogin();
}

async function checkAuth() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) { _showLogin(); return; }
  const payload = await _tryDecrypt(stored);
  if (payload) {
    _showVault(payload);
  } else {
    // Key rotated or payload re-encrypted; clear stale cache.
    localStorage.removeItem(STORAGE_KEY);
    _showLogin();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('login-btn');
  const input = document.getElementById('key-input');
  if (btn) btn.addEventListener('click', attemptLogin);
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
  document.querySelectorAll('[data-logout]').forEach(el => el.addEventListener('click', logout));
  checkAuth();
});
