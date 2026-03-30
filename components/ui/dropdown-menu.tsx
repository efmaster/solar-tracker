'use client'

import * as React from "react"

interface DropdownMenuProps {
  children: React.ReactNode
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false)
  const setOpenProp = setOpen as unknown as (open: boolean) => void

  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          type InjectedProps = { open: boolean; setOpen: (open: boolean) => void }
          return React.cloneElement(child as React.ReactElement<InjectedProps>, { open, setOpen: setOpenProp })
        }
        return child
      })}
    </div>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  open?: boolean
  setOpen?: (open: boolean) => void
}

export const DropdownMenuTrigger = ({ children, open, setOpen }: DropdownMenuTriggerProps) => {
  return (
    <div onClick={() => setOpen?.(!open)}>
      {children}
    </div>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  open?: boolean
  setOpen?: (open: boolean) => void
}

export const DropdownMenuContent = ({ children, open, setOpen }: DropdownMenuContentProps) => {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen?.(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  setOpen?: (open: boolean) => void
}

export const DropdownMenuItem = ({ children, onClick, setOpen }: DropdownMenuItemProps) => {
  const handleClick = () => {
    onClick?.()
    setOpen?.(false)
  }

  return (
    <button
      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      onClick={handleClick}
    >
      {children}
    </button>
  )
}
