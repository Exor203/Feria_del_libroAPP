import Svg, { Path } from "react-native-svg";

export function FeriaLogo({ width }: { width: number }) {
  return <Svg width={width} height={width * 297 / 367} viewBox="0 0 367 297" accessible accessibilityLabel="Logo de la Feria del Libro">
    <Path fill="#0C4358" d="M114 0C151 0 183 22 183 55C183 22 215 0 253 0V100C215 100 191 123 183 154C175 123 151 100 114 100Z" />
    <Path fill="#EFA326" d="M0 122H114C146 122 172 148 172 180V295C140 295 114 269 114 238H57C57 206 82 180 114 180H57C25 180 0 154 0 122Z" />
    <Path fill="#EFA326" d="M195 295V180C195 148 221 122 253 122V238C253 269 227 295 195 295Z" />
    <Path fill="#EFA326" d="M253 238H309C341 238 367 264 367 295H311C279 295 253 269 253 238Z" />
  </Svg>;
}

// Brand glyphs from Font Awesome Free, CC BY 4.0; see assets/auth/NOTICE.md.
export function SocialLogo({ provider }: { provider: "Google" | "Facebook" | "Apple" }) {
  const icons = {
    Google: { viewBox: "0 0 488 512", path: "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" },
    Facebook: { viewBox: "0 0 320 512", path: "M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" },
    Apple: { viewBox: "0 0 384 512", path: "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" },
  };
  const icon = icons[provider];
  return <Svg width={34} height={34} viewBox={icon.viewBox} accessible={false}><Path d={icon.path} fill="#FFFFFF" /></Svg>;
}