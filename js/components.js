/**
 * 案件一覧 UI の制御
 * HTML要素は order/list.html に静的に記述済み。
 * このスクリプトはクラス付与・DOM並び替え・テキスト更新のみ行う。
 */

/* ===========================
   状態管理
=========================== */
let state = {
  tab: 'active',
  filter: 'all',
  sort: 'default',
  view: 'list',
  page: 1,
  perPage: 10,
};

/* ===========================
   DOM からフィルタ済み件数を取得
=========================== */
function countByTabAndTag(tag) {
  let count = 0;
  document.querySelectorAll('.proj-row').forEach(el => {
    if (el.dataset.status !== state.tab) return;
    const tags = (el.dataset.tags || '').split(',');
    if (tags.includes(tag)) count++;
  });
  return count;
}

function countVisible() {
  let count = 0;
  document.querySelectorAll('.proj-row').forEach(el => {
    if (!el.classList.contains('is-filtered-out')) count++;
  });
  return count;
}

/* ===========================
   ビュー切替（リスト / グリッド）
=========================== */
function applyView() {
  const listView = document.querySelector('.proj-view--list');
  const gridView = document.querySelector('.proj-view--grid');
  if (!listView || !gridView) return;
  if (state.view === 'grid') {
    listView.classList.add('is-hidden');
    gridView.classList.remove('is-hidden');
  } else {
    listView.classList.remove('is-hidden');
    gridView.classList.add('is-hidden');
  }
}

/* ===========================
   フィルタ（タブ + ピル）
=========================== */
function applyFilters() {
  document.querySelectorAll('.proj-row, .proj-icon-card').forEach(el => {
    const matchTab = el.dataset.status === state.tab;
    let matchFilter = true;
    if (state.filter !== 'all' && state.filter !== 'search') {
      const tags = (el.dataset.tags || '').split(',');
      matchFilter = tags.includes(state.filter);
    }
    el.classList.toggle('is-filtered-out', !(matchTab && matchFilter));
  });
}

/* ===========================
   並び替え（DOM 要素の再配置）
=========================== */
function getSortComparator() {
  switch (state.sort) {
    case 'start-date-desc': return (a, b) => b.dataset.start.localeCompare(a.dataset.start);
    case 'start-date-asc':  return (a, b) => a.dataset.start.localeCompare(b.dataset.start);
    case 'end-date-asc':    return (a, b) => a.dataset.end.localeCompare(b.dataset.end);
    case 'end-date-desc':   return (a, b) => b.dataset.end.localeCompare(a.dataset.end);
    case 'contracts-desc':  return (a, b) => parseInt(b.dataset.contracts) - parseInt(a.dataset.contracts);
    case 'contracts-asc':   return (a, b) => parseInt(a.dataset.contracts) - parseInt(b.dataset.contracts);
    default:                return (a, b) => parseInt(a.dataset.order) - parseInt(b.dataset.order);
  }
}

function applySort() {
  const cmp = getSortComparator();
  ['.proj-table tbody', '.proj-icon-grid'].forEach(sel => {
    const container = document.querySelector(sel);
    if (!container) return;
    const items = Array.from(container.children);
    items.sort(cmp).forEach(el => container.appendChild(el));
  });
}

/* ===========================
   ページネーション（クラスで表示/非表示）
=========================== */
function applyPagination() {
  ['.proj-row', '.proj-icon-card'].forEach(sel => {
    const all = Array.from(document.querySelectorAll(sel));
    const visible = all.filter(el => !el.classList.contains('is-filtered-out'));
    const start = (state.page - 1) * state.perPage;
    const end   = start + state.perPage;
    all.forEach(el => {
      const idx = visible.indexOf(el);
      el.classList.toggle('is-paged-out', idx >= 0 && (idx < start || idx >= end));
    });
  });
}

