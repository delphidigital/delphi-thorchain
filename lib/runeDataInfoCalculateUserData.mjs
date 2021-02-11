export const getCurrentPrices = async (assets) => {
    console.log('getCurrentPrices:', assets);

    var query = 'asset=BNB.BUSD-BD1';
    for (asset of assets) {
        if (typeof asset == 'object') {
            query += `,${asset.chain}.${asset.symbol}`;
        } else if (typeof asset == 'string') {
            query += ',' + asset;
        }
    }

    var priceData = await $.get(`https://chaosnet-midgard.bepswap.com/v1/assets?${query}`);
    var runePriceUsd = 1 / parseFloat(priceData[0].priceRune);
    var prices = { 'RUNE': runePriceUsd };

    for (i = 1; i < priceData.length; i++) {
        prices[priceData[i].asset] = parseFloat(priceData[i].priceRune) * runePriceUsd
    }

    console.log('getCurrentPrices: done!')
    return prices;
};

export const _getAssetDataWithPoolUnits = async (pool, from, to, interval = 'hour') => {
    console.log('getAssetDataWithPoolUnits:', { pool, from, to, interval });

    var assetData = await $.get(`https://chaosnet-midgard.bepswap.com/v1/history/pools?pool=${pool}&interval=${interval}&from=${from}&to=${to}`);
    var assetDataCurrent = await $.get(`https://chaosnet-midgard.bepswap.com/v1/pools/detail?asset=${pool}`);

    assetData[assetData.length - 1].poolUnits = assetDataCurrent[0].poolUnits;
    for (i = assetData.length - 1; i > 0; i--) {
        assetData[i - 1].poolUnits = assetData[i].poolUnits - assetData[i].unitsChanges;
    }

    console.log('getAssetDataWithPoolUnits: done!');
    return assetData
};

export const getPastSimulation = async (amountInvested, dateInvested, pool, assetData = null, busdData = null) => {
    console.log('getPastSimulation:', { amountInvested, dateInvested, pool });

    if (!busdData || !assetData) {
        var from = Math.floor((new Date(dateInvested)).getTime() / 1000);
        var to = Math.floor(Date.now() / 1000);

        var busdData = await $.get(`https://chaosnet-midgard.bepswap.com/v1/history/pools?pool=BNB.BUSD-BD1&interval=hour&from=${from}&to=${to}`);
        var assetData = await _getAssetDataWithPoolUnits(pool, from, to);
    }

    // Calculate RUNE and asset prices
    for (i = 0; i < assetData.length; i++) {
        assetData[i].runePrice = 1 / busdData[i].price;
        assetData[i].assetPrice = assetData[i].price * assetData[i].runePrice;
    }

    // Calculate share price at the time of investment
    var sharePrice = (assetData[0].runeDepth * assetData[0].runePrice + assetData[0].assetDepth * assetData[0].assetPrice) / assetData[0].poolUnits;
    var userShare = amountInvested / sharePrice;

    var userData = [];

    for (i = 0; i < assetData.length; i++) {
        // User balance
        runeBalance = userShare * assetData[i].runeDepth / assetData[i].poolUnits;
        assetBalance = userShare * assetData[i].assetDepth / assetData[i].poolUnits;

        runeValue = runeBalance * assetData[i].runePrice;
        assetValue = assetBalance * assetData[i].assetPrice;
        totalValue = runeValue + assetValue;

        userData.push({
            timestamp: assetData[i].time,
            runePrice: assetData[i].runePrice,
            assetPrice: assetData[i].assetPrice,
            runeBalance, assetBalance, runeValue, assetValue, totalValue
        });

        totalValueIfHoldRune = 2 * userData[0].runeBalance * assetData[i].runePrice;
        totalValueIfHoldAsset = 2 * userData[0].assetBalance * assetData[i].assetPrice;
        totalValueIfHoldBoth = 0.5 * (totalValueIfHoldRune + totalValueIfHoldAsset);

        // Fee accrued
        kValueSq = Math.sqrt(runeBalance * assetBalance);
        kValueSqInit = Math.sqrt(userData[0].runeBalance * userData[0].assetBalance);
        feeAccrued = kValueSq / kValueSqInit - 1;

        // Imperm Loss
        priceSwing = assetData[i].price / assetData[0].price;
        impermLoss = 2 * Math.sqrt(priceSwing) / (priceSwing + 1) - 1;

        // Total gains
        totalGains = totalValue / totalValueIfHoldBoth - 1;

        userData[i] = {
            ...userData[i],
            totalValueIfHoldRune, totalValueIfHoldAsset, totalValueIfHoldBoth,
            feeAccrued, impermLoss, totalGains
        };
    }

    console.log('getPastSimulation: done!');
    return userData;
};

