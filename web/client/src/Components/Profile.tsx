import { Link } from "react-router-dom";
import auth from "../services/authenticationApi";
import { useState, useRef, useEffect } from "react";
import { person } from "../assets/icon";

function Profile() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    return await auth.logout();
  };
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };
  const handleClickOutside = (event: MouseEvent) => {
    //NOTE - check if it click on backdrop not the not the menu
    if (
      profileMenuRef.current &&
      !profileMenuRef.current.contains(event.target as Node)
    ) {
      setProfileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <div
      ref={profileMenuRef}
      onClick={toggleProfileMenu}
      className="cursor-pointer w-16 h-16"
    >
      <div className="flex justify-center items-center w-full h-full">
        {person}
      </div>
      {profileMenuOpen && (
        <div
          onClick={() => setProfileMenuOpen(false)}
          className="flex flex-col absolute z-[4] right-0 mt-2 mx-12 w-48 bg-optionCard-bg-lightM border border-optionCard-border-lightM rounded-lg shadow-md dark:bg-[hsl(216,29%,44%)] dark:text-optionCard-text-darkM dark:border-optionCard-border-darkM"
        >
          <Link
            reloadDocument
            to="profile"
            className="px-4 py-2 cursor-pointer hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
          >
            โปรไฟล์
          </Link>
          <Link
            to="personal"
            className="px-4 py-2 cursor-pointer hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
          >
            ไดอารี่ส่วนตัว
          </Link>
          <Link
            to="published"
            className="px-4 py-2 cursor-pointer hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
          >
            ไดอารี่ที่เผยแพร่
          </Link>
          <Link
            to="login"
            onClick={handleLogout}
            className="px-4 py-2 cursor-pointer hover:bg-options-hover-lightM active:bg-options-active-lightM dark:hover:bg-options-hover-darkM dark:active:bg-options-active-darkM"
          >
            ออกจากระบบ
          </Link>
        </div>
      )}
    </div>
  );
}

export default Profile;
