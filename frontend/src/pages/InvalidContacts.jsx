import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import {
  useGetInvalidContactsQuery,
  useResolveInvalidContactMutation
} from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

const InvalidContacts = () => {
  const [contactType, setContactType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: contacts, isLoading } = useGetInvalidContactsQuery({ contactType });
  const [resolveContact] = useResolveInvalidContactMutation();

  const handleResolve = async (id) => {
    if (!confirm('Are you sure you want to mark this contact as resolved?')) return;
    try {
      await resolveContact(id).unwrap();
      toast.success('Contact marked as resolved');
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to resolve contact');
    }
  };

  const reasonColors = {
    'invalid-format': 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    'hard-bounce': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    'soft-bounce': 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
    'spam-complaint': 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
    'unsubscribed': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    'blocked': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    'unreachable': 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    'invalid-number': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    'invalid-device-token': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
  };

  const filteredContacts = contacts?.data?.contacts?.filter(c =>
    !searchQuery ||
    c.contactValue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.to?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Invalid Contacts
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage invalid or bounced contact information
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 items-center flex-1">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="deviceToken">Device Token</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
            <Users size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No invalid contacts
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              All contacts are valid and working!
            </p>
          </div>
        ) : (
          filteredContacts?.map((contact) => (
            <div
              key={contact._id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${contact.isResolved ? 'bg-green-100 dark:bg-green-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
                    {contact.isResolved ? (
                      <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {contact.to?.name || 'Unknown'}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${reasonColors[contact.reason] || 'bg-gray-100 dark:bg-gray-800'}`}>
                        {contact.reason?.charAt(0).toUpperCase() + contact.reason?.slice(1).replace('-', ' ') || 'Unknown'}
                      </span>
                      {contact.isResolved && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {contact.contactType?.toUpperCase()}: {contact.contactValue}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {contact.failureCount} failure{contact.failureCount !== 1 ? 's' : ''} • Last: {new Date(contact.lastFailureAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!contact.isResolved && (
                  <button
                    onClick={() => handleResolve(contact._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InvalidContacts;
