import { Wifi } from "lucide-react";

interface LogoProps {
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ animated = false, size = "md" }: LogoProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: 20,
    md: 40,
    lg: 60,
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizes[size]} rounded-full bg-gradient-prosperity flex items-center justify-center shadow-lg ${
          animated ? "animate-pulse-sacred" : ""
        } glow-gold`}
      >
        <Wifi className="text-white" size={iconSizes[size]} strokeWidth={2.5} />
      </div>
      {size !== "sm" && (
        <h1 className="text-2xl md:text-3xl font-bold text-white">MonWiFi</h1>
      )}
    </div>
  );
};

export default Logo;
