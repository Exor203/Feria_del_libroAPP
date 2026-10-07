export type AvailabilityStatus = "available" | "low_stock" | "out_of_stock";

export interface Book { id: string; title: string; author: string; genres: string[]; synopsis: string; }
export interface InventoryItem { bookId: string; standId: string; status: AvailabilityStatus; quantity: number; updatedAt: string; }
export interface EventItem { id: string; title: string; startsAt: string; endsAt: string; venue: string; description: string; }
export interface Artist { id: string; name: string; biography: string; }
export interface MapPoint { id: string; name: string; category: "stand" | "auditorium" | "service" | "entrance"; }
