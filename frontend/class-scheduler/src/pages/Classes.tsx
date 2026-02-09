import { format } from 'date-fns';
import { Calendar, CalendarDays, Clock, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { classService, instructorService, roomTypeService } from '../services';
import type { Class, CreateClassDTO, Instructor, RecurrenceType, RoomType } from '../types';

const WEEK_DAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];


const RECURRENCE_TYPES = [
    { value: 'none', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
];

export default function Classes() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [classes, setClasses] = useState<Class[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateClassDTO>({
        title: '',
        description: '',
        instructor: '',
        roomType: '',
        isRecurring: false,
        scheduledDate: '',
        startTime: '',
        endTime: '',
        recurrence: undefined,
    });

    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
    const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
    const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);
    const [recurrenceDuration, setRecurrenceDuration] = useState<number>(4);
    const [customInterval, setCustomInterval] = useState<number>(1);
    const [timeSlots, setTimeSlots] = useState<{ startTime: string; endTime: string }[]>([
        { startTime: '', endTime: '' }
    ]);

    // Get duration label based on recurrence type
    const getDurationLabel = () => {
        switch (recurrenceType) {
            case 'daily': return 'Number of Days';
            case 'weekly': return 'Number of Weeks';
            case 'monthly': return 'Number of Months';
            case 'custom': return 'Number of Occurrences';
            default: return 'Duration';
        }
    };

    // Fetch data
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [classesData, instructorsData, roomTypesData] = await Promise.all([
                classService.getAll(),
                instructorService.getAll(),
                roomTypeService.getAll(),
            ]);
            setClasses(classesData);
            setInstructors(instructorsData);
            setRoomTypes(roomTypesData);
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (searchParams.get('action') === 'create') {
            openModal();
            // Clear the param so it doesn't reopen on refresh, but keep it clean
            setSearchParams({});
        }
    }, [searchParams]);

    // Open modal for create/edit
    const openModal = (classItem?: Class) => {
        if (classItem) {
            setEditingClass(classItem);
            const instructorId = typeof classItem.instructor === 'string'
                ? classItem.instructor
                : classItem.instructor._id;
            const roomTypeId = typeof classItem.roomType === 'string'
                ? classItem.roomType
                : classItem.roomType._id;

            setFormData({
                title: classItem.title,
                description: classItem.description || '',
                instructor: instructorId,
                roomType: roomTypeId,
                isRecurring: classItem.isRecurring,
                scheduledDate: classItem.scheduledDate ? format(new Date(classItem.scheduledDate), 'yyyy-MM-dd') : '',
                startTime: classItem.startTime || '',
                endTime: classItem.endTime || '',
                recurrence: classItem.recurrence,
            });

            if (classItem.isRecurring && classItem.recurrence) {
                setRecurrenceType(classItem.recurrence.type);
                setSelectedWeekDays(classItem.recurrence.weekDays || classItem.recurrence.customPattern?.weekDays || []);
                setSelectedMonthDays(classItem.recurrence.monthDays || []);
                setRecurrenceDuration(classItem.recurrence.occurrences || 4);
                setCustomInterval(classItem.recurrence.customPattern?.interval || 1);
                setTimeSlots(classItem.recurrence.timeSlots && classItem.recurrence.timeSlots.length > 0
                    ? classItem.recurrence.timeSlots
                    : [{ startTime: '', endTime: '' }]
                );
            } else {
                setRecurrenceType('none');
                setSelectedWeekDays([]);
                setSelectedMonthDays([]);
                setRecurrenceDuration(4);
                setCustomInterval(1);
                setTimeSlots([{ startTime: '', endTime: '' }]);
            }
        } else {
            setEditingClass(null);
            setFormData({
                title: '',
                description: '',
                instructor: '',
                roomType: '',
                isRecurring: false,
                scheduledDate: '',
                startTime: '',
                endTime: '',
                recurrence: undefined,
            });
            setRecurrenceType('none');
            setSelectedWeekDays([]);
            setSelectedMonthDays([]);
            setRecurrenceDuration(4);
            setCustomInterval(1);
            setTimeSlots([{ startTime: '', endTime: '' }]);
        }
        setIsModalOpen(true);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const isRecurring = recurrenceType !== 'none';

            const submitData: CreateClassDTO = {
                title: formData.title,
                description: formData.description,
                instructor: formData.instructor,
                roomType: formData.roomType,
                isRecurring,
            };

            if (isRecurring) {
                // Calculate end date based on recurrence type and duration
                const startDate = new Date(formData.scheduledDate || '');
                let endDate = new Date(startDate);

                switch (recurrenceType) {
                    case 'daily':
                        endDate.setDate(endDate.getDate() + recurrenceDuration - 1);
                        break;
                    case 'weekly':
                        endDate.setDate(endDate.getDate() + (recurrenceDuration * 7) - 1);
                        break;
                    case 'monthly':
                        endDate.setMonth(endDate.getMonth() + recurrenceDuration);
                        endDate.setDate(endDate.getDate() - 1);
                        break;
                    case 'custom':
                        // occurrences * interval * 7 days
                        endDate.setDate(endDate.getDate() + (recurrenceDuration * customInterval * 7) - 1);
                        break;
                }

                submitData.recurrence = {
                    type: recurrenceType,
                    timeSlots: timeSlots,
                    weekDays: selectedWeekDays,
                    monthDays: recurrenceType === 'monthly' ? selectedMonthDays : undefined,
                    startDate: formData.scheduledDate || '',
                    endDate: format(endDate, 'yyyy-MM-dd'),
                    occurrences: recurrenceDuration,
                    customPattern: recurrenceType === 'custom' ? {
                        weekDays: selectedWeekDays,
                        interval: customInterval
                    } : undefined
                };
            } else {
                submitData.scheduledDate = formData.scheduledDate;
                submitData.startTime = formData.startTime;
                submitData.endTime = formData.endTime;
            }

            if (editingClass) {
                await classService.update(editingClass._id, submitData);
                toast.success('Class updated successfully');
            } else {
                await classService.create(submitData);
                toast.success('Class created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(editingClass ? 'Failed to update class' : 'Failed to create class');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class?')) return;

        try {
            await classService.delete(id);
            toast.success('Class deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete class');
            console.error(error);
        }
    };

    // Toggle week day selection
    const toggleWeekDay = (day: number) => {
        setSelectedWeekDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const toggleMonthDay = (day: number) => {
        setSelectedMonthDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleTimeSlotChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
        const newSlots = [...timeSlots];
        newSlots[index][field] = value;
        setTimeSlots(newSlots);
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
    };

    const removeTimeSlot = (index: number) => {
        if (timeSlots.length > 1) {
            setTimeSlots(timeSlots.filter((_, i) => i !== index));
        }
    };

    // Get instructor/room type name
    const getInstructorName = (instructor: Instructor | string) => {
        if (typeof instructor === 'string') {
            const found = instructors.find((i) => i._id === instructor);
            return found?.name || 'Unknown';
        }
        return instructor.name;
    };

    const getRoomTypeName = (roomType: RoomType | string) => {
        if (typeof roomType === 'string') {
            const found = roomTypes.find((r) => r._id === roomType);
            return found?.name || 'Unknown';
        }
        return roomType.name;
    };

    return (
        <div>
            <Header
                title="Classes"
                subtitle="Manage your scheduled classes and recurring sessions"
                actions={
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4" />
                        Add Class
                    </Button>
                }
            />

            {/* Classes List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
                            <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                            <div className="h-4 bg-slate-200 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : classes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No classes scheduled</h3>
                    <p className="text-slate-500 mb-6">Get started by creating your first class.</p>
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4" />
                        Add Class
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {classes.map((classItem) => (
                        <div
                            key={classItem._id}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-slate-900">{classItem.title}</h3>
                                        {classItem.isRecurring && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                <Repeat className="w-3 h-3" />
                                                Recurring
                                            </span>
                                        )}
                                    </div>

                                    {classItem.description && (
                                        <p className="text-slate-500 mb-4">{classItem.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <span>
                                                {classItem.isRecurring && classItem.recurrence?.timeSlots?.[0]
                                                    ? `${classItem.recurrence.timeSlots[0].startTime} - ${classItem.recurrence.timeSlots[0].endTime}`
                                                    : `${classItem.startTime} - ${classItem.endTime}`}
                                            </span>
                                        </div>

                                        {!classItem.isRecurring && classItem.scheduledDate && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <span>{format(new Date(classItem.scheduledDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                        )}

                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                                            {getInstructorName(classItem.instructor)}
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                                            {getRoomTypeName(classItem.roomType)}
                                        </span>
                                    </div>

                                    {classItem.isRecurring && classItem.recurrence?.weekDays && classItem.recurrence.weekDays.length > 0 && (
                                        <div className="mt-3 flex gap-2">
                                            {classItem.recurrence.weekDays.map((day) => (
                                                <span
                                                    key={day}
                                                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium"
                                                >
                                                    {WEEK_DAYS[day].label.slice(0, 3)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => openModal(classItem)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(classItem._id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingClass ? 'Edit Class' : 'Create Class'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Title"
                        placeholder="e.g., Introduction to Programming"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <Input
                        label="Description"
                        placeholder="Brief description of the class"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Instructor"
                            options={instructors.map((i) => ({ value: i._id, label: i.name }))}
                            value={formData.instructor}
                            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                            placeholder="Select instructor"
                            required
                        />

                        <Select
                            label="Room Type"
                            options={roomTypes.map((r) => ({ value: r._id, label: r.name }))}
                            value={formData.roomType}
                            onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                            placeholder="Select room type"
                            required
                        />
                    </div>

                    <Select
                        label="Schedule Type"
                        options={RECURRENCE_TYPES}
                        value={recurrenceType}
                        onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                    />

                    {(recurrenceType === 'weekly' || recurrenceType === 'custom') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Select Days
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {WEEK_DAYS.map((day) => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleWeekDay(day.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedWeekDays.includes(day.value)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {day.label.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {recurrenceType === 'monthly' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Select Days of Month
                            </label>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleMonthDay(day)}
                                        className={`p-2 rounded text-xs font-medium transition-colors ${selectedMonthDays.includes(day)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Select dates for recurrence (e.g., 5th and 20th)</p>
                        </div>
                    )}

                    {recurrenceType === 'custom' && (
                        <Input
                            label="Repeat Every (Weeks)"
                            type="number"
                            min={1}
                            max={52}
                            value={customInterval}
                            onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
                            required
                        />
                    )}

                    {recurrenceType !== 'none' && (
                        <Input
                            label={getDurationLabel()}
                            type="number"
                            min={1}
                            max={52}
                            value={recurrenceDuration}
                            onChange={(e) => setRecurrenceDuration(parseInt(e.target.value) || 1)}
                            helperText={`Class will repeat for ${recurrenceDuration} ${recurrenceType === 'daily' ? 'day' : recurrenceType === 'weekly' ? 'week' : 'month'}${recurrenceDuration > 1 ? 's' : ''}`}
                            required
                        />
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label={recurrenceType !== 'none' ? 'Start Date' : 'Date'}
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            required
                        />

                        {recurrenceType === 'none' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Start Time"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                                <Input
                                    label="End Time"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">
                                    Time Slots
                                </label>
                                {timeSlots.map((slot, index) => (
                                    <div key={index} className="flex gap-3 items-end">
                                        <Input
                                            label={index === 0 ? "Start Time" : ""}
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                                            required
                                        />
                                        <Input
                                            label={index === 0 ? "End Time" : ""}
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeTimeSlot(index)}
                                            className="p-2 mb-[2px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Remove slot"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={addTimeSlot}
                                    className="w-full mt-2"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Time Slot
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting} className="flex-1">
                            {editingClass ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
