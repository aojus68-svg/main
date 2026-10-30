import { createContext, useContext, useMemo } from 'react';
import ZH from './zh.json';

let RE = null;
function build() {
  const keys = Object.keys(ZH).sort((a, b) => b.length - a.length);
  RE = new RegExp(keys.map((k) => {
    const a = /^[A-Za-z0-9]/.test(k) ? '(?<![A-Za-z])' : '';
    const b = /[A-Za-z0-9]$/.test(k) ? '(?![A-Za-z])' : '';
    return a + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + b;
  }).join('|'), 'g');
}
// Translate a string. Exact phrases and fragments come from zh.json; numbers and names pass through.
export function zh(text) {
  if (!RE) build();
  return /[A-Za-z]/.test(text) ? text.replace(RE, (m) => ZH[m]) : text;
}
export const LangContext = createContext('en');
export function useT() {
  const lang = useContext(LangContext);
  return useMemo(() => (lang === 'zh' ? (s) => zh(String(s)) : (s) => String(s)), [lang]);
}
export const localeOf = (lang) => (lang === 'zh' ? 'zh-CN' : 'en-US');
export function initialLang() {
  try { const v = localStorage.getItem('ascend-lang'); if (v === 'zh' || v === 'en') return v; } catch { /* ignore */ }
  return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
}
