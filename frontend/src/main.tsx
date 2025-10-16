// Import React DOM client for rendering
import { createRoot } from "react-dom/client";

// Import main App component
import App from "./App.tsx";

// Import global CSS styles
import "./index.css";

// Create root element and render the App component
// The '!' asserts that getElementById will not return null
createRoot(document.getElementById("root")!).render(<App />);
