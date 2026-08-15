import React, { useState, useRef } from 'react'
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useBulkImportTeachersMutation } from '@/services/api'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

const BulkImportModal = ({ isOpen, onClose }) => {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const [bulkImportTeachers] = useBulkImportTeachersMutation()

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a valid Excel or CSV file')
      return
    }

    setFile(selectedFile)
    setUploadResult(null)

    // Parse file for preview
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // Get first 5 rows for preview (skip header)
        const preview = jsonData.slice(1, 6).map((row) => ({
          name: row[0] || '',
          customId: row[1] || '',
          phone: row[2] || '',
          email: row[3] || '',
          gender: row[4] || '',
          qualification: row[5] || '',
        }))
        
        setPreviewData(preview)
      } catch (err) {
        toast.error('Failed to parse file. Please check the format.')
        setFile(null)
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await bulkImportTeachers(formData).unwrap()
      setUploadResult(result)
      toast.success(`Successfully imported ${result.summary?.created || 0} teachers`)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to import teachers')
      setUploadResult({ error: true, message: err?.data?.message })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setUploadResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Teachers</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {!uploadResult ? (
            <>
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  file ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                      <FileSpreadsheet size={32} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null)
                        setPreviewData([])
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                    >
                      <X size={14} className="mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                      <Upload size={32} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Upload Excel or CSV file
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Drag and drop or click to browse
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>

              {/* File Format Instructions */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                  Required Columns
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Name *</span>
                  <span className="text-gray-600 dark:text-gray-400">Teacher ID *</span>
                  <span className="text-gray-600 dark:text-gray-400">Phone *</span>
                  <span className="text-gray-600 dark:text-gray-400">Email</span>
                  <span className="text-gray-600 dark:text-gray-400">Gender</span>
                  <span className="text-gray-600 dark:text-gray-400">Qualification</span>
                  <span className="text-gray-600 dark:text-gray-400">Experience</span>
                </div>
              </div>

              {/* Preview */}
              {previewData.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    Preview (first 5 rows)
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Phone</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Gender</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{row.name}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{row.customId}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{row.phone}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{row.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                >
                  {isUploading ? 'Importing...' : 'Import Teachers'}
                </Button>
              </div>
            </>
          ) : (
            /* Upload Result */
            <div className="space-y-6">
              {uploadResult.error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Import Failed
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    {uploadResult.message || 'There was an error importing the teachers'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Import Successful
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    {uploadResult.importedCount || 'Teachers'} have been imported successfully
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkImportModal
