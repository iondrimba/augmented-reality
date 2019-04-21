import App from './scripts/app';

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();

  window.addEventListener('resize', app.onResize.bind(app));
});
