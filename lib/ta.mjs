import subDays from 'date-fns/subDays';
import subHours from 'date-fns/subHours';
import getUnixTime from 'date-fns/getUnixTime';
import differenceInHours from 'date-fns/differenceInHours'
import differenceInDays from 'date-fns/differenceInDays';
import { periodToStatsMap } from '../store/pools';
import { poolNameWithoutAddr } from './utils';

// type PeriodKey = 'period24H' | 'period1W' | 'period1M' | 'period3M' | 'period6M' | 'period1Y' | 'period1HM' | 'allTimePeriod'
export const periodKeyToIntervalsDatapointsMap = {
  period24H: 24, // in hours
  period1W: 7 * 24, // in hours
  period1M: 30,
  period3M: 90,
  period6M: 180,
  period1Y: 365,
  period1HM: 720,
};

export const periodKeyToDaysMap = {
  period24H: 1,
  period1W: 7,
  period1M: 30,
  period3M: 90,
  period6M: 180,
  period1Y: 365,
  period1HM: 720,
};

export const e8ValueParser = str => (str
    ? (isNaN(parseInt(str,10)) ? 0 : (parseInt(str,10) / 10 ** 8))
    : 0);

export function getPoolsPeriodDepthAndVolumeUsd(poolHistoryDepths, poolHistorySwaps, periodKey, colors) {
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  const periodDataPoints = (
    periodKeyToIntervalsDatapointsMap[periodKey] || poolHistoryDepths[poolId][periodResolutionKey].intervals.length
  );
  // Use 1 hourly 1 month resolution or daily 1 year resolution to get data points
  return Object.keys(poolHistoryDepths).map((poolId, index) => {
    // slice the daily 1year intervals or hourly 1 month intervals to fit period
    // const depthIntervals = poolHistoryDepths[poolId][periodResolutionKey].intervals.slice(-periodDataPoints);
    const depthIntervals = poolHistoryDepths[poolId][periodResolutionKey].intervals.slice(-periodDataPoints);
    const swapIntervals = poolHistorySwaps[poolId][periodResolutionKey].intervals.slice(-periodDataPoints);
    // total depth is just each pool's latest depth in usd
    const lastN = depthIntervals.length - 1;
    let lastNAssetPriceUSD = parseFloat(depthIntervals[lastN].assetPriceUSD);
    let lastNAssetDepth = e8ValueParser(depthIntervals[lastN].assetDepth);
    if (isNaN(lastNAssetPriceUSD)) { lastNAssetPriceUSD = 0; }
    if (isNaN(lastNAssetDepth)) { lastNAssetDepth = 0; }
    const totalDepthUsd = (lastNAssetDepth * lastNAssetPriceUSD * 2);
    const totalVolumeUsd = swapIntervals.reduce((acc, next, idx) => {
      let assetPriceUSD = parseFloat(depthIntervals[idx].assetPriceUSD);
      let assetPrice = parseFloat(depthIntervals[idx].assetPrice);
      if (isNaN(assetPriceUSD)) { assetPriceUSD = 0; }
      if (isNaN(assetPrice)) { assetPrice = 0; }
      const runePriceUsd = (assetPriceUSD && assetPrice) ? (assetPriceUSD/assetPrice) : 0;
      return (acc + e8ValueParser(next.totalVolume) + runePriceUsd);
    }, 0);
    return {
      totalVolumeUsd,
      totalDepthUsd,
      poolId: poolNameWithoutAddr(poolId),
      color: colors[index % (colors.length)],
    };
  });
  // this.$store.state.pools.poolHistoryDepths["BCH.BCH"].period1Y.intervals[0]
  // this.$store.state.pools.poolHistorySwaps["BCH.BCH"].period1Y.intervals[0]
}

export function getInvervalsFromPeriodKey(depthsOrSwapsMap, periodKey) {
  const periodDataPoints = periodKeyToIntervalsDatapointsMap[periodKey] || 1000; // use 1k data points as all time
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  let startAtPeriodUnixTime = getUnixTime(subDays(new Date(), periodDataPoints));
  if (periodResolutionKey === 'period1HM') {
    startAtPeriodUnixTime = getUnixTime(subHours(new Date(), periodDataPoints));
  }
  return Object.keys(depthsOrSwapsMap).map((poolId, index) => {
    const intervals = depthsOrSwapsMap[poolId][periodResolutionKey].intervals.filter(iv => (
      parseInt(iv.startTime, 10) >= startAtPeriodUnixTime
    ));
    return {
      poolId, intervals,
    }
  });
}

