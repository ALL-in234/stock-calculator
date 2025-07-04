document.addEventListener('DOMContentLoaded', function () {
    const stockForm = document.getElementById('stockForm');
    if (!stockForm) {
        console.error('找不到 stockForm 元素！請檢查 HTML 中是否正確定義了 id="stockForm"。');
        return;
    }
    stockForm.addEventListener('submit', function (e) {
        e.preventDefault();
        calculateStock();
    });

    const addPositionMethod = document.getElementById('addPositionMethod');
    if (!addPositionMethod) {
        console.error('找不到 addPositionMethod 元素！');
        return;
    }
    addPositionMethod.addEventListener('change', function () {
        const addPositionInput = document.getElementById('addPositionInput');
        if (!addPositionInput) {
            console.error('找不到 addPositionInput 元素！');
            return;
        }
        const label = addPositionInput.querySelector('label');
        const input = addPositionInput.querySelector('input');
        if (!label || !input) {
            console.error('找不到 addPositionInput 內的 label 或 input 元素！');
            return;
        }
        if (this.value === '1') {
            label.textContent = '補倉金額:';
            input.placeholder = '輸入具體金額';
        } else {
            label.textContent = '補倉金額占總資產的百分比 (0-100):';
            input.placeholder = '輸入百分比 (0-100)';
        }
    });
});

function calculateStock() {
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('downloadBtn');
    if (!resultDiv || !downloadBtn) {
        console.error('找不到 result 或 downloadBtn 元素！');
        return;
    }

    try {
        const totalAssets = parseFloat(document.getElementById('totalAssets')?.value);
        if (totalAssets <= 0 || isNaN(totalAssets)) throw new Error('總資產金額必須大於 0！');

        const stockCode = document.getElementById('stockCode')?.value.trim().toUpperCase();
        if (!stockCode) throw new Error('股票代碼不能為空！');

        const buyPrice = parseFloat(document.getElementById('buyPrice')?.value);
        if (buyPrice <= 0 || isNaN(buyPrice)) throw new Error('買入價格必須大於 0！');

        const quantityInput = document.getElementById('quantity')?.value.trim();
        let quantity, buyPercentage;
        if (quantityInput.endsWith('%')) {
            buyPercentage = parseFloat(quantityInput.replace(/%/, ''));
            if (buyPercentage < 0 || buyPercentage > 100 || isNaN(buyPercentage)) {
                throw new Error('買入百分比必須在 0 到 100 之間！');
            }
            const buyAmount = totalAssets * (buyPercentage / 100);
            quantity = Math.floor(buyAmount / buyPrice);
            if (quantity <= 0) throw new Error('根據輸入的百分比計算出的買入數量必須大於 0！');
        } else {
            quantity = parseInt(quantityInput);
            if (quantity <= 0 || isNaN(quantity)) throw new Error('買入數量必須大於 0！');
            buyPercentage = (quantity * buyPrice / totalAssets) * 100;
        }

        const predictPrice = parseFloat(document.getElementById('predictPrice')?.value);
        if (isNaN(predictPrice)) throw new Error('請輸入有效的止盈價格！');

        const stopLossPrice = parseFloat(document.getElementById('stopLossPrice')?.value);
        if (isNaN(stopLossPrice)) throw new Error('請輸入有效的止損價格！');

        const addPositionPrice = parseFloat(document.getElementById('addPositionPrice')?.value);
        if (addPositionPrice <= 0 || isNaN(addPositionPrice)) throw new Error('補倉價格必須大於 0！');

        const addPositionMethod = document.getElementById('addPositionMethod')?.value;
        let addPositionAmount, addPositionPercentage;
        if (addPositionMethod === '1') {
            addPositionAmount = parseFloat(document.getElementById('addPositionAmount')?.value);
            if (addPositionAmount <= 0 || isNaN(addPositionAmount)) {
                throw new Error('補倉金額必須大於 0！');
            }
            addPositionPercentage = (addPositionAmount / totalAssets) * 100;
        } else {
            addPositionPercentage = parseFloat(document.getElementById('addPositionAmount')?.value);
            if (addPositionPercentage < 0 || addPositionPercentage > 100 || isNaN(addPositionPercentage)) {
                throw new Error('補倉百分比必須在 0 到 100 之間！');
            }
            addPositionAmount = totalAssets * (addPositionPercentage / 100);
        }

        const totalCost = buyPrice * quantity;
        if (totalCost > totalAssets) throw new Error('初始買入總成本超過總資產金額！');

        const remainingAssets = totalAssets - totalCost;
        if (addPositionAmount > remainingAssets) throw new Error('補倉金額超過剩餘總資產！');

        const profitsAmount = (predictPrice - buyPrice) * quantity;
        const profitsPercentage = (profitsAmount / totalAssets) * 100;

        const lossAmount = (buyPrice - stopLossPrice) * quantity;
        const lossPercentage = (lossAmount / totalAssets) * 100;

        const lossAmount2 = (buyPrice - addPositionPrice) * quantity;
        const lossPercentage2 = (lossAmount2 / totalAssets) * 100;

        const purchaseRatio = (totalCost / totalAssets) * 100;
        const addPositionRatio = (addPositionAmount / totalAssets) * 100;
        const addPositionQuantity = Math.floor(addPositionAmount / addPositionPrice);

        const outputContent = `
股票買入資訊:
總資產金額: $${totalAssets.toFixed(2)}美元
股票代碼: ${stockCode}
買入價格: $${buyPrice.toFixed(2)}
買入數量: ${quantity} 股
買入占比: ${purchaseRatio.toFixed(2)}%
總成本: $${totalCost.toFixed(2)}
剩餘總資產: $${remainingAssets.toFixed(2)}
盈利金額: $${profitsAmount.toFixed(2)}, 盈利總占比: ${profitsPercentage.toFixed(2)}%
止損價格: $${stopLossPrice.toFixed(2)}
${stopLossPrice > 0 ? `虧損金額: $${lossAmount.toFixed(2)} (若觸及止損價格)\n` : ''}
虧損金額: $${lossAmount2.toFixed(2)} (若觸及補倉價格), 虧損總占比: ${lossPercentage2.toFixed(2)}%
補倉價格: $${addPositionPrice.toFixed(2)}
補倉金額: $${addPositionAmount.toFixed(2)}
補倉金額占總資產百分比: ${addPositionPercentage.toFixed(2)}%
補倉股數: ${addPositionQuantity} 股
        `;

        resultDiv.textContent = outputContent;
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => {
            const blob = new Blob([outputContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '盈虧計算.txt';
            a.click();
            URL.revokeObjectURL(url);
        };

    } catch (error) {
        resultDiv.textContent = `錯誤：${error.message}`;
        downloadBtn.style.display = 'none';
    }
}