document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('converterForm');
    const swapBtn = document.getElementById('swapBtn');
    const resultContainer = document.getElementById('result');
    const loadingContainer = document.getElementById('loading');
    const errorContainer = document.getElementById('error');
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const amount = document.getElementById('amount').value;
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        
        // Validation
        if (!amount || amount <= 0) {
            showError('Please enter a valid amount');
            return;
        }
        
        if (fromCurrency === toCurrency) {
            showError('Please select different currencies');
            return;
        }
        
        // Show loading
        hideAllMessages();
        showLoading();
        
        try {
            const response = await fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    from_currency: fromCurrency,
                    to_currency: toCurrency
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showResult(data, amount);
            } else {
                showError(data.error || 'Conversion failed');
            }
            
        } catch (error) {
            showError('Network error. Please try again.');
        } finally {
            hideLoading();
        }
    });
    
    // Swap currencies
    swapBtn.addEventListener('click', function() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        
        // Add visual feedback
        this.style.transform = 'rotate(180deg) scale(1.1)';
        setTimeout(() => {
            this.style.transform = '';
        }, 300);
        
        // If there's a result showing, auto-convert with swapped currencies
        if (resultContainer.style.display !== 'none') {
            form.dispatchEvent(new Event('submit'));
        }
    });
    
    // Real-time conversion on input change
    let debounceTimer;
    document.getElementById('amount').addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (this.value && this.value > 0 && resultContainer.style.display !== 'none') {
                form.dispatchEvent(new Event('submit'));
            }
        }, 500);
    });
    
    // Auto-convert when currency changes
    document.getElementById('fromCurrency').addEventListener('change', function() {
        if (document.getElementById('amount').value && resultContainer.style.display !== 'none') {
            form.dispatchEvent(new Event('submit'));
        }
    });
    
    document.getElementById('toCurrency').addEventListener('change', function() {
        if (document.getElementById('amount').value && resultContainer.style.display !== 'none') {
            form.dispatchEvent(new Event('submit'));
        }
    });
    
    // Helper functions
    function showResult(data, originalAmount) {
        const resultAmount = document.getElementById('convertedAmount');
        const originalAmountEl = document.getElementById('originalAmount');
        const fromCurrencyCode = document.getElementById('fromCurrencyCode');
        const finalAmount = document.getElementById('finalAmount');
        const toCurrencyCode = document.getElementById('toCurrencyCode');
        const rateFrom = document.getElementById('rateFrom');
        const rateValue = document.getElementById('rateValue');
        const rateTo = document.getElementById('rateTo');
        
        // Format numbers with commas
        const formattedAmount = new Intl.NumberFormat().format(data.converted_amount);
        const formattedOriginal = new Intl.NumberFormat().format(originalAmount);
        
        resultAmount.textContent = formattedAmount;
        originalAmountEl.textContent = formattedOriginal;
        fromCurrencyCode.textContent = data.from_currency;
        finalAmount.textContent = formattedAmount;
        toCurrencyCode.textContent = data.to_currency;
        rateFrom.textContent = data.from_currency;
        rateValue.textContent = data.rate;
        rateTo.textContent = data.to_currency;
        
        resultContainer.style.display = 'block';
        
        // Add animation
        resultContainer.style.animation = 'none';
        resultContainer.offsetHeight; // Trigger reflow
        resultContainer.style.animation = 'fadeIn 0.8s ease-out';
    }
    
    function showLoading() {
        loadingContainer.style.display = 'block';
    }
    
    function hideLoading() {
        loadingContainer.style.display = 'none';
    }
    
    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // Add shake animation
        errorContainer.style.animation = 'none';
        errorContainer.offsetHeight; // Trigger reflow
        errorContainer.style.animation = 'shake 0.5s ease-in-out';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
    
    function hideAllMessages() {
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            swapBtn.click();
        }
    });
    
    // Add currency search functionality
    const currencySelects = document.querySelectorAll('select[id$="Currency"]');
    currencySelects.forEach(select => {
        select.addEventListener('keydown', function(e) {
            if (e.key.length === 1) {
                const searchTerm = e.key.toUpperCase();
                const options = Array.from(this.options);
                const matchingOption = options.find(option => 
                    option.value.startsWith(searchTerm) || 
                    option.textContent.toUpperCase().includes(searchTerm)
                );
                if (matchingOption) {
                    this.value = matchingOption.value;
                }
            }
        });
    });
    
    // Add visual feedback for form interactions
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = '';
        });
    });
    
    // Initialize with default conversion
    document.getElementById('amount').value = '100';
    
    // Add tooltip functionality
    const tooltips = {
        'swapBtn': 'Swap currencies (Ctrl+S)',
        'convert-btn': 'Convert currency (Ctrl+Enter)'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id) || document.querySelector(`.${id}`);
        if (element) {
            element.title = text;
        }
    });
    
    // Add currency flag icons
    const currencyFlags = {
        'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
        'AUD': '🇦🇺', 'CAD': '🇨🇦', 'CHF': '🇨🇭', 'CNY': '🇨🇳',
        'INR': '🇮🇳', 'KRW': '🇰🇷', 'MXN': '🇲🇽', 'SGD': '🇸🇬',
        'BRL': '🇧🇷', 'RUB': '🇷🇺', 'ZAR': '🇿🇦'
    };
    
    // Add flags to select options
    currencySelects.forEach(select => {
        Array.from(select.options).forEach(option => {
            const flag = currencyFlags[option.value];
            if (flag) {
                option.textContent = `${flag} ${option.textContent}`;
            }
        });
    });
    
    // Add periodic rate updates (every 5 minutes)
    setInterval(() => {
        if (resultContainer.style.display !== 'none') {
            // Silently update the conversion
            const amount = document.getElementById('amount').value;
            if (amount && amount > 0) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    }, 300000); // 5 minutes
    
    // Add performance monitoring
    const startTime = performance.now();
    window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    });
});