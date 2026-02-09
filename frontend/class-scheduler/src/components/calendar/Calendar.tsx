import { format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, type ToolbarProps, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { ClassInstance } from '../../types';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Modern color palette
const EVENT_COLORS = [
    '#4f46e5', // Indigo 600
    '#059669', // Emerald 600
    '#d97706', // Amber 600
    '#db2777', // Pink 600
    '#7c3aed', // Violet 600
    '#0891b2', // Cyan 600
    '#ea580c', // Orange 600
    '#dc2626', // Red 600
];

const getEventColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % EVENT_COLORS.length;
    return EVENT_COLORS[index];
};

interface CalendarProps {
    events: ClassInstance[];
    onRangeChange: (range: Date[] | { start: Date; end: Date }) => void;
    onSelectEvent: (event: ClassInstance) => void;
    date: Date;
    onNavigate: (newDate: Date) => void;
    view?: View;
    onView?: (view: View) => void;
    toolbar?: boolean;
}

// Custom Toolbar Component
const CustomToolbar = (toolbar: ToolbarProps) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = toolbar.date;
        return (
            <span className="text-xl font-bold text-slate-800">
                {format(date, 'MMMM yyyy')}
            </span>
        );
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
                {label()}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={goToBack}
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToCurrent}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg">
                {[
                    { label: 'Month', value: Views.MONTH },
                    { label: 'Week', value: Views.WEEK },
                    { label: 'Day', value: Views.DAY },
                    { label: 'List', value: Views.AGENDA },
                ].map((view) => (
                    <button
                        key={view.value}
                        onClick={() => toolbar.onView(view.value)}
                        className={`
                            px-4 py-1.5 text-sm font-medium rounded-md transition-all
                            ${toolbar.view === view.value
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }
                        `}
                    >
                        {view.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Custom Event Component
const CustomEvent = ({ event }: any) => {
    return (
        <div className="h-full flex flex-col leading-tight overflow-hidden">
            <div className="font-semibold text-xs truncate">{event.title}</div>
            <div className="text-[10px] opacity-90 truncate">
                {event.resource?.instructor?.name?.split(' ')[0]} • {event.resource?.roomType?.name}
            </div>
            <div className="text-[10px] opacity-75 mt-0.5">
                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </div>
        </div>
    );
};

export default function Calendar({
    events,
    onRangeChange,
    onSelectEvent,
    date,
    onNavigate,
    view = Views.MONTH,
    onView,
    toolbar = true
}: CalendarProps) {
    // Transform instances to calendar events
    const calendarEvents = useMemo(() => {
        return events.map(instance => {
            const start = new Date(`${instance.date.split('T')[0]}T${instance.startTime}`);
            const end = new Date(`${instance.date.split('T')[0]}T${instance.endTime}`);

            return {
                ...instance,
                title: typeof instance.class === 'string' ? 'Class' : instance.class.title,
                start,
                end,
                resource: instance
            };
        });
    }, [events]);

    return (
        <div className="h-full bg-white rounded-xl">
            <style>{`
                .rbc-calendar { font-family: inherit; }
                .rbc-header { padding: 12px 4px; font-weight: 600; color: #64748b; font-size: 0.875rem; border-bottom: 1px solid #e2e8f0; }
                .rbc-off-range-bg { bg-slate-50; }
                .rbc-today { background-color: #eef2ff; }
                .rbc-event { 
                    border-radius: 6px; 
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); 
                    padding: 2px 5px !important;
                    min-height: 50px; /* Force minimum height for clarity */
                }
                .rbc-row-content { z-index: 4; } /* Fix overlapping */
                .rbc-time-view .rbc-header { border-bottom: 2px solid #e2e8f0; }
                .rbc-agenda-view table.rbc-agenda-table { border: 1px solid #e2e8f0; }
                .rbc-month-view .rbc-header { padding: 8px; }
                .rbc-month-row { overflow: visible; } /* Allow content to be seen */
            `}</style>

            <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                date={date}
                onNavigate={onNavigate}
                onRangeChange={onRangeChange}
                onSelectEvent={(event) => onSelectEvent(event as unknown as ClassInstance)}
                view={view}
                onView={onView}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                components={{
                    toolbar: toolbar ? (props: any) => <CustomToolbar {...props} /> : () => null,
                    event: CustomEvent,
                }}


                popup
                eventPropGetter={(event) => {
                    const resource = (event as any).resource;
                    // Color based on room type ID if available, else instructor, else default
                    const colorId = resource?.roomType?._id || resource?.instructor?._id || 'default';
                    const backgroundColor = getEventColor(colorId);

                    return {
                        style: {
                            backgroundColor,
                            border: 'none',
                            color: 'white',
                            fontSize: '0.8rem',
                            padding: '2px 5px'
                        }
                    };
                }}
            />
        </div>
    );
}
