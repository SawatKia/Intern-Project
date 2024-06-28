import { useState, useEffect } from "react";

const ThemeSelector = () => {
  const [theme, setTheme] = useState<string | undefined>(undefined);
  useEffect(() => {
    const localTheme = localStorage.getItem("theme");
    if (localTheme) {
      setTheme(localTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const switcher =
      document.querySelector<HTMLInputElement>("#theme-switcher");
    if (switcher) {
      if (theme === "dark") {
        switcher.setAttribute("checked", "");
      } else {
        switcher.removeAttribute("checked");
      }
    }
  }, [theme]);

  const handleThemeClick = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="text-body-text-lightM dark:text-body-text-darkM">
      <h1 className="text-2xl">theme</h1>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id="theme-switcher"
          className="sr-only peer"
          onClick={handleThemeClick}
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-active:outline-none peer-active:ring-4 peer-active:ring-blue-300 dark:peer-active:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"></div>
        <span className="ms-3 text-sm font-medium ">dark mode</span>
      </label>
    </div>
  );
};

export default ThemeSelector;
