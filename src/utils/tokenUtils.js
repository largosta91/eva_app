export function getRecruiterToken() {
  const pathMatch = window.location.pathname.match(/^\/join\/(.+)$/);
  if (pathMatch) return pathMatch[1];

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) return ref;

  return null;
}

export function saveRecruiterToken(token) {
  try { sessionStorage.setItem('eva_recruiter_token', token); } catch {}
}

export function getSavedRecruiterToken() {
  try { return sessionStorage.getItem('eva_recruiter_token'); } catch { return null; }
}

export function clearRecruiterToken() {
  try { sessionStorage.removeItem('eva_recruiter_token'); } catch {}
}

export function isCreatorFlow() {
  return !!(getRecruiterToken() || getSavedRecruiterToken());
}