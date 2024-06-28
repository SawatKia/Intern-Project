import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import auth from "../services/authenticationApi";
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const ping_result = await auth.checkConnection();
      if (ping_result) {
        const response = await auth.login(username, password);
        if (response) {
          navigate("/");
          console.log('[Login.tsx]: Login successful, navigate to "/" page');
        } else {
          setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
        }
      } else {
        console.log("[Login.tsx]: ping failed, cannot establish connection");
      }
    } catch (error) {
      console.error("[Login.tsx]:  login error: ", error);
      setError("เกิดข้อผิดพลาด เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-body-bg-lightM dark:bg-body-bg-darkM font-Kanit">
      <div className="relative flex w-full max-w-md flex-col rounded-xl bg-card-bg-lightM dark:bg-card-bg-darkM bg-clip-border text-card-text-lightM dark:text-card-text-darkM shadow-md mx-4 sm:mx-0">
        <div className="relative mx-4 -mt-6 mb-4 grid h-28 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-buttonPrimary-bg-lightM to-buttonPrimary-bg-lightM dark:from-buttonPrimary-bg-darkM dark:to-buttonPrimary-bg-darkM bg-clip-border text-card-text-darkM shadow-lg shadow-buttonPrimary-hover-lightM dark:shadow-buttonPrimary-hover-darkM">
          <h3 className="block font-sans text-2xl sm:text-3xl font-semibold leading-snug tracking-normal text-card-text-darkM antialiased">
            เข้าสู่ระบบ
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="relative h-11 w-full">
            <input
              className="peer h-full w-full rounded-md border border-card-border-lightM dark:border-card-border-darkM border-t-transparent bg-transparent px-3 py-3 font-sans text-sm font-normal text-body-text-lightM dark:text-body-text-darkM outline-none transition-all placeholder-shown:border placeholder-shown:border-card-border-lightM dark:placeholder-shown:border-card-border-darkM placeholder-shown:border-t-card-border-lightM dark:placeholder-shown:border-t-card-border-darkM focus:border-2 focus:border-buttonPrimary-bg-lightM dark:focus:border-buttonPrimary-bg-darkM focus:border-t-transparent disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              type="text"
              id="identifier"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-body-subtext-lightM dark:text-body-subtext-darkM transition-all before:content-[' '] after:content-[' '] before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-card-border-lightM dark:before:border-card-border-darkM before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-card-border-lightM dark:after:border-card-border-darkM after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-body-subtext-lightM dark:peer-placeholder-shown:text-body-subtext-darkM peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-buttonPrimary-bg-lightM dark:peer-focus:text-buttonPrimary-bg-darkM peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-buttonPrimary-bg-lightM dark:peer-focus:before:!border-buttonPrimary-bg-darkM peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-buttonPrimary-bg-lightM dark:peer-focus:after:!border-buttonPrimary-bg-darkM peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-body-subtext-lightM dark:peer-disabled:peer-placeholder-shown:text-body-subtext-darkM">
              ชื่อผู้ใช้หรืออีเมล
            </label>
          </div>
          <div className="relative h-11 w-full">
            <input
              className="peer h-full w-full rounded-md border border-card-border-lightM dark:border-card-border-darkM border-t-transparent bg-transparent px-3 py-3 font-sans text-sm font-normal text-body-text-lightM dark:text-body-text-darkM outline-none transition-all placeholder-shown:border placeholder-shown:border-card-border-lightM dark:placeholder-shown:border-card-border-darkM placeholder-shown:border-t-card-border-lightM dark:placeholder-shown:border-t-card-border-darkM focus:border-2 focus:border-buttonPrimary-bg-lightM dark:focus:border-buttonPrimary-bg-darkM focus:border-t-transparent disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              type={passwordVisible ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-body-subtext-lightM dark:text-body-subtext-darkM transition-all before:content-[' '] after:content-[' '] before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-card-border-lightM dark:before:border-card-border-darkM before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-card-border-lightM dark:after:border-card-border-darkM after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-body-subtext-lightM dark:peer-placeholder-shown:text-body-subtext-darkM peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-buttonPrimary-bg-lightM dark:peer-focus:text-buttonPrimary-bg-darkM peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-buttonPrimary-bg-lightM dark:peer-focus:before:!border-buttonPrimary-bg-darkM peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-buttonPrimary-bg-lightM dark:peer-focus:after:!border-buttonPrimary-bg-darkM peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-body-subtext-lightM dark:peer-disabled:peer-placeholder-shown:text-body-subtext-darkM">
              รหัสผ่าน
            </label>
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-body-subtext-lightM dark:text-body-subtext-darkM cursor-pointer transition duration-500"
            >
              <FontAwesomeIcon icon={passwordVisible ? faEye : faEyeSlash} />
            </span>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <button
            className="block w-full select-none rounded-lg bg-buttonPrimary-bg-lightM dark:bg-buttonPrimary-bg-darkM py-3 px-6 text-center font-sans text-xs font-bold uppercase text-buttonPrimary-text-lightM dark:text-buttonPrimary-text-darkM shadow-md shadow-buttonPrimary-hover-lightM dark:shadow-buttonPrimary-hover-darkM transition-all hover:shadow-lg hover:shadow-buttonPrimary-hover-lightM dark:hover:shadow-buttonPrimary-hover-darkM focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="submit"
          >
            เข้าสู่ระบบ
          </button>
          <div className="mt-4 text-center text-sm">
            <span className="text-body-subtext-lightM dark:text-body-subtext-darkM">
              หรือ{" "}
            </span>
            <Link
              to="/register"
              className="hover:underline text-buttonPrimary-bg-lightM dark:text-buttonPrimary-bg-darkM"
            >
              สร้างบัญชีใหม่
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
