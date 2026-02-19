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
  alert: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>`,
  chat: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>`,
  image: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
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
   カード HTML 生成
=========================== */
function renderCard(p) {
  const recruitingLabel = p.recruiting ? '募集中' : '募集停止';
  const recruitingBadgeClass = p.recruiting ? 'status-badge--blue' : 'status-badge--gray';
  const hasAlert = !!p.alert;
  const alertColor = p.alert?.type === 'orange' ? '#f57c00' : '#e8192c';
  const alertIcon = p.alert?.label?.includes('メッセージ') ? ICONS.chat : ICONS.alert;

  const actionsHtml = [
    p.actions.includes('applicants') ? `
      <a href="#" class="btn-action btn-action--outline-red">
        ${ICONS.users} 応募者・契約者を確認する
      </a>` : '',
    p.actions.includes('procedure') ? `
      <a href="#" class="btn-action btn-action--outline-gray">
        ${ICONS.file} 作業手順・報告を確認する
      </a>` : '',
    p.actions.includes('renew') ? `
      <a href="#" class="btn-action btn-action--outline-blue">
        ${ICONS.renew} 契約を更新する
      </a>` : '',
  ].join('');

  return `
    <div class="project-card${hasAlert ? ' project-card--alert' : ''}" data-id="${p.id}" data-tags="${p.tags.join(',')}">
      <div class="card-top">
        <div class="card-thumbnail">${ICONS.image}</div>
        <div class="card-meta">
          <p class="card-dates">${p.dateRange}</p>
          <div class="card-status-row">
            <span class="status-badge status-badge--green">進行中</span>
            <span class="status-badge ${recruitingBadgeClass}">${recruitingLabel}</span>
            <div class="toggle-wrap">
              <span class="toggle-label">${recruitingLabel}</span>
              <label class="toggle-switch">
                <input type="checkbox" ${p.recruiting ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <h2 class="card-title">${p.title}</h2>
        </div>
      </div>

      <div class="card-info-row">
        <span class="card-info-item">${ICONS.pin} ${p.location}</span>
        <span class="card-info-item">${ICONS.yen} ${p.wage}</span>
      </div>

      <div class="card-stats">
        <span class="stat-item">
          <span class="stat-label">契約者数：</span>
          <span class="stat-value">${p.contracts} 名</span>
        </span>
        <span class="stat-sep">|</span>
        <span class="stat-item">
          <span class="stat-label">確完了：</span>
          <span class="stat-value stat-value--green">${p.inspected}</span>
        </span>
        <span class="stat-sep">|</span>
        <span class="stat-item">
          <span class="stat-label">要確収：</span>
          <span class="stat-value ${p.needInspection > 0 ? 'stat-value--red' : ''}">${p.needInspection}</span>
        </span>
        <span class="stat-sep">|</span>
        <span class="stat-item">
          <span class="stat-label">報告中：</span>
          <span class="stat-value">${p.reporting}</span>
        </span>
      </div>

      <div class="card-footer-row">
        <span class="card-id">案件ID：${p.id}</span>
        ${hasAlert ? `
          <span class="alert-badge" style="background:${alertColor};">
            ${alertIcon} ${p.alert.label}
          </span>` : ''}
      </div>

      <div class="card-actions">${actionsHtml}</div>
    </div>
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
    'no-hire':      active.filter(p => p.tags.includes('no-hire')).length,
    'need-action':  active.filter(p => p.tags.includes('need-action')).length,
    'unread-msg':   active.filter(p => p.tags.includes('unread-msg')).length,
  };
  for (const [key, val] of Object.entries(countMap)) {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = val;
  }
}

function renderList() {
  const list = document.getElementById('projectList');
  const empty = document.getElementById('emptyState');
  const totalEl = document.getElementById('totalCount');
  const rangeEl = document.getElementById('rangeLabel');

  const filtered = getFiltered();
  const total = filtered.length;
  const start = (state.page - 1) * state.perPage;
  const end = Math.min(start + state.perPage, total);
  const page = filtered.slice(start, end);

  if (totalEl) totalEl.textContent = total;
  if (rangeEl) rangeEl.textContent = total === 0 ? '0' : `${start + 1}〜${end}`;

  if (page.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'flex';
  } else {
    list.innerHTML = page.map(renderCard).join('');
    empty.style.display = 'none';
    initToggles();
  }

  renderPagination(total);
  renderFooterPagination(total);
  updateBadgeCounts();
}

/* ===========================
   フッターページネーション
=========================== */
function renderFooterPagination(total) {
  const totalPages = Math.ceil(total / state.perPage);
  const start = (state.page - 1) * state.perPage;
  const end = Math.min(start + state.perPage, total);

  const infoEl = document.getElementById('footerPageInfo');
  if (infoEl) {
    infoEl.textContent = total === 0 ? '0件' : `${total}件中${start + 1}〜${end}件表示`;
  }

  const prevBtn = document.getElementById('footerPrevBtn');
  const nextBtn = document.getElementById('footerNextBtn');
  if (prevBtn) prevBtn.disabled = state.page <= 1;
  if (nextBtn) nextBtn.disabled = state.page >= totalPages || totalPages <= 1;
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
      const wrap = input.closest('.toggle-wrap');
      const label = wrap?.querySelector('.toggle-label');
      const badge = wrap?.closest('.card-meta')?.querySelector('.status-badge:last-of-type');
      const text = input.checked ? '募集中' : '募集停止';
      if (label) label.textContent = text;
      if (badge) {
        badge.textContent = text;
        badge.className = `status-badge ${input.checked ? 'status-badge--blue' : 'status-badge--gray'}`;
      }
    });
  });
}

/* ===========================
   初期化
=========================== */
function initHeader() {
  // ハンバーガーメニュー（モバイル用）
  const hamburger = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('headerNav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('is-open'));
  }
}

function initUI() {
  // タブ
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
      btn.classList.add('tab-btn--active');
      state.tab = btn.dataset.tab || 'active';
      state.page = 1;
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
      state.page = 1;
      renderList();
    });
  });

  // 表示件数
  const perPageSel = document.getElementById('perPageSelect');
  if (perPageSel) {
    perPageSel.addEventListener('change', () => {
      state.perPage = parseInt(perPageSel.value);
      state.page = 1;
      renderList();
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
      const filtered = getFiltered();
      const totalPages = Math.ceil(filtered.length / state.perPage);
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
