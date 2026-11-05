import { Image } from "react-native";

const art = {
  books: require("../../assets/menu/books.png"),
  exchange: require("../../assets/menu/exchange.png"),
  game: require("../../assets/menu/game.png"),
  events: require("../../assets/menu/events.png"),
  map: require("../../assets/menu/map.png"),
  artists: require("../../assets/menu/artists.png"),
  assistant: require("../../assets/menu/assistant.png"),
  camera: require("../../assets/menu/camera.png"),
  profile: require("../../assets/menu/profile.png"),
  bookOpen: require("../../assets/menu/bookOpen.png"),
  bookClosed: require("../../assets/menu/bookClosed.png"),
} as const;
export type MenuArtName = keyof typeof art;

export function MenuArt({ name, size }: { name: MenuArtName; size: number }) {
  return <Image source={art[name]} accessible={false} resizeMode="contain" style={{ width: size, height: size }} />;
}
