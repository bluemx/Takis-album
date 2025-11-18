# 3D Model and AR Feature

## Overview
Cards with the `has3d: true` property in the cards database can display 3D models and support Augmented Reality (AR) viewing on compatible devices.

## Usage

### For Card Data
Add the `has3d: true` property to any card in `src/data/cards.ts`:

```typescript
{
  identifier: 205,
  category: 4,
  desc: "Nueva Zelanda - Kiwi Bravío - Tótem Kiwi",
  disposition: "Vertical",
  has3d: true
}
```

### 3D Model Files
Place the corresponding `.glb` file in `src/assets/3ds/` with the format `{card-identifier}.glb`.

Example: `src/assets/3ds/205.glb` for card 205.

## Features

### Mobile Devices
- **AR Button**: "Ver en AR" button appears for cards with 3D models
- **AR Support**: Uses device's native AR capabilities (ARCore on Android, ARKit on iOS)
- **One-tap AR**: Direct activation of AR mode

### Desktop Devices  
- **3D Viewer**: "Ver 3D" button opens interactive 3D model
- **Mouse Controls**: Rotate and zoom with mouse interactions
- **Camera Controls**: Automatic rotation and lighting

## Technical Details

### Supported Formats
- `.glb` (recommended - optimized binary format)
- `.gltf` (with separate texture files)

### Browser Support
- **AR Mode**: iOS Safari 12+, Chrome on Android with ARCore
- **3D Viewer**: All modern browsers with WebGL support

### Model Requirements
- Optimized for mobile performance (< 5MB recommended)
- PBR materials for realistic lighting
- Proper UV mapping for textures

## AR Integration
Uses Google's Model Viewer with the following AR modes:
- `webxr`: WebXR standard for future browsers
- `scene-viewer`: Android's Scene Viewer
- `quick-look`: iOS AR Quick Look

## Error Handling
- Fallback messages for unsupported devices
- Loading states and error recovery
- Graceful degradation for missing models

## Future Enhancements
- Model caching for offline viewing  
- Multiple model variants (LOD)
- Animation support
- Sound effects integration