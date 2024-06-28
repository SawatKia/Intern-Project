import { useEffect } from "react";
import { check, cross } from "../assets/icon";

interface NotificationProps {
  message: string;
  success: boolean;
  onClose: () => void;
}

function Notification({ message, success, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1750);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-[10] inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="z-[11] bg-white p-4 rounded-lg shadow-md flex items-center">
        {success ? (
          <div className="flex items-center">
            <div id="icon-success" className="mr-2">
              {check}
            </div>
            <p className="text-green-500 text-lg">{message}</p>
          </div>
        ) : (
          <div className="flex items-center">
            <div id="icon-failed" className="mr-2">
              {cross}
            </div>
            <p className="text-red-500 text-lg">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;
