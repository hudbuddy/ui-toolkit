import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { SidebarProvider } from './SideBar'
import { AdminProvider } from './Admin'
import * as RM from '@rainmaker/ui'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider theme={RM.theme}>
    <BrowserRouter>
      <AdminProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </AdminProvider>
    </BrowserRouter>
  </ThemeProvider>,
)
