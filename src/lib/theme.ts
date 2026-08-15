export const THEME_STORAGE_KEY = "apiary-theme";

export type Theme = "light" | "dark";

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

export const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;
