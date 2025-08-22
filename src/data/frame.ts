const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

export const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/feed.svg`,
  button: {
    title: 'Open Gift Box',
    action: {
      type: 'launch_frame',
      name: 'Gift Box',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.svg`,
      splashBackgroundColor: '#f8f9fa',
    },
  },
};
