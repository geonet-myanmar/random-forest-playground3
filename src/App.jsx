import React, { useMemo, useState } from "react";

// --- HELPERS ---
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateData(n, noise, seed, pattern) {
  const rand = mulberry32(seed);
  const points = [];
  for (let i = 0; i < n; i++) {
    const x = rand();
    const y = rand();
    let label;
    if (pattern === "circle") {
      const dx = x - 0.5;
      const dy = y - 0.5;
      label = dx * dx + dy * dy < 0.08 ? 1 : 0;
    } else {
      label = x > y ? 1 : 0;
    }
    if (rand() < noise) label = 1 - label;
    points.push({ x, y, label });
  }
  return points;
}

// Simple Decision Tree Logic
function buildTree(data, depth, maxDepth) {
  if (depth >= maxDepth || data.length <= 1) {
    const count1 = data.filter(d => d.label === 1).length;
    return { type: 'leaf', prediction: count1 > data.length / 2 ? 1 : 0 };
  }
  const axis = Math.random() > 0.5 ? 'x' : 'y';
  const split = Math.random();
  const left = data.filter(d => d[axis] < split);
  const right = data.filter(d => d[axis] >= split);
  return {
    type: 'node',
    axis,
    split,
    left: buildTree(left, depth + 1, maxDepth),
    right: buildTree(right, depth + 1, maxDepth)
  };
}

const App = () => {
  const [numTrees, setNumTrees] = useState(5);
  const [pattern, setPattern] = useState("circle");

  const data = useMemo(() => generateData(100, 0.1, 42, pattern), [pattern]);
  const forest = useMemo(() => Array.from({ length: numTrees }).map(() => buildTree(data, 0, 3)), [data, numTrees]);

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <h1 style={{ color: "#1e293b", marginBottom: "10px" }}>🌳 Random Forest Playground</h1>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Adjust parameters to see how the forest learns.</p>
        
        <div style={{ display: "grid", gap: "20px", marginBottom: "30px" }}>
          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>Number of Trees: {numTrees}</label>
            <input 
              type="range" min="1" max="20" value={numTrees} 
              onChange={(e) => setNumTrees(parseInt(e.target.value))} 
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>Data Pattern</label>
            <button 
              onClick={() => setPattern("circle")}
              style={{ padding: "8px 16px", marginRight: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: pattern === "circle" ? "#3b82f6" : "white", color: pattern === "circle" ? "white" : "black", cursor: "pointer" }}
            >Circle</button>
            <button 
              onClick={() => setPattern("linear")}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: pattern === "linear" ? "#3b82f6" : "white", color: pattern === "linear" ? "white" : "black", cursor: "pointer" }}
            >Linear</button>
          </div>
        </div>

        <div style={{ position: "relative", width: "100%", height: "300px", border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#f1f5f9" }}>
          {data.map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: p.label === 1 ? "#ef4444" : "#3b82f6",
              transform: "translate(-50%, -50%)"
            }} />
          ))}
        </div>
        <p style={{ marginTop: "15px", fontSize: "14px", color: "#94a3b8" }}>
          This visualizes the training data. In a real Random Forest, each tree would vote on these points.
        </p>
      </div>
    </div>
  );
};

export default App;