export const calculatePLBreakdown = (userData) => {
    console.log('calculatePLBreakdown...');

    var start = userData[0];
    var end = userData[userData.length - 1];

    kValueStart = start.runeBalance * start.assetBalance;
    kValueEnd = end.runeBalance * end.assetBalance;

    // P&L due to RUNE price movement
    runeMovement = start.runeBalance * (end.runePrice - start.runePrice);

    // P&L due to ASSET price movement
    assetMovement = start.assetBalance * (end.assetPrice - start.assetPrice);

    // RUNE & ASSET balances at the end IF NO FEE WAS RECEIVED
    runeBalanceNoFee = end.runeBalance * Math.sqrt(kValueStart / kValueEnd);
    assetBalanceNoFee = end.assetBalance * Math.sqrt(kValueStart / kValueEnd);

    // Fees
    fees = (end.runeBalance - runeBalanceNoFee) * end.runePrice + (end.assetBalance - assetBalanceNoFee) * end.assetPrice;

    // Imperm loss
    impermLoss = (runeBalanceNoFee - start.runeBalance) * end.runePrice + (assetBalanceNoFee - start.assetBalance) * end.assetPrice;

    // Total
    total = runeMovement + assetMovement + fees + impermLoss

    console.log('calculatePLBreakdown: done!');
    return {
        runeMovement: {
            value: runeMovement,
            percentage: runeMovement / start.totalValue
        },
        assetMovement: {
            value: assetMovement,
            percentage: assetMovement / start.totalValue
        },
        fees: {
            value: fees,
            percentage: fees / start.totalValue
        },
        impermLoss: {
            value: impermLoss,
            percentage: impermLoss / start.totalValue
        },
        total: {
            value: total,
            percentage: total / start.totalValue
        }
    };
};

export const _calculateFeeAPY = async (pool, timespan) => {
    console.log('calculateFeeAPY:', { pool, timespan });

    switch (timespan) {
        case '3days':
            hours = 3 * 24;
        case '7days':
            hours = 7 * 24;
        case '14days':
            hours = 14 * 24;
        case '30days':
            hours = 30 * 24;
    }

    var to = Math.floor(Date.now() / 1000);
    var from = to - hours * 60 * 60;
    var assetData = await _getAssetDataWithPoolUnits(pool, from, to);

    var kValue = {
        start: assetData[0].assetDepth * assetData[0].runeDepth / (assetData[0].poolUnits ** 2),
        end: assetData[assetData.length - 1].assetDepth * assetData[assetData.length - 1].runeDepth / (assetData[assetData.length - 1].poolUnits ** 2)
    };
    var roi = Math.sqrt(kValue.end) / Math.sqrt(kValue.start) - 1;
    var apy = (1 + roi) ** (365 * 24 / hours) - 1;

    console.log('calculateFeeAPY: done!');
    return apy;
};

