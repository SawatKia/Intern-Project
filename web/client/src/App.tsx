import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./Components/Navbar";
import Diaries from "./Pages/Diaries";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import * as icon from "./assets/icon";
import NotFound from "./Pages/NotFound";
import ProtectedRoutes from "./utils/ProtectedRoutes";

function App() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="font-Kanit">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />

        <Route element={<ProtectedRoutes />}>
          <Route
            path="/profile"
            element={
              <Profile
                PersonalIcon={icon.Personal}
                PublishedIcon={icon.Published}
                AllDiariesIcon={icon.AllDiaries}
              />
            }
          />
          <Route
            path="/personal"
            element={
              <Diaries
                header_icon={icon.Personal}
                header_text=" ส่วนตัว"
                privateDiaries={true}
              />
            }
          />
          <Route
            path="/published"
            element={
              <Diaries
                header_icon={icon.Published}
                header_text=" ที่เผยแพร่"
                privateDiaries={false}
              />
            }
          />
          <Route path="/" element={<Diaries team="ทีมรับสาย" />} />
          <Route path="/filling" element={<Diaries team="ทีมกรอกข้อมูล" />} />
          <Route path="/nutrition" element={<Diaries team="ทีม Nutrition" />} />
          <Route path="/colab" element={<Diaries team="ทีม Colab" />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
