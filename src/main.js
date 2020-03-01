import '../node_modules/todomvc-app-css/index.css';
import App from './components/app/app.svelte';

const app = new App({
  target: document.querySelector('app-root')
});

export default app;
