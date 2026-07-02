declare module "lucide-react-native/dist/cjs/icons/*" {
  import type { ComponentType } from "react";
  import type { SvgProps } from "react-native-svg";

  type LucideIconProps = SvgProps & {
    color?: string;
    size?: number | string;
    strokeWidth?: number | string;
  };

  const Icon: ComponentType<LucideIconProps>;
  export default Icon;
}
