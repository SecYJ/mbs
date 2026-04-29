// Shared Tailwind utility chains for admin surfaces.
// Pairs with admin.css which still owns design-token CSS variables (.admin-shell),
// @keyframes definitions, and the ::-webkit-scrollbar selectors that Tailwind v4 cannot express.

export const adminInputClasses =
    "h-9 rounded-lg border border-(--a-border-hover) bg-(--a-bg) px-3 font-[inherit] text-[0.8125rem] text-(--a-text) outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-(--a-text-muted) focus:border-(--a-accent-border) focus:shadow-[0_0_0_3px_var(--a-accent-subtle)]";

export const adminSelectClasses =
    "h-9 cursor-pointer appearance-none rounded-lg border border-(--a-border-hover) bg-(--a-bg) bg-[url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='12'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23959db6'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpolyline%20points='6%209%2012%2015%2018%209'%3E%3C/polyline%3E%3C/svg%3E\")] bg-[position:right_0.5rem_center] bg-no-repeat py-0 pr-8 pl-3 font-[inherit] text-[0.8125rem] text-(--a-text) outline-none transition-[border-color,box-shadow] duration-150 focus:border-(--a-accent-border) focus:shadow-[0_0_0_3px_var(--a-accent-subtle)]";

export const adminBadgeClasses =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] leading-[1.5] font-semibold tracking-[0.02em]";

export const adminStatCardClasses =
    "rounded-xl border border-(--a-border) bg-[linear-gradient(135deg,var(--a-surface-1)_0%,var(--a-surface-2)_100%)] px-5 py-4 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-(--a-border-hover)";

export const adminRuleCardClasses =
    "rounded-xl border border-(--a-border) bg-(--a-surface-1) p-6 transition-[border-color] duration-150 hover:border-(--a-border-hover)";

// .admin-table* (descendant rules on th/td/tr) stays in admin.css as the documented fallback —
// migrating would require touching every <th>/<td>/<tr> across 4 pages and 2 row components for
// duplicated utility chains. Descendant CSS is the cleaner expression here.

// Toggle thumb is a ::after pseudo-element. Tailwind expresses it with the after: variant
// + arbitrary content-[''] (Tailwind v4 supports this).
export const adminToggleClasses =
    "relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-0 bg-(--a-surface-3) transition-colors duration-200 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.3)] after:transition-[transform,box-shadow] after:duration-200 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] after:content-[''] data-[state=on]:bg-(--a-success) data-[state=on]:after:translate-x-4";

// Toast / confirm / expand-row keyframes still live in admin.css; reference them inline.
export const adminToastClasses =
    "animate-[admin-toast-in_280ms_cubic-bezier(0.16,1,0.3,1)_both] data-[leaving=true]:animate-[admin-toast-out_200ms_ease_both]";

export const adminConfirmClasses = "animate-[admin-confirm-in_180ms_cubic-bezier(0.16,1,0.3,1)_both]";

export const adminExpandRowClasses = "overflow-hidden animate-[admin-expand_250ms_ease_both]";
