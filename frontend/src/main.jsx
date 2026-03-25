import { createRoot } from 'react-dom/client'
import './APP/index.css'
import App from './APP/App.jsx'
import {store} from './APP/store/App.store.js'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
 <Provider store={store}>
  <App />
 </Provider>
)
