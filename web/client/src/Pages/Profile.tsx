import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import diaries from "../services/diariesApi";
import { person } from "../assets/icon";

import UserApi from "../services/userApi";
import { User } from "../interfaces/userInterface";

interface profile_props {
  PersonalIcon: JSX.Element;
  PublishedIcon: JSX.Element;
  AllDiariesIcon: JSX.Element;
}

function Profile({
  PersonalIcon,
  PublishedIcon,
  AllDiariesIcon,
}: profile_props) {
  const [theme, setTheme] = useState(localStorage.getItem("theme"));
  const [privateDiaries, setPrivateDiaries] = useState(0);
  const [publishedDiaries, setPublishedDiaries] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = async () => {
      setUser(await UserApi.get_current_user());
    };
    const setDiariresNumber = async () => {
      setPrivateDiaries(await diaries.getDiariesNumber(true));
      setPublishedDiaries(await diaries.getDiariesNumber(false));
    };
    currentUser();
    setDiariresNumber();
  }, []);

  useEffect(() => {
    setTheme(localStorage.getItem("theme"));
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="font-Kanit bg-body-bg-lightM dark:bg-body-bg-darkM min-h-screen">
      <div className="flex flex-col items-center justify-center pt-6 mx-4 mb-20 md:flex-row md:justify-center">
        <div className="grid w-36 justify-items-center">
          {person}
          <div id="mockUp" className="p-5"></div>
        </div>
        <div className="w-full mt-6 md:mt-0 md:w-1/3">
          <div className="text-3xl mb-10 text-body-text-lightM dark:text-body-text-darkM text-center md:text-left">
            {user ? user.username : "ไม่พบผู้ใช้งาน"}
          </div>
          <div className="flex flex-col items-center md:flex-row md:justify-around">
            <NavLink
              to="/personal"
              className="grid justify-items-center group cursor-pointer mb-6 md:mb-0"
            >
              <div className="flex items-center justify-center w-20 h-32 text-Navbar-bg-lightM">
                {PersonalIcon}
              </div>
              <p className="my-4 text-xl text-body-text-lightM dark:text-body-text-darkM">
                ไดอารี่ส่วนตัว
              </p>
              <p className="text-4xl font-bold text-body-text-lightM dark:text-body-text-darkM">
                {privateDiaries}
              </p>
            </NavLink>
            <NavLink
              to="/published"
              className="grid justify-items-center group cursor-pointer mb-6 md:mb-0"
            >
              <div className="flex items-center justify-center w-20 h-32 text-Navbar-bg-lightM">
                {PublishedIcon}
              </div>
              <p className="my-4 text-xl text-body-text-lightM dark:text-body-text-darkM">
                ไดอารี่ที่เผยแพร่แล้ว
              </p>
              <p className="text-4xl font-bold text-body-text-lightM dark:text-body-text-darkM">
                {publishedDiaries}
              </p>
            </NavLink>
            <div className="grid justify-items-center">
              <div className="flex items-center justify-center w-20 h-32 text-Navbar-bg-lightM">
                {AllDiariesIcon}
              </div>
              <p className="my-4 text-xl text-body-text-lightM dark:text-body-text-darkM">
                ไดอารี่ทั้งหมด
              </p>
              <p className="text-4xl font-bold text-body-text-lightM dark:text-body-text-darkM">
                {privateDiaries + publishedDiaries}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div id="down_container"></div>
    </div>
  );
}

export default Profile;
