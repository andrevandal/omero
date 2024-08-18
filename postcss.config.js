import postcssImport from "postcss-import";
import tailwindNesting from "@tailwindcss/nesting";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [postcssImport, tailwindNesting, tailwindcss, autoprefixer],
};
