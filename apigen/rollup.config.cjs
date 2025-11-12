// eslint-disable-next-line @typescript-eslint/no-require-imports
const { dts } = require("rollup-plugin-dts");

const config = [
  {
    input: "src/server/_app.ts",
    output: [{ file: "apigen/api.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
