import React from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
const EmployeeContractsPage = () => {
  return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Contracts</h1><p className="text-sm text-gray-500 dark:text-gray-400">Manage employee contracts</p></div><Button className="gap-2">Add Contract</Button></div><div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50 dark:bg-gray-900"><div className="text-center"><FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" /><p className="text-gray-500">Employee contracts coming soon</p></div></div></div>
}
export default EmployeeContractsPage