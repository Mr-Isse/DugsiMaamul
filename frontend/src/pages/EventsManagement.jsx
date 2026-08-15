import { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Type, 
  AlignLeft, 
  Image as ImageIcon, 
  Edit2, 
  Trash2, 
  X, 
  Save,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation
} from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/skeleton';
import ConfirmModal from '../components/ConfirmModal';
import ImageUpload from '../components/ImageUpload';

const EventsManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // Robust schoolId extraction
  const schoolId = typeof userInfo?.school === 'object' ? userInfo?.school?._id : userInfo?.school;
  
  const { data: events, isLoading } = useGetEventsQuery(schoolId, {
    skip: !schoolId || schoolId === '[object Object]',
  });
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    type: 'other'
  });

  const handleOpenModal = (event = null) => {
    if (event) {
      setSelectedEvent(event);
      setForm({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        location: event.location || '',
        image: event.image || '',
        type: event.type
      });
    } else {
      setSelectedEvent(null);
      setForm({
        title: '',
        description: '',
        date: '',
        location: '',
        image: '',
        type: 'other'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await updateEvent({ id: selectedEvent._id, ...form }).unwrap();
        toast.success('Event updated successfully');
      } else {
        await createEvent(form).unwrap();
        toast.success('Event created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.data?.userMessage || 'Failed to save event');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(selectedEvent._id).unwrap();
      toast.success('Event deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.data?.userMessage || 'Failed to delete event');
    }
  };

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) return <Skeleton count={5} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Create and manage upcoming school events.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm appearance-none"
          >
            <option value="all">All Types</option>
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="holiday">Holiday</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents?.map((event) => (
          <div key={event._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                <ImageIcon size={48} />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  {event.type}
                </span>
                <span className="text-xs text-gray-400 font-medium flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{event.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
              
              <div className="flex items-center text-xs text-gray-400 mb-4">
                <MapPin size={12} className="mr-1" />
                <span>{event.location || 'No location set'}</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-gray-700">
                <button
                  onClick={() => handleOpenModal(event)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-semibold text-sm"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => { setSelectedEvent(event); setIsDeleteModalOpen(true); }}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-semibold text-sm"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents?.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No events found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or create a new event.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <div className="relative">
                      <Type size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm appearance-none dark:text-white dark:bg-gray-800"
                    >
                      <option value="academic">Academic</option>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="holiday">Holiday</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm dark:text-white color-scheme-dark"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm dark:text-white"
                      />
                    </div>
                  </div>
                  <ImageUpload 
                    label="Event Image" 
                    value={form.image} 
                    onChange={(url) => setForm({ ...form, image: url })} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <div className="relative">
                  <AlignLeft size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{isCreating || isUpdating ? 'Saving...' : 'Save Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
        confirmText="Delete Event"
      />
    </div>
  );
};

export default EventsManagement;
