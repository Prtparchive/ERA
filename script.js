// State management
const state = {
    salary: 45000,
    budgets: {
        needs: 50,
        wants: 30,
        savings: 20
    },
    transactions: [
        {
            id: 1,
            type: 'expense',
            category: 'Groceries',
            amount: 2450,
            note: 'Grocery Shopping',
            date: '2023-08-30'
        },
        {
            id: 2,
            type: 'income',
            category: 'Freelance',
            amount: 8500,
            note: 'Freelance Payment',
            date: '2023-08-28'
        },
        {
            id: 3,
            type: 'expense',
            category: 'Utilities',
            amount: 1850,
            note: 'Electricity Bill',
            date: '2023-08-25'
        },
        {
            id: 4,
            type: 'expense',
            category: 'Dining',
            amount: 1200,
            note: 'Dinner Out',
            date: '2023-08-22'
        },
        {
            id: 5,
            type: 'income',
            category: 'Salary',
            amount: 40000,
            note: 'Monthly Salary',
            date: '2023-08-20'
        }
    ],
    goals: [
        {
            id: 1,
            name: 'New Car',
            type: 'inflationAdjusted',
            targetAmount: 800000,
            years: 5,
            inflationRate: 0.047,
            expectedReturn: 0.12,
            futureValue: 1012432,
            monthlySIP: 9832
        }
    ],
    inflationData: {
        latest: { date: '2025-07', cpiYoY: 0.047 },
        avg5y: 0.053
    }
};

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');

// Initialize the application
function initApp() {
    loadFromLocalStorage();
    setupEventListeners();
    updateUI();
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            showView(viewId);
            
            // Update active class
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

   // Menu toggle (works for both mobile + desktop)
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

menuToggle.addEventListener('click', function() {
    // For mobile
    sidebar.classList.toggle('active');
    
    // For desktop collapse
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('sidebar-collapsed');
});


    // Salary
    document.getElementById('save-salary').addEventListener('click', saveSalary);

    // Budgets
    document.getElementById('budget-preset').addEventListener('change', applyBudgetPreset);
    setupBudgetSliders();
    document.getElementById('save-budgets').addEventListener('click', saveBudgets);

    // Transactions
    document.getElementById('add-transaction').addEventListener('click', addTransaction);

    // Goals
    document.getElementById('goal-type').addEventListener('change', updateGoalPreview);
    document.getElementById('goal-amount').addEventListener('input', updateGoalPreview);
    document.getElementById('goal-years').addEventListener('input', updateGoalPreview);
    document.getElementById('goal-inflation').addEventListener('input', updateGoalPreview);
    document.getElementById('goal-return').addEventListener('input', updateGoalPreview);
    document.getElementById('save-goal').addEventListener('click', saveGoal);

    // Export/Import
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', importData);
}

// View Management
function showView(viewId) {
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// Salary Management
function saveSalary() {
    const salaryInput = document.getElementById('salary-amount');
    const salary = parseFloat(salaryInput.value);
    
    if (isNaN(salary) || salary <= 0) {
        alert('Please enter a valid salary amount');
        return;
    }
    
    state.salary = salary;
    saveToLocalStorage();
    updateUI();
    alert('Salary saved successfully!');
}

// Budget Management
function setupBudgetSliders() {
    const sliders = document.querySelectorAll('.budget-slider');
    const percentInputs = document.querySelectorAll('input[type="number"][placeholder="Percentage"]');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const percentInput = document.getElementById(`${slider.id}-percent-input`);
            percentInput.value = slider.value;
            updateBudgetPercent(slider.id.replace('-budget', ''));
            validateBudgetTotal();
        });
    });
    
    percentInputs.forEach(input => {
        input.addEventListener('input', () => {
            const slider = document.getElementById(`${input.id.replace('-percent-input', '')}-budget`);
            slider.value = input.value;
            updateBudgetPercent(input.id.replace('-percent-input', ''));
            validateBudgetTotal();
        });
    });
}

function updateBudgetPercent(type) {
    const percent = document.getElementById(`${type}-budget`).value;
    document.getElementById(`${type}-percent`).textContent = `${percent}%`;
    
    // Calculate amount based on salary
    if (state.salary > 0) {
        const amount = (state.salary * percent) / 100;
        document.getElementById(`${type}-amount`).value = amount.toFixed(2);
    }
}

