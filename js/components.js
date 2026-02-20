/**
 * 案件一覧 UI の制御
 * ヘッダー・フッターは index.html に直接インライン記述（共通パーツの定義元: components/ ディレクトリ）
 */

/* ===========================
   SVG アイコン定義
=========================== */
const ICONS = {
  pin: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>`,
  yen: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>`,
  users: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,
  file: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>`,
  renew: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>`,
  image: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>`,
  chevronLeft: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>`,
  chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>`,
};

/* ===========================
   テーブル行 HTML 生成
=========================== */
function renderRow(p) {
  const parts = p.dateRange.split('〜');
  const startDate = parts[0] ? parts[0].trim() : '';
  const endDate   = parts[1] ? parts[1].trim() : '';

  let stateClass, stateLabel;
  if (p.status === 'done') {
    stateClass = 'state-badge--done'; stateLabel = '完了';
  } else if (p.recruiting) {
    stateClass = 'state-badge--active'; stateLabel = '進行中';
  } else {
    stateClass = 'state-badge--stopped'; stateLabel = '募集停止';
  }

  return `
    <tr class="proj-row" data-id="${p.id}" data-tags="${p.tags.join(',')}">
      <td class="col-check"><input type="checkbox"></td>
      <td class="col-name">
        <div class="proj-name-cell">
          <div class="proj-thumb">${ICONS.image}</div>
          <div class="proj-name-info">
            <div class="proj-title">${p.title}</div>
            <div class="proj-sub">${p.location} ・ ${p.wage}</div>
          </div>
        </div>
      </td>
      <td><span class="type-badge type-badge--${p.jobTypeColor}">${p.jobType}</span></td>
      <td class="col-date">${startDate}</td>
      <td class="col-date">${endDate}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="state-badge ${stateClass}">${stateLabel}</span>
          <label class="toggle-switch" style="flex-shrink:0;">
            <input type="checkbox" ${p.recruiting ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </td>
      <td style="text-align:center;font-weight:700;color:#333;">${p.contracts}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button class="row-detail-btn" title="詳細">›</button>
          <button class="row-menu-btn" title="メニュー">…</button>
        </div>
      </td>
    </tr>
  `;
}

/* ===========================
   案件リスト管理
=========================== */
let state = {
  tab: 'active',
  filter: 'all',
  page: 1,
  perPage: 10,
};

function getFiltered() {
  return PROJECTS.filter(p => {
    if (p.status !== state.tab) return false;
    if (state.filter === 'all') return true;
    if (state.filter === 'search') return true; // 詳細検索は全件表示
    return p.tags.includes(state.filter);
  });
}

function updateBadgeCounts() {
  const active = PROJECTS.filter(p => p.status === state.tab);
  const countMap = {
    'no-hire':     active.filter(p => p.tags.includes('no-hire')).length,
    'need-action': active.filter(p => p.tags.includes('need-action')).length,
    'unread-msg':  active.filter(p => p.tags.includes('unread-msg')).length,
  };
  for (const [key, val] of Object.entries(countMap)) {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = val;
  }
}

function renderList() {
  const list  = document.getElementById('projectList');
  const empty = document.getElementById('emptyState');

  const filtered = getFiltered();
  const total    = filtered.length;
  const start    = (state.page - 1) * state.perPage;
  const end      = Math.min(start + state.perPage, total);
  const page     = filtered.slice(start, end);

  if (page.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'flex';
  } else {
    list.innerHTML = `
      <table class="proj-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox"></th>
            <th>案件名</th>
            <th>種別</th>
            <th>掲載開始</th>
            <th>終了日</th>
            <th>状態</th>
            <th style="text-align:center;">契約者</th>
            <th class="col-actions">アクション</th>
          </tr>
        </thead>
        <tbody>
          ${page.map(renderRow).join('')}
        </tbody>
      </table>
    `;
    empty.style.display = 'none';
    initToggles();
  }

  renderPagination(total);
  renderFooterPagination(total);
  updateBadgeCounts();
}

/* ===========================
   フッター & ツールバーページネーション
=========================== */
function renderFooterPagination(total) {
  const totalPages = Math.ceil(total / state.perPage) || 1;
  const start = (state.page - 1) * state.perPage;
  const end   = Math.min(start + state.perPage, total);

  const infoEl = document.getElementById('footerPageInfo');
  if (infoEl) {
    infoEl.textContent = total === 0 ? '0件' : `${total}件中${start + 1}〜${end}件表示`;
  }

  const toolbarInfo = document.getElementById('toolbarPageInfo');
  if (toolbarInfo) {
    toolbarInfo.textContent = total === 0 ? '0 / 0' : `${state.page} / ${totalPages}`;
  }

  const footerPrev = document.getElementById('footerPrevBtn');
  const footerNext = document.getElementById('footerNextBtn');
  if (footerPrev) footerPrev.disabled = state.page <= 1;
  if (footerNext) footerNext.disabled = state.page >= totalPages || totalPages <= 1;

  const toolbarPrev = document.getElementById('toolbarPrevBtn');
  const toolbarNext = document.getElementById('toolbarNextBtn');
  if (toolbarPrev) toolbarPrev.disabled = state.page <= 1;
  if (toolbarNext) toolbarNext.disabled = state.page >= totalPages || totalPages <= 1;
}

/* ===========================
   ページネーション描画
=========================== */
function renderPagination(total) {
  const nav = document.getElementById('pagination');
  if (!nav) return;
  const totalPages = Math.ceil(total / state.perPage);
  if (totalPages <= 1) { nav.innerHTML = ''; return; }

  const cur = state.page;
  let html = '';

  // 前へ
  html += `<button class="page-btn page-btn--prev" ${cur === 1 ? 'disabled' : ''} data-page="${cur - 1}">
    ${ICONS.chevronLeft} 前へ
  </button>`;

  // ページ番号
  const pages = buildPageNumbers(cur, totalPages);
  for (const p of pages) {
    if (p === '...') {
      html += `<span style="color:#999;padding:0 4px;">...</span>`;
    } else {
      html += `<button class="page-btn ${p === cur ? 'page-btn--active' : ''}" data-page="${p}">${p}</button>`;
    }
  }

  // 次へ
  html += `<button class="page-btn page-btn--next" ${cur === totalPages ? 'disabled' : ''} data-page="${cur + 1}">
    次へ ${ICONS.chevronRight}
  </button>`;

  nav.innerHTML = html;
  nav.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page);
      if (!isNaN(p) && p !== cur) {
        state.page = p;
        renderList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function buildPageNumbers(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (cur <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (cur >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', cur - 1, cur, cur + 1, '...', total);
  }
  return pages;
}

/* ===========================
   トグルスイッチ
=========================== */
function initToggles() {
  document.querySelectorAll('.toggle-switch input').forEach(input => {
    input.addEventListener('change', () => {
      const text       = input.checked ? '進行中' : '募集停止';
      const badgeClass = input.checked ? 'state-badge--active' : 'state-badge--stopped';
      const td = input.closest('td');
      if (td) {
        const badge = td.querySelector('.state-badge');
        if (badge) {
          badge.textContent = text;
          badge.className = `state-badge ${badgeClass}`;
        }
      }
    });
  });
}

/* ===========================
   初期化
=========================== */
function initHeader() {
  const hamburger = document.getElementById('hamburgerBtn');
  const nav       = document.getElementById('headerNav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('is-open'));
  }
}

function initUI() {
  // タブ（サイドバーの data-tab ボタン）
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('tab-btn--active'));
      btn.classList.add('tab-btn--active');
      state.tab    = btn.dataset.tab || 'active';
      state.page   = 1;
      state.filter = 'all';
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
      document.querySelector('[data-filter="all"]')?.classList.add('filter-pill--active');
      renderList();
    });
  });

  // フィルターピル
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
      pill.classList.add('filter-pill--active');
      state.filter = pill.dataset.filter || 'all';
      state.page   = 1;
      renderList();
    });
  });

  // 表示件数
  const perPageSel = document.getElementById('perPageSelect');
  if (perPageSel) {
    perPageSel.addEventListener('change', () => {
      state.perPage = parseInt(perPageSel.value);
      state.page    = 1;
      renderList();
    });
  }

  // ツールバー：前のページ
  const toolbarPrev = document.getElementById('toolbarPrevBtn');
  if (toolbarPrev) {
    toolbarPrev.addEventListener('click', () => {
      if (state.page > 1) {
        state.page -= 1;
        renderList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ツールバー：次のページ
  const toolbarNext = document.getElementById('toolbarNextBtn');
  if (toolbarNext) {
    toolbarNext.addEventListener('click', () => {
      const totalPages = Math.ceil(getFiltered().length / state.perPage);
      if (state.page < totalPages) {
        state.page += 1;
        renderList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // フッター：前の10件
  const footerPrev = document.getElementById('footerPrevBtn');
  if (footerPrev) {
    footerPrev.addEventListener('click', () => {
      if (state.page > 1) {
        state.page -= 1;
        renderList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // フッター：次の10件
  const footerNext = document.getElementById('footerNextBtn');
  if (footerNext) {
    footerNext.addEventListener('click', () => {
      const totalPages = Math.ceil(getFiltered().length / state.perPage);
      if (state.page < totalPages) {
        state.page += 1;
        renderList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initUI();
  renderList();
});
