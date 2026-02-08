import { useState } from "react";
import axios from "axios";
import './App.css'

export default function App() {
  const [mode, setMode] = useState("CBC");
  const [keySize, setKeySize] = useState(16);
  const [key, setKey] = useState("");
  const [iv, setIv] = useState("");
  const [text, setText] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [aad, setAad] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:3000/api";

  const generateKey = async () => {
    const res = await axios.get(`${API}/keygen?keySize=${keySize}`);
    setKey(res.data.key);

    if (mode === "CBC") setIv(res.data.iv);
    else if (mode === "CTR" || mode === "GCM") setIv(res.data.nonce);
  };

  const encrypt = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/encrypt`, {
        mode,
        key,
        iv,
        text,
        aad: mode === "GCM" ? aad : undefined,
      });
      setCiphertext(res.data.ciphertext);
    } catch (e) {
      alert(e.response?.data?.error || "Encryption error");
    }
    setLoading(false);
  };

  const decrypt = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/decrypt`, {
        mode,
        key,
        ciphertext,
        aad: mode === "GCM" ? aad : undefined,
      });
      setText(res.data.plaintext);
    } catch (e) {
      alert(e.response?.data?.error || "Decryption error");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>AES Encryption Tool</h1>

      <div className="row">
        <label>Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option>ECB</option>
          <option>CBC</option>
          <option>CTR</option>
          <option>GCM</option>
        </select>

        <label>Key Size:</label>
        <select value={keySize} onChange={(e) => setKeySize(e.target.value)}>
          <option value={16}>128-bit</option>
          <option value={24}>192-bit</option>
          <option value={32}>256-bit</option>
        </select>
      </div>

      <div className="row">
        <label>Key (Hex):</label>
        <textarea value={key} onChange={(e) => setKey(e.target.value)} />
        <button onClick={generateKey}>Generate Key</button>
      </div>

      {mode !== "ECB" && (
        <div className="row">
          <label>IV / Nonce (Hex):</label>
          <textarea value={iv} onChange={(e) => setIv(e.target.value)} />
        </div>
      )}

      {mode === "GCM" && (
        <div className="row">
          <label>AAD (optional):</label>
          <textarea value={aad} onChange={(e) => setAad(e.target.value)} />
        </div>
      )}

      <div className="row">
        <label>Plaintext:</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="buttons" >
        <button onClick={encrypt} disabled={loading}>
          Encrypt
        </button>
        <button onClick={decrypt} disabled={loading}>
          Decrypt
        </button>
      </div>

      <div className="ciphertext">
        <label>Ciphertext (Hex):</label>
        <textarea
          value={ciphertext}
          onChange={(e) => setCiphertext(e.target.value)}
        />
      </div>
    </div>
  );
}

