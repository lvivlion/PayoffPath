/**
 * popup.js
 * Controller for PayoffPath's popup UI.
 */

let loanData = null;
let mainChart = null;
let pieChart = null;

const UI = {
    currBalance: document.getElementById('currBalance'),
    totalSavings: document.getElementById('totalSavings'),
    origPayoff: document.getElementById('origPayoff'),
    newPayoff: document.getElementById('newPayoff'),
    extraSlider: document.getElementById('extraSlider'),
    extraAmountLabel: document.getElementById('extraAmountLabel'),
    oneTimeSlider: document.getElementById('oneTimeSlider'),
    oneTimeAmountLabel: document.getElementById('oneTimeAmountLabel'),
    timeSavedBanner: document.getElementById('timeSavedBanner'),
    content: document.getElementById('content'),
    empty: document.getElementById('empty'),
    notEnabled: document.getElementById('notEnabled'),
    btnEnableSite: document.getElementById('btnEnableSite'),
    origLoanLabel: document.getElementById('origLoanLabel'),
    piePercentLabel: document.getElementById('piePercentLabel')
};

function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

function updateUI() {
    if (!loanData) return;

    const extraMonthly = parseInt(UI.extraSlider.value);
    const extraOneTime = parseInt(UI.oneTimeSlider.value);

    UI.extraAmountLabel.textContent = `+$${extraMonthly}`;
    UI.oneTimeAmountLabel.textContent = `+$${extraOneTime}`;

    const principal = parseFloat(loanData.ledgerBalance) || 0;
    if (principal <= 0) return; // No valid balance to calculate
    const rate = parseFloat(loanData.interestRate) || 6.0;
    const monthlyBase = parseFloat(loanData.monthlyPayment) ||
        LoanCalculator.calculateMonthlyPayment(principal, rate, 30);

    const baseline = LoanCalculator.getAmortizationStats(principal, rate, monthlyBase, 0, 0);
    const optimized = LoanCalculator.getAmortizationStats(principal, rate, monthlyBase, extraMonthly, extraOneTime);

    const interestSavings = baseline.totalInterest - optimized.totalInterest;
    const monthsSaved = baseline.months - optimized.months;
    const yearsSaved = (monthsSaved / 12).toFixed(1);

    UI.currBalance.textContent = formatCurrency(principal);
    UI.totalSavings.textContent = formatCurrency(interestSavings);
    UI.origLoanLabel.textContent = `Original Loan (${rate}%)`;

    const originalPrincipal = loanData.loanAmount || principal;
    const paidAmount = Math.max(0, originalPrincipal - principal);
    const progressPercent = originalPrincipal > 0 ? ((paidAmount / originalPrincipal) * 100).toFixed(0) : 0;
    UI.piePercentLabel.textContent = `${progressPercent}%`;

    const baselinePayoffDate = new Date();
    baselinePayoffDate.setMonth(baselinePayoffDate.getMonth() + baseline.months);
    UI.origPayoff.textContent = `${baselinePayoffDate.getMonth() + 1}/${baselinePayoffDate.getFullYear()}`;

    const newPayoffDate = new Date();
    newPayoffDate.setMonth(newPayoffDate.getMonth() + optimized.months);
    UI.newPayoff.textContent = `${newPayoffDate.getMonth() + 1}/${newPayoffDate.getFullYear()}`;

    if (monthsSaved > 0) {
        UI.timeSavedBanner.style.display = 'block';
        UI.timeSavedBanner.innerHTML = `You save <span>${yearsSaved} years</span> of payments!`;
    } else {
        UI.timeSavedBanner.style.display = 'none';
    }

    updateCharts(baseline, optimized, paidAmount, principal);
}

function updateCharts(baseline, optimized, paid, remaining) {
    const ctxMain = document.getElementById('payoffChart').getContext('2d');
    const ctxPie = document.getElementById('interestPieChart').getContext('2d');

    if (mainChart) mainChart.destroy();
    if (pieChart) pieChart.destroy();

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#4b5563' : '#cbd5e1';
    const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

    const accentColor = '#6366f1';

    // Inject Month 0 (Today) for the chart
    const baselineChartData = [{ month: 0, balance: remaining }, ...baseline.schedule];
    const optimizedChartData = [{ month: 0, balance: remaining }, ...optimized.schedule];
    const labels = baselineChartData.map(d => `Yr ${Math.floor(d.month / 12)}`);

    mainChart = new Chart(ctxMain, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Original',
                    data: baselineChartData.map(d => d.balance),
                    borderColor: isLight ? '#94a3b8' : 'rgba(148,163,184,0.4)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Accelerated',
                    data: optimizedChartData.map(d => d.balance),
                    borderColor: accentColor,
                    borderWidth: 3,
                    pointRadius: ctx => (ctx.dataIndex === 0 ? 5 : 0),
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: accentColor,
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: isLight ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.1)'
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: {
                    ticks: { color: textColor, font: { size: 9, family: 'JetBrains Mono' } },
                    grid: { color: gridColor }
                }
            }
        }
    });

    pieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Paid Off', 'Remaining'],
            datasets: [{
                data: [paid, remaining],
                backgroundColor: isLight ? ['#10b981', '#e2e8f0'] : ['#6366f1', '#1e293b'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isLight ? '#ffffff' : '#0b1121',
                    titleColor: isLight ? '#111827' : '#ffffff',
                    bodyColor: isLight ? '#374151' : '#e2e8f0',
                    borderColor: isLight ? '#e2e8f0' : '#1e293b',
                    borderWidth: 1,
                    callbacks: { label: ctx => { const val = ctx.raw; return `${ctx.label}: $${Math.round(val).toLocaleString()}`; } }
                }
            }
        }
    });
}

// Initial hydration & activation check
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab || !activeTab.url) return;

    try {
        const url = new URL(activeTab.url);
        const hostname = url.hostname;

        chrome.storage.local.get(['allowedDomains', 'loanData', 'prefs'], (result) => {
            const allowedDomains = result.allowedDomains || [];

            // Apply theme
            if (result.prefs?.theme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }

            if (hostname && !allowedDomains.includes(hostname)) {
                UI.content.style.display = 'none';
                UI.empty.style.display = 'none';
                UI.notEnabled.style.display = 'flex';

                UI.btnEnableSite.onclick = () => {
                    allowedDomains.push(hostname);
                    chrome.storage.local.set({ allowedDomains }, () => {
                        chrome.tabs.reload(activeTab.id);
                        window.close();
                    });
                };
            } else if (result.loanData) {
                loanData = result.loanData;
                UI.content.style.display = 'block';
                UI.empty.style.display = 'none';
                UI.notEnabled.style.display = 'none';
                updateUI();
            } else {
                UI.content.style.display = 'none';
                UI.empty.style.display = 'flex';
                UI.notEnabled.style.display = 'none';
            }
        });
    } catch (e) {
        UI.content.style.display = 'none';
        UI.empty.style.display = 'flex';
    }
});

UI.extraSlider.addEventListener('input', updateUI);
UI.oneTimeSlider.addEventListener('input', updateUI);
