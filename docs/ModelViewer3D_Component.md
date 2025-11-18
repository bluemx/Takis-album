# ModelViewer3D Component

## Overview
A dedicated Vue component for displaying 3D models with AR support. Extracted from CardView.vue to provide better separation of concerns and reusability.

## Features
- **Universal 3D Viewing**: Works on all devices with WebGL support
- **Mobile AR Support**: Activates AR mode on compatible mobile devices
- **Smart Mobile Detection**: More precise detection for AR-capable devices
- **Error Handling**: Graceful handling of missing models or loading errors
- **Responsive Design**: Adapts to different screen sizes

## Usage

```vue
<template>
  <ModelViewer3D 
    :is-open="show3DViewer"
    :card-id="cardId"
    @close="close3DViewer"
  />
</template>

<script setup>
import ModelViewer3D from './ModelViewer3D.vue'

const show3DViewer = ref(false)

function open3DModel() {
  show3DViewer.value = true
}

function close3DViewer() {
  show3DViewer.value = false
}
</script>
```

## Props
- `isOpen: boolean` - Controls visibility of the 3D viewer modal
- `cardId: number` - The card identifier used to load the corresponding .glb model

## Events  
- `@close` - Emitted when user closes the viewer (via close button or backdrop click)

## Mobile Detection
The component uses strict mobile detection specifically for AR functionality:
- Checks for Android/iPhone/iPad user agents
- Verifies AR support via WebXR or VR APIs
- Considers screen size as additional indicator
- Only shows "Activar AR" button on true mobile devices

## Model Loading
- Models are loaded from `../assets/3ds/{cardId}.glb`
- Uses Vite's URL constructor for proper asset resolution
- Handles loading errors with user-friendly messages
- Cleans up resources when component is unmounted

## AR Integration
Uses Google Model Viewer with:
- WebXR for modern browsers
- Scene Viewer for Android
- Quick Look for iOS
- Fallback error handling for unsupported devices

## Technical Details
- Built with Vue 3 Composition API
- TypeScript support with proper type definitions
- Reactive state management
- Clean component lifecycle management
- Accessibility considerations (keyboard navigation, screen reader support)

## Dependencies
- `@google/model-viewer` - For 3D rendering and AR functionality
- Vue 3 with Composition API
- Tailwind CSS for styling