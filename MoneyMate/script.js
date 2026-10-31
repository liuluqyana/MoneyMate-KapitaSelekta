/* ============================================================
   MoneyMate – script.js
   Full Application Logic
   ============================================================ */

'use strict';

/* ============================================================
   CONSTANTS & CONFIG
   ============================================================ */
const STORAGE_KEYS = {
  transactions: 'moneymate_transactions',
  budget: 'moneymate_budget',
  savings: 'moneymate_savings',
  settings: 'moneymate_settings',
};

const INCOME_CATEGORIES = [
  'Gaji', 'Uang Saku', 'Freelance', 'Bisnis', 'Hadiah', 'Investasi', 'Pemasukan Lainnya'
];

const EXPENSE_CATEGORIES = [
  'Makanan dan Minuman', 'Transportasi', 'Pendidikan', 'Belanja',
  'Hiburan', 'Kesehatan', 'Tagihan', 'Kebutuhan Rumah', 'Kebutuhan Lainnya'
];

const CATEGORY_COLORS = [
  '#4A7FA7','#1A3D63','#22C55E','#F59E0B','#EF4444',
  '#8B5CF6','#EC4899','#06B6D4','#F97316','#10B981'
];

/* ============================================================
   DATA ACCESS LAYER
   ============================================================ */
function safeGetStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast('Penyimpanan data gagal. LocalStorage mungkin penuh.', 'error');
    return false;
  }
}

function getTransactions()  { return safeGetStorage(STORAGE_KEYS.transactions) || []; }
function getBudgets()       { return safeGetStorage(STORAGE_KEYS.budget) || []; }
function getSavings()       { return safeGetStorage(STORAGE_KEYS.savings) || []; }
function getSettings()      { return safeGetStorage(STORAGE_KEYS.settings) || { username: 'Pengguna', initialBalance: 500000 }; }

function saveTransactions(data)  { safeSetStorage(STORAGE_KEYS.transactions, data); }
function saveBudgets(data)       { safeSetStorage(STORAGE_KEYS.budget, data); }
function saveSavingsData(data)   { safeSetStorage(STORAGE_KEYS.savings, data); }
function saveSettingsData(data)  { safeSetStorage(STORAGE_KEYS.settings, data); }

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ============================================================
   SAMPLE DATA INITIALIZATION
   ============================================================ */
function initSampleData() {
  if (safeGetStorage(STORAGE_KEYS.transactions) !== null) return; // Data already exists

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  const transactions = [
    { id: generateId(), type: 'pemasukan', amount: 2000000, category: 'Uang Saku',          description: 'Uang Saku Bulanan',       date: `${y}-${m}-01`, note: '' },
    { id: generateId(), type: 'pemasukan', amount: 750000,  category: 'Freelance',           description: 'Proyek Desain Website',   date: `${y}-${m}-05`, note: 'Klien A' },
    { id: generateId(), type: 'pemasukan', amount: 500000,  category: 'Hadiah',              description: 'Hadiah Ulang Tahun',      date: `${y}-${m}-10`, note: '' },
    { id: generateId(), type: 'pengeluaran', amount: 350000, category: 'Makanan dan Minuman', description: 'Makan Siang & Minum',    date: `${y}-${m}-03`, note: '' },
    { id: generateId(), type: 'pengeluaran', amount: 150000, category: 'Transportasi',        description: 'Ongkos Transportasi',    date: `${y}-${m}-06`, note: 'Ojek online' },
    { id: generateId(), type: 'pengeluaran', amount: 200000, category: 'Pendidikan',          description: 'Buku Kuliah',            date: `${y}-${m}-08`, note: '' },
    { id: generateId(), type: 'pengeluaran', amount: 275000, category: 'Belanja',             description: 'Beli Kebutuhan Harian',  date: `${y}-${m}-11`, note: 'Supermarket' },
    { id: generateId(), type: 'pengeluaran', amount: 100000, category: 'Hiburan',             description: 'Nonton Film',            date: `${y}-${m}-14`, note: '' },
    { id: generateId(), type: 'pengeluaran', amount: 80000,  category: 'Kesehatan',           description: 'Beli Vitamin',           date: `${y}-${m}-15`, note: '' },
  ];

  // Add some last-month transactions for comparison
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const pm = String(prevMonth.getMonth() + 1).padStart(2, '0');
  const py = prevMonth.getFullYear();
  transactions.push(
    { id: generateId(), type: 'pemasukan',   amount: 2000000, category: 'Uang Saku',          description: 'Uang Saku Bulan Lalu',  date: `${py}-${pm}-01`, note: '' },
    { id: generateId(), type: 'pengeluaran', amount: 420000,  category: 'Makanan dan Minuman', description: 'Makan Bulan Lalu',      date: `${py}-${pm}-10`, note: '' },
    { id: generateId(), type: 'pengeluaran', amount: 130000,  category: 'Transportasi',        description: 'Transport Bulan Lalu',  date: `${py}-${pm}-12`, note: '' }
  );

  saveTransactions(transactions);

  // Sample budget
  const budgetMonth = `${y}-${m}`;
  saveBudgets([
    { id: generateId(), month: budgetMonth, category: 'total',               amount: 2000000 },
    { id: generateId(), month: budgetMonth, category: 'Makanan dan Minuman', amount: 600000 },
    { id: generateId(), month: budgetMonth, category: 'Transportasi',        amount: 300000 },
    { id: generateId(), month: budgetMonth, category: 'Hiburan',             amount: 200000 },
    { id: generateId(), month: budgetMonth, category: 'Belanja',             amount: 400000 },
  ]);

  // Sample savings
  const futureDate = new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString().split('T')[0];
  saveSavingsData([
    { id: generateId(), name: 'Beli Laptop', target: 8000000,  current: 2500000, deadline: futureDate, description: 'Laptop untuk kuliah' },
    { id: generateId(), name: 'Dana Darurat', target: 5000000, current: 1200000, deadline: `${y + 1}-01-01`, description: 'Tabungan dana darurat 3 bulan' },
    { id: generateId(), name: 'Liburan',      target: 3000000, current: 800000,  deadline: `${y}-12-31`, description: 'Liburan akhir tahun' },
  ]);

  saveSettingsData({ username: 'Pengguna', initialBalance: 500000 });
}

/* ============================================================
   FINANCIAL CALCULATIONS
   ============================================================ */
function calcTotalBalance() {
  const settings = getSettings();
  const transactions = getTransactions();
  let balance = Number(settings.initialBalance) || 0;
  transactions.forEach(t => {
    if (t.type === 'pemasukan') balance += Number(t.amount);
    else balance -= Number(t.amount);
  });
  return balance;
}

function calcTotalIncome(transactions) {
  return transactions.filter(t => t.type === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0);
}

function calcTotalExpense(transactions) {
  return transactions.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0);
}

function getTransactionsByPeriod(period) {
  const all = getTransactions();
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  if (period === 'this_month') {
    return all.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }
  if (period === 'last_month') {
    const lm = new Date(y, m - 1, 1);
    return all.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
    });
  }
  if (period === 'this_year') {
    return all.filter(t => new Date(t.date).getFullYear() === y);
  }
  return all;
}

