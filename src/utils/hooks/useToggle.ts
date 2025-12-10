import { useState } from 'react'

export default function useToggle(
  isInitiallyOpen = false,
): [boolean, () => void, () => void] {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen)

  /**
   * function to open the UI
   */
  const handleOpen = () => {
    setIsOpen(true)
  }

  /**
   * function to close the UI
   */
  const handleClose = () => {
    setIsOpen(false)
  }

  return [isOpen, handleOpen, handleClose]
}
