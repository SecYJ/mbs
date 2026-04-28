export interface RoomEquipmentLine {
    id: string;
    name: string;
    brand: string;
    model: string;
    quantity: number;
}

export interface Room {
    id: string;
    name: string;
    location: string;
    capacity: number;
    active: boolean;
    equipment: RoomEquipmentLine[];
}

export interface Equipment {
    id: string;
    name: string;
    brand: string;
    model: string;
    price: number;
    quantity: number;
    purchaseDate: string;
    warrantyExpiry: string | null;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    lastLogin: string;
    lastLoginAt: string | null;
    image: string | null;
    avatarColor: string;
}
