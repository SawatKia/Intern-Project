import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-body-bg-lightM dark:bg-body-bg-darkM text-body-text-lightM dark:text-body-text-darkM">
      <img src="/404_image.png" alt="404 Not Found" className="mb-4 w-1/4" />
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-xl mb-6">ไม่พบหน้าที่คุณต้องการค้นหา</p>
      <Link
        to="/"
        className="bg-buttonPrimary-bg-lightM text-buttonPrimary-text-lightM hover:bg-buttonPrimary-hover-lightM active:bg-buttonPrimary-selected-lightM dark:bg-buttonPrimary-bg-darkM dark:text-buttonPrimary-text-darkM dark:hover:bg-buttonPrimary-hover-darkM dark:active:bg-buttonPrimary-selected-darkM py-2 px-4 rounded-md"
      >
        คลิกที่นี่เพื่อกลับไปยังหน้าหลัก
      </Link>
    </div>
  );
}

export default NotFound;
