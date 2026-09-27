import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function History() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.history(token);
        if (!cancelled) setLogs(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="main-panel">
      <h2>Email history</h2>
      <p className="lede">The last 100 bulk sends, most recent first.</p>

      {error && <div className="banner error">{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            Nothing sent yet — your first bulk mail will show up here.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sent</th>
                  <th>Subject</th>
                  <th>Recipients</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="mono">{formatDate(log.createdAt)}</td>
                    <td>{log.subject}</td>
                    <td>
                      <span className="count-chip">
                        {log.successCount}/{log.recipients.length} delivered
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${log.status}`}>{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
