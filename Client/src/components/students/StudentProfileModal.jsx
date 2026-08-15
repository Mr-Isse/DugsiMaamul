import React from 'react'
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Users, Badge } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge as BadgeComponent } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const StudentProfileModal = ({ isOpen, onClose, student }) => {
  if (!student) return null

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={
                  student.imageUrl ||
                  (typeof student.profileImage === 'string'
                    ? student.profileImage
                    : student.profileImage?.url)
                }
              />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl font-semibold">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{student.name}</h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{student.customId}</p>
              <div className="flex items-center gap-2 mt-2">
                <BadgeComponent
                  variant={(student.status || 'active') === 'active' ? 'default' : 'destructive'}
                >
                  {student.status || 'active'}
                </BadgeComponent>
                {student.class && (
                  <BadgeComponent variant="secondary">
                    {student.class.name} {student.class.section}
                  </BadgeComponent>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.phone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              Personal Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.gender || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Age</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.age || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mode</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.mode || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(student.entryDate)}</p>
              </div>
            </div>
            {student.address && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Address</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.address}</p>
              </div>
            )}
            {student.placeOfBirth && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Place of Birth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.placeOfBirth}</p>
              </div>
            )}
          </div>

          {/* Family Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              Family Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Parent/Guardian</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.parentName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Parent Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.parentPhone || 'N/A'}</p>
              </div>
              {student.motherName && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Mother's Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{student.motherName}</p>
                </div>
              )}
              {student.emergencyContact && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Emergency Contact</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{student.emergencyContact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Badge size={16} className="text-gray-400" />
              Academic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Class</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {student.class ? `${student.class.name} - ${student.class.section}` : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Branch</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.branch?.name || 'Main Branch'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Fees</p>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${student.monthlyFees || 0}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              Edit Student
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StudentProfileModal
