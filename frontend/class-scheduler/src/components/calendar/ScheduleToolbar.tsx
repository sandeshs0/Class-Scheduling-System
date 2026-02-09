import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Views, type View } from 'react-big-calendar';

interface ScheduleToolbarProps {
    date: Date;
    view: View;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    onViewChange: (view: View) => void;
}

export default function ScheduleToolbar({ date, view, onNavigate, onViewChange }: ScheduleToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-slate-800">
                    {format(date, 'MMMM yyyy')}
                </span>
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"
                        title="Previous"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onNavigate('TODAY')}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"
                        title="Next"
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
                ].map((v) => (
                    <button
                        key={v.value}
                        onClick={() => onViewChange(v.value)}
                        className={`
                            px-4 py-1.5 text-sm font-medium rounded-md transition-all
                            ${view === v.value
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }
                        `}
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
