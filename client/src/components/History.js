import React from "react";

function History({
  history,
  historyStatus,
  onClearHistory,
  onDeleteHistoryItem
}) {
  return (
    <aside className="history-card">
      <div className="history-header">
        <div>
          <div className="panel-label">Memory Widget</div>
          <h2>Calculation History</h2>
        </div>

        <button
          className="toggle-button danger"
          onClick={onClearHistory}
          type="button"
          disabled={!history.length}
        >
          Clear All
        </button>
      </div>

      <p className="history-status">{historyStatus}</p>

      <div className="history-list">
        {history.length ? (
          history.map((item) => (
            <article className="history-item" key={item._id}>
              <div className="history-expression">{item.expression}</div>
              <div className="history-result">= {item.result}</div>
              <div className="history-meta">
                <span>{item.mode === "scientific" ? "Scientific" : "Standard"}</span>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <button
                className="history-delete"
                onClick={() => onDeleteHistoryItem(item._id)}
                type="button"
              >
                Delete
              </button>
            </article>
          ))
        ) : (
          <div className="history-empty">
            Your saved calculations will show up here once you start solving.
          </div>
        )}
      </div>
    </aside>
  );
}

export default History;
