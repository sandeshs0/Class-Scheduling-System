import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { Calendar as CalendarIcon, LayoutList, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Views, type View } from 'react-big-calendar';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/calendar/Calendar';
import ClassList from '../components/calendar/ClassList';
import ScheduleToolbar from '../components/calendar/ScheduleToolbar';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { classService } from '../services';
import type { ClassInstance } from '../types';

export default function Dashboard() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [instances, setInstances] = useState<ClassInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<View>(Views.MONTH);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [selectedEvent, setSelectedEvent] = useState<ClassInstance | null>(null);

    const fetchCalendarData = async (date: Date, currentView: View) => {
        try {
            setIsLoading(true);
            let start: Date, end: Date;

            if (currentView === Views.MONTH) {
                start = startOfWeek(startOfMonth(date));
                end = endOfWeek(endOfMonth(date));
            } else if (currentView === Views.WEEK) {
                start = startOfWeek(date);
                end = endOfWeek(date);
            } else {
                start = startOfWeek(date); 
                end = endOfWeek(date);
            }

            const startDate = format(start, 'yyyy-MM-dd');
            const endDate = format(end, 'yyyy-MM-dd');

            const data = await classService.getCalendar(startDate, endDate);
            setInstances(data);
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarData(currentDate, view);
    }, [currentDate, view]);

    const handleRangeChange = (_range: Date[] | { start: Date; end: Date }) => {
    };

    const handleCalendarNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
    };

    const handleToolbarNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        if (action === 'TODAY') {
            setCurrentDate(new Date());
            return;
        }

        switch (view) {
            case Views.MONTH:
                setCurrentDate(prev => action === 'NEXT' ? addMonths(prev, 1) : subMonths(prev, 1));
                break;
            case Views.WEEK:
                setCurrentDate(prev => action === 'NEXT' ? addWeeks(prev, 1) : subWeeks(prev, 1));
                break;
            case Views.DAY:
                setCurrentDate(prev => action === 'NEXT' ? addDays(prev, 1) : subDays(prev, 1));
                break;
            default:
                break;
        }
    };

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const handleSelectEvent = (event: ClassInstance) => {
        setSelectedEvent(event);
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.6))] flex flex-col p-6 space-y-2">
            <Header
                title="Class Schedule"
                actions={
                    <Button onClick={() => navigate('/classes?action=create')}>
                        <Plus className="w-4 h-4" />
                        Create Class Schedule
                    </Button>
                }
            />

            <div className="flex flex-col gap-4">
                <div className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`
                            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
                            ${viewMode === 'calendar'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }
                        `}
                    >
                        <CalendarIcon className="w-4 h-4" />
                        Calendar
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`
                            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
                            ${viewMode === 'list'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }
                        `}
                    >
                        <LayoutList className="w-4 h-4" />
                        List
                    </button>
                </div>

                <ScheduleToolbar
                    date={currentDate}
                    view={view}
                    onNavigate={handleToolbarNavigate}
                    onViewChange={handleViewChange}
                />
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 relative flex flex-col">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {viewMode === 'calendar' ? (
                    <Calendar
                        events={instances}
                        date={currentDate}
                        onNavigate={handleCalendarNavigate}
                        onRangeChange={handleRangeChange}
                        onSelectEvent={handleSelectEvent}
                        view={view}
                        onView={handleViewChange}
                        toolbar={false}
                    />
                ) : (
                    <div className="flex-1 overflow-auto">
                        <ClassList
                            instances={instances}
                            onSelectEvent={handleSelectEvent}
                        />
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title="Class Details"
                size="md"
            >
                {selectedEvent && (
                    <div className="space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-900">
                                {typeof selectedEvent.class === 'string' ? 'Class' : selectedEvent.class.title}
                            </h3>
                            {typeof selectedEvent.class !== 'string' && selectedEvent.class.description && (
                                <p className="text-slate-500 mt-1">{selectedEvent.class.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time</span>
                                <div className="mt-1 font-medium text-slate-900 flex items-center gap-2">
                                    {selectedEvent.startTime} - {selectedEvent.endTime}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</span>
                                <div className="mt-1 font-medium text-slate-900">
                                    {format(new Date(selectedEvent.date), 'MMM d, yyyy')}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                    <span className="text-xs font-bold">IN</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {typeof selectedEvent.instructor === 'string' ? 'Instructor' : selectedEvent.instructor.name}
                                    </p>
                                    <p className="text-xs text-slate-500">Instructor</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <span className="text-xs font-bold">RM</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {typeof selectedEvent.roomType === 'string' ? 'Room' : selectedEvent.roomType.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Room Type
                                        {typeof selectedEvent.roomType !== 'string' && ` • Capacity: ${selectedEvent.roomType.capacity}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
