import datefns from 'date-fns';

export const getPastSimulation = (amountInvested, dateInvested, pool, poolsState) => {
    const monthAgoTimestamp = datefns.sub(new Date(), { months: 1 }).getTime();
    const periodKey = (monthAgoTimestamp < dateInvested.getTime()) ? 'period1HM' : 'period1Y';
    const fromUnixTime = datefns.getUnixTime(dateInvested);
    if (dateInvested.getTime() > new Date().getTime()) {
        return []
    }
    const depthHistoryItems = poolsState.poolHistoryDepths[pool][periodKey].intervals.filter(i => (
        parseInt(i.startTime, 10) >= fromUnixTime
    ));
    const depthHistory = depthHistoryItems.map(h => {
        const assetDepth = isNaN(h.assetDepth) ? 0 : parseInt(h.assetDepth, 10);
        const assetPrice = isNaN(h.assetPrice) ? 0 : parseFloat(h.assetPrice, 10);
        const assetPriceUSD = isNaN(h.assetPriceUSD) ? 0 : parseFloat(h.assetPriceUSD, 10);
        const endTime = parseInt(h.endTime, 10);
        const liquidityUnits = isNaN(h.liquidityUnits) ? 0 : parseInt(h.liquidityUnits, 10);
        const runeDepth = isNaN(h.runeDepth) ? 0 : parseInt(h.runeDepth, 10);
        const startTime = parseInt(h.startTime, 10);
        const runePriceUSD = assetPrice ? (assetPriceUSD/assetPrice) : 0;
        return {
            assetDepth,
            assetPrice,
            assetPriceUSD,
            runePriceUSD,
            endTime,
            liquidityUnits,
            runeDepth,
            startTime,
        }
    }).filter(h => (
        // testnet data has werid stuff, filter
        // items where there is no value
        h.assetDepth &&
        h.assetPrice &&
        h.assetPriceUSD &&
        h.liquidityUnits &&
        h.runeDepth
    ));
    if (!depthHistory.length) {
        return [];
    }
    // Calculate share price at the time of investment
    const initialRuneDepth = depthHistory[0].runeDepth;
    const initialAssetDepth = depthHistory[0].assetDepth;
    const initialRunePriceUsd = depthHistory[0].runePriceUSD;
    const initialAssetPriceUsd = depthHistory[0].assetPriceUSD;
    const initialLiquidityUnits = depthHistory[0].liquidityUnits;
    const sharePrice = initialLiquidityUnits
        ? (
            (initialRuneDepth * initialRunePriceUsd) + 
            (initialAssetDepth * initialAssetPriceUsd)
        ) / initialLiquidityUnits
        : 0;
    const userShare = sharePrice ? (amountInvested / sharePrice) : 0;
    const userData = [];
    for (let i = 0; i < depthHistory.length; i++) {
        // User balance
        const runeBalance = depthHistory[i].liquidityUnits
            ? (userShare * depthHistory[i].runeDepth / depthHistory[i].liquidityUnits)
            : 0;
        const assetBalance = depthHistory[i].liquidityUnits
            ? (userShare * depthHistory[i].assetDepth / depthHistory[i].liquidityUnits)
            : 0;
        const runeValue = runeBalance * depthHistory[i].runePriceUSD;
        const assetValue = assetBalance * depthHistory[i].assetPriceUSD;
        const totalValue = runeValue + assetValue;
        userData.push({
            timestamp: depthHistory[i].startTime,
            runePrice: depthHistory[i].runePriceUSD,
            assetPrice: depthHistory[i].assetPriceUSD,
            runeBalance,
            assetBalance,
            runeValue,
            assetValue,
            totalValue
        });
        const totalValueIfHoldRune = 2 * userData[0].runeBalance * depthHistory[i].runePriceUSD;
        const totalValueIfHoldAsset = 2 * userData[0].assetBalance * depthHistory[i].assetPriceUSD;
        const totalValueIfHoldBoth = 0.5 * (totalValueIfHoldRune + totalValueIfHoldAsset);
        // Fee accrued
        const kValueSq = Math.sqrt(runeBalance * assetBalance);
        const kValueSqInit = Math.sqrt(userData[0].runeBalance * userData[0].assetBalance);
        const feeAccrued = kValueSqInit ? (kValueSq / kValueSqInit - 1) : 0;
        // Imperm Loss
        const priceSwing = depthHistory[0].assetPrice
            ? (depthHistory[i].assetPrice / depthHistory[0].assetPrice)
            : 0;
        const impermLoss = priceSwing ? (2 * Math.sqrt(priceSwing) / (priceSwing + 1) - 1) : 0;
        // Total gains
        const totalGains = totalValueIfHoldBoth ? (totalValue / totalValueIfHoldBoth - 1) : 0;
        userData[i] = {
            ...userData[i],
            totalValueIfHoldRune,
            totalValueIfHoldAsset,
            totalValueIfHoldBoth,
            feeAccrued,
            impermLoss,
            totalGains
        };
    }
    return userData;
}

