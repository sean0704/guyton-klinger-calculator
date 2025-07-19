// Guyton-Klinger Calculator - Fixed version with enhanced debugging
console.log('Loading Guyton-Klinger calculator...');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    
    // Get form and results elements
    const form = document.getElementById('calculatorForm');
    const resultsSection = document.getElementById('resultsSection');
    
    if (!form) {
        console.error('Form not found!');
        return;
    }
    
    if (!resultsSection) {
        console.error('Results section not found!');
        return;
    }
    
    console.log('Form and results section found successfully');
    
    // Add submit event listener
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted - starting calculation...');
        
        try {
            // Get input values
            const initialAssets = parseFloat(document.getElementById('initialAssets').value) || 0;
            const initialWithdrawalRate = parseFloat(document.getElementById('initialWithdrawalRate').value) || 0;
            const returnRate = parseFloat(document.getElementById('returnRate').value) || 0;
            const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;
            
            console.log('Input values:', {
                initialAssets,
                initialWithdrawalRate,
                returnRate,
                inflationRate
            });
            
            // Validate inputs
            if (initialAssets <= 0) {
                alert('初始資產必須大於 0');
                return;
            }
            
            if (initialWithdrawalRate <= 0 || initialWithdrawalRate > 20) {
                alert('初始提領率必須介於 0.1% 到 20% 之間');
                return;
            }
            
            // Perform calculations
            console.log('Starting calculations...');
            
            // Convert percentages to decimals
            const initialWithdrawalRateDecimal = initialWithdrawalRate / 100;
            const returnRateDecimal = returnRate / 100;
            const inflationRateDecimal = inflationRate / 100;
            
            // Calculate current withdrawal amount
            const currentWithdrawalAmount = initialAssets * initialWithdrawalRateDecimal;
            
            // Calculate year-end assets
            const yearEndAssets = Math.max(0, initialAssets * (1 + returnRateDecimal) - currentWithdrawalAmount);
            
            // Calculate current withdrawal rate
            let currentWithdrawalRate;
            if (yearEndAssets > 0) {
                currentWithdrawalRate = (currentWithdrawalAmount / yearEndAssets) * 100;
            } else {
                currentWithdrawalRate = initialWithdrawalRate * 2; // Force lower guardrail
            }
            
            console.log('Basic calculations completed:', {
                currentWithdrawalAmount,
                yearEndAssets,
                currentWithdrawalRate
            });
            
            // Apply Guyton-Klinger rules
            const lowerGuardrail = initialWithdrawalRate * 1.2;
            const upperGuardrail = initialWithdrawalRate * 0.8;
            
            let nextYearWithdrawalAmount = currentWithdrawalAmount;
            let guardrailStatus = 'normal';
            let statusText = '正常範圍 Normal Range';
            let statusExplanation = '當前提領率在安全範圍內，按通膨調整提領金額';
            
            // Check guardrail rules
            if (currentWithdrawalRate > lowerGuardrail) {
                // Lower guardrail (Capital Preservation)
                guardrailStatus = 'lower';
                statusText = '觸發下護欄 Lower Guardrail';
                statusExplanation = `當前提領率 ${currentWithdrawalRate.toFixed(2)}% 超過安全上限 ${lowerGuardrail.toFixed(2)}%，需減少提領金額 10% 以保護資本`;
                nextYearWithdrawalAmount = currentWithdrawalAmount * 0.9;
                
            } else if (currentWithdrawalRate < upperGuardrail) {
                // Upper guardrail (Prosperity Rule)
                guardrailStatus = 'upper';
                statusText = '觸發上護欄 Upper Guardrail';
                statusExplanation = `當前提領率 ${currentWithdrawalRate.toFixed(2)}% 低於下限 ${upperGuardrail.toFixed(2)}%，可增加提領金額 10% 以改善生活品質`;
                nextYearWithdrawalAmount = currentWithdrawalAmount * 1.1;
                
            } else {
                // Normal range - inflation adjustment
                if (returnRate < 0 && currentWithdrawalRate > initialWithdrawalRate) {
                    statusExplanation = `投報率為負 (${returnRate.toFixed(2)}%) 且當前提領率高於初始提領率，跳過通膨調整以保護資本`;
                } else {
                    nextYearWithdrawalAmount = currentWithdrawalAmount * (1 + inflationRateDecimal);
                    statusExplanation = `當前提領率在安全範圍內，按通膨率 ${inflationRate.toFixed(2)}% 調整提領金額`;
                }
            }
            
            // Calculate next year withdrawal rate
            const nextYearWithdrawalRate = yearEndAssets > 0 ? 
                (nextYearWithdrawalAmount / yearEndAssets) * 100 : 0;
            
            console.log('Guardrail calculations completed:', {
                guardrailStatus,
                nextYearWithdrawalAmount,
                nextYearWithdrawalRate
            });
            
            // Display results
            displayResults({
                currentWithdrawalAmount,
                yearEndAssets,
                currentWithdrawalRate,
                guardrailStatus,
                statusText,
                statusExplanation,
                nextYearWithdrawalAmount,
                nextYearWithdrawalRate
            });
            
        } catch (error) {
            console.error('Calculation error:', error);
            alert('計算過程中發生錯誤: ' + error.message);
        }
    });
    
    // Function to display results
    function displayResults(results) {
        console.log('Displaying results...');
        
        try {
            // Format currency
            function formatCurrency(amount) {
                if (isNaN(amount)) return 'NT$ 0';
                return 'NT$ ' + Math.round(amount).toLocaleString('zh-TW');
            }
            
            // Format percentage
            function formatPercentage(rate) {
                if (isNaN(rate)) return '0.00%';
                return rate.toFixed(2) + '%';
            }
            
            // Update current year data
            document.getElementById('currentWithdrawalAmount').textContent = formatCurrency(results.currentWithdrawalAmount);
            document.getElementById('yearEndAssets').textContent = formatCurrency(results.yearEndAssets);
            document.getElementById('currentWithdrawalRate').textContent = formatPercentage(results.currentWithdrawalRate);
            
            // Update guardrail status
            document.getElementById('statusText').textContent = results.statusText;
            document.getElementById('statusExplanation').textContent = results.statusExplanation;
            
            // Update status styling
            const guardrailStatusElement = document.getElementById('guardrailStatus');
            guardrailStatusElement.className = `guardrail-status guardrail-${results.guardrailStatus}`;
            
            // Update next year projections
            document.getElementById('nextYearWithdrawalAmount').textContent = formatCurrency(results.nextYearWithdrawalAmount);
            document.getElementById('nextYearWithdrawalRate').textContent = formatPercentage(results.nextYearWithdrawalRate);
            
            // Show results section
            resultsSection.style.display = 'block';
            resultsSection.classList.add('fade-in');
            
            // Scroll to results
            setTimeout(function() {
                resultsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
            
            console.log('Results displayed successfully');
            
        } catch (error) {
            console.error('Error displaying results:', error);
            alert('顯示結果時發生錯誤: ' + error.message);
        }
    }
    
    console.log('Guyton-Klinger calculator initialized successfully');
});