// poolId apy volumeAverageUsd depthAverageUsd volumeOverDepthRatio correllation
// export function getPoolsList(poolHistoryDepths, poolHistorySwaps, periodKey, poolsStore, periodStatsKey) { {
//   // 24h, 1W, 1M, 3M, 1Y
//   // "1h" "24h" "7d" "30d" "90d" "365d" "all"
//   const poolsDepths = getInvervalsFromPeriodKey(poolHistoryDepths, periodKey);
//   return poolsDepths.map(pd => {
//     const periodStats = poolsStore.find(p => p.poolId === pd.poolId).poolStats[periodStatsKey];
//     pd.intervals.reduce((acc, next) => {
//       assetPriceUSD
//       assetPrice
//       assetDepth
      
//       return {
//         depthAverageUsd: acc.depthAverageUsd + next.,
//         volumeAverageUsd: acc.volumeAverageUsd + next.,
//       };
//     }, { depthAverageUsd: 0, volumeAverageUsd: 0 });
      
//     return {
//       poolId: pd.poolId,
//       apy: periodStats.poolAPY,
//       volumeAverageUsd,
//       depthAverageUsd,
//       volumeOverDepthRatio,
//       correllation,
//     };
//   });
// }

// }

export function getTopPerformers(poolHistoryDepths, periodKey, poolsStore, periodStatsKey) {
  const poolsDepths = getInvervalsFromPeriodKey(poolHistoryDepths, periodKey);
  return poolsDepths.map(pd => ({
    poolId: pd.poolId,
    apy: poolsStore.find(p => p.poolId === pd.poolId).poolStats[periodStatsKey].poolAPY,
    intervalsWithFeesAndImpLoss: getFeesWithImpermLoss(pd.intervals)
  }));
}

