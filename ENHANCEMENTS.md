# Website Enhancements Documentation

This document describes the modern enhancements added to the website.

## ✨ Features Implemented

### 1. Service Worker for Offline Support
- **File**: `service-worker.js`
- **Description**: Enables Progressive Web App (PWA) functionality with offline support
- **Features**:
  - Caches essential assets for offline access
  - Network-first strategy for dynamic content
  - Cache-first strategy for static assets
  - Automatic cache cleanup
  - Update notifications

### 2. Dark Mode Toggle
- **Files**: `assets/js/modern-enhancements.js`, `assets/css/modern-enhancements.css`
- **Description**: Allows users to switch between light and dark themes
- **Features**:
  - Floating toggle button with sun/moon icons
  - Respects system preference (prefers-color-scheme)
  - Persists user preference in localStorage
  - Smooth transitions between themes
  - CSS custom properties for easy theming

### 3. Multi-Language Support (French)
- **Files**: `assets/js/modern-enhancements.js`, `assets/css/modern-enhancements.css`
- **Description**: Language switcher for English and French
- **Features**:
  - Dropdown language selector in navigation
  - Stores language preference in localStorage
  - Updates page language attribute
  - French translations already available in `_data/ui-text.yml`

### 4. Advanced Search Functionality
- **Files**: `assets/js/modern-enhancements.js`, `assets/css/modern-enhancements.css`
- **Description**: Enhanced search experience
- **Features**:
  - Clear button for search input
  - Keyboard shortcut (Ctrl/Cmd + K) to focus search
  - Animated search results
  - Better visual feedback

### 5. Reading Progress Indicator
- **Files**: `assets/js/modern-enhancements.js`, `assets/css/modern-enhancements.css`
- **Description**: Visual indicator of reading progress on blog posts
- **Features**:
  - Fixed progress bar at top of page
  - Gradient color scheme
  - Smooth animation
  - Calculates progress based on article scroll position

### 6. Enhanced Social Sharing
- **Files**: `assets/js/modern-enhancements.js`, `assets/css/modern-enhancements.css`, `_includes/head/custom.html`
- **Description**: Improved social media sharing capabilities
- **Features**:
  - Additional sharing options (Reddit, WhatsApp)
  - Copy link button
  - Open Graph meta tags for better previews
  - Twitter Card meta tags
  - Optimized sharing buttons

### 7. Comment System Integration
- **Files**: `_config.yml`
- **Description**: GitHub-based commenting using Utterances
- **Features**:
  - No tracking or ads
  - Markdown support
  - GitHub authentication
  - Open source and privacy-friendly

### 8. Modern UI Improvements
- **Files**: `assets/css/modern-enhancements.css`, `assets/js/modern-enhancements.js`
- **Description**: Enhanced user interface and experience
- **Features**:
  - Smooth transitions and animations
  - Scroll-triggered animations
  - Enhanced hover effects
  - Better focus styles for accessibility
  - Loading states for images
  - Mobile-responsive design
  - Reduced motion support
  - High contrast mode support
  - Hardware-accelerated animations
  - Improved spacing and typography

## 🚀 How to Use

### Dark Mode
- Click the floating button in the bottom-right corner to toggle between light and dark themes
- The theme preference is saved automatically

### Language Switcher
- Click the language button in the navigation bar (🌐 EN/FR)
- Select your preferred language from the dropdown
- The preference is saved for future visits

### Search
- Use the search icon or press Ctrl/Cmd + K to open search
- Type your query and use the X button to clear
- Results appear with smooth animations

### Reading Progress
- Automatically appears on blog post pages
- Shows your progress through the article as you scroll

### Social Sharing
- Use the share buttons at the bottom of posts
- Click "Copy Link" to quickly copy the page URL
- Share on Twitter, Facebook, LinkedIn, Reddit, or WhatsApp

### Comments
- Comments appear at the bottom of posts (when enabled)
- Requires GitHub authentication to comment
- Uses GitHub Issues for comment storage

## 📱 Progressive Web App (PWA)

The site can now be installed as a PWA:

1. Visit the site in a compatible browser
2. Look for the "Install" prompt (usually in the address bar)
3. Click "Install" to add to your home screen
4. The site will work offline with cached content

## 🎨 Customization

### Theme Colors
Edit the CSS variables in `assets/css/modern-enhancements.css`:

```css
:root {
  --accent-primary: #00adb5;  /* Primary brand color */
  --accent-secondary: #393e46; /* Secondary brand color */
  /* ... other variables ... */
}
```

### Caching Strategy
Modify `service-worker.js` to adjust which assets are cached:

```javascript
const PRECACHE_URLS = [
  '/',
  '/assets/css/main.css',
  // Add more URLs to cache
];
```

## 🔧 Configuration

### Enable/Disable Comments
Edit `_config.yml`:

```yaml
comments:
  provider: "utterances"  # Set to false to disable
  utterances:
    repo: "benymaxparsa/benymaxparsa.github.io"
```

### Adjust Service Worker Cache
Edit `service-worker.js` and update the cache name to force updates:

```javascript
const CACHE_NAME = 'parsa-portfolio-v2'; // Increment version
```

## 📊 Performance Optimizations

- Lazy loading for images
- Resource hints (dns-prefetch, preconnect)
- Hardware-accelerated CSS animations
- Minimal JavaScript execution
- Efficient caching strategies
- Optimized asset delivery

## ♿ Accessibility Features

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Reduced motion support
- Proper ARIA labels
- Focus indicators
- Semantic HTML

## 🔒 Security

- Service Worker only serves same-origin content
- Security headers in HTML head
- NoOpener for external links
- XSS protection headers
- Content type sniffing protection

## 📱 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11.3+)
- Opera: Full support
- IE11: Graceful degradation (no service worker, no dark mode)

## 🐛 Troubleshooting

### Service Worker Not Updating
1. Open DevTools
2. Go to Application > Service Workers
3. Check "Update on reload"
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Dark Mode Not Working
- Clear localStorage: `localStorage.clear()` in console
- Check if browser supports CSS custom properties

### Comments Not Appearing
- Ensure comments are enabled in `_config.yml`
- Check that the repository in config matches actual repo
- Verify GitHub Issues are enabled for the repository

## 📝 Files Modified/Created

### New Files
- `service-worker.js` - Service worker for offline support
- `assets/js/modern-enhancements.js` - Main enhancements JavaScript
- `assets/css/modern-enhancements.css` - Styles for all enhancements
- `_pages/offline.md` - Offline fallback page
- `ENHANCEMENTS.md` - This documentation file

### Modified Files
- `_config.yml` - Added comment system configuration and script references
- `manifest.json` - Enhanced PWA manifest with shortcuts
- `_includes/head/custom.html` - Added social meta tags

## 🎯 Future Enhancements

Possible future improvements:
- Add more languages (Spanish, German, etc.)
- Implement advanced search filters
- Add estimated reading time
- Create custom 404 page with suggestions
- Add site-wide announcements banner
- Implement print stylesheet optimization

## 📄 License

These enhancements follow the same license as the main repository (MIT License).
