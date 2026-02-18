/**
 * 共通コンポーネント（ヘッダー・フッター）の動的読み込みと
 * UI インタラクションを管理するスクリプト
 */

async function loadComponent(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} の読み込みに失敗しました`);
    el.innerHTML = await res.text();
  } catch (e) {
    console.error(e);
  }
}

async function initComponents() {
  await Promise.all([
    loadComponent('#header-placeholder', 'components/header.html'),
    loadComponent('#footer-placeholder', 'components/footer.html'),
  ]);

  // ハンバーガーメニュー
  const hamburger = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('headerNav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }
}

// タブ切り替え
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('tab-btn--active'));
      tab.classList.add('tab-btn--active');
    });
  });
}

// フィルターピル切り替え
function initFilterPills() {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('filter-pill--active'));
      pill.classList.add('filter-pill--active');
    });
  });
}

// 募集トグル
function initToggles() {
  const toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const label = toggle.closest('.toggle-wrap')?.querySelector('.toggle-label');
      if (label) {
        label.textContent = toggle.checked ? '募集中' : '募集停止';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initComponents();
  initTabs();
  initFilterPills();
  initToggles();
});