function calcBudgetSummary(yearMonth) {
  const budgets = getBudgets().filter(b => b.month === yearMonth);
  const totalBudget = budgets.find(b => b.category === 'total');
  const [y, m] = yearMonth.split('-').map(Number);
  const expenses = getTransactions().filter(t => {
    if (t.type !== 'pengeluaran') return false;
    const d = new Date(t.date);
    return d.getFullYear() === y && d.getMonth() + 1 === m;
  });
  const totalExpense = calcTotalExpense(expenses);
  const budgetAmount = totalBudget ? Number(totalBudget.amount) : 0;
  const remaining = budgetAmount - totalExpense;
  const pct = budgetAmount > 0 ? Math.min((totalExpense / budgetAmount) * 100, 100) : 0;
  return { budgetAmount, totalExpense, remaining, pct };
}

/* ============================================================
   FORMAT HELPERS
   ============================================================ */
function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return 'Rp\u00A0' + num.toLocaleString('id-ID');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str || '');
  return div.innerHTML;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function currentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getBudgetStatusClass(pct) {
  if (pct < 50)  return { text: 'budget-status-safe',  bar: 'progress-safe',  label: 'Aman' };
  if (pct < 80)  return { text: 'budget-status-warn',  bar: 'progress-warn',  label: 'Meningkat' };
  if (pct < 100) return { text: 'budget-status-alert', bar: 'progress-alert', label: 'Hampir Penuh' };
  return             { text: 'budget-status-over',  bar: 'progress-over',  label: 'Melebihi Batas' };
}

/* ============================================================
   NAVIGATION
   ============================================================ */
