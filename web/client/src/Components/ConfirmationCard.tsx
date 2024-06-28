import { useEffect } from "react";
import Button from "./Button";
import { FaEdit, FaTrash, FaLock, FaGlobe } from "react-icons/fa"; // Icons for the actions

interface ConfirmationCardProps {
  onConfirm: () => void;
  onCancel: () => void;
  actionMessage: string;
  warningMessage?: string;
}

function ConfirmationCard({
  onConfirm,
  onCancel,
  actionMessage,
  warningMessage,
}: ConfirmationCardProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  const getIcon = () => {
    switch (actionMessage) {
      case "แก้ไข":
        return <FaEdit />;
      case "ลบ":
        return <FaTrash />;
      case "เปลี่ยนเป็นส่วนตัว":
        return <FaLock />;
      case "เผยแพร่":
        return <FaGlobe />;
      default:
        return null;
    }
  };

  const getButtonColor = () => {
    switch (actionMessage) {
      case "แก้ไข":
        return "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 dark:active:bg-yellow-900";
      case "ลบ":
        return "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:active:bg-red-900";
      case "เปลี่ยนเป็นส่วนตัว":
        return "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 dark:active:bg-yellow-900";
      case "เผยแพร่":
        return "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 dark:active:bg-green-900";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[11] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
      <div
        onClick={(e) => e.stopPropagation()} // Stop event propagation
        className="bg-card-bg-lightM dark:bg-card-bg-darkM dark:text-card-text-darkM text-card-text-lightM p-4 rounded-md shadow-md w-80 animate-fadeIn"
      >
        <h2 className="text-lg font-bold mb-4">ยืนยันการ{actionMessage}</h2>
        <span id="Confirm-message" className="mb-4">
          {warningMessage && (
            <p id="warnning" className="text-orange-600">
              คำเตือน: {warningMessage}
            </p>
          )}
          <p>
            คุณแน่ใจว่าต้องการ
            {actionMessage == "เปลี่ยนเป็นส่วนตัว" || actionMessage == "เผยแพร่"
              ? "เปลี่ยนแปลงความเป็นส่วนตัว"
              : actionMessage}
            ไดอารี่นี้หรือไม่?
          </p>
        </span>
        <div className="flex justify-end">
          <Button
            buttonText={actionMessage == "แก้ไข" ? "ยืนยัน" : actionMessage}
            icon={getIcon()}
            backgroundColor={getButtonColor()}
            onClick={onConfirm}
          />
          <Button
            buttonText="ยกเลิก"
            backgroundColor="bg-card-bg-lightM hover:bg-card-hover-lightM active:card-active-lightM dark:bg-card-bg-darkM dark:hover:bg-card-hover-darkM dark:active:bg-card-active-darkM"
            border="border-2 border-card-border-lightM dark:border-card-border-darkM"
            textColor="text-card-text-lightM dark:text-card-text-darkM"
            onClick={onCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default ConfirmationCard;
