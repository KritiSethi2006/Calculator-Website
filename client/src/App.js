import React, { useEffect, useMemo, useState } from "react";
import Calculator from "./components/Calculator";
import History from "./components/History";
import "./App.css";

const LOCAL_HISTORY_KEY = "neocalc-history";

function App() {
  const [history, setHistory] = useState([]);
  const [historyStatus, setHistoryStatus] = useState(
    "Saving history in your browser for this demo."
  );
  const [theme, setTheme] = useState("dark");

  const appClassName = useMemo(
    () => `app-shell ${theme === "dark" ? "theme-dark" : "theme-light"}`,
    [theme]
  );

  const fetchHistory = () => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
      setHistory(parsedHistory);
      setHistoryStatus(
        parsedHistory.length
          ? "Saved in this browser for demo mode."
          : "No saved calculations yet."
      );
    } catch (error) {
      setHistory([]);
      setHistoryStatus("Could not load local history.");
    }
  };

  const saveCalculation = async (entry) => {
    try {
      const createdEntry = {
        ...entry,
        _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString()
      };

      setHistory((currentHistory) => {
        const updatedHistory = [createdEntry, ...currentHistory].slice(0, 25);
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      setHistoryStatus("Saved in this browser for demo mode.");
    } catch (error) {
      setHistoryStatus("Calculation worked, but local history could not be saved.");
    }
  };

  const clearHistory = async () => {
    try {
      localStorage.removeItem(LOCAL_HISTORY_KEY);
      setHistory([]);
      setHistoryStatus("History cleared.");
    } catch (error) {
      setHistoryStatus("Could not clear history right now.");
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      setHistory((currentHistory) => {
        const updatedHistory = currentHistory.filter((entry) => entry._id !== id);
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
      });
      setHistoryStatus("History updated.");
    } catch (error) {
      setHistoryStatus("Could not delete that history item.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className={appClassName}>
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-grid" />

      <main className="app-layout">
        <section className="hero-panel">
          <div className="eyebrow">CALCULATOR DEMO</div>
          <h1>Stylish daily and scientific calculations in one polished workspace.</h1>
          <p>
            Keyboard friendly, theme aware, browser-persistent history, and built
            with React and JavaScript for a clean frontend demo.
          </p>

          <div className="hero-tags">
            <span>Keyboard Input</span>
            <span>Day / Night Mode</span>
            <span>Scientific Tools</span>
            <span>Local History</span>
          </div>
        </section>

        <section className="workspace-panel">
          <Calculator
            onSaveCalculation={saveCalculation}
            theme={theme}
            onToggleTheme={() =>
              setTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark"
              )
            }
          />

          <History
            history={history}
            historyStatus={historyStatus}
            onClearHistory={clearHistory}
            onDeleteHistoryItem={deleteHistoryItem}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