function validateBudgetTotal() {
    const needs = parseInt(document.getElementById('needs-budget').value) || 0;
    const wants = parseInt(document.getElementById('wants-budget').value) || 0;
    const savings = parseInt(document.getElementById('savings-budget').value) || 0;
    
    const total = needs + wants + savings;
    const remaining = 100 - total;
    
    document.getElementById('remaining-percent').textContent = `${remaining}%`;
    
    const saveButton = document.getElementById('save-budgets');
    saveButton.disabled = remaining !== 0;
    
    if (remaining < 0) {
        document.getElementById('remaining-percent').style.color = 'var(--danger)';
    } else {
        document.getElementById('remaining-percent').style.color = 'inherit';
    }
}

function applyBudgetPreset() {
    const preset = document.getElementById('budget-preset').value;
    
    if (preset === '50-30-20') {
        document.getElementById('needs-budget').value = 50;
        document.getElementById('wants-budget').value = 30;
        document.getElementById('savings-budget').value = 20;
    } else if (preset === '60-20-20') {
        document.getElementById('needs-budget').value = 60;
        document.getElementById('wants-budget').value = 20;
        document.getElementById('savings-budget').value = 20;
    } else if (preset === '70-20-10') {
        document.getElementById('needs-budget').value = 70;
        document.getElementById('wants-budget').value = 20;
        document.getElementById('savings-budget').value = 10;
    }
    
    // Update all percentage displays and inputs
    ['needs', 'wants', 'savings'].forEach(type => {
        const percent = document.getElementById(`${type}-budget`).value;
        document.getElementById(`${type}-percent`).textContent = `${percent}%`;
        document.getElementById(`${type}-percent-input`).value = percent;
        updateBudgetPercent(type);
    });
    
    validateBudgetTotal();
}

function saveBudgets() {
    state.budgets.needs = parseInt(document.getElementById('needs-budget').value);
    state.budgets.wants = parseInt(document.getElementById('wants-budget').value);
    state.budgets.savings = parseInt(document.getElementById('savings-budget').value);
    
    saveToLocalStorage();
    updateUI();
    alert('Budgets saved successfully!');
}

// Transaction Management
function addTransaction() {
    const type = document.getElementById('transaction-type').value;
    const category = document.getElementById('transaction-category').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const note = document.getElementById('transaction-note').value;
    const date = document.getElementById('transaction-date').value || new Date().toISOString().split('T')[0];
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type,
        category,
        amount,
        note,
        date
    };
    
    state.transactions.unshift(transaction); // Add to beginning of array
    saveToLocalStorage();
    updateUI();
    
    // Reset form
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-note').value = '';
    document.getElementById('transaction-date').value = '';
    
    alert('Transaction added successfully!');
}

// Goals Management
function updateGoalPreview() {
    const goalType = document.getElementById('goal-type').value;
    const targetAmount = parseFloat(document.getElementById('goal-amount').value) || 0;
    const years = parseInt(document.getElementById('goal-years').value) || 0;
    const inflationRate = (parseFloat(document.getElementById('goal-inflation').value) || 0) / 100;
    const expectedReturn = (parseFloat(document.getElementById('goal-return').value) || 0) / 100;
    
    if (targetAmount <= 0 || years <= 0) {
        document.getElementById('sip-amount').textContent = '₹0';
        document.getElementById('future-value').textContent = '₹0';
        return;
    }
    
    let futureValue, monthlySIP;
    
    if (goalType === 'inflationAdjusted') {
        // Adjust for inflation
        futureValue = targetAmount * Math.pow(1 + inflationRate, years);
        monthlySIP = calculateSIP(futureValue, expectedReturn, years * 12);
    } else {
        futureValue = targetAmount;
        monthlySIP = calculateSIP(targetAmount, expectedReturn, years * 12);
    }
    
    document.getElementById('sip-amount').textContent = `₹${monthlySIP.toFixed(0)}`;
    document.getElementById('future-value').textContent = `₹${futureValue.toFixed(0)}`;
}

function calculateSIP(futureValue, annualReturn, months) {
    const monthlyRate = annualReturn / 12;
    return futureValue * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
}

