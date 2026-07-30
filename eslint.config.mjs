import { type Config } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig: Config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
