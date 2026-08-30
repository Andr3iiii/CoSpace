# CoSpace Admin Frontend

Production-ready administration portal built with React 18, Vite, React Router, Recharts, and React Hook Form.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server on port 5174
npm run dev

# Build production bundle
npm run build
```

---

## 🎨 UI & Styling Architecture
- **Pure React Inline Styles** (`style={{ ... }}`)
- No Tailwind CSS, No CSS Modules, No Styled Components
- Design tokens defined centrally in `src/theme/theme.ts`
- Interactive states handled through React state (`isHovered`, `isPressed`, `isFocused`)
- Responsive breakpoints handled via `useResponsive` hook
