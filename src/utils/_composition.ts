// src/utils/composition.ts
export function createComponent<Props extends Record<string, any>>(
  Component: React.ComponentType<Props>,
  displayName: string,
) {
  Component.displayName = displayName;
  return Component;
}

export function createCompoundComponent<
  Props extends Record<string, any>,
  Subcomponents extends Record<string, React.ComponentType<any>>,
>(
  Component: React.ComponentType<Props>,
  subcomponents: Subcomponents,
  displayName: string,
) {
  const EnhancedComponent = Component as React.ComponentType<Props> &
    Subcomponents;
  Object.assign(EnhancedComponent, subcomponents);
  EnhancedComponent.displayName = displayName;
  return EnhancedComponent;
}
