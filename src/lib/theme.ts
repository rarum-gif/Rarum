// Inline-Skript gegen Aufblitzen des falschen Farbschemas (läuft vor dem Rendern)
export function initialThemeScript() {
  return `(function(){try{var t=localStorage.getItem('rarum.pref.theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
}