export function getTopPerformersNo(poolHistoryDepths, allPoolsHistoryEarnings, periodKey) {
  const poolsDepths = getInvervalsFromPeriodKey(poolHistoryDepths, periodKey);
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  const periodDataPoints = periodKeyToIntervalsDatapointsMap[periodKey] || 1000;
  return poolsDepths.map(pd => {
    const intervalsCalculations = {};
    let firstIntervalTimestamp = 0;
    pd.intervals.forEach((interval, idx) => {
      let assetPriceUSD = parseFloat(interval.assetPriceUSD);
      let assetPrice = parseFloat(interval.assetPrice);
      let assetDepth = e8ValueParser(interval.assetDepth);
      if (isNaN(assetPriceUSD)) { assetPriceUSD = 0; }
      if (isNaN(assetPrice)) { assetPrice = 0; }
      if (isNaN(assetDepth)) { assetDepth = 0; }
      const runePriceUSD = (assetPriceUSD && assetPrice) ? (assetPriceUSD/assetPrice) : 0;

      // const assetPriceUsd = parseFloat(interval.assetPriceUSD);
      // const assetPrice = parseFloat(interval.assetPrice);
      // const runePriceUsd = (isNaN(assetPriceUsd) || isNaN(assetPrice)) ? 0 : assetPriceUsd/assetPrice;
      const runeAssetRatio = assetPriceUSD ? ((runePriceUSD) / (assetPriceUSD)) : 0;
  
      let priceSwing = 0.0;
      let impermanentLoss = 0.0;
      if (idx === 0) {
        firstIntervalTimestamp = interval.startTime;
      } else {
        // use runeAssetRatio from first interval value for price swing
        const firstIntervalRuneAssetRatio = intervalsCalculations[firstIntervalTimestamp].runeAssetRatio;
        priceSwing = firstIntervalRuneAssetRatio
          ? ((runeAssetRatio / firstIntervalRuneAssetRatio)-1)
          : 0;
        impermanentLoss = (
          (2 * Math.sqrt(1+priceSwing) / (2+priceSwing)) - 1
        );
      }
      let periodRuneEarnings = 0.0;
      // let periodUsdEarnings = 0.0;
      let periodicRate = 0.0;
      let periodAPY = 0.0;
      let periodRewards = 0.0;
      let periodTotalDepthUsd = (assetDepth * assetPriceUSD * 2);
      if (allPoolsHistoryEarnings[periodResolutionKey] && allPoolsHistoryEarnings[periodResolutionKey].meta?.pools) {
        const intervalEarnings = allPoolsHistoryEarnings[periodResolutionKey].intervals.find(earningsInterval => (
          earningsInterval.startTime === interval.startTime
        ));
        if (intervalEarnings) {
          const poolPeriodEarnings = intervalEarnings.pools.find(pe => (pe.pool === pd.poolId));
          if (poolPeriodEarnings) {
            periodRuneEarnings = e8ValueParser(poolPeriodEarnings.earnings);
            periodRewards = e8ValueParser(poolPeriodEarnings.rewards);
            const intervalRuneDepth = e8ValueParser(interval.runeDepth);
            // periodUsdEarnings = periodRuneEarnings * runePriceUSD;
            // periodUsdEarnings = periodRuneEarnings;
            // https://www.investopedia.com/personal-finance/apr-apy-bank-hopes-cant-tell-difference/
            // Periodic Rate = (earnings - IL) / total Depth
            periodicRate = intervalRuneDepth
              // TODO: how to remove impermanent loss??!!
              ? (((periodRuneEarnings + (periodRuneEarnings * impermanentLoss))/(intervalRuneDepth*2)))
              // ? ((periodRuneEarnings/(intervalRuneDepth*2)))
              : 0;
            // APY = ((1 + Periodic Rate)^Number of periods) – 1
            let numberOfPeriods = 365;
            if (periodResolutionKey === 'period1HM') {
              numberOfPeriods = 365 * pd.intervals.length;
            } else if (periodResolutionKey === 'period1Y') {
              numberOfPeriods = 365 / pd.intervals.length;
            } else if (periodResolutionKey === 'allTimePeriod') {
              numberOfPeriods = 365 / differenceInDays(new Date(parseInt(interval.startTime,10)*1000), new Date(parseInt(interval.endTime,10)*1000))
            }
            // let numberOfPeriods = 365;
            // if (periodResolutionKey === 'period24H') {
            //   numberOfPeriods = 365 * 24;
            // } else if (periodResolutionKey === 'allTimePeriod') {
            //   numberOfPeriods = 365 / differenceInDays(new Date(parseInt(interval.startTime,10)*1000), new Date(parseInt(interval.endTime,10)*1000))
            // }
            
            // "APY= (1 + r )n – 1
            //   r = return over the specified period
            //   n = 365/days over which r is measured
            // https://learn.robinhood.com/articles/5CLrCuXmQXIKWMye3uZcEM/what-is-annual-percentage-yield-apy/
            periodAPY = (((1+(periodicRate/numberOfPeriods))**numberOfPeriods)-1) * 100;
          }
        }
      }
      intervalsCalculations[interval.startTime] = {
        assetPrice,
        assetPriceUSD,
        runePriceUSD,
        runeAssetRatio,
        startTime: interval.startTime,
        priceSwing,
        impermanentLoss: impermanentLoss * 100,
        periodRuneEarnings,
        periodTotalDepthUsd,
        periodRewards,
        // periodUsdEarnings,
        periodicRate,
        periodAPY,
      };

    });
    return {
      poolId: pd.poolId, intervalsCalculations,
    }

  });

}


