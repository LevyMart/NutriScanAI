import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Make Material Icons available globally
document.head.innerHTML += `
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
`;

createRoot(document.getElementById("root")!).render(<App />);
