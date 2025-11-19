import { useState } from "react";
import "./App.css";
import PiePage from "./PiePage";

function App() {
  const [tickers, setTickers] = useState("");
  const [result, setResult] = useState(null);
  const [showPie, setShowPie] = useState(false);
  const [allowShort, setAllowShort] = useState("no"); 


  const handleSubmit = async (e) => {
    e.preventDefault();
    const tickersList = tickers.split(",").map((t) => t.trim().toUpperCase());

    try {
      const response = await fetch("http://127.0.0.1:8000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: tickersList, allow_short: allowShort }),
      });

      const data = await response.json();
      setResult(data);
      setShowPie(true); // show pie chart after fetching
    } catch (error) {
      console.error("Error calling backend:", error);
      setResult({ error: "Failed to fetch data from backend." });
      setShowPie(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Portfolio Optimizer</h1>

      <form onSubmit={handleSubmit} className="form-container">
        <label className="label">Enter tickers (comma-separated):</label>
        <input
          type="text"
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
          placeholder="AAPL, MSFT, GOOGL"
          className="input-field"
        />
                {/* Allow short selling box */}
        <div className="short-sell-box">
          <label className="short-label">Allow Short Selling?</label>
          <div className="short-options">
            <label>
              <input
                type="radio"
                name="short"
                value="yes"
                checked={allowShort === "yes"}
                onChange={(e) => setAllowShort(e.target.value)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="short"
                value="no"
                checked={allowShort === "no"}
                onChange={(e) => setAllowShort(e.target.value)}
              />
              No
            </label>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Optimize
        </button>
      </form>
      

      {/* Display result table */}
      {result && result.weights && (
        <div className="result-container">
          <h2>Optimal Portfolio Weights</h2>
          <table className="result-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Weight (%)</th>
              </tr>
            </thead>
            <tbody>
              {result.tickers.map((t, i) => (
                <tr key={t}>
                  <td>{t}</td>
                  <td>{Math.ceil(result.weights[i] * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display errors */}
      {result && result.error && (
        <div className="error-message">{result.error}</div>
      )}

      {/* Conditional Pie chart */}
      {showPie && result && result.weights && (
        <PiePage data={result} />
      )}
    </div>
  );
}

export default App;






      