// Object.keys(historySwaps).forEach(poolId => {
//   Object.keys(historySwaps[poolId]).forEach(periodKey => {
//     const runeUSDPrices = {};
//     historyDepth[poolId][periodKey].intervals.forEach(i => {
//       const assetPriceUSD = parseFloat(i.assetPriceUSD);
//       const assetPrice = parseFloat(i.assetPrice);
//       runeUSDPrices[i.startTime] = isNaN(assetPriceUSD) || isNaN(assetPrice) || !assetPrice
//         ? 0
//         : assetPriceUSD / assetPrice;
//     });
//     // { intervals: any[], meta: { endTime: string; startTime: string; }}
//     const { intervals } = historySwaps[poolId][periodKey];
//     const totalVolume = intervals.reduce((result, item) => (
//       result + e8ValueParser(item.totalVolume)
//     ), 0);
//     const volumeAverage = (totalVolume / intervals.length);
//     const totalVolumeUsd = intervals.reduce((result, item) => {
//       const runePriceUsd = runeUSDPrices[item.startTime] || 0;
//       return (result + (e8ValueParser(item.totalVolume) * runePriceUsd));
//     }, 0);
//     const intervalSwaps = {};
//     intervals.forEach(interval => {
//       const runePriceUsd = runeUSDPrices[interval.startTime] || 0;
//       intervalSwaps[interval.startTime] = {
//         totalVolumeUsd: e8ValueParser(interval.totalVolume) * runePriceUsd,
//         startTime: interval.startTime
//       };
//     })
//     const volumeAverageUsd = totalVolumeUsd / intervals.length;
//     if (technicalAnalysisCache[poolId] === undefined) {
//       technicalAnalysisCache[poolId] = {};
//     }
//     if (technicalAnalysisCache[poolId][periodKey] === undefined) {
//       technicalAnalysisCache[poolId][periodKey] = {};
//     }
//     technicalAnalysisCache[poolId][periodKey].intervalSwaps = intervalSwaps;
//     technicalAnalysisCache[poolId][periodKey].totalVolume = totalVolume;
//     technicalAnalysisCache[poolId][periodKey].volumeAverage = volumeAverage;
//     technicalAnalysisCache[poolId][periodKey].totalVolumeUsd = totalVolumeUsd;
//     technicalAnalysisCache[poolId][periodKey].volumeAverageUsd = volumeAverageUsd;
//   });
// });

// switch (timespan) {
//   case '3days':
//       hours = 3 * 24;
//   case '7days':
//       hours = 7 * 24;
//   case '14days':
//       hours = 14 * 24;
// }

export const calculateFeeAPY = (assetData) => {
  const startTime = parseInt(assetData[0].startTime, 10);
  const endTime = parseInt(assetData[assetData.length-1].endTime, 10);
  const hours = differenceInHours(endTime * 1000, startTime * 1000);

  const startAssetDepth = e8ValueParser(assetData[0].assetDepth);
  const startRuneDepth = e8ValueParser(assetData[0].runeDepth);
  const startLiqUnits = parseFloat(assetData[0].liquidityUnits);
  const endAssetDepth = e8ValueParser(assetData[assetData.length - 1].assetDepth);
  const endRuneDepth = e8ValueParser(assetData[assetData.length - 1].runeDepth);
  const endLiqUnits = parseFloat(assetData[assetData.length - 1].liquidityUnits);
  let kValue = {
      start: startLiqUnits ? (startAssetDepth * startRuneDepth / (startLiqUnits ** 2)) : 0,
      end: endLiqUnits ? endAssetDepth * endRuneDepth / (endLiqUnits ** 2) : 0,
  };
  let roi = Math.sqrt(kValue.end) / Math.sqrt(kValue.start) - 1;
  const apy = (1 + roi) ** (365 * 24 / hours) - 1;
  return apy;
};

export const calculateFeeAPY2 = (allPoolsHistoryEarnings, periodKey, allPolsHistoryDepths) => {
  let periodRuneEarnings = 0.0;
  let periodUsdEarnings = 0.0;
  let periodicRate = 0.0;
  let periodAPY = 0.0;
  if (allPoolsHistoryEarnings[periodKey] && allPoolsHistoryEarnings[periodKey].meta?.pools) {
    const intervalEarnings = allPoolsHistoryEarnings[periodKey].intervals.find(earningsInterval => (
      earningsInterval.startTime === interval.startTime
    ));
    if (intervalEarnings) {
      const poolPeriodEarnings = intervalEarnings.pools.find(pe => (pe.pool === poolId));
      if (poolPeriodEarnings) {
        periodRuneEarnings = e8ValueParser(poolPeriodEarnings.earnings);
        const intervalRuneDepth = e8ValueParser(interval.runeDepth);
        // periodUsdEarnings = periodRuneEarnings * runePriceUsd;
        // periodUsdEarnings = periodRuneEarnings;
        // https://www.investopedia.com/personal-finance/apr-apy-bank-hopes-cant-tell-difference/
        // Periodic Rate = (earnings - IL) / total Depth
        periodicRate = intervalRuneDepth
          // TODO: how to remove impermanent loss??!!
          ? (((periodRuneEarnings + (periodRuneEarnings * impermanentLoss))/(intervalRuneDepth*2)))
          // ? ((periodRuneEarnings/(intervalRuneDepth*2)))
          : 0;
        // APY = ((1 + Periodic Rate)^Number of periods) – 1
        let numberOfPeriods = 365;
        if (periodKey === 'period24H') {
          numberOfPeriods = 365 * 24;
        } else if (periodKey === 'allTimePeriod') {
          numberOfPeriods = 365 / differenceInDays(new Date(parseInt(interval.startTime,10)*1000), new Date(parseInt(interval.endTime,10)*1000))
        }
        // "APY= (1 + r )n – 1
        //   r = return over the specified period
        //   n = 365/days over which r is measured
        // https://learn.robinhood.com/articles/5CLrCuXmQXIKWMye3uZcEM/what-is-annual-percentage-yield-apy/
        periodAPY = (((1+(periodicRate/numberOfPeriods))**numberOfPeriods)-1) * 100;
      }
    }
  }
}

