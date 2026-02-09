import { format, isPast } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import type { ClassInstance } from '../../types';

interface ClassListProps {
    instances: ClassInstance[];
    onSelectEvent: (instance: ClassInstance) => void;
}

export default function ClassList({ instances, onSelectEvent }: ClassListProps) {
    const getStatus = (instance: ClassInstance) => {
        if (instance.isCancelled) return { label: 'Cancelled', className: 'bg-rose-100 text-rose-700' };

        const endDateTime = new Date(`${instance.date}T${instance.endTime}`);
        if (isPast(endDateTime)) return { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' };

        return { label: 'Scheduled', className: 'bg-amber-100 text-amber-700' };
    };

    const sortedInstances = [...instances].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200">
                        <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                        <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                        <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructor</th>
                        <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room</th>
                        <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedInstances.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                                No classes found for this period.
                            </td>
                        </tr>
                    ) : (
                        sortedInstances.map((instance) => {
                            const status = getStatus(instance);
                            const instructorName = typeof instance.instructor === 'string'
                                ? 'Unknown'
                                : instance.instructor.name;
                            const roomName = typeof instance.roomType === 'string'
                                ? 'Unknown'
                                : instance.roomType.name;
                            const classTitle = typeof instance.class === 'string'
                                ? 'Unknown'
                                : instance.class.title;

                            return (
                                <tr
                                    key={instance._id}
                                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                    onClick={() => onSelectEvent(instance)}
                                >
                                    <td className="py-4 px-4 text-sm font-medium text-slate-900">
                                        {format(new Date(instance.date), 'EEE, MMM d')}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-600">
                                        {instance.startTime}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="font-medium text-slate-900">{classTitle}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                {instructorName.charAt(0)}
                                            </div>
                                            <span className="text-sm text-slate-700">{instructorName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-slate-600">
                                        {roomName}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button className="p-1 hover:bg-white rounded text-slate-400 hover:text-indigo-600 transition-colors">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
