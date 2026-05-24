# Configuration Reference

## tailwind.config.js

Ensure your `tailwind.config.js` includes proper configuration:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          '950': '#03060b',
          '900': '#0f1419',
          '850': '#1a202d',
          // ... rest of slate colors
        },
      },
      backgroundColor: {
        'glass': 'rgba(15, 23, 42, 0.7)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(34, 211, 238, 0.3)',
      },
    },
  },
  plugins: [],
}
```

## next.config.js

Ensure your `next.config.js` is properly configured:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add any other configs as needed
}

module.exports = nextConfig
```

## .env.local (Optional)

For any future environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
# Add more as needed
```

## package.json Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Required Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^latest",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

## Recommended Package Versions

```bash
npm install next@14.0.3
npm install react@18.2.0
npm install react-dom@18.2.0
npm install lucide-react@latest
npm install recharts@2.10.4
npm install -D tailwindcss@3.3.6
npm install -D postcss@8.4.31
npm install -D autoprefixer@10.4.16
```

## PostCSS Configuration

Ensure `postcss.config.js` exists:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Key Tailwind Classes Used

### Background Colors
- `bg-slate-950` - Near black background
- `bg-slate-900` - Dark slate
- `bg-cyan-500/20` - Cyan with 20% opacity
- `bg-gradient-to-br` - Gradient direction

### Border
- `border-cyan-500/20` - Cyan border with opacity
- `rounded-2xl` - Large border radius
- `rounded-lg` - Medium border radius

### Effects
- `backdrop-blur-md` - Medium blur effect
- `shadow-lg` - Large shadow
- `shadow-cyan-500/20` - Cyan tinted shadow

### Typography
- `text-slate-300` - Light text
- `text-cyan-300` - Cyan accent text
- `font-bold` - Bold font weight
- `uppercase` - Uppercase text
- `tracking-wider` - Wide letter spacing

### Layout
- `flex`, `flex-col`, `flex-row` - Flexbox
- `gap-4` - Space between items
- `p-6`, `px-4`, `py-2` - Padding
- `w-full`, `h-screen` - Width/height
- `md:ml-64` - Responsive margin
- `grid grid-cols-1 md:grid-cols-4` - Responsive grid

### Responsive
- `md:` - Tablet and up (768px+)
- `lg:` - Desktop and up (1024px+)
- `sm:` - Small devices and up (640px+)

### States
- `hover:` - Hover state
- `focus:` - Focus state
- `active:` - Active state
- `disabled:` - Disabled state

## Utility Classes Reference

### Common Patterns

#### Card Container
```jsx
className="bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md"
```

#### Button
```jsx
className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/50"
```

#### Input
```jsx
className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 text-slate-200 focus:border-cyan-500/50 focus:outline-none"
```

#### Table Row
```jsx
className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors duration-200"
```

## Mobile-First Responsive Pattern

All components follow mobile-first responsive design:

```jsx
// Mobile first, then enhance for larger screens
className="
  grid-cols-1              // Mobile: 1 column
  md:grid-cols-2           // Tablet: 2 columns
  lg:grid-cols-4           // Desktop: 4 columns
"
```

## Color Opacity System

Used throughout for glassmorphic effects:

```
/10  = 10% opacity
/20  = 20% opacity
/30  = 30% opacity
/40  = 40% opacity
/50  = 50% opacity
/60  = 60% opacity
/70  = 70% opacity
/80  = 80% opacity
```

## Animation Classes

Custom animations defined in `globals.css`:

- `animate-pulse` - Built-in pulse
- `animate-pulse-glow` - Custom cyan pulse
- `animate-fadeIn` - Fade in animation
- `animate-slideFromLeft` - Slide from left

## Duration Scale

Used for transitions and animations:

```
duration-200  // 200ms
duration-300  // 300ms
duration-500  // 500ms
```

## Z-Index Layers

```
z-1   = Base layer
z-20  = Modal overlay
z-30  = Sidebar
z-40  = Mobile menu button
```

## Breakpoints

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

## Performance Tips

1. **Use Next.js Image Optimization**
   ```jsx
   import Image from 'next/image';
   <Image src="/avatar.png" alt="Avatar" width={64} height={64} />
   ```

2. **Lazy Load Components**
   ```jsx
   const HeavyComponent = dynamic(() => import('./Heavy'), {
     loading: () => <Loader />
   });
   ```

3. **Optimize CSS**
   - Tailwind purges unused styles automatically
   - No CSS-in-JS needed
   - All styles static and optimized

4. **Image Optimization**
   - Use WebP format when possible
   - Compress SVGs
   - Use placeholder blur for next/image

## Accessibility Features

- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA labels on interactive elements
- Color contrast meets WCAG AA
- Keyboard navigation supported
- Focus states visible

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting Checklist

- [ ] tailwind.config.js has correct content paths
- [ ] postcss.config.js exists and is configured
- [ ] All imports use correct paths (@/...)
- [ ] Lucide icons installed: `npm install lucide-react`
- [ ] Recharts installed: `npm install recharts`
- [ ] App router enabled in next.config.js
- [ ] No TypeScript errors (or convert to .tsx if needed)
- [ ] CSS class names spelled correctly
- [ ] Cache cleared after config changes: `rm -rf .next`

## VSCode Extensions Recommended

- **Tailwind CSS IntelliSense** - Syntax highlighting
- **PostCSS Language Support** - CSS parsing
- **ES7+ React/Redux/React-Native snippets** - Code snippets

## Development Tips

1. Use Tailwind Playground: https://play.tailwindcss.com/
2. Check component sizes: Browser DevTools → Elements
3. Debug styles: Inspect element to see applied classes
4. Test responsive: DevTools → Toggle Device Toolbar

---

**Configuration Version**: 1.0
**Compatible with**: Next.js 14+, Tailwind CSS 3.3+

All configuration is standard and production-ready!