let currentPage = 'dashboard';

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
  const section = document.getElementById('page-' + page);
  if (section) section.classList.remove('hidden');

  const titles = {
    dashboard: ['Dashboard', 'Ringkasan keuangan Anda'],
    transaksi: ['Manajemen Transaksi', 'Kelola seluruh transaksi keuangan'],
    analisis:  ['Analisis Keuangan', 'Gambaran menyeluruh kondisi finansial'],
    anggaran:  ['Anggaran Bulanan', 'Kontrol pengeluaran dengan anggaran'],
    tabungan:  ['Target Tabungan', 'Pantau progres tujuan keuangan'],
    pengaturan:['Pengaturan', 'Kelola profil dan data aplikasi'],
  };
  const [title, sub] = titles[page] || ['MoneyMate', ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = sub;

  closeSidebar();

  if (page === 'dashboard') updateDashboard();
  if (page === 'transaksi') { populateCategoryFilter(); renderTransactions(); }
  if (page === 'analisis')  renderAnalysis();
  if (page === 'anggaran')  renderBudget();
  if (page === 'tabungan')  renderSavings();
  if (page === 'pengaturan') loadSettings();
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function openSidebar() {
  document.getElementById('sidebar').classList.remove('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.remove('hidden');
}

function closeSidebar() {
  if (window.innerWidth >= 1024) return;
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.add('hidden');
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = {
    success: '<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    error:   '<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    warning: '<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>',
    info:    '<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01"/></svg>',
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = (icons[type] || icons.info) + `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ============================================================
   CONFIRM MODAL
   ============================================================ */
let _confirmCallback = null;

function showConfirm(title, message, callback) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = message;
  _confirmCallback = callback;
  document.getElementById('modal-confirm').classList.remove('hidden');
}

function closeConfirmModal() {
  document.getElementById('modal-confirm').classList.add('hidden');
  _confirmCallback = null;
}

document.getElementById('confirm-action-btn').addEventListener('click', () => {
  if (_confirmCallback) _confirmCallback();
  closeConfirmModal();
});

/* ============================================================
   DASHBOARD
   ============================================================ */
let dashMainChartInstance = null;
let dashDoughnutChartInstance = null;

function updateDashboard() {
  const settings = getSettings();
  const period = document.getElementById('dash-period').value;
  const trxPeriod = getTransactionsByPeriod(period);

  // Update name
  document.getElementById('dash-username').textContent = escapeHtml(settings.username || 'Pengguna');
  document.getElementById('sidebar-username').textContent = escapeHtml(settings.username || 'Pengguna');
  document.getElementById('sidebar-avatar').textContent = (settings.username || 'U').charAt(0).toUpperCase();

  // Cards
  const totalBalance  = calcTotalBalance();
  const totalIncome   = calcTotalIncome(trxPeriod);
  const totalExpense  = calcTotalExpense(trxPeriod);

  document.getElementById('card-saldo').textContent     = formatRupiah(totalBalance);
  document.getElementById('card-pemasukan').textContent = formatRupiah(totalIncome);
  document.getElementById('card-pengeluaran').textContent = formatRupiah(totalExpense);

  // Compare with previous month
  const prevTrx = getTransactionsByPeriod('last_month');
  const prevIncome  = calcTotalIncome(prevTrx);
  const prevExpense = calcTotalExpense(prevTrx);
  document.getElementById('card-pemasukan-change').textContent  = changeLabel(totalIncome,  prevIncome);
  document.getElementById('card-pengeluaran-change').textContent = changeLabel(totalExpense, prevExpense);

  // Budget card
  const ym = currentYearMonth();
  const bSummary = calcBudgetSummary(ym);
  document.getElementById('card-anggaran').textContent = bSummary.budgetAmount > 0
    ? formatRupiah(bSummary.remaining)
    : 'Belum ada anggaran';
  const pct = bSummary.pct;
  const bar = document.getElementById('card-anggaran-bar');
  const pctEl = document.getElementById('card-anggaran-pct');
  const st = getBudgetStatusClass(pct);
  bar.style.width = pct + '%';
  bar.className = `h-full rounded-full transition-all duration-500 ${st.bar}`;
  pctEl.textContent = bSummary.budgetAmount > 0 ? `${pct.toFixed(0)}% terpakai – ${st.label}` : '';

  // Desc
  const desc = totalIncome >= totalExpense
    ? 'Kondisi keuangan Anda sehat! Pemasukan lebih besar dari pengeluaran.'
    : 'Pengeluaran melebihi pemasukan. Tinjau anggaran Anda.';
  document.getElementById('dash-desc').textContent = desc;

  renderDashboardChart();
  renderDashboardDoughnut(trxPeriod);
  renderRecentTransactions();
  renderDashboardInsights(trxPeriod);
}

function changeLabel(current, prev) {
  if (prev === 0) return '';
  const diff = current - prev;
  const pct = Math.abs((diff / prev) * 100).toFixed(1);
  if (diff > 0) return `▲ ${pct}% dari periode sebelumnya`;
  if (diff < 0) return `▼ ${pct}% dari periode sebelumnya`;
  return 'Sama dengan periode sebelumnya';
}

function renderDashboardChart() {
  const period = document.getElementById('dash-chart-period').value;
  const { labels, income, expense } = buildChartData(period);
  const ctx = document.getElementById('dashMainChart').getContext('2d');

  if (dashMainChartInstance) dashMainChartInstance.destroy();
  dashMainChartInstance = new Chart(ctx, {
    type: period === 'monthly' ? 'bar' : 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Pemasukan',
          data: income,
          backgroundColor: 'rgba(34,197,94,0.15)',
          borderColor: '#22C55E',
          borderWidth: 2,
          borderRadius: 6,
          fill: period !== 'monthly',
          tension: 0.4,
          pointBackgroundColor: '#22C55E',
          pointRadius: 3,
        },
        {
          label: 'Pengeluaran',
          data: expense,
          backgroundColor: 'rgba(239,68,68,0.15)',
          borderColor: '#EF4444',
          borderWidth: 2,
          borderRadius: 6,
          fill: period !== 'monthly',
          tension: 0.4,
          pointBackgroundColor: '#EF4444',
          pointRadius: 3,
        }
      ]
    },
    options: chartOptions()
  });
}

function renderDashboardDoughnut(trxPeriod) {
  const expenses = trxPeriod.filter(t => t.type === 'pengeluaran');
  const catMap = {};
  expenses.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
  });
  const labels = Object.keys(catMap);
  const values = Object.values(catMap);
  const ctx = document.getElementById('dashDoughnutChart').getContext('2d');

  if (dashDoughnutChartInstance) dashDoughnutChartInstance.destroy();

  if (labels.length === 0) {
    document.getElementById('dash-cat-legend').innerHTML = '<p class="text-xs text-midnight/40 text-center py-2">Belum ada data pengeluaran.</p>';
    dashDoughnutChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['Tidak Ada Data'], datasets: [{ data: [1], backgroundColor: ['#E2E8F0'] }] },
      options: { plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }
    });
    return;
  }

  dashDoughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: CATEGORY_COLORS.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: ctx => ` ${ctx.label}: ${formatRupiah(ctx.raw)}`
      }}},
      cutout: '68%',
    }
  });

  const total = values.reduce((a, b) => a + b, 0);
  const legend = document.getElementById('dash-cat-legend');
  legend.innerHTML = labels.map((l, i) => `
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${CATEGORY_COLORS[i]}"></span>
        <span class="text-xs text-midnight/70 truncate">${escapeHtml(l)}</span>
      </div>
      <span class="text-xs font-semibold text-midnight flex-shrink-0">${total > 0 ? ((values[i]/total)*100).toFixed(1) : 0}%</span>
    </div>`).join('');
}

function renderRecentTransactions() {
  const all = getTransactions().slice().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const container = document.getElementById('dash-recent-list');
  if (all.length === 0) {
    container.innerHTML = emptyStateHTML('Belum ada transaksi. Tambahkan transaksi pertama Anda!');
    return;
  }
  container.innerHTML = all.map(t => `
    <div class="flex items-center gap-3 py-2 border-b border-border-gray last:border-0">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === 'pemasukan' ? 'bg-success/10' : 'bg-danger/10'}">
        ${t.type === 'pemasukan'
          ? '<svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>'
          : '<svg class="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>'}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-midnight truncate">${escapeHtml(t.description)}</div>
        <div class="text-xs text-midnight/50">${escapeHtml(t.category)} · ${formatDate(t.date)}</div>
      </div>
      <div class="text-sm font-bold flex-shrink-0 ${t.type === 'pemasukan' ? 'text-success' : 'text-danger'}">
        ${t.type === 'pemasukan' ? '+' : '-'}${formatRupiah(t.amount)}
      </div>
    </div>`).join('');
}

function renderDashboardInsights(trxPeriod) {
  const container = document.getElementById('dash-insights');
  const insights = generateInsights(trxPeriod);
  if (insights.length === 0) {
    container.innerHTML = '<p class="text-xs text-midnight/40 text-center py-4">Tambahkan transaksi untuk melihat insight keuangan.</p>';
    return;
  }
  container.innerHTML = insights.map(i => `
    <div class="insight-item">
      <span class="insight-dot" style="background:${i.color}"></span>
      <span>${escapeHtml(i.text)}</span>
    </div>`).join('');
}

function generateInsights(trxPeriod) {
  const insights = [];
  const totalIncome = calcTotalIncome(trxPeriod);
  const totalExpense = calcTotalExpense(trxPeriod);

  if (totalIncome > 0 && totalExpense > 0) {
    const ratio = (totalExpense / totalIncome * 100).toFixed(0);
    insights.push({ text: `Rasio pengeluaran terhadap pemasukan: ${ratio}%.`, color: ratio > 80 ? '#EF4444' : '#4A7FA7' });
  }

  if (totalIncome >= totalExpense && totalIncome > 0) {
    insights.push({ text: 'Pemasukan bulan ini lebih besar daripada pengeluaran. Kondisi sehat!', color: '#22C55E' });
  } else if (totalExpense > totalIncome && totalIncome > 0) {
    insights.push({ text: 'Pengeluaran melebihi pemasukan. Perlu perhatian!', color: '#EF4444' });
  }

  const expenses = trxPeriod.filter(t => t.type === 'pengeluaran');
  if (expenses.length > 0) {
    const catMap = {};
    expenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });
    const topCat = Object.entries(catMap).sort((a,b) => b[1]-a[1])[0];
    if (topCat) insights.push({ text: `Pengeluaran terbesar: ${topCat[0]} (${formatRupiah(topCat[1])}).`, color: '#F59E0B' });
  }

  const ym = currentYearMonth();
  const bSummary = calcBudgetSummary(ym);
  if (bSummary.budgetAmount > 0) {
    insights.push({ text: `Anggaran bulanan telah digunakan ${bSummary.pct.toFixed(0)}%.`, color: getBudgetStatusClass(bSummary.pct).bar.replace('progress-', '') === 'safe' ? '#22C55E' : '#F59E0B' });
  }

  const prevTrx = getTransactionsByPeriod('last_month');
  const prevExpense = calcTotalExpense(prevTrx);
  if (prevExpense > 0 && totalExpense > 0) {
    const diff = totalExpense - prevExpense;
    if (diff > 0) insights.push({ text: `Pengeluaran bulan ini lebih besar ${formatRupiah(diff)} dibanding bulan lalu.`, color: '#EF4444' });
    else if (diff < 0) insights.push({ text: `Pengeluaran bulan ini lebih hemat ${formatRupiah(Math.abs(diff))} dibanding bulan lalu.`, color: '#22C55E' });
  }

  return insights.slice(0, 5);
}

/* ============================================================
   CHART DATA BUILDER
   ============================================================ */
function buildChartData(period) {
  const all = getTransactions();
  const now = new Date();
  const labels = [], income = [], expense = [];

  if (period === 'weekly') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayTrx = all.filter(t => t.date === ds);
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
      income.push(calcTotalIncome(dayTrx));
      expense.push(calcTotalExpense(dayTrx));
    }
  } else if (period === 'monthly') {
    const y = now.getFullYear(), m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayTrx = all.filter(t => t.date === ds);
      labels.push(String(d));
      income.push(calcTotalIncome(dayTrx));
      expense.push(calcTotalExpense(dayTrx));
    }
  } else if (period === 'yearly') {
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    for (let mo = 0; mo < 12; mo++) {
      const monthTrx = all.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === mo;
      });
      labels.push(monthNames[mo]);
      income.push(calcTotalIncome(monthTrx));
      expense.push(calcTotalExpense(monthTrx));
    }
  }

  return { labels, income, expense };
}

function buildAnalysisChartData(period) {
  const all = getTransactions();
  const now = new Date();
  const labels = [], income = [], expense = [];

  if (period === '7days') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayTrx = all.filter(t => t.date === ds);
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
      income.push(calcTotalIncome(dayTrx));
      expense.push(calcTotalExpense(dayTrx));
    }
  } else if (period === 'this_month') {
    const y = now.getFullYear(), m = now.getMonth();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayTrx = all.filter(t => t.date === ds);
      labels.push(String(d));
      income.push(calcTotalIncome(dayTrx));
      expense.push(calcTotalExpense(dayTrx));
    }
  } else if (period === '6months') {
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTrx = all.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
      });
      labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
      income.push(calcTotalIncome(monthTrx));
      expense.push(calcTotalExpense(monthTrx));
    }
  } else if (period === 'this_year') {
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    for (let mo = 0; mo < 12; mo++) {
      const monthTrx = all.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === mo;
      });
      labels.push(monthNames[mo]);
      income.push(calcTotalIncome(monthTrx));
      expense.push(calcTotalExpense(monthTrx));
    }
  }

  return { labels, income, expense };
}

function chartOptions(yLabel = '') {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 11 }, padding: 14, boxWidth: 12 } },
      tooltip: {
        backgroundColor: '#0A1931',
        titleFont: { family: 'Plus Jakarta Sans', size: 11 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.dataset.label}: ${formatRupiah(ctx.raw)}` }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 10 }, maxTicksLimit: 12 } },
      y: { grid: { color: 'rgba(179,207,229,0.35)', drawBorder: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 10 }, callback: v => 'Rp'+v.toLocaleString('id-ID') } }
    }
  };
}

