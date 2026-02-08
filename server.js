// server.js
const express = require('express');
const bodyParser = require('body-parser');
const AES = require('./aes');
const CustomRNG = require('./rng');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

// Хелперы для конвертации строк в байты и обратно (Hex)
const hexToBytes = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
};

const bytesToHex = (bytes) => {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

const stringToBytes = (str) => new TextEncoder().encode(str);
const bytesToString = (bytes) => new TextDecoder().decode(bytes);

// --- ENDPOINTS ---

// 1. Generate Key / IV
app.get('/api/keygen', (req, res) => {
    const rng = new CustomRNG();

    // keySize в байтах: 16 (128), 24 (192), 32 (256)
    const keySize = parseInt(req.query.keySize || '16', 10);
    if (![16, 24, 32].includes(keySize)) {
        return res.status(400).json({ error: 'keySize must be 16, 24, or 32 bytes' });
    }

    const key = rng.getBytes(keySize);
    const iv = rng.getBytes(16);      // CBC IV 16 bytes
    const nonce = rng.getBytes(12);   // CTR/GCM nonce/IV 12 bytes

    res.json({
        key: bytesToHex(key),
        iv: bytesToHex(iv),
        nonce: bytesToHex(nonce)
    });
});

// 2. Encrypt (ECB/CBC/CTR)
app.post('/api/encrypt', (req, res) => {
    const { mode, key, iv } = req.body;
    const text = (req.body.text ?? req.body.data ?? "");
    // text - обычная строка
    // key, iv - hex строки

    try {
        const keyBytes = hexToBytes(key);
        const dataBytes = stringToBytes(text);
        let result;

        if (mode === 'ECB') {
            result = AES.encryptECB(dataBytes, keyBytes);
        } else if (mode === 'CBC') {
            const rng = new CustomRNG();
            const ivBytes = iv ? hexToBytes(iv) : rng.getBytes(16);

            const cipherOnly = AES.encryptCBC(dataBytes, keyBytes, ivBytes);

            // prepend IV
            result = new Uint8Array(ivBytes.length + cipherOnly.length);
            result.set(ivBytes, 0);
            result.set(cipherOnly, 16);
        } else if (mode === 'CTR') {
            const rng = new CustomRNG();
            const nonce = iv ? hexToBytes(iv).slice(0, 12) : rng.getBytes(12);

            const cipherOnly = AES.cryptCTR(dataBytes, keyBytes, nonce);

            // prepend nonce (12 bytes)
            result = new Uint8Array(12 + cipherOnly.length);
            result.set(nonce, 0);
            result.set(cipherOnly, 12);
        } else if (mode === 'GCM') {
            const rng = new CustomRNG();

            // iv12 можно передать в поле iv, либо сгенерируем
            const ivBytes = iv ? hexToBytes(iv).slice(0, 12) : rng.getBytes(12);

            // AAD (optional) — если фронт передаст req.body.aad (строка)
            const aadBytes = req.body.aad ? stringToBytes(req.body.aad) : new Uint8Array(0);

            const { ciphertext: c, tag } = AES.encryptGCM(dataBytes, keyBytes, ivBytes, aadBytes);

            // output format: IV || CIPHERTEXT || TAG
            result = new Uint8Array(12 + c.length + 16);
            result.set(ivBytes, 0);
            result.set(c, 12);
            result.set(tag, 12 + c.length);
        } else {
            return res.status(400).json({ error: 'Unknown mode' });
        }

        res.json({ ciphertext: bytesToHex(result) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Decrypt
app.post('/api/decrypt', (req, res) => {
    const { mode, ciphertext, key, iv } = req.body;
    // ciphertext - hex строка

    try {
        const keyBytes = hexToBytes(key);
        const cipherBytes = hexToBytes(ciphertext);
        let result;

        if (mode === 'ECB') {
            result = AES.decryptECB(cipherBytes, keyBytes);
        } else if (mode === 'CBC') {
            if (cipherBytes.length < 16) return res.status(400).json({ error: 'Ciphertext too short' });

            const ivBytes = cipherBytes.slice(0, 16);
            const cipherOnly = cipherBytes.slice(16);

            result = AES.decryptCBC(cipherOnly, keyBytes, ivBytes);
        } else if (mode === 'CTR') {
            if (cipherBytes.length < 12) return res.status(400).json({ error: 'Ciphertext too short' });

            const nonce = cipherBytes.slice(0, 12);
            const cipherOnly = cipherBytes.slice(12);

            result = AES.cryptCTR(cipherOnly, keyBytes, nonce);
        } else if (mode === 'GCM') {
            // format: IV(12) || C || TAG(16)
            if (cipherBytes.length < 12 + 16) {
                return res.status(400).json({ error: 'Ciphertext too short' });
            }

            const ivBytes = cipherBytes.slice(0, 12);
            const tag = cipherBytes.slice(cipherBytes.length - 16);
            const cipherOnly = cipherBytes.slice(12, cipherBytes.length - 16);

            const aadBytes = req.body.aad ? stringToBytes(req.body.aad) : new Uint8Array(0);

            result = AES.decryptGCM(cipherOnly, keyBytes, ivBytes, tag, aadBytes);
        }
        res.json({ plaintext: bytesToString(result) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => {
    console.log('AES Backend running on port 3000');
});