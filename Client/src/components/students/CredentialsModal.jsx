import React, { useState } from 'react'
import { Key, Download, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useGenerateBulkCredentialsMutation, useGenerateStudentLoginMutation } from '@/services/api'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

const CredentialsModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('bulk') // 'bulk' or 'single'
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [generatedCredentials, setGeneratedCredentials] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [generateBulkCredentials] = useGenerateBulkCredentialsMutation()
  const [generateStudentLogin] = useGenerateStudentLoginMutation()

  const handleBulkGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateBulkCredentials().unwrap()
      setGeneratedCredentials(result.credentials || result)
      toast.success('Credentials generated successfully')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate credentials')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSingleGenerate = async () => {
    if (!selectedStudentId) {
      toast.error('Please enter a student ID')
      return
    }
    setIsGenerating(true)
    try {
      const result = await generateStudentLogin(selectedStudentId).unwrap()
      setGeneratedCredentials([result])
      toast.success('Credentials generated successfully')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate credentials')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadExcel = () => {
    if (!generatedCredentials || generatedCredentials.length === 0) return

    const data = generatedCredentials.map((cred) => ({
      'Student Name': cred.name || cred.studentName,
      'Student ID': cred.customId || cred.studentId,
      'Username': cred.username || cred.customId,
      'Password': cred.password,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Credentials')
    XLSX.writeFile(wb, 'student_credentials.xlsx')
    toast.success('Credentials downloaded')
  }

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleClose = () => {
    setMode('bulk')
    setSelectedStudentId('')
    setGeneratedCredentials(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Student Credentials</DialogTitle>
          <DialogDescription>
            Generate login credentials for students to access the student portal
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setMode('bulk')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'bulk'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Bulk Generate
            </button>
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'single'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Single Student
            </button>
          </div>

          {!generatedCredentials ? (
            <>
              {mode === 'bulk' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex gap-3">
                      <Key size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300">
                          Bulk Credential Generation
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          This will generate login credentials for all students who don't have credentials yet.
                          Each student will receive a unique username (their student ID) and a random password.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleBulkGenerate}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key size={16} className="mr-2" />
                        Generate Credentials for All Students
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      placeholder="Enter student ID (e.g., HJSTD277043)"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <Button
                    onClick={handleSingleGenerate}
                    disabled={isGenerating || !selectedStudentId}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key size={16} className="mr-2" />
                        Generate Credentials
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Generated Credentials Display */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Credentials Generated Successfully
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadExcel}
                >
                  <Download size={14} className="mr-2" />
                  Download Excel
                </Button>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Student Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Student ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Password</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedCredentials.map((cred, index) => (
                      <tr key={index} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {cred.name || cred.studentName}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {cred.customId || cred.studentId}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {cred.username || cred.customId}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">
                              {cred.password}
                            </code>
                            <button
                              onClick={() => handleCopyToClipboard(cred.password)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Copy password"
                            >
                              <Copy size={12} className="text-gray-400" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCopyToClipboard(`${cred.username || cred.customId}\n${cred.password}`)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Copy All
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setGeneratedCredentials(null)}>
                  Generate More
                </Button>
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CredentialsModal
