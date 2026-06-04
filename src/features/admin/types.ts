import type { UserRole } from "@/lib/roles";

type RoomEquipmentLine = {
    id: string;
    name: string;
    brand: string;
    model: string;
    quantity: number;
};

export type Room = {
    id: string;
    name: string;
    location: string;
    capacity: number;
    active: boolean;
    equipment: RoomEquipmentLine[];
};

export type Equipment = {
    id: string;
    name: string;
    brand: string;
    model: string;
    price: number;
    quantity: number;
    purchaseDate: string;
    warrantyExpiry: string | null;
};

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastLogin: string;
    lastLoginAt: string | null;
    image: string | null;
};
