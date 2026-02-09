import {
    addDays,
    addMonths,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { classService } from '../services';

export default function Dashboard() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [instances, setInstances] = useState<any[]>([]); // Using any[] because backend returns partial objects
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Fetch classes for current month
    const fetchClasses = async () => {
        try {
            setIsLoading(true);
            const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

            const data = await classService.getCalendar(start, end);
            setInstances(data);
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [currentDate]); // Re-fetch when month changes

    // Navigate months
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Generate calendar days
    const generateCalendarDays = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        const days: Date[] = [];
        let day = calendarStart;

        while (day <= calendarEnd) {
            days.push(day);
            day = addDays(day, 1);
        }

        return days;
    };

    // Get classes for a specific day
    const getClassesForDay = (date: Date): any[] => {
        return instances.filter((instance) =>
            isSameDay(new Date(instance.date), date) && !instance.isCancelled
        );
    };

    // Get selected date's classes
    const selectedDateClasses = selectedDate ? getClassesForDay(selectedDate) : [];

    const days = generateCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <Header
                title="Dashboard"
                subtitle="View and manage your class schedule"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={goToToday}>
                                Today
                            </Button>
                            <button
                                onClick={prevMonth}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 mb-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-sm font-semibold text-slate-500 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-7 gap-1">
                            {[...Array(35)].map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square p-2 bg-slate-50 rounded-lg animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, index) => {
                                const dayClasses = getClassesForDay(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                      aspect-square p-2 rounded-lg text-left transition-all
                      ${isCurrentMonth ? 'bg-white' : 'bg-slate-50'}
                      ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''}
                      ${isToday(day) ? 'border-2 border-indigo-400' : ''}
                      hover:bg-slate-100
                    `}
                                    >
                                        <span
                                            className={`
                        text-sm font-medium
                        ${isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}
                        ${isToday(day) ? 'text-indigo-600' : ''}
                      `}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                        {dayClasses.length > 0 && (
                                            <div className="mt-1 space-y-0.5">
                                                {dayClasses.slice(0, 2).map((instance, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="text-xs truncate px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded"
                                                    >
                                                        {instance.class.title}
                                                    </div>
                                                ))}
                                                {dayClasses.length > 2 && (
                                                    <div className="text-xs text-slate-500 px-1">
                                                        +{dayClasses.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Selected Day Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                    </h3>

                    {!selectedDate ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarDays className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-sm">
                                Click on a date to view classes
                            </p>
                        </div>
                    ) : selectedDateClasses.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarDays className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-sm">
                                No classes scheduled for this day
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDateClasses.map((instance) => (
                                <div
                                    key={instance._id}
                                    className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                                >
                                    <h4 className="font-semibold text-slate-900 mb-2">
                                        {instance.class.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            {instance.startTime} - {instance.endTime}
                                        </span>
                                    </div>
                                    {instance.class.description && (
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                            {instance.class.description}
                                        </p>
                                    )}
                                    <div className="mt-2 text-xs text-slate-500">
                                        {instance.instructor.name} • {instance.roomType.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">This Month</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <div className="text-2xl font-bold text-indigo-600">
                                    {instances.length}
                                </div>
                                <div className="text-xs text-slate-500">Total Classes</div>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {instances.length}
                                </div>
                                <div className="text-xs text-slate-500">Scheduled</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
