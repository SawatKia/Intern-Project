import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-common-types"; // Import this for TypeScript type checking

interface ButtonProps {
  buttonText: string;
  icon?: string | JSX.Element | IconDefinition | null; // Update icon prop to support FontAwesomeIcon
  width?: string;
  border?: string;
  ring?: string;
  font?: string;
  backgroundColor?: string;
  textColor?: string;
  onClick?: (data: any) => void; // Adjusted for TypeScript type checking
  otherClasses?: string;
}

function Button({
  buttonText,
  icon,
  width = "w-auto",
  border = "border-0",
  ring = "ring-0",
  font = "font-medium",
  backgroundColor = "",
  textColor = "text-text-light",
  onClick,
  otherClasses = "",
}: ButtonProps) {
  const IconComponent = () => {
    if (!icon) return null;

    // Handle FontAwesomeIcon
    if (typeof icon === "object" && "iconName" in icon) {
      return <FontAwesomeIcon icon={icon as IconDefinition} />;
    }

    // Handle JSX.Element
    return (
      <span className="flex justify-center items-center h-6 w-6">{icon}</span>
    );
  };

  return (
    <button
      className={`
        flex flex-row justify-center items-center whitespace-nowrap
        transition-colors drop-shadow-md rounded-md py-2 px-4 gap-2 m-4
        ${width}
        ${backgroundColor}
        ${textColor}
        ${border}
        ${ring}
        ${otherClasses}
      `}
      onClick={onClick}
    >
      <IconComponent />
      <span className={`text-sm ${font}`}>{buttonText}</span>
    </button>
  );
}

export default Button;
