import { EditBookingDialog } from "@/features/my-bookings/components/EditBookingDialog";
import { MyBookingsEditProvider } from "@/features/my-bookings/components/MyBookingsEditProvider";
import { MyBookingsFormProvider } from "@/features/my-bookings/components/MyBookingsFormProvider";
import { MyBookingsHeader } from "@/features/my-bookings/components/MyBookingsHeader";
import { MyBookingsPageHost } from "@/features/my-bookings/components/MyBookingsPageHost";

export const MyBookingsPage = () => (
    <MyBookingsFormProvider>
        <MyBookingsEditProvider>
            <div className="mx-auto w-full max-w-7xl space-y-8">
                <MyBookingsHeader />
                <MyBookingsPageHost />
            </div>
            <EditBookingDialog />
        </MyBookingsEditProvider>
    </MyBookingsFormProvider>
);
