import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AuthHydration } from '@/components/AuthHydration'
import { createAppRouter } from '@/routes'

const router = createAppRouter()

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthHydration>
            <RouterProvider router={router} />
            <Toaster richColors closeButton position="top-right" />
          </AuthHydration>
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  )
}
