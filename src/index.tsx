import { createRoot } from 'react-dom/client'
import App from 'App'

if (process.env.NODE_ENV === 'development') {
  import('./__mocks__/mockServer').then(module => {
    const { default: mockServer } = module
    mockServer()
  })
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
