declare module "*.svg" {
  import type * as React from "react";

  const component: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  export default component;
}