export const calculatePLBreakdown = (userData) => {
    if (!userData || !userData.length) {
        return null;
    }
    const start = userData[0];
    const end = userData[userData.length - 1];
    const kValueStart = start.runeBalance * start.assetBalance;
    const kValueEnd = end.runeBalance * end.assetBalance;
    // P&L due to RUNE price movement
    const runeMovement = start.runeBalance * (end.runePrice - start.runePrice);
    // P&L due to ASSET price movement
    const assetMovement = start.assetBalance * (end.assetPrice - start.assetPrice);
    // RUNE & ASSET balances at the end IF NO FEE WAS RECEIVED
    const runeBalanceNoFee = end.runeBalance * Math.sqrt(kValueStart / kValueEnd);
    const assetBalanceNoFee = end.assetBalance * Math.sqrt(kValueStart / kValueEnd);
    // Fees
    const fees = (end.runeBalance - runeBalanceNoFee) * end.runePrice + (end.assetBalance - assetBalanceNoFee) * end.assetPrice;
    // Imperm loss
    const impermLoss = (runeBalanceNoFee - start.runeBalance) * end.runePrice + (assetBalanceNoFee - start.assetBalance) * end.assetPrice;
    // Total
    const total = runeMovement + assetMovement + fees + impermLoss
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

export const _calculateFeeAPY = (pool, timespan, poolsStore) => {
    let hours = 30 * 24; // 1 hourly month by default
    const phd = poolsStore.poolHistoryDepths[pool] && poolsStore.poolHistoryDepths[pool].period1HM.intervals;
    if (!phd)  { return null; }
    switch (timespan) {
        case '3days':
            hours = 3 * 24;
        case '7days':
            hours = 7 * 24;
        case '14days':
            hours = 14 * 24;
    }
    const startAtPeriodUnixTime = datefns.getUnixTime(datefns.subHours(new Date(), hours));
    const assetData = phd.filter(interval => (
        parseInt(interval.startTime, 10) >= startAtPeriodUnixTime && parseInt(interval.liquidityUnits,10) !== 0
    ));
    let kValue = {
        start: assetData[0].assetDepth * assetData[0].runeDepth / (assetData[0].liquidityUnits ** 2),
        end: assetData[assetData.length - 1].assetDepth * assetData[assetData.length - 1].runeDepth / (assetData[assetData.length - 1].liquidityUnits ** 2)
    };
    let roi = Math.sqrt(kValue.end) / Math.sqrt(kValue.start) - 1;
    let apy = (1 + roi) ** (365 * 24 / hours) - 1;
    return apy;
};

export const calculatePrediction = (
    amountInvested, dateToPredict, pool, timespanForAPY, priceTargetRune, priceTargetAsset, poolsStore,
) => {
    const poolCache = poolsStore.pools.find(p => p.poolId === pool);
    if (!poolCache) { return null; }
    const assetPriceUSD = parseFloat(poolCache.poolStats.period1H.assetPriceUSD);
    const runePriceUSD = assetPriceUSD / parseFloat(poolCache.poolStats.period1H.assetPrice);
    console.log('calculatePrediction', {
        amountInvested, dateToPredict, pool,
        timespanForAPY, priceTargetRune, priceTargetAsset
    });

    // If HODL
    var withdrawAndHoldRune = amountInvested * priceTargetRune / runePriceUSD;
    var withdrawAndHoldAsset = amountInvested * priceTargetAsset / assetPriceUSD;
    var withdrawAndHoldBoth = 0.5 * (withdrawAndHoldRune + withdrawAndHoldAsset);

    // Predict fee income
    var apy = _calculateFeeAPY(pool, timespanForAPY, poolsStore);
    var hours = (new Date(dateToPredict) - new Date(Date.now())) / 1000 / 60 / 60;
    var fees = (1 + apy) ** (hours / (365 * 24)) - 1;

    // Predict imperm loss
    var currentPriceRatio = assetPriceUSD / runePriceUSD;
    var futurePriceRatio = priceTargetAsset / priceTargetRune;
    var priceSwing = currentPriceRatio / futurePriceRatio;
    var impermLoss = 2 * Math.sqrt(priceSwing) / (priceSwing + 1) - 1;

    // Total gains
    var total = fees + impermLoss;
    var totalValue = withdrawAndHoldBoth * (1 + total);

    // If LP, start and end state
    var start = {
        runeBalance: 0.5 * amountInvested / runePriceUSD,
        assetBalance: 0.5 * amountInvested / assetPriceUSD,
        runePrice: runePriceUSD,
        assetPrice: assetPriceUSD,
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
