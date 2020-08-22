export function formatLocation(location) {
  return [location.org, location.city, location.country].filter(f => f && f.length).join(', ');
}

export function formatPercentageFloat(fraction) {
  return (fraction * 100).toFixed(2) + '%';
}

export function formatPercentageInt(fraction) {
  return (fraction * 100).toFixed(0) + '%';
}
