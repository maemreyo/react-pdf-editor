// src/custom.d.ts
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}