export const calculatePrediction = async (amountInvested, dateToPredict,
                                   pool, timespanForAPY,
                                   priceTargetRune, priceTargetAsset,
                                   prices) => {
    console.log('calculatePrediction', {
        amountInvested, dateToPredict, pool,
        timespanForAPY, priceTargetRune, priceTargetAsset
    });

    // Prices of RUNE and asset
    if (!prices) {
        prices = await getCurrentPrices([pool]);
    }

    // If HODL
    var withdrawAndHoldRune = amountInvested * priceTargetRune / prices['RUNE'];
    var withdrawAndHoldAsset = amountInvested * priceTargetAsset / prices[pool];
    var withdrawAndHoldBoth = 0.5 * (withdrawAndHoldRune + withdrawAndHoldAsset);

    // Predict fee income
    var apy = await _calculateFeeAPY(pool, timespanForAPY);
    var hours = (new Date(dateToPredict) - new Date(Date.now())) / 1000 / 60 / 60;
    var fees = (1 + apy) ** (hours / (365 * 24)) - 1;

    // Predict imperm loss
    var currentPriceRatio = prices[pool] / prices['RUNE'];
    var futurePriceRatio = priceTargetAsset / priceTargetRune;
    var priceSwing = currentPriceRatio / futurePriceRatio;
    var impermLoss = 2 * Math.sqrt(priceSwing) / (priceSwing + 1) - 1;

    // Total gains
    var total = fees + impermLoss;
    var totalValue = withdrawAndHoldBoth * (1 + total);

    // If LP, start and end state
    var start = {
        runeBalance: 0.5 * amountInvested / prices['RUNE'],
        assetBalance: 0.5 * amountInvested / prices[pool],
        runePrice: prices['RUNE'],
        assetPrice: prices[pool],
        totalValue: amountInvested
    };
    var end = {
        runeBalance: 0.5 * totalValue / priceTargetRune,
        assetBalance: 0.5 * totalValue / priceTargetAsset,
        runePrice: priceTargetRune,
        assetPrice: priceTargetAsset
    };

    var prediction = {
        keepProvidingLiquidity: {
            totalValue: totalValue,
            change: totalValue - amountInvested,
        },
        withdrawAndHoldRune: {
            totalValue: withdrawAndHoldRune,
            change: withdrawAndHoldRune - amountInvested
        },
        withdrawAndHoldAsset: {
            totalValue: withdrawAndHoldAsset,
            change: withdrawAndHoldAsset - amountInvested
        },
        withdrawAndHoldBoth: {
            totalValue: withdrawAndHoldBoth,
            change: withdrawAndHoldBoth - amountInvested
        }
    };
    var predictionBreakdown = calculatePLBreakdown([start, end]);

    console.log('calculatePrediction: done!');
    return { prediction, predictionBreakdown };
};

export const getAllAssetPerformances = async (since) => {
    console.log('getAllAssetPerformances:', { since });

    var from = Math.floor((new Date(since)).getTime() / 1000);
    var to = Math.floor(Date.now() / 1000);

    var busdData = await $.get(`https://chaosnet-midgard.bepswap.com/v1/history/pools?pool=BNB.BUSD-BD1&interval=hour&from=${from}&to=${to}`);
    var performances = [];

    for (asset of _assets) {
        pool = `${asset.chain}.${asset.symbol}`;
        console.log(`Calculating performance: ${pool}`);
        assetData = await _getAssetDataWithPoolUnits(pool, from, to);

        assetPerformance = await getPastSimulation(
            10000, since, pool, [
                assetData[0],
                assetData[assetData.length - 1]
            ], [
                busdData[0],
                busdData[busdData.length - 1]
        ]);

        performances.push({
            pool,
            roi: assetPerformance[1].totalValue / assetPerformance[0].totalValue - 1,
            feeAccrued: assetPerformance[1].feeAccrued,
            impermLoss: assetPerformance[1].impermLoss
        });
    }

    console.log('getAllAssetPerformances: done!');
    return performances;
};

export const getBestsAndWorsts = (performances) => {
    performances.sort((a, b) => a.roi < b.roi ? -1 : 1);  // Sort ascendingly by ROI
    return {
        bests: performances.slice(performances.length - 6, performances.length - 1).reverse(),
        worsts: performances.slice(0, 5)
    };
};



/// UTILS
const _outOrUnderperform = (val) => val >= 0 ? 'outperforms' : 'underperforms';
const _upOrDown = (val) => val >= 0 ? 'up' : 'down';
const _gainOrLose = (val) => val >= 0 ? 'will gain' : 'will lose';
const _gainedOrLost = (val) => val >= 0 ? 'gained' : 'lost';

const _formatPrice = (p) => {
    return p.toFixed(p >= 1 ? 2 : 5);
};

const _formatTotalValue = (v) => {
    return '$' + Math.abs(v).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const _formatPriceChange = (value) => {
    if (value >= 0) {
        var sign = '+';
    } else {
        var sign = '–';
    }
    return sign + '$' + Math.abs(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const _formatTotalValueChange = (value) => {
    if (value >= 0) {
        var sign = '+';
    } else {
        var sign = '–';
    }
    color = value >= 0 ? 'green' : 'red';
    return `<b style="color: ${color}">${sign}$` + Math.abs(value).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</b>';
};

const _formatPercentChange = (pc, signed = true) => {
    if (signed) {
        sign = pc >= 0 ? '+' : '–';
    } else {
        sign = '';
    }
    color = pc >= 0 ? 'green' : 'red';
    pc = Math.abs(pc) * 100;
    pc = pc.toFixed(pc < 10 ? 1 : 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `<b style="color: ${color}">${sign}${pc}%</b>`;
};