export const getPoolDailyEarningsAfter = (allPoolsHistoryEarnings, startTime, poolId) => {
  // this.$store.state.pools.allPoolsHistoryEarnings.period1Y.intervals[0].startTime
  return allPoolsHistoryEarnings.period1Y.intervals
    .filter(i => parseInt(i.startTime, 10) >= startTime)
    .map(i => ({
      startTime: i.startTime,
      ...(i.pools.find(p => p.pool === poolId) || {})
    }));
}

export const getFeesWithImpermLoss = (depthHistoryItems) => {
  // const monthAgoTimestamp = datefns.sub(new Date(), { months: 1 }).getTime();
  // const periodKey = (monthAgoTimestamp < new Date(fromUnixTime * 1000).getTime()) ? 'period1HM' : 'period1Y';
  // const fromUnixTime = datefns.getUnixTime(dateInvested);
  // if (dateInvested.getTime() > new Date().getTime()) {
  //     return []
  // }
  // const depthHistoryItems = poolsState.poolHistoryDepths[pool][periodKey].intervals.filter(i => (
  //     parseInt(i.startTime, 10) >= fromUnixTime
  // ));
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
  // const initialRuneDepth = depthHistory[0].runeDepth;
  // const initialAssetDepth = depthHistory[0].assetDepth;
  // const initialRunePriceUsd = depthHistory[0].runePriceUSD;
  // const initialAssetPriceUsd = depthHistory[0].assetPriceUSD;
  // const initialLiquidityUnits = depthHistory[0].liquidityUnits;
  // const sharePrice = initialLiquidityUnits
  //     ? (
  //         (initialRuneDepth * initialRunePriceUsd) + 
  //         (initialAssetDepth * initialAssetPriceUsd)
  //     ) / initialLiquidityUnits
  //     : 0;
  // const userShare = sharePrice ? (amountInvested / sharePrice) : 0;
  const userData = [];
  for (let i = 0; i < depthHistory.length; i++) {
      // User balance
      // const runeBalance = depthHistory[i].liquidityUnits
      //     ? (userShare * depthHistory[i].runeDepth / depthHistory[i].liquidityUnits)
      //     : 0;
      // const assetBalance = depthHistory[i].liquidityUnits
      //     ? (userShare * depthHistory[i].assetDepth / depthHistory[i].liquidityUnits)
      //     : 0;
      const runeBalance = depthHistory[i].liquidityUnits
          ? (depthHistory[i].runeDepth / depthHistory[i].liquidityUnits)
          : 0;
      const assetBalance = depthHistory[i].liquidityUnits
          ? (depthHistory[i].assetDepth / depthHistory[i].liquidityUnits)
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



// History depth and swaps contain this keys: 
export function technicalAnalysis(
  historyDepth, historySwaps, allPoolsHistoryEarnings, periodKey
) {
  const technicalAnalysisCache = {};
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  const periodDataPoints = periodKeyToIntervalsDatapointsMap[periodKey] || 365;
  let startTime = getUnixTime(subDays(new Date(), periodDataPoints));
  if (periodResolutionKey === 'period1HM') {
    startTime = getUnixTime(subHours(new Date(), periodDataPoints));
  }
  // TA from historySwaps payload
  Object.keys(historySwaps).forEach(poolId => {
    // Object.keys(historySwaps[poolId]).forEach(periodKey => {
      const runeUSDPrices = {};
      historyDepth[poolId][periodResolutionKey].intervals.forEach(i => {
        if (parseInt(i.startTime,10) < startTime) {
          return;
        }
        const assetPriceUSD = parseFloat(i.assetPriceUSD);
        const assetPrice = parseFloat(i.assetPrice);
        runeUSDPrices[i.startTime] = isNaN(assetPriceUSD) || isNaN(assetPrice) || !assetPrice
          ? 0
          : assetPriceUSD/assetPrice;
      });
      // { intervals: any[], meta: { endTime: string; startTime: string; }}
      const { intervals } = historySwaps[poolId][periodResolutionKey];
      const filteredIntervals = intervals.filter(i => parseInt(i.startTime, 10) > startTime)
      const totalVolume = filteredIntervals.reduce((result, item) => (
        result + e8ValueParser(item.totalVolume)
      ), 0);
      const volumeAverage = (totalVolume / filteredIntervals.length);
      const totalVolumeUsd = filteredIntervals.reduce((result, item) => {
        const runePriceUsd = runeUSDPrices[item.startTime] || 0;
        return (result + (e8ValueParser(item.totalVolume)*runePriceUsd));
      }, 0);
      const intervalSwaps = {};
      filteredIntervals.forEach(interval => {
        const runePriceUsd = runeUSDPrices[interval.startTime] || 0;
        intervalSwaps[interval.startTime] = {
          totalVolumeUsd: e8ValueParser(interval.totalVolume) * runePriceUsd,
          startTime: interval.startTime
        };
      })
      const volumeAverageUsd = totalVolumeUsd/filteredIntervals.length;
      if (technicalAnalysisCache[poolId] === undefined) {
        technicalAnalysisCache[poolId] = {};
      }
      if (technicalAnalysisCache[poolId][periodKey] === undefined) {
        technicalAnalysisCache[poolId][periodKey] = {};
      }
      technicalAnalysisCache[poolId][periodKey].intervalSwaps = intervalSwaps;
      technicalAnalysisCache[poolId][periodKey].totalVolume = totalVolume;
      technicalAnalysisCache[poolId][periodKey].volumeAverage = volumeAverage;  
      technicalAnalysisCache[poolId][periodKey].totalVolumeUsd = totalVolumeUsd;
      technicalAnalysisCache[poolId][periodKey].volumeAverageUsd = volumeAverageUsd;
    // });
  });

  // TA from historyDepth payload
  Object.keys(historyDepth).forEach(poolId => {
    // Object.keys(historyDepth[poolId]).forEach(periodKey => {
      // { intervals: any[], meta: { endTime: string; startTime: string; }}
      const { intervals } = historyDepth[poolId][periodResolutionKey];
      const filteredIntervals = intervals.filter(i => (parseInt(i.startTime, 10) > startTime && parseInt(i.liquidityUnits,10) !== 0))
      const totalDepth = filteredIntervals.reduce((result, item) => (
        result + (e8ValueParser(item.runeDepth) * 2)
      ), 0);
      const depthAverage = (totalDepth / filteredIntervals.length);
      const totalDepthUsd = filteredIntervals.reduce((result, item) => {
        const assetPriceUSD = parseFloat(item.assetPriceUSD);
        const assetPrice = parseFloat(item.assetPrice);
        const runePriceUsd = isNaN(assetPriceUSD) || isNaN(assetPrice) ? 0 : assetPriceUSD/assetPrice;
        return (result + (e8ValueParser(item.runeDepth)*2*runePriceUsd));
      }, 0);
      const depthAverageUsd = totalDepthUsd/filteredIntervals.length;
      if (technicalAnalysisCache[poolId] === undefined) {
        technicalAnalysisCache[poolId] = {};
      }
      if (technicalAnalysisCache[poolId][periodKey] === undefined) {
        technicalAnalysisCache[poolId][periodKey] = {};
      }
      technicalAnalysisCache[poolId][periodKey].totalDepth = totalDepth;
      technicalAnalysisCache[poolId][periodKey].depthAverage = depthAverage;
      technicalAnalysisCache[poolId][periodKey].totalDepthUsd = totalDepthUsd;
      technicalAnalysisCache[poolId][periodKey].depthAverageUsd = depthAverageUsd;
      // need intervals sorted since the first interval is used as reference for the price swing
      const sortedIntervals = filteredIntervals.sort((a,b) => parseInt(a.startTime, 10) - parseInt(b.startTime, 10));
      const intervalsCalculations = {};
      let firstIntervalTimestamp = 0;
      sortedIntervals.forEach((interval, idx) => {
        // NOTE: each interval is like:
        // {
        //   assetDepth: "0"
        //   assetPrice: "0"
        //   assetPriceUSD: "99.1302878324524",
        //   endTime: "1609977600"
        //   runeDepth: "0"
        //   startTime: "1609891200"
        // }
        const assetPriceUsd = parseFloat(interval.assetPriceUSD);
        const assetPrice = parseFloat(interval.assetPrice);
        const runePriceUsd = isNaN(assetPriceUsd) || isNaN(assetPrice) ? 0 : assetPriceUsd/assetPrice;
        const runeAssetRatio = interval.assetPriceUsd
          ? (interval.runePriceUsd) / (interval.assetPriceUsd)
          : 0

        let priceSwing = 0.0;
        let impermanentLoss = 0.0;
        if (idx === 0) {
          firstIntervalTimestamp = interval.startTime;
        } else {
          // use runeAssetRatio from first interval value for price swing
          const firstIntervalRuneAssetRatio = intervalsCalculations[firstIntervalTimestamp].runeAssetRatio
          priceSwing = firstIntervalRuneAssetRatio
            ? ((runeAssetRatio / firstIntervalRuneAssetRatio)-1)
            : 0;
          impermanentLoss = (
            (2 * Math.sqrt(1+priceSwing) / (2+priceSwing)) - 1
          );
        }
        let periodRuneEarnings = 0.0;
        let periodUsdEarnings = 0.0;
        let periodicRate = 0.0;
        let periodAPY = 0.0;
        if (allPoolsHistoryEarnings[periodResolutionKey] && allPoolsHistoryEarnings[periodResolutionKey].meta?.pools) {
          const intervalEarnings = allPoolsHistoryEarnings[periodResolutionKey].intervals.find(earningsInterval => (
            earningsInterval.startTime === interval.startTime
          ));
          if (intervalEarnings) {
            const poolPeriodEarnings = intervalEarnings.pools.find(pe => (pe.pool === poolId));
            if (poolPeriodEarnings) {
              periodRuneEarnings = e8ValueParser(poolPeriodEarnings.earnings);
              const intervalRuneDepth = e8ValueParser(interval.runeDepth);
              // periodUsdEarnings = periodRuneEarnings * runePriceUsd;
              // periodUsdEarnings = periodRuneEarnings;
              // https://www.investopedia.com/personal-finance/apr-apy-bank-hopes-cant-tell-difference/
              // Periodic Rate = (earnings - IL) / total Depth
              
              periodicRate = intervalRuneDepth
                // TODO: how to remove impermanent loss??!!
                // ? (((periodRuneEarnings)/(intervalRuneDepth*2)))
                // ? (((periodRuneEarnings + (periodRuneEarnings * impermanentLoss))/(intervalRuneDepth*2)))
                ? ((periodRuneEarnings/(intervalRuneDepth*2)))
                : 0;
              // APY = ((1 + Periodic Rate)^Number of periods) – 1
              let numberOfPeriods = 365; // / differenceInDays(new Date(parseInt(interval.startTime,10)*1000), new Date(parseInt(interval.endTime,10)*1000))
              if (periodResolutionKey === 'period1HM') {
                numberOfPeriods = 365 * 24;
              }
              // "APY= (1 + r )n – 1
              //   r = return over the specified period
              //   n = 365/days over which r is measured
              // https://learn.robinhood.com/articles/5CLrCuXmQXIKWMye3uZcEM/what-is-annual-percentage-yield-apy/
              periodAPY = (((1+(periodicRate/numberOfPeriods))**numberOfPeriods)-1) * 100;
            }
          }
        }
        intervalsCalculations[interval.startTime] = {
          assetPrice,
          assetPriceUsd,
          runePriceUsd,
          runeAssetRatio,
          startTime: interval.startTime,
          priceSwing,
          impermanentLoss: impermanentLoss * 100,
          periodRuneEarnings,
          // periodUsdEarnings,
          periodicRate,
          periodAPY,
        };
      });
      let averageRunePriceUsd = 0;
      let averageAssetPriceUsd = 0;
      let averageAssetPrice = 0;
      let averagePeriodAPY = 0;
      const intervalsCalculationsStartTimes = Object.keys(intervalsCalculations)
        .map(it => parseInt(it, 10))
        .sort();
      intervalsCalculationsStartTimes.forEach(startTimeKey => {
        averageRunePriceUsd += intervalsCalculations[startTimeKey].runePriceUsd;
        averageAssetPriceUsd += intervalsCalculations[startTimeKey].assetPriceUsd;
        averageAssetPrice += intervalsCalculations[startTimeKey].assetPrice;
        averagePeriodAPY += intervalsCalculations[startTimeKey].periodAPY;
      });
      averageRunePriceUsd = averageRunePriceUsd / intervalsCalculationsStartTimes.length;
      averageAssetPriceUsd = averageAssetPriceUsd / intervalsCalculationsStartTimes.length;
      averageAssetPrice = averageAssetPrice / intervalsCalculationsStartTimes.length;
      averagePeriodAPY = averagePeriodAPY / intervalsCalculationsStartTimes.length;
      technicalAnalysisCache[poolId][periodKey].averageRunePriceUsd = averageRunePriceUsd;
      technicalAnalysisCache[poolId][periodKey].averageAssetPriceUsd = averageAssetPriceUsd;
      technicalAnalysisCache[poolId][periodKey].averageAssetPrice = averageAssetPrice;
      technicalAnalysisCache[poolId][periodKey].averagePeriodAPY = averagePeriodAPY;
      let poolPeriodTotalEarningsRune = 0.0;
      let poolPeriodAverageEarningsRune = 0.0;
      if (allPoolsHistoryEarnings[periodKey] && allPoolsHistoryEarnings[periodKey].meta?.pools) {
        const poolEarnings = allPoolsHistoryEarnings[periodKey].meta.pools.find(p => p.pool === poolId);
        if (poolEarnings) {
          poolPeriodTotalEarningsRune = e8ValueParser(poolEarnings.earnings);
          poolPeriodAverageEarningsRune = poolPeriodTotalEarningsRune / filteredIntervals.length;
        }
      }
      technicalAnalysisCache[poolId][periodKey].totalEarningsRune = poolPeriodTotalEarningsRune;
      technicalAnalysisCache[poolId][periodKey].averageEarningsRune = poolPeriodAverageEarningsRune;
      
      // calculate total prices, deviation, correlation
      let sumSqrtAssetDeviation = 0.0;
      let sumSqrtRuneDeviation = 0.0;
      let sumSqrtAssetRuneDeviationMultiplied = 0.0;
      intervalsCalculationsStartTimes.forEach(startTimeKey => {
        intervalsCalculations[startTimeKey].assetPriceDeviation = (
          intervalsCalculations[startTimeKey].assetPriceUsd - averageAssetPriceUsd
        );
        intervalsCalculations[startTimeKey].runePriceDeviation = (
          intervalsCalculations[startTimeKey].runePriceUsd - averageRunePriceUsd
        );
        //  First, find the square of each daily deviation for each asset.
        const sqrtAssetDeviation = (Math.sqrt(Math.abs(intervalsCalculations[startTimeKey].assetPriceDeviation)));
        const sqrtRuneDeviation = (Math.sqrt(Math.abs(intervalsCalculations[startTimeKey].runePriceDeviation)));
        sumSqrtAssetDeviation += sqrtAssetDeviation;
        sumSqrtRuneDeviation += sqrtRuneDeviation;
        // Then take this square daily deviation associated with the first asset for day one and multiply 
        // it by the square daily deviation for the second asset on day one
        sumSqrtAssetRuneDeviationMultiplied += (sqrtAssetDeviation * sqrtRuneDeviation)
      });
      // Take all of the squared daily deviations for asset one and add them together, before taking the square root of the sum
      const assetStandardDeviation = (Math.sqrt(sumSqrtAssetDeviation));
      const runeStandardDeviation = (Math.sqrt(sumSqrtRuneDeviation));
      // Then multiply the standard deviations for the two assets by one another, and put this number aside for the moment.
      const standardDeviationsMultiplied = assetStandardDeviation * runeStandardDeviation;
      const correllation = (Math.sqrt(sumSqrtAssetRuneDeviationMultiplied)) / standardDeviationsMultiplied;
      technicalAnalysisCache[poolId][periodKey].intervals = intervalsCalculations;
      technicalAnalysisCache[poolId][periodKey].assetStandardDeviation = assetStandardDeviation;
      technicalAnalysisCache[poolId][periodKey].runeStandardDeviation = runeStandardDeviation;
      technicalAnalysisCache[poolId][periodKey].correllation = correllation;
    // });
  });
  return technicalAnalysisCache;
}