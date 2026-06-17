import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RoomCollectionSelectProps<TValue extends string> = {
    label: string;
    value: TValue;
    items: Array<{ label: string; value: TValue }>;
    onValueChange: (value: TValue) => void;
};

export const RoomCollectionSelect = <TValue extends string>({
    label,
    value,
    items,
    onValueChange,
}: RoomCollectionSelectProps<TValue>) => (
    <Select
        value={value}
        onValueChange={(nextValue) => {
            if (!nextValue) return;

            onValueChange(nextValue);
        }}
        items={items}
    >
        <SelectTrigger
            aria-label={label}
            size="sm"
            className="h-9 rounded-lg border-(--a-border-hover) bg-(--a-bg) px-3 text-[0.8125rem] text-(--a-text) shadow-none hover:bg-(--a-surface-1) focus-visible:border-(--a-accent-border) focus-visible:ring-(--a-accent-subtle) [&>svg]:text-(--a-text-muted)"
        >
            <SelectValue />
        </SelectTrigger>
        <SelectContent
            align="end"
            className="admin-shell min-w-40 border-(--a-border-hover) bg-(--a-surface-0) text-(--a-text)"
        >
            {items.map((item) => (
                <SelectItem
                    key={item.value}
                    value={item.value}
                    className="text-[0.8125rem] text-(--a-text) data-highlighted:bg-(--a-surface-2) data-highlighted:text-(--a-text)"
                >
                    {item.label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
