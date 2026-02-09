import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { roomTypeService } from '../services';
import type { CreateRoomTypeDTO, RoomType } from '../types';

export default function RoomTypes() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateRoomTypeDTO>({
        name: '',
        description: '',
        capacity: 0,
    });

    // Fetch room types
    const fetchRoomTypes = async () => {
        try {
            setIsLoading(true);
            const data = await roomTypeService.getAll();
            setRoomTypes(data);
        } catch (error) {
            toast.error('Failed to fetch room types');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    // Open modal for create/edit
    const openModal = (roomType?: RoomType) => {
        if (roomType) {
            setEditingRoomType(roomType);
            setFormData({
                name: roomType.name,
                description: roomType.description || '',
                capacity: roomType.capacity,
            });
        } else {
            setEditingRoomType(null);
            setFormData({ name: '', description: '', capacity: 0 });
        }
        setIsModalOpen(true);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingRoomType) {
                await roomTypeService.update(editingRoomType._id, formData);
                toast.success('Room type updated successfully');
            } else {
                await roomTypeService.create(formData);
                toast.success('Room type created successfully');
            }
            setIsModalOpen(false);
            fetchRoomTypes();
        } catch (error) {
            toast.error(editingRoomType ? 'Failed to update room type' : 'Failed to create room type');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this room type?')) return;

        try {
            await roomTypeService.delete(id);
            toast.success('Room type deleted successfully');
            fetchRoomTypes();
        } catch (error) {
            toast.error('Failed to delete room type');
            console.error(error);
        }
    };

    return (
        <div>
            <Header
                title="Room Types"
                subtitle="Manage your classroom and venue types"
                actions={
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4" />
                        Add Room Type
                    </Button>
                }
            />

            {/* Room Types Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                            <div className="h-6 bg-slate-200 rounded w-2/3 mb-4" />
                            <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                            <div className="h-4 bg-slate-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : roomTypes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No room types yet</h3>
                    <p className="text-slate-500 mb-6">Get started by creating your first room type.</p>
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4" />
                        Add Room Type
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roomTypes.map((roomType) => (
                        <div
                            key={roomType._id}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(roomType)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(roomType._id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 capitalize mb-2">
                                {roomType.name}
                            </h3>
                            {roomType.description && (
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                    {roomType.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-sm">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                    Capacity: {roomType.capacity}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full font-medium ${roomType.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    {roomType.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRoomType ? 'Edit Room Type' : 'Create Room Type'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        placeholder="e.g., Computer Lab, Lecture Hall"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Description"
                        placeholder="Brief description of this room type"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <Input
                        label="Capacity"
                        type="number"
                        min={1}
                        placeholder="Maximum capacity"
                        value={formData.capacity || ''}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                        required
                    />

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
                            {editingRoomType ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
