import { Pencil, Plus, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { instructorService } from '../services';
import type { CreateInstructorDTO, Instructor } from '../types';

export default function Instructors() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateInstructorDTO>({
        name: '',
        role: '',
    });

    // Fetch instructors
    const fetchInstructors = async () => {
        try {
            setIsLoading(true);
            const data = await instructorService.getAll();
            setInstructors(data);
        } catch (error) {
            toast.error('Failed to fetch instructors');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    // Open modal for create/edit
    const openModal = (instructor?: Instructor) => {
        if (instructor) {
            setEditingInstructor(instructor);
            setFormData({
                name: instructor.name,
                role: instructor.role,
            });
        } else {
            setEditingInstructor(null);
            setFormData({ name: '', role: '' });
        }
        setIsModalOpen(true);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingInstructor) {
                await instructorService.update(editingInstructor._id, formData);
                toast.success('Instructor updated successfully');
            } else {
                await instructorService.create(formData);
                toast.success('Instructor created successfully');
            }
            setIsModalOpen(false);
            fetchInstructors();
        } catch (error) {
            toast.error(editingInstructor ? 'Failed to update instructor' : 'Failed to create instructor');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this instructor?')) return;

        try {
            await instructorService.delete(id);
            toast.success('Instructor deleted successfully');
            fetchInstructors();
        } catch (error) {
            toast.error('Failed to delete instructor');
            console.error(error);
        }
    };

    // Generate avatar color from name
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-indigo-500',
            'bg-rose-500',
            'bg-emerald-500',
            'bg-amber-500',
            'bg-cyan-500',
            'bg-purple-500',
            'bg-pink-500',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div>
            <Header
                title="Instructors"
                subtitle="Manage your teaching staff and trainers"
                actions={
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4" />
                        Add Instructor
                    </Button>
                }
            />

            {/* Instructors Table */}
            {isLoading ? (
                <div className="bg-white rounded-2xl overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 animate-pulse">
                            <div className="w-12 h-12 bg-slate-200 rounded-full" />
                            <div className="flex-1">
                                <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                                <div className="h-4 bg-slate-200 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : instructors.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No instructors yet</h3>
                    <p className="text-slate-500 mb-6">Get started by adding your first instructor.</p>
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4" />
                        Add Instructor
                    </Button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Instructor</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {instructors.map((instructor) => (
                                <tr key={instructor._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                                                    instructor.name
                                                )}`}
                                            >
                                                {instructor.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-900">{instructor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600">{instructor.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${instructor.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            {instructor.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(instructor)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(instructor._id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingInstructor ? 'Edit Instructor' : 'Add Instructor'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        placeholder="e.g., John Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Role"
                        placeholder="e.g., Senior Instructor, Professor"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                            {editingInstructor ? 'Update' : 'Add'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
