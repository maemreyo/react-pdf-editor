import { useRef, useEffect } from "react";

export function useDebugRender(componentName: string, props: any) {
  const renderCount = useRef(0);
  const previousProps = useRef<any>(props);

  useEffect(() => {
    const changedProps: Record<string, { old: any; new: any }> = {};

    Object.entries(props).forEach(([key, value]) => {
      if (previousProps.current[key] !== value) {
        changedProps[key] = {
          old: previousProps.current[key],
          new: value,
        };
      }
    });

    console.log(`[${componentName}] render #${renderCount.current}`);
    if (Object.keys(changedProps).length > 0) {
      console.log("[Changed Props]:", changedProps);
    }

    renderCount.current++;
    previousProps.current = props;
  });
}