/* ===========================
   バッジ件数・ページ情報の更新（テキストのみ）
=========================== */
function updateBadgeCounts() {
  ['no-hire', 'need-action', 'unread-msg'].forEach(tag => {
    const el = document.getElementById('count-' + tag);
    if (el) el.textContent = countByTabAndTag(tag);
  });
}

function updateSortButton() {
  const btn = document.getElementById('sortCtrlBtn');
  if (!btn) return;
  btn.querySelectorAll('.sort-btn-icon').forEach(icon => icon.classList.remove('is-active'));
  const active = btn.querySelector('.sort-btn-icon--' + state.sort);
  if (active) active.classList.add('is-active');
  const sorted = state.sort !== 'default';
  btn.classList.toggle('filter-ctrl-btn--active', sorted);
}

function updatePaginationControls() {
  const total      = countVisible();
  const totalPages = Math.ceil(total / state.perPage) || 1;
  const startIdx   = (state.page - 1) * state.perPage;
  const endIdx     = Math.min(startIdx + state.perPage, total);

  // 空表示
  const empty = document.getElementById('emptyState');
  if (empty) empty.style.display = total === 0 ? 'flex' : 'none';
  const wrap = document.getElementById('projectList');
  if (wrap) wrap.classList.toggle('is-hidden', total === 0);

  // メインページネーション
  const pagination = document.getElementById('pagination');
  if (pagination) {
    pagination.classList.toggle('is-hidden', totalPages <= 1);
    pagination.querySelectorAll('[data-page]').forEach(btn => {
      const p = parseInt(btn.dataset.page);
      btn.classList.toggle('is-hidden', p > totalPages);
      btn.classList.toggle('page-btn--active', p === state.page);
    });
    var prev = document.getElementById('pagePrevBtn');
    var next = document.getElementById('pageNextBtn');
    if (prev) prev.disabled = state.page <= 1;
    if (next) next.disabled = state.page >= totalPages;
  }

  // ツールバー情報
  var toolbarInfo = document.getElementById('toolbarPageInfo');
  if (toolbarInfo) toolbarInfo.textContent = total === 0 ? '0 / 0' : state.page + ' / ' + totalPages;
  var toolbarPrev = document.getElementById('toolbarPrevBtn');
  var toolbarNext = document.getElementById('toolbarNextBtn');
  if (toolbarPrev) toolbarPrev.disabled = state.page <= 1;
  if (toolbarNext) toolbarNext.disabled = state.page >= totalPages || totalPages <= 1;

  // フッター情報
  var footerInfo = document.getElementById('footerPageInfo');
  if (footerInfo) footerInfo.textContent = total === 0 ? '0件' : total + '件中' + (startIdx + 1) + '〜' + endIdx + '件表示';
  var footerPrev = document.getElementById('footerPrevBtn');
  var footerNext = document.getElementById('footerNextBtn');
  if (footerPrev) footerPrev.disabled = state.page <= 1;
  if (footerNext) footerNext.disabled = state.page >= totalPages || totalPages <= 1;
}

/* ===========================
   統合描画
=========================== */
function renderList() {
  applyView();
  applyFilters();
  applySort();
  applyPagination();
  updateBadgeCounts();
  updateSortButton();
  updatePaginationControls();
}

/* ===========================
   トグルスイッチ（イベント委譲）
=========================== */
function initToggles() {
  document.addEventListener('change', function (e) {
    var input = e.target;
    if (!input.matches || !input.matches('.toggle-switch input')) return;
    var text       = input.checked ? '募集中' : '募集停止';
    var badgeClass = input.checked ? 'state-badge--active' : 'state-badge--stopped';
    var container  = input.closest('td') || input.closest('.pic-state');
    if (container) {
      var badge = container.querySelector('.state-badge');
      if (badge) {
        badge.textContent = text;
        badge.className = 'state-badge ' + badgeClass;
      }
    }
  });
}

