import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import user from "../services/userApi";
import Notification from "../Components/Notification";

function Register() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !passwordValue || !confirmPasswordValue) {
      setPasswordError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (passwordValue !== confirmPasswordValue) {
      setPasswordError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setPasswordError("");
    // call API to register
    try {
      const result = await user.register(
        username,
        email,
        passwordValue,
        confirmPasswordValue
      );
      if (result) {
        setRegistrationSuccess(true);
        setNotification({ message: "ลงทะเบียนสำเร็จ!", success: true });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError(error.message);
        setNotification({ message: error.message, success: false });
      } else {
        setPasswordError("เกิดข้อผิดพลาด");
        setNotification({ message: "เกิดข้อผิดพลาด", success: false });
      }
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-body-bg-lightM dark:bg-body-bg-darkM font-Kanit">
      {notification && (
        <Notification
          message={notification.message}
          success={notification.success}
          onClose={closeNotification}
        />
      )}
      <div className="relative flex flex-col w-full max-w-md px-4 sm:px-6 lg:px-8 py-8 mx-auto rounded-xl bg-card-bg-lightM dark:bg-card-bg-darkM text-card-text-lightM dark:text-card-text-darkM shadow-md">
        <div className="relative mx-4 -mt-6 mb-4 grid h-28 place-items-center overflow-hidden rounded-xl bg-gradient-to-tr from-buttonPrimary-bg-lightM to-buttonPrimary-bg-lightM dark:from-buttonPrimary-bg-darkM dark:to-buttonPrimary-bg-darkM text-card-text-darkM shadow-lg shadow-buttonPrimary-hover-lightM dark:shadow-buttonPrimary-hover-darkM">
          <h3 className="block font-sans text-3xl font-semibold leading-snug tracking-normal text-card-text-darkM antialiased">
            ลงทะเบียน
          </h3>
        </div>
        <div id="form-inputs" className="flex flex-col gap-4 px-4 sm:px-6">
          <div className="relative h-11 w-full min-w-[200px]">
            <input
              className="peer h-full w-full rounded-md border border-card-border-lightM dark:border-card-border-darkM border-t-transparent bg-transparent px-3 py-3 font-sans text-sm font-normal text-body-text-lightM dark:text-body-text-darkM outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-card-border-lightM dark:placeholder-shown:border-card-border-darkM placeholder-shown:border-t-card-border-lightM dark:placeholder-shown:border-t-card-border-darkM focus:border-2 focus:border-buttonPrimary-bg-lightM dark:focus:border-buttonPrimary-bg-darkM focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              aria-required
            />
            <label className="before:content-[' '] after:content-[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-body-subtext-lightM dark:text-body-subtext-darkM transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-card-border-lightM dark:before:border-card-border-darkM before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-card-border-lightM dark:after:border-card-border-darkM after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-body-subtext-lightM dark:peer-placeholder-shown:text-body-subtext-darkM peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-buttonPrimary-bg-lightM dark:peer-focus:text-buttonPrimary-bg-darkM peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-buttonPrimary-bg-lightM dark:peer-focus:before:!border-buttonPrimary-bg-darkM peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-buttonPrimary-bg-lightM dark:peer-focus:after:!border-buttonPrimary-bg-darkM peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-body-subtext-lightM dark:peer-disabled:peer-placeholder-shown:text-body-subtext-darkM">
              ชื่อผู้ใช้
            </label>
          </div>
          <div className="relative h-11 w-full min-w-[200px]">
            <input
              className="peer h-full w-full rounded-md border border-card-border-lightM dark:border-card-border-darkM border-t-transparent bg-transparent px-3 py-3 font-sans text-sm font-normal text-body-text-lightM dark:text-body-text-darkM outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-card-border-lightM dark:placeholder-shown:border-card-border-darkM placeholder-shown:border-t-card-border-lightM dark:placeholder-shown:border-t-card-border-darkM focus:border-2 focus:border-buttonPrimary-bg-lightM dark:focus:border-buttonPrimary-bg-darkM focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required
            />
            <label className="before:content-[' '] after:content-[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-body-subtext-lightM dark:text-body-subtext-darkM transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-card-border-lightM dark:before:border-card-border-darkM before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-card-border-lightM dark:after:border-card-border-darkM after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-body-subtext-lightM dark:peer-placeholder-shown:text-body-subtext-darkM peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-buttonPrimary-bg-lightM dark:peer-focus:text-buttonPrimary-bg-darkM peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-buttonPrimary-bg-lightM dark:peer-focus:before:!border-buttonPrimary-bg-darkM peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-buttonPrimary-bg-lightM dark:peer-focus:after:!border-buttonPrimary-bg-darkM peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-body-subtext-lightM dark:peer-disabled:peer-placeholder-shown:text-body-subtext-darkM">
              อีเมล
            </label>
          </div>
          <div className="relative h-11 w-full min-w-[200px]">
            <input
              className="peer h-full w-full rounded-md border border-card-border-lightM dark:border-card-border-darkM border-t-transparent bg-transparent px-3 py-3 font-sans text-sm font-normal text-body-text-lightM dark:text-body-text-darkM outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-card-border-lightM dark:placeholder-shown:border-card-border-darkM placeholder-shown:border-t-card-border-lightM dark:placeholder-shown:border-t-card-border-darkM focus:border-2 focus:border-buttonPrimary-bg-lightM dark:focus:border-buttonPrimary-bg-darkM focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              type={passwordVisible ? "text" : "password"}
              id="password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
              aria-required
            />
            <label className="before:content-[' '] after:content-[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-body-subtext-lightM dark:text-body-subtext-darkM transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-card-border-lightM dark:before:border-card-border-darkM before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-card-border-lightM dark:after:border-card-border-darkM after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-body-subtext-lightM dark:peer-placeholder-shown:text-body-subtext-darkM peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-buttonPrimary-bg-lightM dark:peer-focus:text-buttonPrimary-bg-darkM peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-buttonPrimary-bg-lightM dark:peer-focus:before:!border-buttonPrimary-bg-darkM peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-buttonPrimary-bg-lightM dark:peer-focus:after:!border-buttonPrimary-bg-darkM peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-body-subtext-lightM dark:peer-disabled:peer-placeholder-shown:text-body-subtext-darkM">
              รหัสผ่าน
            </label>
            <button
              type="button"
              className="absolute right-0 top-0 mt-3 mr-3 text-gray-600 dark:text-gray-400"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              <FontAwesomeIcon icon={passwordVisible ? faEye : faEyeSlash} />
            </button>
          </div>
          <div className="relative h-11 w-full min-w-[200px]">
            <input
              className="peer h-full w-full rounded-md border border-card-border-lightM dark:border-card-border-darkM border-t-transparent bg-transparent px-3 py-3 font-sans text-sm font-normal text-body-text-lightM dark:text-body-text-darkM outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-card-border-lightM dark:placeholder-shown:border-card-border-darkM placeholder-shown:border-t-card-border-lightM dark:placeholder-shown:border-t-card-border-darkM focus:border-2 focus:border-buttonPrimary-bg-lightM dark:focus:border-buttonPrimary-bg-darkM focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              type={confirmPasswordVisible ? "text" : "password"}
              id="confirm-password"
              value={confirmPasswordValue}
              onChange={(e) => setConfirmPasswordValue(e.target.value)}
              required
              aria-required
            />
            <label className="before:content-[' '] after:content-[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-body-subtext-lightM dark:text-body-subtext-darkM transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-card-border-lightM dark:before:border-card-border-darkM before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-card-border-lightM dark:after:border-card-border-darkM after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-body-subtext-lightM dark:peer-placeholder-shown:text-body-subtext-darkM peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-buttonPrimary-bg-lightM dark:peer-focus:text-buttonPrimary-bg-darkM peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-buttonPrimary-bg-lightM dark:peer-focus:before:!border-buttonPrimary-bg-darkM peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-buttonPrimary-bg-lightM dark:peer-focus:after:!border-buttonPrimary-bg-darkM peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-body-subtext-lightM dark:peer-disabled:peer-placeholder-shown:text-body-subtext-darkM">
              ยืนยันรหัสผ่าน
            </label>
            <button
              type="button"
              className="absolute right-0 top-0 mt-3 mr-3 text-gray-600 dark:text-gray-400"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              <FontAwesomeIcon
                icon={confirmPasswordVisible ? faEye : faEyeSlash}
              />
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          <button
            onClick={handleRegister}
            className="w-full py-3 mt-4 text-center rounded-md bg-gradient-to-tr from-buttonPrimary-bg-lightM to-buttonPrimary-bg-lightM dark:from-buttonPrimary-bg-darkM dark:to-buttonPrimary-bg-darkM text-card-text-darkM shadow-lg shadow-buttonPrimary-hover-lightM dark:shadow-buttonPrimary-hover-darkM hover:bg-buttonPrimary-hover-lightM dark:hover:bg-buttonPrimary-hover-darkM transition duration-300"
          >
            ลงทะเบียน
          </button>
          {registrationSuccess && (
            <p className="text-green-500 text-center mt-4">ลงทะเบียนสำเร็จ!</p>
          )}
          <div className="mt-4 text-center">
            <span className=" text-body-text-lightM dark:text-body-text-darkM ">
              มีบัญชีอยู่แล้ว?
            </span>
            <Link
              to="/login"
              className="text-sm hover:underline text-buttonPrimary-bg-lightM dark:text-buttonPrimary-bg-darkM"
            >
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
