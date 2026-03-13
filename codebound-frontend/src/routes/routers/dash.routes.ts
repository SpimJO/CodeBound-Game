import { DashboardLayout } from "../_root"
import Dashboard from "@/app/(dashboard)/Dashboard"
import { createRoute, redirect } from "@tanstack/react-router"

export const DashboardRoute = createRoute({
    getParentRoute: () => DashboardLayout,
    path: "/",
    beforeLoad: () => {
        throw redirect({ to: "/" });
    },
    component: Dashboard
})