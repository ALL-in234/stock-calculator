document.addEventListener('DOMContentLoaded', function () {
    let stockCount = 1;
    const stockInputsContainer = document.getElementById('stock-inputs');
    const addStockBtn = document.getElementById('add_stock_btn');
    const calculateBtn = document.getElementById('calculate_btn');

    if (!stockInputsContainer || !addStockBtn || !calculateBtn) {
        console.error('找不到 stock-inputs, add_stock_btn 或 calculate_btn 元素！請檢查 HTML。');
        document.getElementById('error').textContent = '頁面元素載入失敗，請檢查 HTML 結構！';
        return;
    }

    // 動態新增股票輸入框
    addStockBtn.addEventListener('click', function () {
        stockCount++;
        const stockEntry = document.createElement('div');
        stockEntry.className = 'stock-entry border p-4 rounded';
        stockEntry.innerHTML = `
            <h3 class="font-bold text-gray-700">股票 ${stockCount}</h3>
            <div class="mb-2">
                <label for="stock_code_${stockCount}" class="block font-bold text-gray-700">股票代碼 (例如: AAPL):</label>
                <input type="text" id="stock_code_${stockCount}" required class="w-full p-2 border rounded">
                <div class="error-message" id="stock_code_${stockCount}_error"></div>
            </div>
            <div class="mb-2">
                <label for="buy_price_${stockCount}" class="block font-bold text-gray-700">買入價格 ($):</label>
                <input type="number" id="buy_price_${stockCount}" step="0.01" min="0" required class="w-full p-2 border rounded">
                <div class="error-message" id="buy_price_${stockCount}_error"></div>
            </div>
            <div class="mb-2">
                <label for="quantity_input_${stockCount}" class="block font-bold text-gray-700">買入數量 (股數或百分比):</label>
                <input type="text" id="quantity_input_${stockCount}" required class="w-full p-2 border rounded">
                <div class="error-message" id="quantity_input_${stockCount}_error"></div>
            </div>
            <div class="mb-2">
                <label for="predict_price_${stockCount}" class="block font-bold text-gray-700">止盈價格 ($):</label>
                <input type="number" id="predict_price_${stockCount}" step="0.01" min="0" required class="w-full p-2 border rounded">
                <div class="error-message" id="predict_price_${stockCount}_error"></div>
            </div>
            <div class="mb-2">
                <label for="stop_loss_price_${stockCount}" class="block font-bold text-gray-700">止損價格 ($):</label>
                <input type="number" id="stop_loss_price_${stockCount}" step="0.01" min="0" required class="w-full p-2 border rounded">
                <div class="error-message" id="stop_loss_price_${stockCount}_error"></div>
            </div>
            <div class="mb-2">
                <label for="add_position_price_${stockCount}" class="block font-bold text-gray-700">補倉價格 ($):</label>
                <input type="number" id="add_position_price_${stockCount}" step="0.01" min="0" required class="w-full p-2 border rounded">
                <div class="error-message" id="add_position_price_${stockCount}_error"></div>
            </div>
            <div class="mb-2">
                <label for="add_position_method_${stockCount}" class="block font-bold text-gray-700">補倉金額輸入方式:</label>
                <select id="add_position_method_${stockCount}" required class="w-full p-2 border rounded">
                    <option value="1">具體金額</option>
                    <option value="2">總資產百分比</option>
                </select>
            </div>
            <div class="mb-2">
                <label id="add_position_label_${stockCount}" class="block font-bold text-gray-700">補倉金額 ($):</label>
                <input type="number" id="add_position_input_${stockCount}" step="0.01" min="0" required class="w-full p-2 border rounded">
                <div class="error-message" id="add_position_input_${stockCount}_error"></div>
            </div>
        `;
        stockInputsContainer.appendChild(stockEntry);
        bindInputValidation();
    });

    // 輸入驗證函數
    function validateInput(input, errorId) {
        const errorElement = document.getElementById(errorId);
        errorElement.style.display = 'none';
        if (input.value === '') return false;

        if (input.id.includes('quantity_input')) {
            if (input.value.endsWith('%')) {
                const percent = input.value.replace(/[^0-9.]/g, '');
                if (!/^\d+(\.\d+)?$/.test(percent) || parseFloat(percent) > 100 || parseFloat(percent) <= 0) {
                    errorElement.textContent = '請輸入有效的百分比 (0-100)！';
                    errorElement.style.display = 'block';
                    return false;
                }
            } else {
                if (!/^\d+$/.test(input.value) || parseInt(input.value) <= 0) {
                    errorElement.textContent = '請輸入有效的股數（正整數）！';
                    errorElement.style.display = 'block';
                    return false;
                }
            }
        } else if (input.id.includes('stock_code')) {
            if (!/^[A-Za-z0-9.]+$/.test(input.value)) {
                errorElement.textContent = '請輸入有效的股票代碼！';
                errorElement.style.display = 'block';
                return false;
            }
        } else {
            if (parseFloat(input.value) <= 0) {
                errorElement.textContent = '輸入值必須大於 0！';
                errorElement.style.display = 'block';
                return false;
            }
        }
        return true;
    }

    // 驗證所有輸入
    function validateAllInputs() {
        let Marisa
let allValid = true;
        const inputs = [
            { id: 'total_assets', errorId: 'total_assets_error' }
        ];
        for (let i = 1; i <= stockCount; i++) {
            inputs.push(
                { id: `stock_code_${i}`, errorId: `stock_code_${i}_error` },
                { id: `buy_price_${i}`, errorId: `buy_price_${i}_error` },
                { id: `quantity_input_${i}`, errorId: `quantity_input_${i}_error` },
                { id: `predict_price_${i}`, errorId: `predict_price_${i}_error` },
                { id: `stop_loss_price_${i}`, errorId: `stop_loss_price_${i}_error` },
                { id: `add_position_price_${i}`, errorId: `add_position_price_${i}_error` },
                { id: `add_position_input_${i}`, errorId: `add_position_input_${i}_error` }
            );
        }
        inputs.forEach(({ id, errorId }) => {
            const input = document.getElementById(id);
            if (!input || !validateInput(input, errorId)) {
                allValid = false;
            }
        });
        calculateBtn.disabled = !allValid;
        return allValid;
    }

    // 綁定輸入驗證和補倉方式切換
    function bindInputValidation() {
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                validateInput(input, `${input.id}_error`);
                validateAllInputs();
            });
            if (input.id.includes('add_position_method')) {
                input.addEventListener('change', () => {
                    const index = input.id.split('_').pop();
                    const label = document.getElementById(`add_position_label_${index}`);
                    const addInput = document.getElementById(`add_position_input_${index}`);
                    if (label && addInput) {
                        label.textContent = input.value === '1' ? '補倉金額 ($):' : '補倉金額占總資產的百分比 (0-100):';
                        addInput.setAttribute('step', input.value === '1' ? '0.01' : '0.1');
                        addInput.value = '';
                        validateInput(addInput, `add_position_input_${index}_error`);
                    }
                });
            }
        });
    }

    // 計算股票盈虧
    function calculateStock() {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = '';
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.classList.remove('hidden');

        if (!validateAllInputs()) {
            errorDiv.textContent = '請修正所有輸入錯誤！';
            if (loadingDiv) loadingDiv.classList.add('hidden');
            return;
        }

        try {
            const totalAssets = parseFloat(document.getElementById('total_assets').value);
            if (totalAssets <= 0 || isNaN(totalAssets)) throw new Error('總資產金額必須大於 0！');

            const stockData = [];
            let totalCostSum = 0;

            for (let i = 1; i <= stockCount; i++) {
                const stockCode = document.getElementById(`stock_code_${i}`)?.value.trim().toUpperCase();
                if (!stockCode) throw new Error(`股票 ${i} 代碼不能為空！`);

                const buyPrice = parseFloat(document.getElementById(`buy_price_${i}`).value);
                if (buyPrice <= 0 || isNaN(buyPrice)) throw new Error(`股票 ${i} 買入價格必須大於 0！`);

                const quantityInput = document.getElementById(`quantity_input_${i}`).value.trim();
                let quantity, buyPercentage;
                if (quantityInput.endsWith('%')) {
                    buyPercentage = parseFloat(quantityInput.replace(/%/, ''));
                    if (buyPercentage < 0 || buyPercentage > 100 || isNaN(buyPercentage)) {
                        throw new Error(`股票 ${i} 買入百分比必須在 0 到 100 之間！`);
                    }
                    const buyAmount = totalAssets * (buyPercentage / 100);
                    quantity = Math.floor(buyAmount / buyPrice);
                    if (quantity <= 0) throw new Error(`股票 ${i} 根據輸入的百分比計算出的買入數量必須大於 0！`);
                } else {
                    quantity = parseInt(quantityInput);
                    if (quantity <= 0 || isNaN(quantity)) throw new Error(`股票 ${i} 買入數量必須大於 0！`);
                    buyPercentage = (quantity * buyPrice / totalAssets) * 100;
                }

                const predictPrice = parseFloat(document.getElementById(`predict_price_${i}`).value);
                if (predictPrice <= 0 || isNaN(predictPrice)) throw new Error(`股票 ${i} 止盈價格必須大於 0！`);

                const stopLossPrice = parseFloat(document.getElementById(`stop_loss_price_${i}`).value);
                if (stopLossPrice <= 0 || isNaN(stopLossPrice)) throw new Error(`股票 ${i} 止損價格必須大於 0！`);

                const addPositionPrice = parseFloat(document.getElementById(`add_position_price_${i}`).value);
                if (addPositionPrice <= 0 || isNaN(addPositionPrice)) throw new Error(`股票 ${i} 補倉價格必須大於 0！`);

                const addPositionMethod = document.getElementById(`add_position_method_${i}`).value;
                let addPositionAmount, addPositionPercentage;
                if (addPositionMethod === '1') {
                    addPositionAmount = parseFloat(document.getElementById(`add_position_input_${i}`).value);
                    if (addPositionAmount <= 0 || isNaN(addPositionAmount)) {
                        throw new Error(`股票 ${i} 補倉金額必須大於 0！`);
                    }
                    addPositionPercentage = (addPositionAmount / totalAssets * 100).toFixed(2);
                } else {
                    addPositionPercentage = parseFloat(document.getElementById(`add_position_input_${i}`).value);
                    if (addPositionPercentage < 0 || addPositionPercentage > 100 || isNaN(addPositionPercentage)) {
                        throw new Error(`股票 ${i} 補倉百分比必須在 0 到 100 之間！`);
                    }
                    addPositionAmount = (totalAssets * (addPositionPercentage / 100)).toFixed(2);
                }

                const totalCost = (buyPrice * quantity).toFixed(2);
                totalCostSum += parseFloat(totalCost);
                if (totalCostSum > totalAssets) throw new Error(`股票 ${i} 初始買入總成本超過總資產金額！`);

                const remainingAssets = (totalAssets - totalCostSum).toFixed(2);
                if (parseFloat(addPositionAmount) > parseFloat(remainingAssets)) {
                    throw new Error(`股票 ${i} 補倉金額超過剩餘總資產！`);
                }

                const profitsAmount = ((predictPrice - buyPrice) * quantity).toFixed(2);
                const profitsPercentage = (profitsAmount / totalAssets * 100).toFixed(2);
                const lossAmount = ((buyPrice - stopLossPrice) * quantity).toFixed(2);
                const lossPercentage = (lossAmount / totalAssets * 100).toFixed(2);
                const lossAmount2 = ((buyPrice - addPositionPrice) * quantity).toFixed(2);
                const lossPercentage2 = (lossAmount2 / totalAssets * 100).toFixed(2);
                const purchaseRatio = (totalCost / totalAssets * 100).toFixed(2);
                const addPositionQuantity = Math.floor(addPositionAmount / addPositionPrice);
                if (addPositionQuantity <= 0) throw new Error(`股票 ${i} 補倉金額不足以購買至少 1 股！`);

                stockData.push({
                    totalAssets,
                    stockCode,
                    buyPrice,
                    quantity,
                    buyPercentage,
                    predictPrice,
                    stopLossPrice,
                    addPositionPrice,
                    addPositionAmount,
                    addPositionPercentage,
                    profitsAmount,
                    profitsPercentage,
                    lossAmount,
                    lossPercentage,
                    lossAmount2,
                    lossPercentage2,
                    purchaseRatio,
                    addPositionQuantity,
                    remainingAssets,
                    totalCost
                });
            }

            // 將數據存儲到 localStorage 並跳轉到結果頁面
            localStorage.setItem('stockData', JSON.stringify(stockData));
            window.location.href = 'result.html';
        } catch (e) {
            errorDiv.textContent = `輸入錯誤！${e.message}`;
        } finally {
            if (loadingDiv) loadingDiv.classList.add('hidden');
        }
    }

    // 綁定計算按鈕
    calculateBtn.addEventListener('click', calculateStock);

    bindInputValidation();
});