function saveGoal() {
    const name = document.getElementById('goal-name').value;
    const type = document.getElementById('goal-type').value;
    const targetAmount = parseFloat(document.getElementById('goal-amount').value);
    const years = parseInt(document.getElementById('goal-years').value);
    const inflationRate = parseFloat(document.getElementById('goal-inflation').value) / 100;
    const expectedReturn = parseFloat(document.getElementById('goal-return').value) / 100;
    
    if (!name || isNaN(targetAmount) || targetAmount <= 0 || isNaN(years) || years <= 0) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    const futureValue = type === 'inflationAdjusted' 
        ? targetAmount * Math.pow(1 + inflationRate, years) 
        : targetAmount;
        
    const monthlySIP = calculateSIP(futureValue, expectedReturn, years * 12);
    
    const goal = {
        id: Date.now(),
        name,
        type,
        targetAmount,
        years,
        inflationRate,
        expectedReturn,
        futureValue,
        monthlySIP,
        createdAt: new Date().toISOString()
    };
    
    state.goals.push(goal);
    saveToLocalStorage();
    updateUI();
    
    // Reset form
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-amount').value = '';
    document.getElementById('goal-years').value = '';
    
    alert('Goal saved successfully!');
}

// Export/Import
function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'finance-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a file to import');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedState = JSON.parse(e.target.result);
            
            // Validate the imported state
            if (importedState && typeof importedState === 'object') {
                // Merge with current state
                Object.assign(state, importedState);
                saveToLocalStorage();
                updateUI();
                alert('Data imported successfully!');
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// UI Update
function updateUI() {
    // Update salary display
    document.getElementById('salary-kpi').textContent = `₹${state.salary.toFixed(2)}`;
    
    // Calculate and update transaction totals
    const income = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const expenses = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const net = income - expenses;
    
    document.getElementById('income-kpi').textContent = `₹${income.toFixed(2)}`;
    document.getElementById('expenses-kpi').textContent = `₹${expenses.toFixed(2)}`;
    document.getElementById('net-kpi').textContent = `₹${net.toFixed(2)}`;
    
    // Update recent transactions
    const recentTransactions = state.transactions.slice(0, 5);
    const recentTbody = document.getElementById('recent-transactions');
    
    if (recentTransactions.length === 0) {
        recentTbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No transactions yet</td></tr>';
    } else {
        recentTbody.innerHTML = recentTransactions.map(t => `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td>${t.note || 'No description'}</td>
                <td>${t.category}</td>
                <td class="${t.type === 'income' ? 'positive' : 'negative'}">${t.type === 'income' ? '+' : '-'}₹${t.amount.toFixed(2)}</td>
            </tr>
        `).join('');
    }
    
    // Update all transactions
    const allTbody = document.getElementById('all-transactions');
    
    if (state.transactions.length === 0) {
        allTbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No transactions yet</td></tr>';
    } else {
        allTbody.innerHTML = state.transactions.map(t => `
            <tr>
                <td>${t.date}</td>
                <td>${t.type}</td>
                <td>${t.category}</td>
                <td>${t.note || 'No description'}</td>
                <td class="${t.type === 'income' ? 'positive' : 'negative'}">${t.type === 'income' ? '+' : '-'}₹${t.amount.toFixed(2)}</td>
            </tr>
        `).join('');
    }
    
    // Update goals list
    const goalsList = document.getElementById('goals-list');
    
    if (state.goals.length === 0) {
        goalsList.innerHTML = '<p>No goals set yet</p>';
    } else {
        goalsList.innerHTML = state.goals.map(goal => `
            <div class="goal-item">
                <h3>${goal.name}</h3>
                <p>Target: ₹${goal.targetAmount.toFixed(2)} in ${goal.years} years</p>
                <p>Monthly SIP: ₹${goal.monthlySIP.toFixed(2)}</p>
                <p>Future Value: ₹${goal.futureValue.toFixed(2)}</p>
            </div>
        `).join('');
    }
    
    // Update CPI badge
    const cpiBadge = document.getElementById('cpi-badge');
    cpiBadge.textContent = `Inflation default ${(state.inflationData.latest.cpiYoY * 100).toFixed(1)}% as of ${state.inflationData.latest.date}`;
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('financeAppState', JSON.stringify(state));
}

function loadFromLocalStorage() {
    const savedState = localStorage.getItem('financeAppState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            Object.assign(state, parsedState);
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);