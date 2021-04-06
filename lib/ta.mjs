import subDays from 'date-fns/subDays';
import subHours from 'date-fns/subHours';
import getUnixTime from 'date-fns/getUnixTime';
import fromUnixTime from 'date-fns/fromUnixTime';
import { poolNameWithoutAddr } from './utils';


const secondsInOneYear = 365*24*60*60;

// type PeriodKey = 'period24H' | 'period1W' | 'period1M' | 'period3M' | 'period6M' | 'period1Y' | 'period1HM' | 'allTimePeriod'
export const periodKeyToSecondsMap = {
  period24H: 24*60*60, // in hours
  period1W: 24*60*60*7, // in hours
  period1M: 24*60*60*30,
  period3M: 24*60*60*90,
  period6M: 24*60*60*180,
  period1Y: secondsInOneYear,
  period1HM: 24*60*60*30, // 30*24
};

export const periodKeyToDaysMap = {
  period24H: 1,
  period1W: 7,
  period1M: 30,
  period3M: 90,
  period6M: 180,
  period1Y: 365,
  period1HM: 30,
};

// For 24h (use 4h ma)
// for 1W (use 1d ma)
// for 1M (use 3d ma)
// for 3m (use 15d ma)
// for 1y (use 1m ma)
export const periodKeyToDataPointsMovingAvg = {
  // hourly periods
  period24H: 4, // 4h
  period1W: 24, // 24h
  // daily periods
  period1M: 3, // 3day ma
  period3M: 15, // 15day ma
  period6M: 15, // 15day ma
  period1Y: 30, // 30day ma
};

export const e8ValueParser = str => (str
    ? (isNaN(parseInt(str,10)) ? 0 : (parseInt(str,10) / 10 ** 8))
    : 0);

