export type MenuKey = 'home' | 'logs' | 'production' | 'tracker' | 'reports' | 'users' | 'settings' | 'status';

// Role prefix will be derived from current URL to avoid hardcoding
function getCurrentRolePrefix(): string {
  if (typeof window === 'undefined') return '';
  const seg = window.location.pathname.split('/').filter(Boolean)[0] || '';
  return seg ? `/${seg}` : '';
}

export function getRoleIdFromCookie(): number | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|; )userRole=([^;]+)/);
  return match ? parseInt(decodeURIComponent(match[1])) : undefined;
}

// Cache loaded from API (client-side only)
// We'll avoid calling admin-only endpoints for catalog to prevent 403 for non-admin users
// and rely on stable local mapping for paths.
let cachedAllowedKeys: Set<string> | null = null;
let loadingPromise: Promise<void> | null = null;

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const id = setTimeout(() => resolve(fallback), ms);
    p.then((v) => { clearTimeout(id); resolve(v); }).catch(() => { clearTimeout(id); resolve(fallback); });
  });
}

async function loadDataFromApi(): Promise<void> {
  if (typeof window === 'undefined') return; // SSR no-op
  if (loadingPromise) return loadingPromise;
  // Try cache first for instant render
  try {
    // Cookie takes precedence (set at login)
    const cookieMatch = document.cookie.match(/(?:^|; )rbac\.allowedKeys=([^;]+)/);
    if (cookieMatch && !cachedAllowedKeys) {
      const decoded = decodeURIComponent(cookieMatch[1]);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        cachedAllowedKeys = new Set(parsed as string[]);
      }
    }
    const raw = localStorage.getItem('rbac.allowedKeys');
    if (raw && !cachedAllowedKeys) {
      const { keys, ts } = JSON.parse(raw);
      // accept cache up to 10 minutes old
      if (Array.isArray(keys) && Date.now() - (ts || 0) < 10 * 60 * 1000) {
        cachedAllowedKeys = new Set(keys as string[]);
      }
    }
  } catch {}
  loadingPromise = (async () => {
    try {
      // Prefer bootstrap (returns role + permissions + catalog) in a single call
      const bootstrap = await withTimeout(
        fetch('/api/me/bootstrap', { headers: { 'Accept': 'application/json' } })
          .then((r) => r.ok ? r.json() : ({ success: false, data: {} })),
        1500,
        { success: false, data: {} }
      );
      const hasRole = Boolean(bootstrap?.data?.role?.id);
      const keys: string[] = Array.isArray(bootstrap?.data?.menu_keys)
        ? bootstrap.data.menu_keys
        : [];
      if (hasRole) {
        cachedAllowedKeys = new Set(keys);
      } else {
        // keep undefined to avoid hiding menus when role is unknown
        cachedAllowedKeys = cachedAllowedKeys || null;
      }
      if (hasRole && cachedAllowedKeys) {
        try {
          const encoded = encodeURIComponent(JSON.stringify(Array.from(cachedAllowedKeys || new Set<string>())));
          document.cookie = `rbac.allowedKeys=${encoded}; Path=/; Max-Age=600; SameSite=Lax`;
        } catch {}
        try { localStorage.setItem('rbac.allowedKeys', JSON.stringify({ keys: Array.from(cachedAllowedKeys || new Set<string>()), ts: Date.now() })); } catch {}
      }
      // expose for debugging
      (window as any).__allowedMenuKeys = Array.from(cachedAllowedKeys || new Set<string>());
    } catch (e) {
      // Fallback silently
      cachedAllowedKeys = cachedAllowedKeys || new Set<string>();
    }
  })();
  return loadingPromise;
}

export function isMenuAllowed(menu: MenuKey, roleId?: number): boolean {
  // Prefer API permissions
  if (typeof window !== 'undefined') {
    if (!cachedAllowedKeys) {
      // fire-and-forget load; allow UI to render once loaded
      void loadDataFromApi();
      // While loading, do NOT hide menus to avoid flicker/disappear
      return true;
    }
    return cachedAllowedKeys.has(menu);
  }

  // Fallback hardcoded
  const roleAllowed: Record<number, Set<MenuKey>> = {
    2: new Set(['home','logs','production','reports','users','settings','status']), // Admin
    1: new Set(['home','production','status']), // Planner
    5: new Set(['home','logs','production','reports','status']), // Operation
    4: new Set(['home','logs','reports']) // Viewer
  } as const;
  if (!roleId) return false;
  return (roleAllowed[roleId] || new Set()).has(menu);
}

export function buildMenuHref(menu: MenuKey, roleId?: number): string {
  // Prefer current URL prefix (works for all roles without static mapping)
  const prefix = getCurrentRolePrefix();
  // Use stable local mapping to avoid admin-only API dependency
  // Fallback mapping
  switch (menu) {
    case 'home':
      return `${prefix}/home`;
    case 'production':
    case 'tracker':
      return `${prefix}/tracker`;
    case 'logs':
      return '/logs';
    case 'reports':
      return '/reports';
    case 'users':
      return '/users';
    case 'settings':
      return '/settings';
    case 'status':
      return '/monitoring';
    default:
      return `${prefix}/home`;
  }
}

// Expose a manual initializer for pages that want to await data
export async function ensureMenuDataLoaded(): Promise<void> {
  await loadDataFromApi();
}



