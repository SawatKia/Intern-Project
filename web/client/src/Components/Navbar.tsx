import { useState, useRef, useEffect } from "react";
import ThemeSelector from "./ThemeSelector";
import Profile from "./Profile";
import { NavLink } from "react-router-dom";
import { hamburger } from "../assets/icon";
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const MenuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (MenuRef.current && !MenuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div ref={MenuRef} className="font-Kanit sticky top-0 z-[5]">
      <nav className="bg-Navbar-bg-lightM text-Navbar-text-lightM drop-shadow-lg dark:bg-Navbar-bg-darkM dark:text-Navbar-text-darkM">
        <div className="py-2 px-6 md:px-10 flex justify-between items-center">
          <NavLink to="/" className="flex items-center">
            <img src="/logo.png" alt="Logo" className="mr-2 w-16" />
            <span className="font-bold text-2xl">Vulcan Wall</span>
          </NavLink>
          <div className="hidden md:block">
            <div id="menu" className="flex items-center space-x-4 md:space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-xl p-2 rounded-lg ${
                    isActive
                      ? "bg-Navbar-selected-lightM text-white font-semibold dark:bg-Navbar-selected-darkM"
                      : "hover:bg-Navbar-hover-lightM focus:bg-Navbar-selected-lightM dark:hover:bg-Navbar-hover-darkM hover:focus:bg-Navbar-selected-darkM"
                  }`
                }
              >
                ทีมรับสาย
              </NavLink>
              <NavLink
                to="/filling"
                className={({ isActive }) =>
                  `text-xl p-2 rounded-lg ${
                    isActive
                      ? "bg-Navbar-selected-lightM text-white font-semibold dark:bg-Navbar-selected-darkM"
                      : "hover:bg-Navbar-hover-lightM focus:bg-Navbar-selected-lightM dark:hover:bg-Navbar-hover-darkM hover:focus:bg-Navbar-selected-darkM"
                  }`
                }
              >
                ทีมกรอกข้อมูล
              </NavLink>
              <NavLink
                to="/nutrition"
                className={({ isActive }) =>
                  `text-xl p-2 rounded-lg ${
                    isActive
                      ? "bg-Navbar-selected-lightM text-white font-semibold dark:bg-Navbar-selected-darkM"
                      : "hover:bg-Navbar-hover-lightM focus:bg-Navbar-selected-lightM dark:hover:bg-Navbar-hover-darkM hover:focus:bg-Navbar-selected-darkM"
                  }`
                }
              >
                Nutrition
              </NavLink>
              <NavLink
                to="/colab"
                className={({ isActive }) =>
                  `text-xl p-2 rounded-lg ${
                    isActive
                      ? "bg-Navbar-selected-lightM text-white font-semibold dark:bg-Navbar-selected-darkM"
                      : "hover:bg-Navbar-hover-lightM focus:bg-Navbar-selected-lightM dark:hover:bg-Navbar-hover-darkM hover:focus:bg-Navbar-selected-darkM"
                  }`
                }
              >
                Colab
              </NavLink>
              <Profile />
            </div>
          </div>
          <div className="md:hidden">
            <button
              className="block text-gray-900 dark:text-gray-50"
              onClick={toggleMenu}
            >
              {hamburger}
            </button>
            {menuOpen && (
              <div className="absolute z-[6] right-0 mx-6 my-2 w-48 bg-optionCard-bg-lightM border border-optionCard-border-lightM text-optionCard-text-lightM rounded-lg shadow-md dark:bg-optionCard-bg-darkM dark:border-optionCard-border-darkM dark:text-optionCard-text-darkM">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block px-4 py-2 ${
                      isActive
                        ? "text-white font-semibold bg-Navbar-selected-lightM dark:bg-Navbar-selected-darkM"
                        : "hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
                    }`
                  }
                >
                  ทีมรับสาย
                </NavLink>
                <NavLink
                  to="/filling"
                  className={({ isActive }) =>
                    `block px-4 py-2 ${
                      isActive
                        ? "text-white font-semibold bg-Navbar-selected-lightM dark:bg-Navbar-selected-darkM"
                        : "hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
                    }`
                  }
                >
                  ทีมกรอกข้อมูล
                </NavLink>
                <NavLink
                  to="/nutrition"
                  className={({ isActive }) =>
                    `block px-4 py-2 ${
                      isActive
                        ? "text-white font-semibold bg-Navbar-selected-lightM dark:bg-Navbar-selected-darkM"
                        : "hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
                    }`
                  }
                >
                  Nutrition
                </NavLink>
                <NavLink
                  to="/colab"
                  className={({ isActive }) =>
                    `block px-4 py-2 ${
                      isActive
                        ? "text-white font-semibold bg-Navbar-selected-lightM dark:bg-Navbar-selected-darkM"
                        : "hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
                    }`
                  }
                >
                  Colab
                </NavLink>
                <Profile />
                <div className="px-4 py-2">
                  <ThemeSelector />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