export function getPoolsPeriodDepthAndVolumeUsd(poolHistoryDepths, poolHistorySwaps, periodKey, colors) {
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  const secondsElapsedSincePeriod = (periodKeyToSecondsMap[periodKey]);
  const startAtUnixTime = getUnixTime(new Date()) - secondsElapsedSincePeriod;
  // Use 1 hourly 1 month resolution or daily 1 year resolution to get data points
  return Object.keys(poolHistoryDepths).map((poolId, index) => {
    // slice the daily 1year intervals or hourly 1 month intervals to fit period
    // const depthIntervals = poolHistoryDepths[poolId][periodResolutionKey].intervals.slice(-periodDataPoints);
    const depthIntervals = poolHistoryDepths[poolId][periodResolutionKey].intervals
      .filter(v => parseInt(v.startTime, 10) >= startAtUnixTime);
    const swapIntervals = poolHistorySwaps[poolId][periodResolutionKey].intervals
      .filter(v => parseInt(v.startTime, 10) >= startAtUnixTime);
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
}

export function getInvervalsFromPeriodKey(depthsOrSwapsMap, periodKey) {
  const secondsElapsedSincePeriod = periodKeyToSecondsMap[periodKey];
  const startAtUnixTime = getUnixTime(new Date()) - secondsElapsedSincePeriod;
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  return Object.keys(depthsOrSwapsMap).map((poolId, _index) => {
    const intervals = depthsOrSwapsMap[poolId][periodResolutionKey].intervals.filter(iv => (
      parseInt(iv.startTime, 10) >= startAtUnixTime
    ));
    return { poolId, intervals }
  });
}

export function getTopPerformers(
  poolHistoryDepths,
  poolHistorySwaps,
  allPoolsHistoryEarnings,
  periodKey,
  poolsStore,
  periodStatsKey,
) {
  const poolsDepths = getInvervalsFromPeriodKey(poolHistoryDepths, periodKey);
  const ta = technicalAnalysis(
    poolHistoryDepths, poolHistorySwaps, allPoolsHistoryEarnings, periodKey
  );
  return poolsDepths.map(pd => ({
    poolId: pd.poolId,
    apy: poolsStore.find(p => p.poolId === pd.poolId).poolStats[periodStatsKey].poolAPY,
    ta: ta[pd.poolId][periodKey],
  }));
}

// History depth and swaps contain this keys: 
export function technicalAnalysis(
  historyDepth, historySwaps, allPoolsHistoryEarnings, periodKey
) {
  const technicalAnalysisCache = {};
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  const secondsElapsedSincePeriod = periodKeyToSecondsMap[periodKey];
  const startTime = getUnixTime(new Date()) - secondsElapsedSincePeriod;
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
      const filteredIntervals = intervals.filter(i => parseInt(i.startTime, 10) >= startTime)
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
      if (technicalAnalysisCache[poolId] === undefined) {
        technicalAnalysisCache[poolId] = {};
      }
      if (technicalAnalysisCache[poolId][periodKey] === undefined) {
        technicalAnalysisCache[poolId][periodKey] = {};
      }
      const { intervals } = historyDepth[poolId][periodResolutionKey];
      const filteredIntervals = intervals.filter(i => (
        parseInt(i.startTime, 10) >= startTime && parseInt(i.liquidityUnits,10) !== 0
      ));
      // need intervals sorted since the first interval is used as reference for the price swing
      const sortedIntervals = filteredIntervals.sort((a,b) => (
        parseInt(a.startTime, 10) - parseInt(b.startTime, 10)
      ));
      const lastIntervalItem = sortedIntervals[sortedIntervals.length - 1];
      const totalDepth = e8ValueParser(lastIntervalItem.assetDepth) * 2;
      const totalDepthUsd = parseFloat(lastIntervalItem.assetPriceUSD) * totalDepth;
      // technicalAnalysisCache[poolId][periodKey].totalDepth = totalDepth;
      technicalAnalysisCache[poolId][periodKey].totalDepthUsd = totalDepthUsd;
      technicalAnalysisCache[poolId][periodKey].lastIntervalStartTime = lastIntervalItem.startTime;




      const previousIntervals = intervals.filter(i => (parseInt(i.startTime, 10) < startTime));
      const includePreviousNDatapoints = periodKeyToDataPointsMovingAvg[periodKey] - 1;
      const previousIntervalsFromNewestToOldest = previousIntervals.sort((a,b) => (
        parseInt(b.startTime, 10) - parseInt(a.startTime, 10)
      )).slice(-includePreviousNDatapoints);
      const previousIntervalsAPYs = previousIntervalsFromNewestToOldest.map((prevInterval) => {
        let periodRuneEarnings = 0.0;
        let periodicRate = 0.0;
        let periodAPY = 0.0;
        if (allPoolsHistoryEarnings[periodResolutionKey] && allPoolsHistoryEarnings[periodResolutionKey].meta?.pools) {
          const intervalEarnings = allPoolsHistoryEarnings[periodResolutionKey].intervals.find(earningsInterval => (
            earningsInterval.startTime === prevInterval.startTime
          ));
          if (intervalEarnings) {
            const poolPeriodEarnings = intervalEarnings.pools.find(pe => (pe.pool === poolId));
            if (poolPeriodEarnings) {
              periodRuneEarnings = e8ValueParser(poolPeriodEarnings.earnings);
              const intervalRuneDepth = e8ValueParser(sortedIntervals[sortedIntervals.length - 1].runeDepth);
              periodicRate = intervalRuneDepth
                ? ((periodRuneEarnings/(2*intervalRuneDepth)))
                : 0;
              const numberOfPeriods = (
                secondsInOneYear / (parseInt(prevInterval.endTime, 10) - parseInt(prevInterval.startTime, 10))
              );
              periodAPY = periodResolutionKey === 'period1HM'
                ? periodicRate * numberOfPeriods
                : (((1+periodicRate)**(numberOfPeriods))-1);
            }
          }
        }
        return periodAPY;
      });
      const intervalsCalculations = {};
      let firstIntervalTimestamp = 0;
      let lastCorrellation = 0;
      sortedIntervals.forEach((interval, idx) => {
        let previousN_APYs = [];
        if (idx < includePreviousNDatapoints) {
          // fill in previous APY's if required
          previousN_APYs = [
            ...previousIntervalsAPYs.slice(idx - includePreviousNDatapoints),
            ...sortedIntervals.slice(0,idx).map(oldInterval => (
              intervalsCalculations[oldInterval.startTime]?.periodAPY || 0
            )),
          ];
        } else {
          previousN_APYs = [
            ...sortedIntervals.slice(idx-includePreviousNDatapoints, idx).map(oldInterval => (
              intervalsCalculations[oldInterval.startTime]?.periodAPY || 0
            )),
          ];
        }

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
        const runeAssetRatio = assetPriceUsd
          ? (runePriceUsd) / (assetPriceUsd)
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
        let periodicRate = 0.0;
        let periodAPY = 0.0;
        let periodAPY_MA = 0.0;
        if (allPoolsHistoryEarnings[periodResolutionKey] && allPoolsHistoryEarnings[periodResolutionKey].meta?.pools) {
          const intervalEarnings = allPoolsHistoryEarnings[periodResolutionKey].intervals.find(earningsInterval => (
            earningsInterval.startTime === interval.startTime
          ));
          if (intervalEarnings) {
            const poolPeriodEarnings = intervalEarnings.pools.find(pe => (pe.pool === poolId));
            if (poolPeriodEarnings) {
              periodRuneEarnings = e8ValueParser(poolPeriodEarnings.earnings);
              // const intervalRuneDepth = e8ValueParser(interval.runeDepth);
              const intervalRuneDepth = e8ValueParser(sortedIntervals[sortedIntervals.length - 1].runeDepth);
              // periodUsdEarnings = periodRuneEarnings * runePriceUsd;
              // periodUsdEarnings = periodRuneEarnings;
              // https://www.investopedia.com/personal-finance/apr-apy-bank-hopes-cant-tell-difference/
              // Periodic Rate = (earnings - IL) / total Depth
              
              // https://gitlab.com/thorchain/midgard/-/blob/develop/internal/timeseries/lookup.go#L552-575
              // poolRate := float64(income[pool]) / (2 * float64(runeDepth))
              periodicRate = intervalRuneDepth
                // TODO: how to remove impermanent loss??!!
                // ? (((periodRuneEarnings)/(intervalRuneDepth*2)))
                // ? (((periodRuneEarnings + (periodRuneEarnings * impermanentLoss))/(intervalRuneDepth*2)))
                ? ((periodRuneEarnings/(2*intervalRuneDepth)))
                : 0;

              // midgard formula for APY:
              // https://gitlab.com/thorchain/midgard/-/blob/develop/internal/timeseries/lookup.go#L552-575
              // periodsPerYear := float64(365*24*60*60) / float64(window.Until-window.From)
              const numberOfPeriods = (
                secondsInOneYear / (parseInt(interval.endTime, 10) - parseInt(interval.startTime, 10))
              );
              // debugger;
              // const days = differenceInDays(new Date(parseInt(interval.endTime,10)*1000), new Date(parseInt(interval.startTime,10)*1000))
              // const numberOfPeriods = periodResolutionKey === 'period1HM'
              //   ? ((365*24))
              //   : ((365))
              // APY = ((1 + Periodic Rate)^Number of periods) – 1
              // let numberOfPeriods = 365; // / differenceInDays(new Date(parseInt(interval.startTime,10)*1000), new Date(parseInt(interval.endTime,10)*1000))
              // if (periodResolutionKey === 'period1HM') {
              //   numberOfPeriods = 365 * 24;
              // }

              
              // "APY= (1 + r )n – 1
              //   r = return over the specified period
              //   n = 365/days over which r is measured
              // https://learn.robinhood.com/articles/5CLrCuXmQXIKWMye3uZcEM/what-is-annual-percentage-yield-apy/
              periodAPY = periodResolutionKey === 'period1HM'
                ? periodicRate * numberOfPeriods // (((1+periodicRate)**(365*24))-1)
                : (((1+periodicRate)**(numberOfPeriods))-1);
              // periodAPY = (((1+periodicRate)**numberOfPeriods)-1)
            }
          }
        }
        periodAPY_MA = (
          (previousN_APYs.reduce((acc, next) => acc + next, 0) + periodAPY) /
          (previousN_APYs.length + 1)
        );
        const correllation = getCorrellationsForUnixtime(
          poolId, historyDepth, periodKey, interval.startTime
        );
        lastCorrellation = correllation;
        intervalsCalculations[interval.startTime] = {
          assetPrice,
          assetPriceUsd,
          runePriceUsd,
          runeAssetRatio,
          startTime: interval.startTime,
          priceSwing,
          impermanentLoss,
          periodRuneEarnings,
          periodicRate,
          periodAPY,
          periodAPY_MA: periodAPY_MA,
          correllation,
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
      
      const periods = periodResolutionKey === 'period1HM' ? (secondsElapsedSincePeriod/(60*60)) : (secondsElapsedSincePeriod/(60*60*24));
      // averagePeriodAPY = averagePeriodAPY / intervalsCalculationsStartTimes.length; // use periods within time
      averagePeriodAPY = averagePeriodAPY / periods;
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
      technicalAnalysisCache[poolId][periodKey].lastCorrellation = lastCorrellation;
      technicalAnalysisCache[poolId][periodKey].totalEarningsRune = poolPeriodTotalEarningsRune;
      technicalAnalysisCache[poolId][periodKey].averageEarningsRune = poolPeriodAverageEarningsRune;
      
      // calculate total prices, deviation, correllation
      // let sumSqrtAssetDeviation = 0.0;
      // let sumSqrtRuneDeviation = 0.0;
      // let sumSqrtAssetRuneDeviationMultiplied = 0.0;
      // intervalsCalculationsStartTimes.forEach(startTimeKey => {
      //   intervalsCalculations[startTimeKey].assetPriceDeviation = (
      //     averageAssetPriceUsd - intervalsCalculations[startTimeKey].assetPriceUsd
      //   );
      //   intervalsCalculations[startTimeKey].runePriceDeviation = (
      //     averageRunePriceUsd - intervalsCalculations[startTimeKey].runePriceUsd
      //   );
      //   //  First, find the square of each daily deviation for each asset.
      //   const sqrtAssetDeviation = (Math.sqrt(Math.abs(intervalsCalculations[startTimeKey].assetPriceDeviation)));
      //   const sqrtRuneDeviation = (Math.sqrt(Math.abs(intervalsCalculations[startTimeKey].runePriceDeviation)));
      //   sumSqrtAssetDeviation += sqrtAssetDeviation;
      //   sumSqrtRuneDeviation += sqrtRuneDeviation;
      //   // Then take this square daily deviation associated with the first asset for day one and multiply 
      //   // it by the square daily deviation for the second asset on day one
      //   sumSqrtAssetRuneDeviationMultiplied += (sqrtAssetDeviation * sqrtRuneDeviation)
      // });
      // Take all of the squared daily deviations for asset one and add them together, before taking the square root of the sum
      // const assetStandardDeviation = (Math.sqrt(sumSqrtAssetDeviation));
      // const runeStandardDeviation = (Math.sqrt(sumSqrtRuneDeviation));
      // Then multiply the standard deviations for the two assets by one another, and put this number aside for the moment.
      // const standardDeviationsMultiplied = assetStandardDeviation * runeStandardDeviation;
      // const correllation = (Math.sqrt(sumSqrtAssetRuneDeviationMultiplied)) / standardDeviationsMultiplied;
      technicalAnalysisCache[poolId][periodKey].intervals = intervalsCalculations;
      // technicalAnalysisCache[poolId][periodKey].assetStandardDeviation = assetStandardDeviation;
      // technicalAnalysisCache[poolId][periodKey].runeStandardDeviation = runeStandardDeviation;
      // technicalAnalysisCache[poolId][periodKey].correllation = correllation;
    // });
  });
  return technicalAnalysisCache;
}


function getCorrellationsForUnixtime(
  poolId, historyDepth, periodKey, unixtime,
) {
  const atUnixtime = parseInt(unixtime, 10);
  const periodResolutionKey = ['period24H', 'period1W'].find(k => k === periodKey) ? 'period1HM' : 'period1Y';
  const periodKeyToStartTimestamp = {
    period24H: getUnixTime(subHours(fromUnixTime(atUnixtime), 24)),
    period1W: getUnixTime(subHours(fromUnixTime(atUnixtime), 24 * 7)),
    period1M: getUnixTime(subDays(fromUnixTime(atUnixtime), 30)),
    period3M: getUnixTime(subDays(fromUnixTime(atUnixtime), 90)),
    period6M: getUnixTime(subDays(fromUnixTime(atUnixtime), 180)),
    period1Y: getUnixTime(subDays(fromUnixTime(atUnixtime), 365)),
  };
  const startOfPeriod = periodKeyToStartTimestamp[periodKey];
  const { intervals } = historyDepth[poolId][periodResolutionKey];
  const intervalsBeforeToUnixtime = intervals.filter(i => (
    parseInt(i.startTime, 10) >= startOfPeriod && parseInt(i.startTime, 10) <= atUnixtime
  )).sort((a,b) => (
    parseInt(a.startTime, 10) - parseInt(b.startTime, 10)
  ));
  let averageAssetPriceUsd = 0;
  let averageRunePriceUsd = 0;
  intervalsBeforeToUnixtime.forEach(iv => {
    averageAssetPriceUsd += parseFloat(iv.assetPriceUSD);
    averageRunePriceUsd += (iv.assetPriceUSD && iv.assetPrice) ? (parseFloat(iv.assetPriceUSD)/parseFloat(iv.assetPrice)) : 0;
  });
  averageAssetPriceUsd = averageAssetPriceUsd / intervalsBeforeToUnixtime.length;
  averageRunePriceUsd = averageRunePriceUsd / intervalsBeforeToUnixtime.length;
  let assetStandardDeviation = 0;
  let runeStandardDeviation = 0;
  let productsStandardDeviation = 0;
  const deviations = intervalsBeforeToUnixtime.map(iv => {
    const assetPriceDeviation = (averageAssetPriceUsd - parseFloat(iv.assetPriceUSD || '0'));
    const runePriceUSD = ((iv.assetPriceUSD && iv.assetPrice)
      ? (parseFloat(iv.assetPriceUSD)/parseFloat(iv.assetPrice))
      : 0
    );
    const runePriceDeviation = (averageRunePriceUsd - runePriceUSD);
    const assetPriceDeviationSqrt = (Math.sqrt(Math.abs(assetPriceDeviation)));
    const runePriceDeviationSqrt = (Math.sqrt(Math.abs(runePriceDeviation)));
    const sqrtDeviationsMultipied = assetPriceDeviationSqrt * runePriceDeviationSqrt;
    assetStandardDeviation += assetPriceDeviationSqrt;
    runeStandardDeviation += runePriceDeviationSqrt;
    productsStandardDeviation += sqrtDeviationsMultipied;
    return {
      assetPriceDeviation,
      runePriceDeviation,
      assetPriceDeviationSqrt,
      runePriceDeviationSqrt,
      sqrtDeviationsMultipied,
    }
  });
  // This should give you three sets of numbers: all the squared deviations for asset one, all the squared
  // deviations for asset two and a third group of all the numbers you got by multiplying each asset’s
  // squared daily deviations by one another. Take all of the squared daily deviations for asset one and 
  // add them together, before taking the square root of the sum. This is the standard deviation. Do the 
  // same for asset two. Then multiply the standard deviations for the two assets by one another, and put 
  // this number aside for the moment.
  assetStandardDeviation = Math.sqrt(assetStandardDeviation);
  runeStandardDeviation = Math.sqrt(runeStandardDeviation);
  const standardDeviationsProduct = assetStandardDeviation * runeStandardDeviation;
  // Finally, add all of the numbers in set three — the products of multiplying each day’s two
  // squared deviations by each other — and add them together before taking the square root.
  productsStandardDeviation = Math.sqrt(productsStandardDeviation);
  const correllation = productsStandardDeviation / standardDeviationsProduct;
  // Then divide this number by the product of the two assets’ standard deviations.
  // The resulting number would range between -1 and 1, reflecting the two assets’ correllation to one another.
  return correllation;
}

// function getCorrellations(averageAssetPriceUsd, averageRunePriceUsd, intervalsCalculations) {
//   let sumSqrtAssetDeviation = 0.0;
//   let sumSqrtRuneDeviation = 0.0;
//   let sumSqrtAssetRuneDeviationMultiplied = 0.0;
//   const assetCalcs = {};
//   const runeCalcs = {};
//   intervalsCalculationsStartTimes.forEach(startTimeKey => {
//     const assetPriceDeviation = (
//       averageAssetPriceUsd - intervalsCalculations[startTimeKey].assetPriceUsd
//     );
//     const runePriceDeviation = (
//       averageRunePriceUsd - intervalsCalculations[startTimeKey].runePriceUsd
//     );
//     const assetPriceDeviationSqrt = (Math.sqrt(Math.abs(assetPriceDeviation)));
//     const runePriceDeviationSqrt = (Math.sqrt(Math.abs(runePriceDeviation)));
//     assetCalcs[startTimeKey] = {
//       assetPriceDeviation,
//       sqrt: assetPriceDeviationSqrt,
//       sqrtDeviationsMultipied: assetPriceDeviationSqrt * runePriceDeviationSqrt,
//     };
//     runeCalcs[startTimeKey] = {
//       runePriceDeviation,
//       sqrt: runePriceDeviationSqrt,
//       sqrtDeviationsMultipied: runePriceDeviationSqrt * assetPriceDeviationSqrt,
//     };
//   });
// }