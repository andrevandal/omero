import { fullUrl } from "@omero/utils";
import { Img } from "@react-email/components";

type LogoProperties = {
  variant?: "dark" | "light";
  baseUrl?: string;
};

export const Logo = ({ variant = "dark", baseUrl = "/" }: LogoProperties) => {
  const path =
    variant === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png";

  return (
    <Img
      src={fullUrl(baseUrl, path).toString()}
      width="162"
      height="42"
      alt="Omero"
      className="h-[42px] w-auto"
    />
  );
};
