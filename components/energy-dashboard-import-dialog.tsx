'use client'

import { type ChangeEvent } from 'react'
import { useTranslations } from '@/lib/use-translations'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { type ImportResult } from '@/components/energy-dashboard-types'

interface EnergyDashboardImportDialogProps {
  importDialogOpen: boolean
  setImportDialogOpen: (open: boolean) => void
  handleFileImport: (event: ChangeEvent<HTMLInputElement>) => void
  importing: boolean
  importResult: ImportResult | null
  setImportResult: (result: ImportResult | null) => void
}

export function EnergyDashboardImportDialog({
  importDialogOpen,
  setImportDialogOpen,
  handleFileImport,
  importing,
  importResult,
  setImportResult,
}: EnergyDashboardImportDialogProps) {
  const t = useTranslations()

  return (
    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
      <DialogContent>
        <DialogClose onClose={() => { setImportDialogOpen(false); setImportResult(null) }} />
        <DialogHeader>
          <DialogTitle>{t.ui.importDialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t.ui.importHint}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              {t.ui.exampleHint}
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileImport}
              disabled={importing}
              className="block w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800 cursor-pointer"
            />
          </div>

          {importing && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t.ui.importing}</p>
            </div>
          )}

          {importResult && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">{t.ui.importResultTitle}:</h4>
              <div className="text-sm space-y-1">
                <p className="text-green-600 dark:text-green-400">✓ {importResult.imported} {t.ui.importedEntries}</p>
                <p className="text-blue-600 dark:text-blue-400">↻ {importResult.updated} {t.ui.updatedEntries}</p>
                {importResult.errors > 0 && (
                  <p className="text-red-600 dark:text-red-400">✗ {importResult.errors} {t.ui.importErrors}</p>
                )}
              </div>
              {importResult.errorDetails.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">{t.ui.showErrorDetails}</summary>
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 max-h-32 overflow-y-auto">
                    {importResult.errorDetails.map((error, i) => (
                      <div key={i}>{error}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => { setImportDialogOpen(false); setImportResult(null) }}
              className="flex-1"
            >
              {t.ui.close}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
