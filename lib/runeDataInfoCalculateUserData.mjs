import axios from 'axios';
import datefns from 'date-fns';

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

// assetCurrent solo necesita poolUnits
// assetData necesita poolUnits y unitsChanges
// busdData necesita price
// http://18.193.249.209:8080/v2/history/depths/BCH.BCH?interval=day&count=10
// returns liquidityUnits
export const _getAssetDataWithPoolUnits = async (pool, from, to, interval = 'hour') => {
    console.log('getAssetDataWithPoolUnits:', { pool, from, to, interval });

    var asset = await axios.get(`https://chaosnet-midgard.bepswap.com/v1/history/pools?pool=${pool}&interval=${interval}&from=${from}&to=${to}`);
    var assetData = asset.data;
    var assetCurrent = await axios.get(`https://chaosnet-midgard.bepswap.com/v1/pools/detail?asset=${pool}`);
    var assetDataCurrent = assetCurrent.data;

    assetData[assetData.length - 1].poolUnits = assetDataCurrent[0].poolUnits;
    for (i = assetData.length - 1; i > 0; i--) {
        assetData[i - 1].poolUnits = assetData[i].poolUnits - assetData[i].unitsChanges;
    }

    console.log('getAssetDataWithPoolUnits: done!');
    return assetData
};

export const getPastSimulation = (amountInvested, dateInvested, pool, poolsState) => {
    const monthAgoTimestamp = datefns.sub(new Date(), { months: 1 }).getTime();
    const periodKey = (monthAgoTimestamp < dateInvested.getTime()) ? 'period1HM' : 'period1Y';
    const fromUnixTime = datefns.getUnixTime(dateInvested);
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

// !!! gud
export const calculatePLBreakdown = (userData) => {
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
    console.log('calculateFeeAPY:', { pool, timespan });
    let assetData = null;
    let hours = null;
    const phd = poolsStore.poolHistoryDepths[pool] && poolsStore.poolHistoryDepths[pool].period1M.intervals;
    if (!phd)  { return null; }
    switch (timespan) {
        case '3days':
            hours = 3 * 24;
            assetData = phd.slice(0,3);
        case '7days':
            hours = 7 * 24;
            assetData = phd.slice(0,7);
        case '14days':
            hours = 14 * 24;
            assetData = phd.slice(0,14);
        case '30days':
            hours = 30 * 24;
            assetData = phd.slice(0,30);
    }
    if (!assetData || ! hours)  { return null; }
    let kValue = {
        start: assetData[0].assetDepth * assetData[0].runeDepth / (assetData[0].liquidityUnits ** 2),
        end: assetData[assetData.length - 1].assetDepth * assetData[assetData.length - 1].runeDepth / (assetData[assetData.length - 1].liquidityUnits ** 2)
    };
    let roi = Math.sqrt(kValue.end) / Math.sqrt(kValue.start) - 1;
    let apy = (1 + roi) ** (365 * 24 / hours) - 1;
    console.log('calculateFeeAPY: done!');
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