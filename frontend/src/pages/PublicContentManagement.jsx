import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  useGetPublicContentQuery, 
  useUpdateHomeContentMutation, 
  useUpdateAboutContentMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUploadImageMutation
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { 
  Home, 
  Info, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';

const PublicContentManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const schoolId = userInfo?.school;

  const [activeTab, setActiveTab] = useState('home');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null
  });

  // Queries
  const { data: content, isLoading: contentLoading, refetch: refetchContent } = useGetPublicContentQuery(schoolId, { skip: !schoolId });
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useGetEventsQuery(schoolId, { skip: !schoolId });

  // Mutations
  const [updateHome] = useUpdateHomeContentMutation();
  const [updateAbout] = useUpdateAboutContentMutation();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  // Form states
  const [homeForm, setHomeForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    welcomeText: '',
    featuredImage: ''
  });

  const [aboutForm, setAboutForm] = useState({
    history: '',
    mission: '',
    vision: '',
    values: '',
    principalMessage: '',
    principalImage: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
    type: 'other'
  });

  useEffect(() => {
    if (content?.home) {
      setHomeForm({
        heroTitle: content.home.heroTitle || '',
        heroSubtitle: content.home.heroSubtitle || '',
        heroImage: content.home.heroImage || '',
        welcomeText: content.home.welcomeText || '',
        featuredImage: content.home.featuredImage || ''
      });
    }
    if (content?.about) {
      setAboutForm({
        history: content.about.history || '',
        mission: content.about.mission || '',
        vision: content.about.vision || '',
        values: content.about.values?.join(', ') || '',
        principalMessage: content.about.principalMessage || '',
        principalImage: content.about.principalImage || ''
      });
    }
  }, [content]);

  const handleImageUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', type === 'event' ? 'events' : 'school');

    try {
      const res = await uploadImage(formData).unwrap();
      if (type === 'hero') setHomeForm({ ...homeForm, heroImage: res });
      if (type === 'featured') setHomeForm({ ...homeForm, featuredImage: res });
      if (type === 'principal') setAboutForm({ ...aboutForm, principalImage: res });
      if (type === 'event') setEventForm({ ...eventForm, image: res });
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  // Helper to get image URL from either string or object
  const getImageUrl = (val) => {
    if (!val) return '';
    return typeof val === 'string' ? val : val.url;
  };

  const handleHomeSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateHome(homeForm).unwrap();
      toast.success('Home content updated');
      refetchContent();
    } catch (err) {
      toast.error('Failed to update home content');
    }
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    try {
      const valuesArray = aboutForm.values.split(',').map(v => v.trim()).filter(v => v);
      await updateAbout({ ...aboutForm, values: valuesArray }).unwrap();
      toast.success('About content updated');
      refetchContent();
    } catch (err) {
      toast.error('Failed to update about content');
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent({ id: editingEvent._id, ...eventForm }).unwrap();
        toast.success('Event updated');
      } else {
        await createEvent(eventForm).unwrap();
        toast.success('Event created');
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setEventForm({ title: '', description: '', date: '', location: '', image: '', type: 'other' });
      refetchEvents();
    } catch (err) {
      toast.error('Failed to save event');
    }
  };

  const handleDeleteEvent = async (id) => {
    setConfirmModal({
      isOpen: true,
      id
    });
  };

  const confirmDeleteEvent = async () => {
    try {
      await deleteEvent(confirmModal.id).unwrap();
      toast.success('Event deleted');
      refetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  if (contentLoading || eventsLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Public Content Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage the content that appears on the mobile app's public section.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium transition-all ${
            activeTab === 'home' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Home className="w-5 h-5 mr-2" />
          Home Page
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium transition-all ${
            activeTab === 'about' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Info className="w-5 h-5 mr-2" />
          About Page
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center px-4 py-2 border-b-2 font-medium transition-all ${
            activeTab === 'events' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Events
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        {activeTab === 'home' && (
          <form onSubmit={handleHomeSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={homeForm.heroTitle}
                    onChange={(e) => setHomeForm({ ...homeForm, heroTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Welcome to Our School"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Hero Subtitle</label>
                  <textarea
                    value={homeForm.heroSubtitle}
                    onChange={(e) => setHomeForm({ ...homeForm, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    rows="3"
                    placeholder="A brief tagline..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Welcome Text</label>
                  <textarea
                    value={homeForm.welcomeText}
                    onChange={(e) => setHomeForm({ ...homeForm, welcomeText: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    rows="4"
                    placeholder="Full welcome message..."
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Hero Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-full aspect-video rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {homeForm.heroImage ? (
                        <img src={getImageUrl(homeForm.heroImage)} alt="Hero" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload Hero
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'hero')} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Featured Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {homeForm.featuredImage ? (
                        <img src={getImageUrl(homeForm.featuredImage)} alt="Featured" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload Featured
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'featured')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === 'about' && (
          <form onSubmit={handleAboutSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Our History</label>
                  <textarea
                    value={aboutForm.history}
                    onChange={(e) => setAboutForm({ ...aboutForm, history: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    rows="4"
                    placeholder="The history of our school..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Our Mission</label>
                    <textarea
                      value={aboutForm.mission}
                      onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Our Vision</label>
                    <textarea
                      value={aboutForm.vision}
                      onChange={(e) => setAboutForm({ ...aboutForm, vision: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                      rows="3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Core Values (comma separated)</label>
                  <input
                    type="text"
                    value={aboutForm.values}
                    onChange={(e) => setAboutForm({ ...aboutForm, values: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Integrity, Excellence, Respect..."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Principal's Message</label>
                  <textarea
                    value={aboutForm.principalMessage}
                    onChange={(e) => setAboutForm({ ...aboutForm, principalMessage: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    rows="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Principal's Photo</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {aboutForm.principalImage ? (
                        <img src={getImageUrl(aboutForm.principalImage)} alt="Principal" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload Photo
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'principal')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Upcoming Events</h3>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setEventForm({ title: '', description: '', date: '', location: '', image: '', type: 'other' });
                  setIsEventModalOpen(true);
                }}
                className="px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event) => (
                <div key={event._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md group">
                  <div className="relative h-40 bg-gray-200 dark:bg-gray-600">
                    {event.image ? (
                      <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setEventForm({
                            title: event.title,
                            description: event.description,
                            date: new Date(event.date).toISOString().split('T')[0],
                            location: event.location || '',
                            image: event.image || '',
                            type: event.type || 'other'
                          });
                          setIsEventModalOpen(true);
                        }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 text-blue-600 rounded-full shadow-sm hover:scale-110 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 text-red-600 rounded-full shadow-sm hover:scale-110 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md mb-2 uppercase">
                      {event.type}
                    </span>
                    <h4 className="font-bold text-lg mb-1 truncate">{event.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {(!events || events.length === 0) && (
                <div className="col-span-full py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No events found. Click "Add Event" to create one.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
                <button onClick={() => setIsEventModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Event Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Date</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Type</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="academic">Academic</option>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="holiday">Holiday</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none"
                    rows="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Event Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {eventForm.image ? (
                        <img src={getImageUrl(eventForm.image)} alt="Event" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all">
                      <Upload className="w-4 h-4 inline mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'event')} />
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmDeleteEvent}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default PublicContentManagement;
