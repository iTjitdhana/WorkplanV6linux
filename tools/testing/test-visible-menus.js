/*
  Quick RBAC menu visibility test

  Usage:
    node tools/testing/test-visible-menus.js            # default prefix /planner/
    ROLE_PREFIX=/admin/ node tools/testing/test-visible-menus.js
    node tools/testing/test-visible-menus.js /operation/

  Env:
    BACKEND_BASE (default: http://localhost:3101)
    ROLE_PREFIX  (default: /planner/)
*/

const BACKEND_BASE = process.env.BACKEND_BASE || 'http://localhost:3101';
const ROLE_PREFIX = (process.env.ROLE_PREFIX || process.argv[2] || '/planner/').trim();

// Map menu keys in DB to UI paths (relative to role prefix)
const MENU_URL_MAP = {
  home: '/home',
  logs: '/logs',
  reports: '/reports',
  production: '/tracker',
  users: '/users',
  settings: '/settings',
  status: '/monitoring',
};

async function main() {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/me/bootstrap`, {
      headers: { Accept: 'application/json' },
    });
    const json = await res.json();
    const roleId = json?.data?.role?.id || null;
    const menuKeys = Array.isArray(json?.data?.menu_keys) ? json.data.menu_keys : [];
    const catalog = Array.isArray(json?.data?.menu_catalog) ? json.data.menu_catalog : [];

    const visible = menuKeys.map((key) => {
      const base = MENU_URL_MAP[key] || '/';
      const clean = base.startsWith('/') ? base.slice(1) : base;
      const href = `/${ROLE_PREFIX.replace(/^\/*|\/*$/g, '')}/${clean}`.replace(/\/+$/, '');
      return { key, href };
    });

    console.log(JSON.stringify(
      {
        backend: BACKEND_BASE,
        role: roleId,
        prefix: ROLE_PREFIX,
        menu_keys: menuKeys,
        visible,
        catalog_count: catalog.length,
      },
      null,
      2,
    ));
  } catch (err) {
    console.error('RBAC menu test failed:', err.message || err);
    process.exitCode = 1;
  }
}

main();











