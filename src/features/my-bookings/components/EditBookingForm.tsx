import { Save } from "lucide-react";
import { Controller, FormProvider, FormStateSubscribe, Watch } from "react-hook-form";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EditBookingAttendeesField } from "@/features/my-bookings/components/EditBookingAttendeesField";
import { EditBookingDateTimeField } from "@/features/my-bookings/components/EditBookingDateTimeField";
import { useEditBookingForm } from "@/features/my-bookings/hooks/useEditBookingForm";
import type { BookingHistoryItem } from "@/features/my-bookings/my-bookings.constants";

type EditBookingFormProps = {
    booking: BookingHistoryItem;
    onCancel: () => void;
};

export const EditBookingForm = ({ booking, onCancel }: EditBookingFormProps) => {
    const { form, isSubmitting, minimumStartTime, rooms, serverError, onSubmit } = useEditBookingForm({
        booking,
        onSuccess: onCancel,
    });

    return (
        <FormProvider {...form}>
            <div>
                <p className="eyebrow text-(--gold)">Edit Reservation</p>
                <DialogTitle className="display-italic mt-2 text-[1.75rem] leading-[1.05] font-normal text-(--bone)">
                    Update the booking.
                </DialogTitle>
                <DialogDescription className="mt-2 text-[0.78rem] text-(--bone-muted)">
                    Adjust the room, time, attendees, or notes for this reservation.
                </DialogDescription>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-6 border-t border-(--hairline) pt-6">
                <div className="space-y-2">
                    <Label className="eyebrow block">Meeting Title</Label>
                    <Controller
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="e.g. Sprint Planning"
                                required
                                className="h-10 rounded-none border-0 border-b border-(--hairline) bg-transparent px-0 text-[0.9rem] text-(--bone) shadow-none focus-visible:ring-0 placeholder:text-(--bone-faint)"
                            />
                        )}
                    />
                </div>

                <Controller
                    control={form.control}
                    name="roomId"
                    render={({ field }) => (
                        <div className="space-y-2">
                            <Label className="eyebrow block">Room</Label>
                            <Select
                                value={field.value}
                                onValueChange={(value) => field.onChange(value ?? "")}
                                items={rooms.map((room) => ({ value: room.id, label: room.title }))}
                                required
                            >
                                <SelectTrigger className="h-10 w-full rounded-none border-0 border-b border-(--hairline) bg-transparent px-0 text-[0.9rem] text-(--bone) shadow-none ring-0 focus:border-(--gold) focus:ring-0 [&>svg]:text-(--bone-dim)">
                                    <SelectValue placeholder="Select a room" />
                                </SelectTrigger>
                                <SelectContent className="w-(--anchor-width) rounded-none border-(--hairline) bg-(--surface-02)">
                                    {rooms.map((room) => (
                                        <SelectItem
                                            key={room.id}
                                            value={room.id}
                                            className="rounded-none text-(--bone) focus:bg-(--gold-wash) focus:text-(--bone)"
                                        >
                                            <span className="font-medium">{room.title}</span>
                                            <span className="tabular-num ml-2 text-(--bone-dim)">
                                                &middot; {room.location} &middot; {room.capacity}p &middot; max{" "}
                                                {room.maxBookingDurationHours}h
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />

                <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                    <Controller
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <EditBookingDateTimeField
                                label="Start Time"
                                min={minimumStartTime}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <Watch
                                control={form.control}
                                name="startTime"
                                compute={(startTime) => (startTime > minimumStartTime ? startTime : minimumStartTime)}
                                render={(minimumEndTime) => (
                                    <EditBookingDateTimeField
                                        label="End Time"
                                        min={minimumEndTime}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        )}
                    />
                </div>

                <EditBookingAttendeesField />

                <div className="space-y-2">
                    <Label className="eyebrow block">
                        Description <span className="ml-1 text-(--bone-faint)">(optional)</span>
                    </Label>
                    <Controller
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Meeting agenda or notes..."
                                rows={3}
                                className="resize-none rounded-none border border-(--hairline) bg-(--surface-02) px-3 py-2.5 text-[0.88rem] leading-relaxed text-(--bone) shadow-none placeholder:text-(--bone-faint) focus:border-(--gold) focus-visible:ring-0"
                            />
                        )}
                    />
                </div>

                <FormStateSubscribe
                    control={form.control}
                    render={({ errors, isValid }) => {
                        const fieldError = Object.values(errors).find((error) => error?.message)?.message;
                        const message = fieldError ?? serverError;

                        return (
                            <>
                                {message ? (
                                    <p className="border border-red-400/30 bg-red-500/10 px-3 py-2 text-[0.75rem] text-red-200">
                                        {message}
                                    </p>
                                ) : null}

                                <div className="flex gap-3 border-t border-(--hairline) pt-5">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                        className="flex-1 cursor-pointer border border-(--hairline) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-(--bone-muted) uppercase transition-all hover:border-(--hairline-strong) hover:text-(--bone) disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isValid}
                                        className="flex flex-1 cursor-pointer items-center justify-center gap-2 border border-(--bone) bg-(--bone) py-2.5 text-[0.66rem] font-semibold tracking-[0.28em] text-black uppercase transition-all hover:bg-white hover:tracking-[0.32em] disabled:cursor-wait disabled:opacity-70"
                                    >
                                        <span>{isSubmitting ? "Saving" : "Save"}</span>
                                        <Save className="size-4" strokeWidth={1.6} />
                                    </button>
                                </div>
                            </>
                        );
                    }}
                />
            </form>
        </FormProvider>
    );
};
