import Svg, { Circle, Path, Rect } from "react-native-svg";

export default function GameIcon({ size = 48, trophy = false }: { size?: number; trophy?: boolean }) {
  return <Svg width={size} height={size} viewBox="0 0 48 48" accessible={false}>
    <Circle cx={24} cy={24} r={23} fill={trophy ? "#F4A62A" : "#00756F"} />
    {trophy ? <Path d="M17 13h14v10a7 7 0 0 1-14 0z M17 16h-5v3a6 6 0 0 0 6 6 M31 16h5v3a6 6 0 0 1-6 6 M24 30v6m-6 0h12" stroke="#0C4358" strokeWidth={2.5} strokeLinecap="round" fill="none" /> : <>
      <Rect x={13} y={13} width={22} height={22} rx={5} fill="#FFF6E5" />
      <Circle cx={19} cy={19} r={2} fill="#00756F" />
      <Circle cx={24} cy={24} r={2} fill="#00756F" />
      <Circle cx={29} cy={29} r={2} fill="#00756F" />
    </>}
  </Svg>;
}
