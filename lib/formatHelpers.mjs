export function formatLocation(location) {
  return [location.org, location.city, location.country].filter(f => f && f.length).join(', ');
}
