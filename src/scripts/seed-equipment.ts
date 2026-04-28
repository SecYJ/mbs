import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { equipment } from "@/db/schema";

type EquipmentInput = typeof equipment.$inferInsert;

const tvs: EquipmentInput[] = [
    {
        name: '65" Crystal UHD Business TV',
        brand: "Samsung",
        model: "BE65C-H",
        price: 899,
        purchaseDate: "2025-09-15",
        warrantyExpiry: "2028-09-15",
    },
    {
        name: '55" QM-C Series Signage Display',
        brand: "Samsung",
        model: "QM55C",
        price: 1199,
        purchaseDate: "2026-01-10",
        warrantyExpiry: "2029-01-10",
    },
    {
        name: '65" UR640S Commercial Lite 4K UHD',
        brand: "LG",
        model: "65UR640S9UD",
        price: 849,
        purchaseDate: "2025-11-22",
        warrantyExpiry: null,
    },
    {
        name: '75" UR340C Commercial 4K UHD TV',
        brand: "LG",
        model: "75UR340C9UD",
        price: 1399,
        purchaseDate: "2026-02-05",
        warrantyExpiry: "2029-02-05",
    },
    {
        name: '65" B-Line Professional 4K Display',
        brand: "Philips",
        model: "65BFL2214/27",
        price: 899,
        purchaseDate: "2025-08-30",
        warrantyExpiry: null,
    },
    {
        name: '75" Q-Line 4K UHD Display',
        brand: "Philips",
        model: "75BDL3550Q",
        price: 1499,
        purchaseDate: "2026-03-12",
        warrantyExpiry: "2028-03-12",
    },
];

const chairs: EquipmentInput[] = [
    {
        name: "Stackable Office Visitor Chair",
        brand: "IKEA",
        model: "TEODORES",
        price: 45,
        quantity: 50,
        purchaseDate: "2025-04-10",
        warrantyExpiry: null,
    },
];

const projectors: EquipmentInput[] = [
    {
        name: "PowerLite W49 WXGA Business Projector",
        brand: "Epson",
        model: "EB-W49",
        price: 599,
        purchaseDate: "2025-07-18",
        warrantyExpiry: "2027-07-18",
    },
    {
        name: "MW560 WXGA Meeting Room Projector",
        brand: "BenQ",
        model: "MW560",
        price: 549,
        purchaseDate: "2025-10-05",
        warrantyExpiry: "2028-10-05",
    },
    {
        name: "PT-VMW60 WXGA Laser Projector",
        brand: "Panasonic",
        model: "PT-VMW60",
        price: 1399,
        purchaseDate: "2026-01-25",
        warrantyExpiry: "2029-01-25",
    },
];

const airConditioners: EquipmentInput[] = [
    {
        name: "FTKM Series Inverter Split AC 1.5HP",
        brand: "Daikin",
        model: "FTKM35QV2S",
        price: 749,
        purchaseDate: "2025-05-20",
        warrantyExpiry: "2030-05-20",
    },
    {
        name: "MSY-GN Cooling-Only Split AC 2.0HP",
        brand: "Mitsubishi",
        model: "MSY-GN18VF",
        price: 899,
        purchaseDate: "2025-05-20",
        warrantyExpiry: "2030-05-20",
    },
    {
        name: "Inverter Split AC 1.0HP",
        brand: "Panasonic",
        model: "CS-PU10VKH",
        price: 649,
        purchaseDate: "2025-06-12",
        warrantyExpiry: "2030-06-12",
    },
    {
        name: "WindFree Wall-Mount Split AC 1.5HP",
        brand: "Samsung",
        model: "AR12TYHYEWKNST",
        price: 829,
        purchaseDate: "2025-06-12",
        warrantyExpiry: "2030-06-12",
    },
];

const whiteboards: EquipmentInput[] = [
    {
        name: 'Standard Magnetic Whiteboard 4\' x 6\'',
        brand: "Quartet",
        model: "S537",
        price: 129,
        purchaseDate: "2025-03-15",
        warrantyExpiry: null,
    },
    {
        name: 'Magnetic Dry-Erase Whiteboard 3\' x 4\'',
        brand: "Quartet",
        model: "SM534",
        price: 89,
        purchaseDate: "2025-03-15",
        warrantyExpiry: null,
    },
    {
        name: 'Glass Dry-Erase Board 36" x 24"',
        brand: "U Brands",
        model: "2825U00-01",
        price: 159,
        purchaseDate: "2025-09-02",
        warrantyExpiry: null,
    },
    {
        name: "Mobile Magnetic Whiteboard with Stand",
        brand: "Luxor",
        model: "MB4836WW",
        price: 179,
        purchaseDate: "2025-09-02",
        warrantyExpiry: "2027-09-02",
    },
    {
        name: 'Standard Whiteboard 2\' x 3\'',
        brand: "Office Depot",
        model: "OD-WB23",
        price: 59,
        purchaseDate: "2025-03-15",
        warrantyExpiry: null,
    },
];

const sections: Record<string, EquipmentInput[]> = {
    tvs,
    chairs,
    projectors,
    airConditioners,
    whiteboards,
};

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const requested = args.filter((a) => a !== "--reset");
const toSeed = requested.length > 0 ? requested : Object.keys(sections);

for (const key of toSeed) {
    const rows = sections[key];
    if (!rows) {
        console.error(`Unknown section: ${key}. Available: ${Object.keys(sections).join(", ")}`);
        continue;
    }
    if (reset) {
        let deleted = 0;
        for (const row of rows) {
            const removed = await db
                .delete(equipment)
                .where(and(eq(equipment.brand, row.brand), eq(equipment.model, row.model)))
                .returning({ id: equipment.equipmentId });
            deleted += removed.length;
        }
        console.log(`[${key}] reset deleted ${deleted} rows`);
    }
    const inserted = await db.insert(equipment).values(rows).returning();
    console.log(`[${key}] inserted ${inserted.length} rows`);
}

process.exit(0);
