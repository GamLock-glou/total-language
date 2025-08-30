import { Route, Routes } from "react-router-dom";
import "./styles/main.css";
import { lazy } from "react";
import styles from './app.module.css';

const LearningPage = lazy(() => import('../pages/Learning'))
const DictionaryPage = lazy(() => import('../pages/Dictionary'))

function App() {
  return (
    <div className={styles.container}>
      <Routes>
        <Route path="/" element={<LearningPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/dictionary" element={<DictionaryPage />} />
      </Routes>
    </div>
  );
}

export default App;
