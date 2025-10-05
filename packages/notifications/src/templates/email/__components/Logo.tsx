import { fullUrl } from "@omero/utils";
import { Img } from "@react-email/components";

import { env } from ":env";

type LogoProperties = {
  variant?: "dark" | "light";
};

export const Logo = ({ variant = "dark" }: LogoProperties) => {
  const path =
    variant === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png";

  return (
    <Img
      src={fullUrl(env.BASE_URL, path).toString()}
      width="162"
      height="42"
      alt="Omero"
      className="h-[42px] w-auto"
    />
  );
};
