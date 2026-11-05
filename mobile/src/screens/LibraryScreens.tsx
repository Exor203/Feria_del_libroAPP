import { useEffect, useRef, useState } from "react";
import { Alert, Linking, Share, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { FairScroll, Heading, Pill, ui } from "../components/FairUi";
import { readIsbn, type ShelfBook, type Trade } from "../services/library";

export function ProfileScreen({ name, books, trades, onCamera, onTrading, signingOut, onSignOut }: {
  name: string; books: ShelfBook[]; trades: Trade[]; onCamera: () => void; onTrading: () => void;
  signingOut: boolean; onSignOut: () => void;
}) {
  const [tab, setTab] = useState<"books" | "trades">("books");
  return <FairScroll>
    <Heading title="Mi perfil" subtitle={name} />
    <View style={ui.row}>
      <Pill label="Libros guardados" active={tab === "books"} onPress={() => setTab("books")} />
      <Pill label="Intercambios" active={tab === "trades"} onPress={() => setTab("trades")} />
    </View>
    {tab === "books" ? <>
      {books.length === 0 && <Text style={ui.body}>Tus libros guardados van a aparecer acá.</Text>}
      {books.map(book => <View key={book.id} style={ui.card}>
        <Text style={ui.heading}>{book.title}</Text>
        {!!book.author && <Text style={ui.body}>{book.author}</Text>}
        <Pill label="Compartir" onPress={() => {
          const message = [book.title, book.author, book.isbn && `ISBN ${book.isbn}`].filter(Boolean).join("\n");
          void Share.share({ message }).catch(() => Alert.alert("No se pudo compartir el libro"));
        }} />
      </View>)}
      <Pill label="Escanear un libro" active onPress={onCamera} />
    </> : <>
      {trades.length === 0 && <Text style={ui.body}>Tus intercambios de prueba van a aparecer acá.</Text>}
      {trades.map(trade => <View key={trade.id} style={ui.card}>
        <Text style={ui.heading}>{trade.offered.title} ↔ {trade.received.title}</Text>
        <Text style={ui.body}>{trade.status}</Text>
      </View>)}
      <Pill label="Ir a Trading" active onPress={onTrading} />
    </>}
    <Pill label={signingOut ? "Saliendo…" : "Cerrar sesión"} disabled={signingOut} onPress={onSignOut} />
  </FairScroll>;
}

export function ScannerScreen({ onSave, ready, active }: { onSave: (book: ShelfBook) => void; ready: boolean; active: boolean }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isbn, setIsbn] = useState<string>();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const locked = useRef(false);
  useEffect(() => {
    if (!isbn) return;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 7000);
    const key = `ISBN:${isbn}`;
    let mounted = true;
    setLoading(true);
    void fetch(`https://openlibrary.org/api/books?bibkeys=${key}&jscmd=data&format=json`, { signal: abort.signal })
      .then(response => { if (!response.ok) throw new Error("ISBN"); return response.json(); })
      .then(data => {
        if (!mounted) return;
        const entry = data[key] as { title?: string; authors?: { name: string }[] } | undefined;
        setTitle(entry?.title ?? "");
        setAuthor(entry?.authors?.map(item => item.name).join(", ") ?? "");
      }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; clearTimeout(timeout); abort.abort(); };
  }, [isbn]);

  return <FairScroll>
    <Heading title="Cámara" subtitle="Sumá libros a tu perfil" />
    {isbn ? <View style={ui.card}>
      <Text style={ui.heading}>ISBN {isbn}</Text>
      {loading ? <Text style={ui.body}>Buscando el libro…</Text> : <>
        <TextInput style={ui.input} placeholder="Título" accessibilityLabel="Título" value={title} onChangeText={setTitle} />
        <TextInput style={ui.input} placeholder="Autor" accessibilityLabel="Autor" value={author} onChangeText={setAuthor} />
        <Pill label="Guardar en mi perfil" active disabled={!title.trim() || !ready} onPress={() => onSave({ id: isbn, isbn, title: title.trim(), author: author.trim() })} />
      </>}
      <Pill label="Escanear otro" onPress={() => { setIsbn(undefined); setTitle(""); setAuthor(""); locked.current = false; }} />
    </View> : <>
      <Text style={ui.body}>Apuntá al código de barras de la contratapa.</Text>
      {permission?.granted ? <View style={{ height: 320, borderRadius: 24, overflow: "hidden" }}>
        {active && <CameraView style={{ flex: 1 }} barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
          onBarcodeScanned={({ data }) => {
            const result = readIsbn(data);
            if (!result || locked.current) return;
            locked.current = true;
            setIsbn(result);
          }} />}
      </View> : permission && <Pill label={permission.canAskAgain ? "Permitir cámara" : "Abrir ajustes"} active onPress={() => {
        const action = permission.canAskAgain ? requestPermission() : Linking.openSettings();
        void action.catch(() => Alert.alert("No se pudo abrir el permiso de cámara"));
      }} />}
    </>}
  </FairScroll>;
}
