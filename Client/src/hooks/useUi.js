import { useDispatch, useSelector } from 'react-redux'
import {
  selectUi,
  setSidebarOpen,
  toggleSidebar,
  setMobileNavOpen,
  setPageTitle,
} from '@/store/slices/uiSlice'

export function useUi() {
  const dispatch = useDispatch()
  const ui = useSelector(selectUi)

  return {
    ...ui,
    openSidebar: () => dispatch(setSidebarOpen(true)),
    closeSidebar: () => dispatch(setSidebarOpen(false)),
    toggleSidebar: () => dispatch(toggleSidebar()),
    openMobileNav: () => dispatch(setMobileNavOpen(true)),
    closeMobileNav: () => dispatch(setMobileNavOpen(false)),
    setPageTitle: (title) => dispatch(setPageTitle(title)),
  }
}
