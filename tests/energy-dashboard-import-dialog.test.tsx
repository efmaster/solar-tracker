/// <reference types="vitest" />

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EnergyDashboardImportDialog } from '../components/energy-dashboard-import-dialog'

describe('EnergyDashboardImportDialog', () => {
  it('renders the dialog and shows import result details', () => {
    const setImportDialogOpen = vi.fn()
    const setImportResult = vi.fn()
    const handleFileImport = vi.fn()

    render(
      <EnergyDashboardImportDialog
        importDialogOpen={true}
        setImportDialogOpen={setImportDialogOpen}
        handleFileImport={handleFileImport}
        importing={false}
        importResult={{ imported: 2, updated: 1, errors: 1, errorDetails: ['Zeile 3: Ungültiges Datum'] }}
        setImportResult={setImportResult}
      />
    )

    expect(screen.getByText(/Import Ergebnis/i)).toBeInTheDocument()
    expect(screen.getByText(/2 neue Einträge importiert/i)).toBeInTheDocument()
    expect(screen.getByText(/1 Einträge aktualisiert/i)).toBeInTheDocument()
    expect(screen.getByText(/1 Fehler/i)).toBeInTheDocument()
  })

  it('calls close handlers when Schließen is clicked', () => {
    const setImportDialogOpen = vi.fn()
    const setImportResult = vi.fn()
    const handleFileImport = vi.fn()

    render(
      <EnergyDashboardImportDialog
        importDialogOpen={true}
        setImportDialogOpen={setImportDialogOpen}
        handleFileImport={handleFileImport}
        importing={false}
        importResult={null}
        setImportResult={setImportResult}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Schließen/i }))
    expect(setImportDialogOpen).toHaveBeenCalledWith(false)
    expect(setImportResult).toHaveBeenCalledWith(null)
  })
})
