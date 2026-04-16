# Milkdown Playground

A Next.js based markdown editor playground built with Milkdown Crepe editor.

## Overview

This is a WYSIWYG markdown editor playground featuring the **Milkdown Crepe** editor - a plugin-based markdown editor framework. The project demonstrates a dual-pane editor with CodeMirror integration for real-time markdown preview.

## Tech Stack

- **Framework**: Next.js 16.2.3 (App Router)
- **Editor**: @milkdown/crepe 7.20.0
- **UI**: React 19, Tailwind CSS 3.4
- **State Management**: Jotai 2.8.3
- **Code Editor**: CodeMirror 6

## Features

- **Dual Editor**: Split view with Milkdown editor and CodeMirror
- **Dark Mode**: System preference detection with toggle support
- **Share**: Generate shareable links with encoded content
- **Live Sync**: Real-time synchronization between both editors
- **Toast Notifications**: User feedback system

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── client-layout.tsx   # Client providers (dark mode, toast)
│   │   ├── page.tsx            # Playground as root page
│   │   ├── playground-wrapper.tsx  # Suspense wrapper for useSearchParams
│   │   └── api/
│   │       └── export-docx/
│   │           └── route.ts    # DOCX export API route
│   ├── lib/
│   │   └── playground.ts     # Template loading utilities
│   ├── components/
│   │   ├── playground/
│   │   │   ├── index.tsx      # Dual pane component
│   │   │   ├── Crepe.tsx      # Milkdown Crepe editor
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── atom.ts        # Jotai atoms
│   │   │   └── codemirror/    # CodeMirror integration
│   │   ├── toast/             # Toast notification system
│   │   └── loading/           # Loading components
│   ├── hooks/
│   │   └── useLinkClass.ts    # Link styling hook
│   ├── providers/
│   │   └── DarkModeProvider.tsx
│   ├── styles/
│   │   ├── globals.css        # Global styles + Tailwind
│   │   ├── crepe.css          # Crepe editor styles
│   │   ├── playground.css    # Playground layout
│   │   ├── prosemirror.css   # ProseMirror styles
│   │   └── toast.css         # Toast animations
│   └── utils/
│       ├── types.ts           # TypeScript types
│       └── share.ts           # URL encoding utilities
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── milkdown-logo.svg
│   ├── banner.svg
│   ├── site.webmanifest
│   ├── robots.txt
│   └── polar.jpeg
├── docs/
│   └── playground/
│       └── template.md        # Default editor content
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 20.x or later (LTS recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Configuration

### Next.js Configuration

The `next.config.js` includes:
- `reactStrictMode: true` - Enable React strict mode
- `transpilePackages` - Transpile Milkdown packages

### Tailwind Configuration

Custom styles for:
- Nord color theme
- Editor components
- Toast notifications

## Editor Features

### Crepe Editor

The Milkdown Crepe editor provides:
- Slash commands (/)
- Markdown syntax support
- Code syntax highlighting
- Link tooltips
- Image embedding
- Tables, lists, blockquotes

### CodeMirror Integration

Paired with CodeMirror for:
- Raw markdown editing
- Syntax highlighting
- Line numbers
- Auto-completion

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Credits

- [Milkdown](https://milkdown.dev/) - Plugin-based WYSIWYG markdown editor
- [Crepe](https://github.com/Milkdown/crepe) - The editor component used