/* ============================================================
   TRANSACTIONS – CRUD
   ============================================================ */
let currentTrxPage = 1;
let filteredTrxData = [];

function addTransaction(data) {
  const transactions = getTransactions();
  transactions.push({ id: generateId(), ...data });
  saveTransactions(transactions);
}

function updateTransaction(id, data) {
  const transactions = getTransactions();
  const idx = transactions.findIndex(t => t.id === id);
  if (idx !== -1) {
    transactions[idx] = { ...transactions[idx], ...data };
    saveTransactions(transactions);
  }
}

function deleteTransaction(id) {
  const transactions = getTransactions().filter(t => t.id !== id);
  saveTransactions(transactions);
}

/* ---- Transaction Modal ---- */
function openTransactionModal(id = null) {
  const form = document.getElementById('form-transaction');
  form.reset();
  clearTransactionErrors();
  document.getElementById('trx-edit-id').value = id || '';
  document.getElementById('modal-trx-title').textContent = id ? 'Edit Transaksi' : 'Tambah Transaksi';
  document.getElementById('btn-submit-trx').textContent = id ? 'Simpan Perubahan' : 'Simpan';

  // Reset type buttons
  document.getElementById('btn-pemasukan').classList.remove('selected');
  document.getElementById('btn-pengeluaran').classList.remove('selected');
  document.getElementById('trx-type').value = '';

  if (id) {
    const t = getTransactions().find(t => t.id === id);
    if (t) {
      setTransactionType(t.type);
      document.getElementById('trx-amount').value = t.amount;
      document.getElementById('trx-desc').value = t.description;
      document.getElementById('trx-date').value = t.date;
      document.getElementById('trx-note').value = t.note || '';
      // category filled after type change populates options
      setTimeout(() => { document.getElementById('trx-category').value = t.category; }, 50);
    }
  } else {
    document.getElementById('trx-date').value = todayStr();
  }

  document.getElementById('modal-transaction').classList.remove('hidden');
}

function closeTransactionModal() {
  document.getElementById('modal-transaction').classList.add('hidden');
}

