import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './queryClient'
import { router } from './routes'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            border: '1px solid #eadfd2',
            background: '#fffaf5',
            color: '#2d241f',
          },
        }}
      />
    </QueryClientProvider>
  )
}