/* ===========================
   ページ遷移ヘルパー
=========================== */
function goPage(p) {
  state.page = p;
  renderList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goPrev() {
  if (state.page > 1) goPage(state.page - 1);
}

function goNext() {
  var total = countVisible();
  var totalPages = Math.ceil(total / state.perPage);
  if (state.page < totalPages) goPage(state.page + 1);
}

/* ===========================
   初期化
=========================== */
function initHeader() {
  var hamburger = document.getElementById('hamburgerBtn');
  var nav       = document.getElementById('headerNav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () { nav.classList.toggle('is-open'); });
  }
}

function initUI() {
  // サイドバータブ
  document.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.remove('tab-btn--active'); });
      btn.classList.add('tab-btn--active');
      state.tab    = btn.dataset.tab || 'active';
      state.page   = 1;
      state.filter = 'all';
      document.querySelectorAll('.filter-pill').forEach(function (p) { p.classList.remove('filter-pill--active'); });
      var allPill = document.querySelector('[data-filter="all"]');
      if (allPill) allPill.classList.add('filter-pill--active');
      renderList();
    });
  });

  // フィルターピル
  document.querySelectorAll('.filter-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      document.querySelectorAll('.filter-pill').forEach(function (p) { p.classList.remove('filter-pill--active'); });
      pill.classList.add('filter-pill--active');
      state.filter = pill.dataset.filter || 'all';
      state.page   = 1;
      renderList();
    });
  });

  // ビュー切替
  document.querySelectorAll('.view-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.view-btn').forEach(function (b) { b.classList.remove('view-btn--active'); });
      btn.classList.add('view-btn--active');
      state.view = btn.dataset.view || 'list';
      state.page = 1;
      renderList();
    });
  });

  // 表示件数
  var perPageSel = document.getElementById('perPageSelect');
  if (perPageSel) {
    perPageSel.addEventListener('change', function () {
      state.perPage = parseInt(perPageSel.value);
      state.page    = 1;
      renderList();
    });
  }

  // ツールバー前後
  var toolbarPrev = document.getElementById('toolbarPrevBtn');
  var toolbarNext = document.getElementById('toolbarNextBtn');
  if (toolbarPrev) toolbarPrev.addEventListener('click', goPrev);
  if (toolbarNext) toolbarNext.addEventListener('click', goNext);

  // フッター前後
  var footerPrev = document.getElementById('footerPrevBtn');
  var footerNext = document.getElementById('footerNextBtn');
  if (footerPrev) footerPrev.addEventListener('click', goPrev);
  if (footerNext) footerNext.addEventListener('click', goNext);

  // メインページネーション
  var pagination = document.getElementById('pagination');
  if (pagination) {
    pagination.querySelectorAll('[data-page]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = parseInt(btn.dataset.page);
        if (!isNaN(p) && p !== state.page) goPage(p);
      });
    });
    var pagePrev = document.getElementById('pagePrevBtn');
    var pageNext = document.getElementById('pageNextBtn');
    if (pagePrev) pagePrev.addEventListener('click', goPrev);
    if (pageNext) pageNext.addEventListener('click', goNext);
  }

  // 並び替えパネル
  var sortBtn   = document.getElementById('sortCtrlBtn');
  var sortPanel = document.getElementById('sortPanel');
  if (sortBtn && sortPanel) {
    sortBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      sortPanel.classList.toggle('is-open');
    });

    sortPanel.querySelectorAll('.sort-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        state.sort = opt.dataset.sort;
        state.page = 1;
        sortPanel.querySelectorAll('.sort-option').forEach(function (o) { o.classList.remove('sort-option--active'); });
        opt.classList.add('sort-option--active');
        sortBtn.title = state.sort !== 'default' ? opt.textContent.trim() : '';
        sortPanel.classList.remove('is-open');
        renderList();
      });
    });

    document.addEventListener('click', function () {
      sortPanel.classList.remove('is-open');
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initToggles();
  initUI();
  renderList();
});
