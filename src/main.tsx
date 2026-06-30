import { createRoot } from "react-dom/client";
import App from "./app/App";
import { StudyFlowProvider } from "./app/data/studyflow-store";
import "./styles/index.css";
import "./app/i18n";

createRoot(document.getElementById("root")!).render(
  <StudyFlowProvider>
    <App />
  </StudyFlowProvider>,
);
