import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

export type ShelfBook = { id: string; title: string; author: string; isbn?: string };
export type Trade = { id: string; offered: ShelfBook; received: ShelfBook; status: "Pendiente" | "Aceptado" | "Finalizado" };
type Library = { books: ShelfBook[]; trades: Trade[] };
const empty: Library = { books: [], trades: [] };

export function useLibrary(uid: string, onError: () => void) {
  const key = `feria-library-v1:${uid}`;
  const [snapshot, setSnapshot] = useState<{ key: string; value: Library }>();
  const current = useRef(snapshot);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    if (!uid) return;
    let active = true;
    void writes.current.then(() => AsyncStorage.getItem(key)).then(raw => {
      if (!active) return;
      current.current = { key, value: raw ? JSON.parse(raw) : empty };
      setSnapshot(current.current);
    }).catch(() => { if (active) onError(); });
    return () => { active = false; };
  }, [key, onError, uid]);

  function update(change: (value: Library) => Library) {
    if (current.current?.key !== key) return;
    const next = { key, value: change(current.current.value) };
    current.current = next;
    setSnapshot(next);
    writes.current = writes.current.then(() => AsyncStorage.setItem(key, JSON.stringify(next.value))).catch(onError);
  }

  return {
    ...(snapshot?.key === key ? snapshot.value : empty),
    ready: snapshot?.key === key,
    save: (book: ShelfBook) => update(value => ({
      ...value, books: value.books.some(item => item.id === book.id) ? value.books : [...value.books, book],
    })),
    addTrade: (trade: Trade) => update(value => ({ ...value, trades: [trade, ...value.trades] })),
  };
}

export function readIsbn(value: string) {
  const isbn = value.trim();
  if (!/^97[89]\d{10}$/.test(isbn)) return null;
  const sum = [...isbn].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  return sum % 10 === 0 ? isbn : null;
}
