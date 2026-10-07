import { Image, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

const homeReference = require("../../assets/home/home-reference.png");
const menuReference = require("../../assets/home/menu-reference.png");

function Crop({ source, sourceWidth, sourceHeight, x, y, cropWidth, cropHeight, width, rounded = false }: {
  source: ImageSourcePropType; sourceWidth: number; sourceHeight: number;
  x: number; y: number; cropWidth: number; cropHeight: number; width: number; rounded?: boolean;
}) {
  const scale = width / cropWidth;
  return <View style={{ width, height: cropHeight * scale, overflow: "hidden", borderRadius: rounded ? width / 2 : 0 }}>
    <Image source={source} accessible={false} resizeMode="stretch" style={{ position: "absolute", width: sourceWidth * scale, height: sourceHeight * scale, left: -x * scale, top: -y * scale }} />
  </View>;
}

export type IconName = "books" | "exchange" | "events" | "map" | "artists" | "camera" | "assistant" | "bookClosed" | "bookOpen";
const icons: Record<Exclude<IconName, "bookClosed">, { x: number; y: number; size: number }> = {
  books: { x: 80, y: 579, size: 76 }, exchange: { x: 314, y: 579, size: 76 },
  events: { x: 189, y: 682, size: 81 }, map: { x: 79, y: 784, size: 76 },
  artists: { x: 311, y: 784, size: 76 }, camera: { x: 94, y: 947, size: 56 },
  assistant: { x: 322, y: 947, size: 56 }, bookOpen: { x: 187, y: 937, size: 82 },
};

export function ReferenceIcon({ name, size = 64 }: { name: IconName; size?: number }) {
  if (name === "bookClosed") return <Crop source={homeReference} sourceWidth={656} sourceHeight={996} x={389} y={886} cropWidth={81} cropHeight={81} width={size} rounded />;
  const icon = icons[name];
  return <Crop source={menuReference} sourceWidth={472} sourceHeight={1036} x={icon.x} y={icon.y} cropWidth={icon.size} cropHeight={icon.size} width={size} rounded={name !== "events"} />;
}

export function ReferencePortrait({ index, width }: { index: number; width: number }) {
  return <Crop source={homeReference} sourceWidth={656} sourceHeight={996} x={index === 0 ? 232 : index === 1 ? 367 : 503} y={692} cropWidth={index === 0 ? 124 : 125} cropHeight={127} width={width} />;
}
