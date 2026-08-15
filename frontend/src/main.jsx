import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/store.js'
import './index.css'
import './i18n'
import App from './App.jsx'
import TenantLoader from './components/TenantLoader'
import { DesignSystemProvider } from './lib/DesignSystemProvider'

const RootApp = () => {
  return (
    <DesignSystemProvider>
      <TenantLoader>
        <App />
      </TenantLoader>
    </DesignSystemProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RootApp />
    </Provider>
  </StrictMode>,
)
