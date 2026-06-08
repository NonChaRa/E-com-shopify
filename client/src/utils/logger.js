import { supabase } from '../supabaseClient';

// Level hierarchy — only levels >= active threshold are processed
const LEVELS = { DEBUG: 0, DEV: 1, INFO: 2, WARN: 3, ERROR: 4, CRITICAL: 5 };

const IS_DEV  = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;

// In dev: show everything. In prod: suppress DEBUG/DEV noise.
const MIN_CONSOLE_LEVEL = IS_DEV ? LEVELS.DEBUG : LEVELS.WARN;

// Colorized console styles per level (dev only)
const STYLES = {
  DEBUG:    'color:#888;font-size:11px',
  DEV:      'color:#6c9fff;font-weight:bold',
  INFO:     'color:#2ecc71;font-weight:bold',
  WARN:     'color:#f39c12;font-weight:bold',
  ERROR:    'color:#e74c3c;font-weight:bold',
  CRITICAL: 'background:#e74c3c;color:#fff;font-weight:bold;padding:2px 6px;border-radius:3px',
};

function buildEntry(level, context, message, meta = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    user_id:  meta.userId  ?? null,
    page:     meta.page    ?? (typeof window !== 'undefined' ? window.location.pathname : null),
    action:   meta.action  ?? null,
    metadata: meta.data    ?? null,
  };
}

async function persistToSupabase(entry) {
  try {
    await supabase.from('app_logs').insert([entry]);
  } catch {
    // Persistence failure must never throw — log to console as last resort
    if (IS_DEV) console.warn('[logger] Failed to persist log entry:', entry);
  }
}

function log(level, context, message, meta = {}) {
  const levelNum = LEVELS[level];
  const entry    = buildEntry(level, context, message, meta);

  // Console output
  if (levelNum >= MIN_CONSOLE_LEVEL) {
    const prefix = `%c[${level}] [${context}]`;
    const style  = STYLES[level] || '';
    const detail = entry.action ? ` — ${entry.action}` : '';

    if (level === 'ERROR' || level === 'CRITICAL') {
      console.error(prefix + detail, style, message, meta.error ?? meta.data ?? '');
    } else if (level === 'WARN') {
      console.warn(prefix + detail, style, message, meta.data ?? '');
    } else {
      console.log(prefix + detail, style, message, meta.data ?? '');
    }
  }

  // Persist ERROR and CRITICAL in production (and dev if explicitly desired)
  if (IS_PROD && (level === 'ERROR' || level === 'CRITICAL')) {
    persistToSupabase(entry);
  }
}

/**
 * Returns a context-bound logger.
 * Usage:
 *   import { createLogger } from '../utils/logger';
 *   const log = createLogger('CartSidebar');
 *   log.error('Checkout failed', { error: err, action: 'checkout' });
 */
export function createLogger(context) {
  return {
    debug:    (msg, meta) => log('DEBUG',    context, msg, meta),
    dev:      (msg, meta) => log('DEV',      context, msg, meta),
    info:     (msg, meta) => log('INFO',     context, msg, meta),
    warn:     (msg, meta) => log('WARN',     context, msg, meta),
    error:    (msg, meta) => log('ERROR',    context, msg, meta),
    critical: (msg, meta) => log('CRITICAL', context, msg, meta),
  };
}

// Default app-level logger for quick use
export default createLogger('app');
