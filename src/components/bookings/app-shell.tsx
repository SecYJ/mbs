import { Link, useMatches } from "@tanstack/react-router";
import {
	Calendar,
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	LayoutGrid,
	LogOut,
	Bell,
	Settings,
	User,
	DoorOpen,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ id: "calendar", to: "/bookings" as const, label: "Calendar", icon: Calendar },
	{ id: "my-bookings", to: "/bookings" as const, label: "My Bookings", icon: CalendarDays },
	{ id: "rooms", to: "/bookings" as const, label: "Rooms", icon: DoorOpen },
];

function SidebarNav({ collapsed }: { collapsed: boolean }) {
	const matches = useMatches();
	const currentPath = matches.at(-1)?.fullPath ?? "";

	return (
		<nav className="flex flex-col gap-0.5 px-3">
			{NAV_ITEMS.map((item) => {
				const isActive = item.id === "calendar" && currentPath === "/bookings";

				const linkContent = (
					<Link
						to={item.to}
						className={cn(
							"group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[0.8rem] font-medium transition-all duration-150",
							isActive
								? "bg-[var(--accent-green-subtle)] text-[var(--text-primary)]"
								: "text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text-secondary)]",
							collapsed && "justify-center px-2.5"
						)}
					>
						<item.icon
							className={cn(
								"shrink-0 transition-colors",
								isActive ? "text-[var(--accent-green)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
							)}
							size={18}
							strokeWidth={1.6}
						/>
						{!collapsed && <span>{item.label}</span>}
					</Link>
				);

				if (collapsed) {
					return (
						<Tooltip key={item.id}>
							<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
							<TooltipContent side="right" sideOffset={8}>
								{item.label}
							</TooltipContent>
						</Tooltip>
					);
				}

				return <div key={item.id}>{linkContent}</div>;
			})}
		</nav>
	);
}

function NotificationBell() {
	const unreadCount = 3;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]"
				>
					<Bell size={18} strokeWidth={1.6} />
					{unreadCount > 0 && (
						<span className="absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>Notifications</TooltipContent>
		</Tooltip>
	);
}

function UserMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2 py-1.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
				>
					<Avatar className="size-8 border border-[var(--border-subtle)]">
						<AvatarFallback className="bg-[var(--bg-active)] text-xs font-semibold text-[var(--text-secondary)]">
							JD
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-52 border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
			>
				<div className="px-3 py-2.5">
					<p className="text-sm font-medium text-[var(--text-primary)]">John Doe</p>
					<p className="text-xs text-[var(--text-tertiary)]">john@company.com</p>
				</div>
				<DropdownMenuSeparator className="bg-[var(--border-grid)]" />
				<DropdownMenuItem className="gap-2 text-[var(--text-tertiary)] focus:bg-[rgba(255,255,255,0.04)] focus:text-[var(--text-secondary)]">
					<User size={15} strokeWidth={1.6} />
					Profile
				</DropdownMenuItem>
				<DropdownMenuItem className="gap-2 text-[var(--text-tertiary)] focus:bg-[rgba(255,255,255,0.04)] focus:text-[var(--text-secondary)]">
					<Settings size={15} strokeWidth={1.6} />
					Settings
				</DropdownMenuItem>
				<DropdownMenuSeparator className="bg-[var(--border-grid)]" />
				<DropdownMenuItem className="gap-2 text-[var(--danger)] focus:bg-[rgba(239,68,68,0.06)] focus:text-[var(--danger)]">
					<LogOut size={15} strokeWidth={1.6} />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	return (
		<TooltipProvider delayDuration={200}>
			<div className="flex h-dvh overflow-hidden bg-[var(--bg-base)]">
				{/* Sidebar */}
				<aside
					className={cn(
						"flex shrink-0 flex-col border-r border-[var(--border-grid)] bg-[var(--bg-base)] transition-[width] duration-200",
						sidebarCollapsed ? "w-[68px]" : "w-[240px]"
					)}
				>
					{/* Logo */}
					<div
						className={cn(
							"flex h-14 shrink-0 items-center border-b border-[var(--border-grid)] px-4",
							sidebarCollapsed && "justify-center px-2"
						)}
					>
						<div className="flex items-center gap-2.5">
							<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent-green-subtle)]">
								<LayoutGrid size={16} className="text-[var(--accent-green)]" strokeWidth={1.8} />
							</div>
							{!sidebarCollapsed && (
								<span className="text-[0.82rem] font-bold tracking-tight text-[var(--text-primary)]">
									MeetBook
								</span>
							)}
						</div>
					</div>

					{/* Nav */}
					<div className="mt-6 flex-1 overflow-y-auto">
						{!sidebarCollapsed && (
							<p className="mb-2 px-6 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
								Navigation
							</p>
						)}
						<SidebarNav collapsed={sidebarCollapsed} />
					</div>

					{/* Collapse toggle */}
					<div className="shrink-0 border-t border-[var(--border-grid)] p-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSidebarCollapsed((prev) => !prev)}
							className={cn(
								"w-full text-[var(--text-tertiary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-secondary)]",
								sidebarCollapsed && "px-0"
							)}
						>
							{sidebarCollapsed ? (
								<ChevronRight size={16} strokeWidth={1.6} />
							) : (
								<>
									<ChevronLeft size={16} strokeWidth={1.6} />
									<span className="text-xs">Collapse</span>
								</>
							)}
						</Button>
					</div>
				</aside>

				{/* Main content */}
				<div className="flex flex-1 flex-col overflow-hidden">
					<header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-grid)] bg-[var(--bg-base)] px-6 backdrop-blur-sm">
						<div />
						<div className="flex items-center gap-2">
							<NotificationBell />
							<Separator
								orientation="vertical"
								className="mx-1 h-6 bg-[var(--border-grid)]"
							/>
							<UserMenu />
						</div>
					</header>

					<main className="flex-1 overflow-y-auto overflow-x-hidden">
						{children}
					</main>
				</div>
			</div>
		</TooltipProvider>
	);
}
