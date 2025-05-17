# ClearMark
[![React Version](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/) [![Editor](https://img.shields.io/badge/Editor-Slate.js-purple?style=for-the-badge&logo=markdown)](https://www.slatejs.org/) [![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-blue?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/) [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## Project Overview

**ClearMark** is a modern, feature-rich markdown editor built with React and TypeScript. It leverages Slate.js for rich text editing capabilities and Tailwind CSS for a responsive, modern UI. The editor is designed to provide a seamless writing experience while maintaining the simplicity and power of markdown.

## Purpose & Motivation

### Why ClearMark Exists

Modern markdown editing should be both powerful and intuitive. ClearMark aims to:

- Provide a rich text editing experience while maintaining markdown compatibility
- Offer a clean, distraction-free writing environment
- Support modern web technologies and best practices
- Be extensible and customizable for different use cases

ClearMark is particularly useful for developers, writers, and content creators who want a modern markdown editor that combines the power of rich text editing with the simplicity of markdown.

## Architecture

### System Structure

```
src/
├── components/    # Reusable React components
├── context/      # React context providers
├── hooks/        # Custom React hooks
├── styles/       # Global styles and Tailwind configuration
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
└── index.tsx     # Application entry point
```

The modular design ensures separation of concerns, with components, hooks, and context providers working together to create a cohesive editing experience.

### Core Technologies

- **React 18**: Modern UI framework with concurrent features
- **TypeScript**: Type-safe development
- **Slate.js**: Rich text editing framework
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation frontend tooling

## Key Features

### ✍️ Rich Text Editing

- Real-time markdown preview
- Syntax highlighting
- Keyboard shortcuts
- Custom formatting options

### 🎨 Modern UI

- Responsive design
- Dark/Light mode support
- Customizable themes
- Clean, distraction-free interface

### 💧 Fluid Design Methodology

ClearMark's interface is inspired by the natural flow of water, creating a seamless, intuitive experience:

- **Flow-Based Aesthetics**: Interface elements mimic the natural movement of rainwater flowing down a stream
- **Asymmetric Border Radius**: Custom border-radius-fluid with varying corner values creates a subtle flow direction
- **Gradient Transitions**: Smooth color gradients transition from sky to cyan tones, evoking the feel of moving water
- **Depth & Transparency**: Strategic use of opacity and backdrop blur creates a sense of depth like looking through water
- **Fluid Animations**: Transitions use custom cubic-bezier curves that follow the physics of fluid movement
- **Cohesive Color Palette**: A carefully crafted "flow" palette with blues and teals connects all UI elements

#### Design Implementation

- **Light Mode**: Soft sky blues with subtle cyan accents mimicking daylight reflecting off water
- **Dark Mode**: Deep slate and blue-black backgrounds that evoke flowing water at night
- **Interactive Elements**: Buttons and controls feature directional styling that suggests downstream movement
- **Dividers**: Gradient dividers that transition from light to dark, creating a sense of water flowing
- **Shadows & Highlights**: Custom shadow effects give the impression of light passing through water

This water-inspired design philosophy creates a more organic, natural interface that feels less rigid and mechanical than traditional UI designs, helping users feel more connected to the creative flow of writing.

### 🔧 Developer Experience

- TypeScript support
- Component-based architecture
- Custom hooks for common functionality
- Context-based state management

### 📱 Responsive Design

- Mobile-friendly interface
- Adaptive layouts
- Touch-friendly controls
- Cross-platform compatibility

## Dependencies

- `react` & `react-dom` - Core UI framework
- `slate` & `slate-react` - Rich text editing
- `tailwindcss` - Styling framework
- `typescript` - Type safety
- `vite` - Build tool
- `eslint` - Code quality
- `postcss` - CSS processing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ParleSec/ZeroVault.git
cd ClearMark
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

The project follows a modular architecture with clear separation of concerns:

- **Components**: Reusable UI elements
- **Context**: State management
- **Hooks**: Custom React hooks
- **Styles**: Global styling and themes
- **Types**: TypeScript type definitions
- **Utils**: Helper functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m 'Add some feature-name'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 