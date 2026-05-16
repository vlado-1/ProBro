declare module "*.md" {
    const content: string;
    export default content;
}
declare module "*.gif" {
    const value: { default: string };
    export default value;
}

declare module "*.jpg" {
    const value: { default: string };
    export default value;
}

declare module "*.css" {
    const content: string;
    export default content;
}

declare module 'reactjs-popup' {
  import * as React from 'react';

  export type PopupChildren = (close: () => void) => React.ReactNode;

  // Omit 'children' from HTMLAttributes so we can allow a function render-prop.
  export interface PopupProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
    children?: React.ReactNode | PopupChildren;
    modal?: boolean;
    open?: boolean;
    onClose?: () => void;
    trigger?: React.ReactNode | PopupChildren;
  }

  const Popup: React.ComponentType<PopupProps>;
  export default Popup;
}