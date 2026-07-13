import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Import legacy vanilla CSS exactly as it was
import './assets/styles.css'

// Import FontAwesome (will be resolved by Vite or we can use CDN in index.html)
// Note: for now, FontAwesome and Google Fonts remain in index.html for simplicity

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
