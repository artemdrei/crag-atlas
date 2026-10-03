import {
  defineConfig,
  minimal2023Preset
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: '#C25A2A' }
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: '#C25A2A' }
    }
  },
  images: ['public/logo.svg']
});
