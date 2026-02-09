import {
    CalendarDays,
    DoorOpen,
    GraduationCap,
    LayoutDashboard,
    Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/room-types', icon: DoorOpen, label: 'Room Types' },
    { to: '/instructors', icon: Users, label: 'Instructors' },
    { to: '/classes', icon: CalendarDays, label: 'Classes' },
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">Class</h1>
                        <p className="text-xs text-slate-400">Scheduler</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">
                    © 2026 PlexBit
                </p>
            </div>
        </aside>
    );
}
