function addDays(date, amount) {
  date.setDate(date.getDate() + amount);
}

export function dummyTimeSeriesProgressive(start, end, startValue) {
  const result = [{ date: start, value: startValue }];

  const d = new Date(start.getTime());
  addDays(d, 1);

  for (let i = 0; d <= end; addDays(d, 1)) {
    i = (result.push({
      date: new Date(d.getTime()),
      value: Math.round(result[i].value + (30 * ((0.95 - Math.random())))),
    })) - 2;
  }
  return result;
};

export function dummyTimeSeriesIntervals(start, end, min, max) {
  const result = [];
  const d = new Date(start.getTime());

  for (let i = 0; d <= end; addDays(d, 1)) {
    (result.push({
      date: new Date(d.getTime()),
      value: Math.round(min + Math.random() * (max - min)),
    }));
  }
  return result;
};