function setTransactionType(type) {
  document.getElementById('trx-type').value = type;
  const btnP = document.getElementById('btn-pemasukan');
  const btnE = document.getElementById('btn-pengeluaran');
  btnP.classList.toggle('selected', type === 'pemasukan');
  btnE.classList.toggle('selected', type === 'pengeluaran');

  const catSel = document.getElementById('trx-category');
  const cats = type === 'pemasukan' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  catSel.innerHTML = '<option value="">-- Pilih Kategori --</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function clearTransactionErrors() {
  ['trx-amount-err','trx-cat-err','trx-desc-err','trx-date-err'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}

function submitTransaction(e) {
  e.preventDefault();
  clearTransactionErrors();
  let valid = true;

  const type   = document.getElementById('trx-type').value;
  const amount = Number(document.getElementById('trx-amount').value);
  const cat    = document.getElementById('trx-category').value;
  const desc   = document.getElementById('trx-desc').value.trim();
  const date   = document.getElementById('trx-date').value;
  const note   = document.getElementById('trx-note').value.trim();
  const editId = document.getElementById('trx-edit-id').value;

  if (!type) { showToast('Pilih jenis transaksi terlebih dahulu.', 'error'); valid = false; }
  if (!amount || amount <= 0) { document.getElementById('trx-amount-err').classList.remove('hidden'); valid = false; }
  if (!cat)   { document.getElementById('trx-cat-err').classList.remove('hidden'); valid = false; }
  if (!desc)  { document.getElementById('trx-desc-err').classList.remove('hidden'); valid = false; }
  if (!date)  { document.getElementById('trx-date-err').classList.remove('hidden'); valid = false; }
  if (!valid) return;

  const data = { type, amount, category: cat, description: desc, date, note };

  if (editId) {
    updateTransaction(editId, data);
    showToast('Transaksi berhasil diperbarui.', 'success');
  } else {
    addTransaction(data);
    showToast('Transaksi berhasil ditambahkan.', 'success');
  }

  closeTransactionModal();
  if (currentPage === 'transaksi') renderTransactions();
  updateDashboard(); // Always keep dashboard data fresh
}

/* ---- Transaction List ---- */
function populateCategoryFilter() {
  const sel = document.getElementById('trx-filter-cat');
  const allCats = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  sel.innerHTML = '<option value="all">Semua Kategori</option>' +
    allCats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function filterTransactions() {
  currentTrxPage = 1;
  renderTransactions();
}

function renderTransactions() {
  const search  = (document.getElementById('trx-search').value || '').toLowerCase();
  const type    = document.getElementById('trx-filter-type').value;
  const cat     = document.getElementById('trx-filter-cat').value;
  const month   = document.getElementById('trx-filter-month').value;
  const sort    = document.getElementById('trx-sort').value;

  let data = getTransactions();

  if (search) data = data.filter(t => t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
  if (type !== 'all') data = data.filter(t => t.type === type);
  if (cat !== 'all')  data = data.filter(t => t.category === cat);
  if (month) {
    const [y, m] = month.split('-').map(Number);
    data = data.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
  }

  if (sort === 'date_desc') data.sort((a,b) => new Date(b.date) - new Date(a.date));
  else if (sort === 'date_asc') data.sort((a,b) => new Date(a.date) - new Date(b.date));
  else if (sort === 'amount_desc') data.sort((a,b) => b.amount - a.amount);
  else if (sort === 'amount_asc')  data.sort((a,b) => a.amount - b.amount);

  filteredTrxData = data;
  const perPage = Number(document.getElementById('trx-per-page').value) || 10;
  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  if (currentTrxPage > totalPages) currentTrxPage = totalPages;

  const start = (currentTrxPage - 1) * perPage;
  const pageData = data.slice(start, start + perPage);

  document.getElementById('trx-count-label').textContent = `${data.length} transaksi tercatat`;
  document.getElementById('trx-total-label').textContent = `${data.length} data`;

  const tbody = document.getElementById('trx-table-body');
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      <div><p class="font-semibold text-midnight/40">Tidak ada transaksi</p><p class="text-xs mt-1">Coba ubah filter atau tambahkan transaksi baru.</p></div>
    </div></td></tr>`;
    renderPagination(0, perPage);
    return;
  }

  tbody.innerHTML = pageData.map((t, i) => `
    <tr>
      <td class="px-4 py-3 text-sm text-midnight/40">${start + i + 1}</td>
      <td class="px-4 py-3 text-sm text-midnight">${formatDate(t.date)}</td>
      <td class="px-4 py-3">
        <div class="text-sm font-medium text-midnight">${escapeHtml(t.description)}</div>
        ${t.note ? `<div class="text-xs text-midnight/40 mt-0.5">${escapeHtml(t.note)}</div>` : ''}
      </td>
      <td class="px-4 py-3"><span class="badge badge-category">${escapeHtml(t.category)}</span></td>
      <td class="px-4 py-3"><span class="badge ${t.type === 'pemasukan' ? 'badge-income' : 'badge-expense'}">${t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
      <td class="px-4 py-3 text-right font-bold text-sm ${t.type === 'pemasukan' ? 'text-success' : 'text-danger'}">
        ${t.type === 'pemasukan' ? '+' : '-'}${formatRupiah(t.amount)}
      </td>
      <td class="px-4 py-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <button onclick="openTransactionModal('${t.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-steel/10 text-steel transition-colors" title="Edit">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="deleteTransactionConfirm('${t.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger/10 text-danger transition-colors" title="Hapus">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  renderPagination(data.length, perPage);
}

function deleteTransactionConfirm(id) {
  showConfirm('Hapus Transaksi', 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.', () => {
    deleteTransaction(id);
    showToast('Transaksi berhasil dihapus.', 'success');
    renderTransactions();
    updateDashboard();
  });
}

function renderPagination(total, perPage) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const container = document.getElementById('trx-pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goToPage(1)" ${currentTrxPage === 1 ? 'disabled' : ''}>«</button>
              <button class="page-btn" onclick="goToPage(${currentTrxPage - 1})" ${currentTrxPage === 1 ? 'disabled' : ''}>‹</button>`;

  const start = Math.max(1, currentTrxPage - 2);
  const end   = Math.min(totalPages, currentTrxPage + 2);
  for (let p = start; p <= end; p++) {
    html += `<button class="page-btn ${p === currentTrxPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
  }

  html += `<button class="page-btn" onclick="goToPage(${currentTrxPage + 1})" ${currentTrxPage === totalPages ? 'disabled' : ''}>›</button>
           <button class="page-btn" onclick="goToPage(${totalPages})" ${currentTrxPage === totalPages ? 'disabled' : ''}>»</button>`;
  container.innerHTML = html;
}

function goToPage(p) {
  currentTrxPage = p;
  renderTransactions();
}

/* ============================================================
   ANALYSIS PAGE
   ============================================================ */
let analisisMainChartInstance = null;
let analisisDoughnutChartInstance = null;

function renderAnalysis() {
  const period = document.getElementById('analisis-period').value;
  const { labels, income, expense } = buildAnalysisChartData(period);

  // Main chart
  const ctx1 = document.getElementById('analisisMainChart').getContext('2d');
  if (analisisMainChartInstance) analisisMainChartInstance.destroy();
  analisisMainChartInstance = new Chart(ctx1, {
    type: (period === 'this_month' || period === '7days') ? 'bar' : 'line',
    data: {
      labels,
      datasets: [
        { label: 'Pemasukan', data: income, backgroundColor: 'rgba(34,197,94,0.2)', borderColor: '#22C55E', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#22C55E' },
        { label: 'Pengeluaran', data: expense, backgroundColor: 'rgba(239,68,68,0.2)', borderColor: '#EF4444', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#EF4444' }
      ]
    },
    options: chartOptions()
  });

  // Doughnut – for filtered period
  const all = getTransactions();
  const now = new Date();
  let filtered = [];
  if (period === '7days') {
    const ago = new Date(); ago.setDate(ago.getDate() - 6);
    filtered = all.filter(t => new Date(t.date) >= ago);
  } else if (period === 'this_month') {
    filtered = all.filter(t => { const d = new Date(t.date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); });
  } else if (period === '6months') {
    const ago = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    filtered = all.filter(t => new Date(t.date) >= ago);
  } else {
    filtered = all.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
  }

  const expenses = filtered.filter(t => t.type === 'pengeluaran');
  const catMap = {};
  expenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });
  const dLabels = Object.keys(catMap);
  const dValues = Object.values(catMap);

  const ctx2 = document.getElementById('analisisDoughnutChart').getContext('2d');
  if (analisisDoughnutChartInstance) analisisDoughnutChartInstance.destroy();
  analisisDoughnutChartInstance = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: dLabels.length ? dLabels : ['Tidak Ada Data'],
      datasets: [{ data: dLabels.length ? dValues : [1], backgroundColor: dLabels.length ? CATEGORY_COLORS.slice(0, dLabels.length) : ['#E2E8F0'], borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 10 }, padding: 10, boxWidth: 10 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatRupiah(ctx.raw)}` } }
      },
      cutout: '65%'
    }
  });

  // Stats
  renderAnalysisStats(filtered);

  // Comparison
  renderMonthlyComparison();

  // Insights
  renderAnalysisInsights(filtered);
}

function renderAnalysisStats(trx) {
  const totalIncome  = calcTotalIncome(trx);
  const totalExpense = calcTotalExpense(trx);
  const expenses = trx.filter(t => t.type === 'pengeluaran');
  const catMap = {};
  expenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount); });
  const topCat = Object.entries(catMap).sort((a,b) => b[1]-a[1])[0];

  // Avg daily expense
  const uniqueDays = new Set(expenses.map(t => t.date)).size;
  const avgDaily = uniqueDays > 0 ? totalExpense / uniqueDays : 0;

  // Ratio
  const ratio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0;

  // Highest expense day
  const dayMap = {};
  expenses.forEach(t => { dayMap[t.date] = (dayMap[t.date] || 0) + Number(t.amount); });
  const topDay = Object.entries(dayMap).sort((a,b) => b[1]-a[1])[0];

  const container = document.getElementById('analisis-stats');
  const stats = [
    { label: 'Total Pemasukan', value: formatRupiah(totalIncome), color: 'text-success' },
    { label: 'Total Pengeluaran', value: formatRupiah(totalExpense), color: 'text-danger' },
    { label: 'Rata-rata Pengeluaran/Hari', value: formatRupiah(avgDaily), color: 'text-midnight' },
    { label: 'Kategori Terbesar', value: topCat ? escapeHtml(topCat[0]) : 'N/A', color: 'text-warning' },
    { label: 'Hari Pengeluaran Tertinggi', value: topDay ? formatDate(topDay[0]) : 'N/A', color: 'text-midnight' },
    { label: 'Rasio Pengeluaran', value: `${ratio}%`, color: Number(ratio) > 80 ? 'text-danger' : 'text-success' },
  ];

  container.innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value ${s.color}">${s.value}</div>
    </div>`).join('');
}

function renderMonthlyComparison() {
  const now = new Date();
  const thisMonth = getTransactionsByPeriod('this_month');
  const lastMonth = getTransactionsByPeriod('last_month');

  const thisIncome  = calcTotalIncome(thisMonth);
  const thisExpense = calcTotalExpense(thisMonth);
  const lastIncome  = calcTotalIncome(lastMonth);
  const lastExpense = calcTotalExpense(lastMonth);

  function pctChange(curr, prev) {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const p = ((curr - prev) / prev * 100).toFixed(1);
    return (p > 0 ? '+' : '') + p + '%';
  }
  function changeColor(curr, prev, higherIsBad = false) {
    if (curr > prev) return higherIsBad ? 'text-danger' : 'text-success';
    if (curr < prev) return higherIsBad ? 'text-success' : 'text-danger';
    return 'text-midnight/50';
  }

  const prevM = new Date(now.getFullYear(), now.getMonth()-1,1);
  const curLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const prevLabel = prevM.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Category changes
  const thisExpenses = thisMonth.filter(t => t.type === 'pengeluaran');
  const lastExpenses = lastMonth.filter(t => t.type === 'pengeluaran');
  const thisCatMap = {}, lastCatMap = {};
  thisExpenses.forEach(t => { thisCatMap[t.category] = (thisCatMap[t.category]||0) + Number(t.amount); });
  lastExpenses.forEach(t => { lastCatMap[t.category] = (lastCatMap[t.category]||0) + Number(t.amount); });

  const catIncreased = Object.keys(thisCatMap).filter(c => (thisCatMap[c]||0) > (lastCatMap[c]||0));

  const container = document.getElementById('analisis-comparison');
  container.innerHTML = `
    <div class="text-xs text-midnight/50 mb-3 font-medium">${prevLabel} → ${curLabel}</div>
    <div class="comparison-row">
      <span class="text-midnight/70">Pemasukan</span>
      <div class="text-right">
        <div class="font-semibold text-midnight text-sm">${formatRupiah(thisIncome)}</div>
        <div class="text-xs ${changeColor(thisIncome, lastIncome)}">${pctChange(thisIncome, lastIncome)} dari ${formatRupiah(lastIncome)}</div>
      </div>
    </div>
    <div class="comparison-row">
      <span class="text-midnight/70">Pengeluaran</span>
      <div class="text-right">
        <div class="font-semibold text-midnight text-sm">${formatRupiah(thisExpense)}</div>
        <div class="text-xs ${changeColor(thisExpense, lastExpense, true)}">${pctChange(thisExpense, lastExpense)} dari ${formatRupiah(lastExpense)}</div>
      </div>
    </div>
    <div class="comparison-row">
      <span class="text-midnight/70">Perubahan Saldo</span>
      <div class="text-right">
        <div class="font-semibold ${(thisIncome - thisExpense) >= 0 ? 'text-success' : 'text-danger'} text-sm">${formatRupiah(thisIncome - thisExpense)}</div>
      </div>
    </div>
    ${catIncreased.length > 0 ? `
    <div class="mt-3 p-3 bg-warning/5 rounded-xl border border-warning/20">
      <p class="text-xs font-semibold text-warning mb-1">Kategori yang Meningkat:</p>
      <p class="text-xs text-midnight/70">${catIncreased.map(c => escapeHtml(c)).join(', ')}</p>
    </div>` : ''}`;
}

function renderAnalysisInsights(trx) {
  const container = document.getElementById('analisis-insights');
  const insights = generateInsights(trx);

  // Additional analysis-specific insights
  const all = getTransactions();
  const now = new Date();
  const thisMonth = getTransactionsByPeriod('this_month');
  const lastMonth = getTransactionsByPeriod('last_month');

  const thisExpenses = thisMonth.filter(t => t.type === 'pengeluaran');
  const lastExpenses = lastMonth.filter(t => t.type === 'pengeluaran');
  const thisCatMap = {}, lastCatMap = {};
  thisExpenses.forEach(t => { thisCatMap[t.category] = (thisCatMap[t.category]||0) + Number(t.amount); });
  lastExpenses.forEach(t => { lastCatMap[t.category] = (lastCatMap[t.category]||0) + Number(t.amount); });

  Object.keys(thisCatMap).forEach(cat => {
    const prev = lastCatMap[cat] || 0;
    if (prev > 0 && thisCatMap[cat] > prev * 1.2) {
      const pct = ((thisCatMap[cat] - prev) / prev * 100).toFixed(0);
      insights.push({ text: `Pengeluaran ${cat} meningkat ${pct}% dibanding bulan lalu.`, color: '#EF4444' });
    }
  });

  if (insights.length === 0) {
    container.innerHTML = '<p class="text-xs text-midnight/40 text-center py-4">Tambahkan lebih banyak transaksi untuk melihat insight.</p>';
    return;
  }

  container.innerHTML = insights.slice(0, 6).map(i => `
    <div class="insight-item">
      <span class="insight-dot" style="background:${i.color}"></span>
      <span>${escapeHtml(i.text)}</span>
    </div>`).join('');
}

/* ============================================================
   BUDGET
   ============================================================ */
function openBudgetModal(id = null) {
  document.getElementById('form-budget').reset();
  document.getElementById('budget-edit-id').value = id || '';
  document.getElementById('modal-budget-title').textContent = id ? 'Edit Anggaran' : 'Tambah Anggaran';

  if (id) {
    const b = getBudgets().find(b => b.id === id);
    if (b) {
      document.getElementById('budget-month-input').value = b.month;
      document.getElementById('budget-category').value = b.category;
      document.getElementById('budget-amount').value = b.amount;
    }
  } else {
    document.getElementById('budget-month-input').value = currentYearMonth();
  }

  document.getElementById('modal-budget').classList.remove('hidden');
}

function closeBudgetModal() {
  document.getElementById('modal-budget').classList.add('hidden');
}

function submitBudget(e) {
  e.preventDefault();
  const editId = document.getElementById('budget-edit-id').value;
  const month  = document.getElementById('budget-month-input').value;
  const cat    = document.getElementById('budget-category').value;
  const amount = Number(document.getElementById('budget-amount').value);

  if (!month || !cat || !amount || amount <= 0) {
    showToast('Lengkapi semua field anggaran.', 'error');
    return;
  }

  let budgets = getBudgets();

  if (editId) {
    const idx = budgets.findIndex(b => b.id === editId);
    if (idx !== -1) budgets[idx] = { ...budgets[idx], month, category: cat, amount };
  } else {
    // Check duplicate
    const exists = budgets.find(b => b.month === month && b.category === cat);
    if (exists) {
      showToast('Anggaran untuk bulan dan kategori ini sudah ada.', 'error');
      return;
    }
    budgets.push({ id: generateId(), month, category: cat, amount });
  }

  saveBudgets(budgets);
  closeBudgetModal();
  showToast('Anggaran berhasil disimpan.', 'success');
  renderBudget();
}

function deleteBudgetConfirm(id) {
  showConfirm('Hapus Anggaran', 'Yakin ingin menghapus anggaran ini?', () => {
    saveBudgets(getBudgets().filter(b => b.id !== id));
    showToast('Anggaran berhasil dihapus.', 'success');
    renderBudget();
  });
}

function renderBudget() {
  const monthInput = document.getElementById('anggaran-month');
  if (!monthInput.value) monthInput.value = currentYearMonth();
  const ym = monthInput.value;
  const [y, m] = ym.split('-').map(Number);

  const budgets = getBudgets().filter(b => b.month === ym);
  const allTrx = getTransactions().filter(t => {
    if (t.type !== 'pengeluaran') return false;
    const d = new Date(t.date);
    return d.getFullYear() === y && d.getMonth() + 1 === m;
  });

  const totalExpense = calcTotalExpense(allTrx);
  const totalBudget  = budgets.find(b => b.category === 'total');
  const budgetAmount = totalBudget ? Number(totalBudget.amount) : 0;
  const remaining    = budgetAmount - totalExpense;
  const pct          = budgetAmount > 0 ? Math.min((totalExpense / budgetAmount) * 100, 100) : 0;
  const st           = getBudgetStatusClass(pct);

  // Overall summary
  const summaryEl = document.getElementById('anggaran-summary');
  if (budgetAmount === 0) {
    summaryEl.innerHTML = `
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="text-soft-blue/70 text-sm">Bulan ${new Date(y, m-1).toLocaleDateString('id-ID', {month:'long', year:'numeric'})}</p>
          <p class="text-white font-semibold mt-1">Belum ada anggaran total bulan ini.</p>
          <p class="text-soft-blue/60 text-xs mt-0.5">Tambahkan anggaran untuk mulai memantau pengeluaran.</p>
        </div>
        <button onclick="openBudgetModal()" class="text-xs bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl font-semibold transition-colors">+ Buat Anggaran</button>
      </div>`;
  } else {
    summaryEl.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-start gap-4">
        <div class="flex-1">
          <p class="text-soft-blue/70 text-xs font-semibold uppercase tracking-wide">Bulan ${new Date(y, m-1).toLocaleDateString('id-ID', {month:'long', year:'numeric'})}</p>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-2xl font-bold">${formatRupiah(budgetAmount)}</span>
            <span class="text-soft-blue/60 text-sm">total anggaran</span>
          </div>
          <div class="mt-3 mb-1.5">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-soft-blue/70">Terpakai ${pct.toFixed(0)}%</span>
              <span class="${remaining < 0 ? 'text-red-300' : 'text-soft-blue/70'}">${remaining < 0 ? 'Melebihi ' + formatRupiah(Math.abs(remaining)) : 'Sisa ' + formatRupiah(remaining)}</span>
            </div>
            <div class="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div class="${st.bar} h-full rounded-full transition-all duration-500" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-white/10 rounded-xl p-3">
            <p class="text-xs text-soft-blue/60">Terpakai</p>
            <p class="text-base font-bold mt-1">${formatRupiah(totalExpense)}</p>
          </div>
          <div class="bg-white/10 rounded-xl p-3">
            <p class="text-xs text-soft-blue/60">Status</p>
            <p class="text-base font-bold mt-1">${st.label}</p>
          </div>
        </div>
      </div>`;
  }

  // Category budgets
  const catBudgets = budgets.filter(b => b.category !== 'total');
  const listEl = document.getElementById('anggaran-list');

  if (catBudgets.length === 0) {
    listEl.innerHTML = `<div class="col-span-full">
      <div class="empty-state">
        <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
        <div><p class="font-semibold text-midnight/40">Belum ada anggaran per kategori</p><p class="text-xs mt-1">Tambahkan anggaran berdasarkan kategori pengeluaran.</p></div>
        <button onclick="openBudgetModal()" class="text-xs bg-steel text-white px-4 py-2 rounded-xl font-semibold hover:bg-ocean transition-colors">Tambah Anggaran</button>
      </div>
    </div>`;
    return;
  }

  listEl.innerHTML = catBudgets.map(b => {
    const catExpense = allTrx.filter(t => t.category === b.category).reduce((s,t) => s + Number(t.amount), 0);
    const bPct = Number(b.amount) > 0 ? Math.min((catExpense / Number(b.amount)) * 100, 100) : 0;
    const bSt  = getBudgetStatusClass(bPct);
    const bRem = Number(b.amount) - catExpense;
    return `
      <div class="budget-card">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="font-semibold text-midnight text-sm">${escapeHtml(b.category)}</h4>
            <p class="text-xs text-midnight/50 mt-0.5">${formatRupiah(b.amount)} anggaran</p>
          </div>
          <div class="flex gap-1">
            <button onclick="openBudgetModal('${b.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-steel/10 text-steel transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="deleteBudgetConfirm('${b.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger/10 text-danger transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-midnight/60">Terpakai: ${formatRupiah(catExpense)}</span>
          <span class="${bSt.text} font-semibold">${bPct.toFixed(0)}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${bSt.bar}" style="width:${bPct}%"></div>
        </div>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs ${bRem < 0 ? 'text-danger' : 'text-midnight/50'}">${bRem < 0 ? 'Melebihi ' + formatRupiah(Math.abs(bRem)) : 'Sisa ' + formatRupiah(bRem)}</span>
          <span class="badge ${bSt.text === 'budget-status-safe' ? 'badge-income' : bSt.text === 'budget-status-over' ? 'badge-expense' : 'bg-warning/10 text-yellow-700'}">${bSt.label}</span>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   SAVINGS
   ============================================================ */
function openSavingModal(id = null) {
  document.getElementById('form-saving').reset();
  document.getElementById('saving-edit-id').value = id || '';
  document.getElementById('modal-saving-title').textContent = id ? 'Edit Target Tabungan' : 'Tambah Target Tabungan';

  if (id) {
    const s = getSavings().find(s => s.id === id);
    if (s) {
      document.getElementById('saving-name').value = s.name;
      document.getElementById('saving-target').value = s.target;
      document.getElementById('saving-current').value = s.current;
      document.getElementById('saving-deadline').value = s.deadline;
      document.getElementById('saving-desc').value = s.description || '';
    }
  } else {
    document.getElementById('saving-current').value = 0;
  }
  document.getElementById('modal-saving').classList.remove('hidden');
}

function closeSavingModal() {
  document.getElementById('modal-saving').classList.add('hidden');
}

function submitSaving(e) {
  e.preventDefault();
  const editId  = document.getElementById('saving-edit-id').value;
  const name    = document.getElementById('saving-name').value.trim();
  const target  = Number(document.getElementById('saving-target').value);
  const current = Number(document.getElementById('saving-current').value);
  const deadline= document.getElementById('saving-deadline').value;
  const desc    = document.getElementById('saving-desc').value.trim();

  if (!name || !target || target <= 0 || !deadline) {
    showToast('Lengkapi semua field target tabungan.', 'error');
    return;
  }

  let savings = getSavings();
  const data = { name, target, current: current || 0, deadline, description: desc };

  if (editId) {
    const idx = savings.findIndex(s => s.id === editId);
    if (idx !== -1) savings[idx] = { ...savings[idx], ...data };
  } else {
    savings.push({ id: generateId(), ...data });
  }

  saveSavingsData(savings);
  closeSavingModal();
  showToast(editId ? 'Target tabungan diperbarui.' : 'Target tabungan berhasil dibuat!', 'success');
  renderSavings();
}

function deleteSavingConfirm(id) {
  showConfirm('Hapus Target', 'Yakin ingin menghapus target tabungan ini?', () => {
    saveSavingsData(getSavings().filter(s => s.id !== id));
    showToast('Target tabungan dihapus.', 'success');
    renderSavings();
  });
}

function openUpdateSavingModal(id) {
  const s = getSavings().find(s => s.id === id);
  if (!s) return;
  document.getElementById('update-saving-id').value = id;
  document.getElementById('update-saving-amount').value = s.current;
  document.getElementById('modal-update-saving').classList.remove('hidden');
}

function closeUpdateSavingModal() {
  document.getElementById('modal-update-saving').classList.add('hidden');
}

function submitUpdateSaving() {
  const id = document.getElementById('update-saving-id').value;
  const amount = Number(document.getElementById('update-saving-amount').value);
  if (isNaN(amount) || amount < 0) {
    showToast('Masukkan jumlah tabungan yang valid.', 'error');
    return;
  }
  let savings = getSavings();
  const idx = savings.findIndex(s => s.id === id);
  if (idx !== -1) {
    savings[idx].current = amount;
    const wasCompleted = savings[idx].current >= savings[idx].target;
    saveSavingsData(savings);
    closeUpdateSavingModal();
    if (wasCompleted) showToast(`🎉 Selamat! Target "${savings[idx].name}" telah tercapai!`, 'success');
    else showToast('Jumlah tabungan berhasil diperbarui.', 'success');
    renderSavings();
  }
}

function renderSavings() {
  const savings = getSavings();
  const container = document.getElementById('tabungan-list');

  if (savings.length === 0) {
    container.innerHTML = `<div class="col-span-full">
      <div class="empty-state">
        <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        <div><p class="font-semibold text-midnight/40">Belum ada target tabungan</p><p class="text-xs mt-1">Buat target pertama Anda dan mulai menabung!</p></div>
        <button onclick="openSavingModal()" class="text-xs bg-steel text-white px-4 py-2 rounded-xl font-semibold hover:bg-ocean transition-colors">Buat Target</button>
      </div>
    </div>`;
    return;
  }

  container.innerHTML = savings.map(s => {
    const pct     = s.target > 0 ? Math.min((s.current / s.target) * 100, 100) : 0;
    const rem     = Math.max(0, s.target - s.current);
    const done    = s.current >= s.target;
    const deadline = new Date(s.deadline + 'T00:00:00');
    const today    = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000*60*60*24));

    let barColor = 'progress-safe';
    if (pct >= 100) barColor = 'progress-safe';
    else if (pct >= 70) barColor = 'bg-steel';
    else if (pct >= 40) barColor = 'bg-ocean';
    else barColor = 'bg-soft-blue';

    return `
      <div class="saving-card relative">
        ${done ? '<div class="absolute top-4 right-4"><span class="badge badge-income">✓ Tercapai</span></div>' : ''}
        <h4 class="font-bold text-midnight text-base mb-0.5 pr-20">${escapeHtml(s.name)}</h4>
        ${s.description ? `<p class="text-xs text-midnight/50 mb-3">${escapeHtml(s.description)}</p>` : '<div class="mb-3"></div>'}

        <div class="flex justify-between items-baseline mb-1.5">
          <span class="text-xl font-bold text-midnight">${formatRupiah(s.current)}</span>
          <span class="text-sm text-midnight/50">dari ${formatRupiah(s.target)}</span>
        </div>

        <div class="progress-bar-wrap mb-2">
          <div class="progress-bar-fill ${barColor}" style="width:${pct}%"></div>
        </div>

        <div class="flex justify-between text-xs mb-4">
          <span class="font-semibold text-steel">${pct.toFixed(1)}% tercapai</span>
          ${done ? '<span class="text-success font-semibold">Target Selesai! 🎉</span>' : `<span class="text-midnight/50">Sisa ${formatRupiah(rem)}</span>`}
        </div>

        <div class="flex items-center justify-between text-xs text-midnight/50 mb-4 pt-3 border-t border-border-gray">
          <span>Target: ${formatDate(s.deadline)}</span>
          <span class="${daysLeft < 0 ? 'text-danger' : daysLeft <= 30 ? 'text-warning' : 'text-midnight/50'} font-medium">
            ${daysLeft < 0 ? 'Melewati batas' : daysLeft === 0 ? 'Hari ini!' : daysLeft + ' hari lagi'}
          </span>
        </div>

        <div class="flex gap-2">
          <button onclick="openUpdateSavingModal('${s.id}')" class="flex-1 text-xs font-semibold py-2 bg-steel/10 hover:bg-steel/20 text-steel rounded-xl transition-colors">Perbarui</button>
          <button onclick="openSavingModal('${s.id}')" class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-soft-blue/20 text-steel transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="deleteSavingConfirm('${s.id}')" class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-danger/10 text-danger transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   SETTINGS
   ============================================================ */
function loadSettings() {
  const s = getSettings();
  document.getElementById('set-username').value = s.username || '';
  document.getElementById('set-initial-balance').value = s.initialBalance || 0;
}

function saveSettings() {
  const username = document.getElementById('set-username').value.trim();
  const initialBalance = Number(document.getElementById('set-initial-balance').value) || 0;

  if (!username) {
    showToast('Nama tidak boleh kosong.', 'error');
    return;
  }

  saveSettingsData({ username, initialBalance });
  showToast('Pengaturan berhasil disimpan.', 'success');

  // Refresh sidebar
  document.getElementById('sidebar-username').textContent = escapeHtml(username);
  document.getElementById('sidebar-avatar').textContent   = username.charAt(0).toUpperCase();
  document.getElementById('dash-username').textContent    = escapeHtml(username);
}

/* ---- Export CSV ---- */
function exportCSV() {
  const transactions = getTransactions();
  if (transactions.length === 0) {
    showToast('Tidak ada data transaksi untuk diekspor.', 'warning');
    return;
  }

  const headers = ['No','Tanggal','Deskripsi','Kategori','Jenis','Nominal','Catatan'];
  const rows = transactions.map((t, i) => [
    i + 1,
    t.date,
    '"' + (t.description || '').replace(/"/g,'""') + '"',
    '"' + (t.category || '').replace(/"/g,'""') + '"',
    t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
    t.amount,
    '"' + (t.note || '').replace(/"/g,'""') + '"'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `moneymate-transaksi-${todayStr()}.csv`);
  showToast('Data transaksi berhasil diekspor ke CSV.', 'success');
}

/* ---- Export JSON ---- */
function exportJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    transactions: getTransactions(),
    budget: getBudgets(),
    savings: getSavings(),
    settings: getSettings(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `moneymate-backup-${todayStr()}.json`);
  showToast('Semua data berhasil diekspor ke JSON.', 'success');
}

/* ---- Import JSON ---- */
function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // Validate structure
      if (!data.transactions || !Array.isArray(data.transactions)) {
        showToast('Format file JSON tidak valid.', 'error');
        return;
      }
      showConfirm(
        'Impor Data',
        'Ini akan menggantikan seluruh data yang ada. Lanjutkan?',
        () => {
          if (data.transactions) saveTransactions(data.transactions);
          if (data.budget)       saveBudgets(data.budget);
          if (data.savings)      saveSavingsData(data.savings);
          if (data.settings)     saveSettingsData(data.settings);
          showToast('Data berhasil diimpor.', 'success');
          initApp();
        }
      );
    } catch {
      showToast('Gagal membaca file JSON. Pastikan format file benar.', 'error');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

/* ---- Reset Data ---- */
function confirmResetData() {
  showConfirm(
    'Reset Semua Data',
    'Semua transaksi, anggaran, target tabungan, dan pengaturan akan dihapus permanen. Tindakan ini tidak dapat dibatalkan!',
    () => {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      showToast('Semua data berhasil direset.', 'info');
      initApp();
    }
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================================================
   HELPERS
   ============================================================ */
function emptyStateHTML(message) {
  return `<div class="empty-state">
    <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    <p class="text-sm text-midnight/40">${escapeHtml(message)}</p>
  </div>`;
}

/* ============================================================
   KEYBOARD EVENTS
   ============================================================ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('modal-transaction').classList.add('hidden');
    document.getElementById('modal-budget').classList.add('hidden');
    document.getElementById('modal-saving').classList.add('hidden');
    document.getElementById('modal-update-saving').classList.add('hidden');
    document.getElementById('modal-confirm').classList.add('hidden');
    closeSidebar();
  }
});

/* ============================================================
   APP INITIALIZATION
   ============================================================ */
function initApp() {
  initSampleData();

  // Set header date
  const today = new Date();
  document.getElementById('header-date').textContent = today.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Default anggaran month
  document.getElementById('anggaran-month').value = currentYearMonth();

  // Navigate to dashboard
  navigateTo('dashboard');
}

// Start app
document.addEventListener('DOMContentLoaded', initApp);