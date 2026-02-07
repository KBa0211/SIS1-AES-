// aes.js
// --- CONSTANTS ---
const SBOX = new Uint8Array([
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]);

const INV_SBOX = new Uint8Array([
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
]);

const RCON = new Uint8Array([0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36]);

// --- HELPER FUNCTIONS ---

function gmul(a, b) {
    let p = 0;
    for (let i = 0; i < 8; i++) {
        if ((b & 1) !== 0) p ^= a;
        let hi_bit_set = (a & 0x80) !== 0;
        a = (a << 1) & 0xFF; // Keep it 8-bit
        if (hi_bit_set) a ^= 0x1B;
        b >>= 1;
    }
    return p & 0xFF;
}

function subWord(word) {
    for (let i = 0; i < 4; i++) word[i] = SBOX[word[i]];
}

function rotWord(word) {
    let temp = word[0];
    word[0] = word[1];
    word[1] = word[2];
    word[2] = word[3];
    word[3] = temp;
}

// --- CORE TRANSFORMATIONS ---

function subBytes(state) {
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
            state[r][c] = SBOX[state[r][c]];
}

function invSubBytes(state) {
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
            state[r][c] = INV_SBOX[state[r][c]];
}

function shiftRows(state) {
    let temp;
    // Row 1: shift 1
    temp = state[1][0]; state[1][0] = state[1][1]; state[1][1] = state[1][2]; state[1][2] = state[1][3]; state[1][3] = temp;
    // Row 2: shift 2
    temp = state[2][0]; state[2][0] = state[2][2]; state[2][2] = temp;
    temp = state[2][1]; state[2][1] = state[2][3]; state[2][3] = temp;
    // Row 3: shift 3
    temp = state[3][3]; state[3][3] = state[3][2]; state[3][2] = state[3][1]; state[3][1] = state[3][0]; state[3][0] = temp;
}

function invShiftRows(state) {
    let temp;
    temp = state[1][3]; state[1][3] = state[1][2]; state[1][2] = state[1][1]; state[1][1] = state[1][0]; state[1][0] = temp;
    temp = state[2][0]; state[2][0] = state[2][2]; state[2][2] = temp;
    temp = state[2][1]; state[2][1] = state[2][3]; state[2][3] = temp;
    temp = state[3][0]; state[3][0] = state[3][1]; state[3][1] = state[3][2]; state[3][2] = state[3][3]; state[3][3] = temp;
}

function mixColumns(state) {
    let temp = new Uint8Array(4);
    for (let c = 0; c < 4; c++) {
        temp[0] = state[0][c]; temp[1] = state[1][c]; temp[2] = state[2][c]; temp[3] = state[3][c];
        state[0][c] = gmul(0x02, temp[0]) ^ gmul(0x03, temp[1]) ^ temp[2] ^ temp[3];
        state[1][c] = temp[0] ^ gmul(0x02, temp[1]) ^ gmul(0x03, temp[2]) ^ temp[3];
        state[2][c] = temp[0] ^ temp[1] ^ gmul(0x02, temp[2]) ^ gmul(0x03, temp[3]);
        state[3][c] = gmul(0x03, temp[0]) ^ temp[1] ^ temp[2] ^ gmul(0x02, temp[3]);
    }
}

function invMixColumns(state) {
    let temp = new Uint8Array(4);
    for (let c = 0; c < 4; c++) {
        temp[0] = state[0][c]; temp[1] = state[1][c]; temp[2] = state[2][c]; temp[3] = state[3][c];
        state[0][c] = gmul(0x0e, temp[0]) ^ gmul(0x0b, temp[1]) ^ gmul(0x0d, temp[2]) ^ gmul(0x09, temp[3]);
        state[1][c] = gmul(0x09, temp[0]) ^ gmul(0x0e, temp[1]) ^ gmul(0x0b, temp[2]) ^ gmul(0x0d, temp[3]);
        state[2][c] = gmul(0x0d, temp[0]) ^ gmul(0x09, temp[1]) ^ gmul(0x0e, temp[2]) ^ gmul(0x0b, temp[3]);
        state[3][c] = gmul(0x0b, temp[0]) ^ gmul(0x0d, temp[1]) ^ gmul(0x09, temp[2]) ^ gmul(0x0e, temp[3]);
    }
}

function addRoundKey(state, roundKey) {
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
            state[r][c] ^= roundKey[r][c];
}

// --- KEY EXPANSION ---
function keyExpansion(key) {
    const keyBits = key.length * 8;
    let Nk = keyBits / 32;
    let Nr = Nk + 6;
    let expandedKey = new Uint8Array(4 * 4 * (Nr + 1));

    for (let i = 0; i < Nk * 4; i++) expandedKey[i] = key[i];

    let temp = new Uint8Array(4);
    for (let i = Nk; i < 4 * (Nr + 1); i++) {
        let prevWordIdx = (i - 1) * 4;
        for (let j = 0; j < 4; j++) temp[j] = expandedKey[prevWordIdx + j];

        if (i % Nk === 0) {
            rotWord(temp);
            subWord(temp);
            temp[0] ^= RCON[Math.floor(i / Nk)];
        } else if (Nk > 6 && (i % Nk === 4)) {
            subWord(temp);
        }

        let sourceIdx = (i - Nk) * 4;
        for (let j = 0; j < 4; j++) expandedKey[i * 4 + j] = expandedKey[sourceIdx + j] ^ temp[j];
    }
    return { expandedKey, Nr };
}

// --- BLOCK CIPHER ---
function encryptBlock(input, expandedKey, Nr) {
    let state = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    // Array to State
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) state[r][c] = input[r + 4 * c];

    // Initial Round
    let roundKey = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) roundKey[r][c] = expandedKey[r + 4 * c];
    addRoundKey(state, roundKey);

    // Main Rounds
    for (let round = 1; round < Nr; round++) {
        subBytes(state);
        shiftRows(state);
        mixColumns(state);
        for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) roundKey[r][c] = expandedKey[round * 16 + r + 4 * c];
        addRoundKey(state, roundKey);
    }

    // Final Round
    subBytes(state);
    shiftRows(state);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) roundKey[r][c] = expandedKey[Nr * 16 + r + 4 * c];
    addRoundKey(state, roundKey);

    // State to Array
    let output = new Uint8Array(16);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) output[r + 4 * c] = state[r][c];
    return output;
}

function decryptBlock(input, expandedKey, Nr) {
    let state = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) state[r][c] = input[r + 4 * c];

    let roundKey = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) roundKey[r][c] = expandedKey[Nr * 16 + r + 4 * c];
    addRoundKey(state, roundKey);

    for (let round = Nr - 1; round >= 1; round--) {
        invShiftRows(state);
        invSubBytes(state);
        for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) roundKey[r][c] = expandedKey[round * 16 + r + 4 * c];
        addRoundKey(state, roundKey);
        invMixColumns(state);
    }

    invShiftRows(state);
    invSubBytes(state);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) roundKey[r][c] = expandedKey[r + 4 * c];
    addRoundKey(state, roundKey);

    let output = new Uint8Array(16);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) output[r + 4 * c] = state[r][c];
    return output;
}

// --- MODES AND PADDING ---

function padPKCS7(data) {
    const paddingSize = 16 - (data.length % 16);
    const padded = new Uint8Array(data.length + paddingSize);
    padded.set(data);
    for (let i = data.length; i < padded.length; i++) {
        padded[i] = paddingSize;
    }
    return padded;
}

function unpadPKCS7(data) {
    if (data.length === 0) return new Uint8Array(0);
    const paddingSize = data[data.length - 1];
    if (paddingSize > 0 && paddingSize <= 16) {
        return data.slice(0, data.length - paddingSize);
    }
    return data;
}

function xorBlocks(a, b, len) {
    let out = new Uint8Array(len);
    for (let i = 0; i < len; i++) out[i] = a[i] ^ b[i];
    return out;
}

//---------------------------------
// --- GCM (AEAD) HELPERS ---
// Convert 16 bytes -> BigInt (128-bit)
function bytesToBigInt128(b16) {
    let x = 0n;
    for (let i = 0; i < 16; i++) {
        x = (x << 8n) | BigInt(b16[i]);
    }
    return x;
}

// BigInt (128-bit) -> 16 bytes
function bigInt128ToBytes(x) {
    const out = new Uint8Array(16);
    for (let i = 15; i >= 0; i--) {
        out[i] = Number(x & 0xFFn);
        x >>= 8n;
    }
    return out;
}

// GF(2^128) multiply: X * Y mod (x^128 + x^7 + x^2 + x + 1)
function gf128Mul(x, y) {
    const R = 0xE1000000000000000000000000000000n;
    let z = 0n;
    let v = x;

    for (let i = 0; i < 128; i++) {
        // process bit i of y (from MSB to LSB)
        const bit = (y >> BigInt(127 - i)) & 1n;
        if (bit === 1n) z ^= v;

        // v = v >> 1, and if LSB was 1 then v ^= R
        const lsb = v & 1n;
        v >>= 1n;
        if (lsb === 1n) v ^= R;
    }
    return z;
}

function xor16(a, b) {
    const out = new Uint8Array(16);
    for (let i = 0; i < 16; i++) out[i] = a[i] ^ b[i];
    return out;
}

// pad to 16-byte blocks for GHASH
function pad16(data) {
    if (data.length % 16 === 0) return data;
    const out = new Uint8Array(data.length + (16 - (data.length % 16)));
    out.set(data);
    return out;
}

function u64be(nBig) {
    // nBig is BigInt
    const out = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
        out[i] = Number(nBig & 0xFFn);
        nBig >>= 8n;
    }
    return out;
}

function ghash(H, A, C) {
    const Hx = bytesToBigInt128(H);
    let y = 0n;

    const Ap = pad16(A || new Uint8Array(0));
    const Cp = pad16(C || new Uint8Array(0));

    for (let i = 0; i < Ap.length; i += 16) {
        const block = Ap.slice(i, i + 16);
        y = gf128Mul(y ^ bytesToBigInt128(block), Hx);
    }
    for (let i = 0; i < Cp.length; i += 16) {
        const block = Cp.slice(i, i + 16);
        y = gf128Mul(y ^ bytesToBigInt128(block), Hx);
    }

    // length block: [len(A)]64 || [len(C)]64 in bits
    const lenBlock = new Uint8Array(16);
    lenBlock.set(u64be(BigInt((A ? A.length : 0) * 8)), 0);
    lenBlock.set(u64be(BigInt((C ? C.length : 0) * 8)), 8);

    y = gf128Mul(y ^ bytesToBigInt128(lenBlock), Hx);
    return bigInt128ToBytes(y);
}

function inc32(block16) {
    // increment last 32 bits (big-endian)
    const out = block16.slice();
    let x = (out[12] << 24) | (out[13] << 16) | (out[14] << 8) | out[15];
    x = (x + 1) >>> 0;
    out[12] = (x >>> 24) & 0xFF;
    out[13] = (x >>> 16) & 0xFF;
    out[14] = (x >>> 8) & 0xFF;
    out[15] = x & 0xFF;
    return out;
}

function constTimeEq(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= (a[i] ^ b[i]);
    return diff === 0;
}
// --- PUBLIC API ---
const AES = {
    encryptECB: (plaintext, key) => {
        const { expandedKey, Nr } = keyExpansion(key);
        const padded = padPKCS7(plaintext);
        const ciphertext = new Uint8Array(padded.length);
        for (let i = 0; i < padded.length; i += 16) {
            const block = padded.slice(i, i + 16);
            const encBlock = encryptBlock(block, expandedKey, Nr);
            ciphertext.set(encBlock, i);
        }
        return ciphertext;
    },

    decryptECB: (ciphertext, key) => {
        const { expandedKey, Nr } = keyExpansion(key);
        const decrypted = new Uint8Array(ciphertext.length);
        for (let i = 0; i < ciphertext.length; i += 16) {
            const block = ciphertext.slice(i, i + 16);
            const decBlock = decryptBlock(block, expandedKey, Nr);
            decrypted.set(decBlock, i);
        }
        return unpadPKCS7(decrypted);
    },

    encryptCBC: (plaintext, key, iv) => {
        const { expandedKey, Nr } = keyExpansion(key);
        const padded = padPKCS7(plaintext);
        const ciphertext = new Uint8Array(padded.length);
        let previousBlock = iv.slice(0, 16);

        for (let i = 0; i < padded.length; i += 16) {
            let block = padded.slice(i, i + 16);
            block = xorBlocks(block, previousBlock, 16);
            const encBlock = encryptBlock(block, expandedKey, Nr);
            ciphertext.set(encBlock, i);
            previousBlock = encBlock;
        }
        return ciphertext;
    },

    decryptCBC: (ciphertext, key, iv) => {
        const { expandedKey, Nr } = keyExpansion(key);
        const decrypted = new Uint8Array(ciphertext.length);
        let previousBlock = iv.slice(0, 16);

        for (let i = 0; i < ciphertext.length; i += 16) {
            const block = ciphertext.slice(i, i + 16);
            const decBlock = decryptBlock(block, expandedKey, Nr);
            const xored = xorBlocks(decBlock, previousBlock, 16);
            decrypted.set(xored, i);
            previousBlock = block;
        }
        return unpadPKCS7(decrypted);
    },
    
    // CTR Mode (Counter)
    cryptCTR: (data, key, nonce) => {
         const { expandedKey, Nr } = keyExpansion(key);
         const output = new Uint8Array(data.length);
         let counterBlock = new Uint8Array(16);
         counterBlock.set(nonce, 0); // Copy 12 bytes nonce
         let counter = 0;
         
         for(let i=0; i < data.length; i+=16) {
             // Set counter in big-endian
             counterBlock[12] = (counter >>> 24) & 0xFF;
             counterBlock[13] = (counter >>> 16) & 0xFF;
             counterBlock[14] = (counter >>> 8) & 0xFF;
             counterBlock[15] = counter & 0xFF;
             
             const keystream = encryptBlock(counterBlock, expandedKey, Nr);
             const len = Math.min(16, data.length - i);
             const block = data.slice(i, i + len);
             
             for(let j=0; j<len; j++) {
                 output[i+j] = block[j] ^ keystream[j];
             }
             counter++;
         }
         return output;
    },
    
    // --- GCM (AEAD) ---
    encryptGCM: (plaintext, key, iv12, aad = new Uint8Array(0)) => {
        if (iv12.length !== 12) throw new Error('GCM IV must be 12 bytes');

        const { expandedKey, Nr } = keyExpansion(key);

        // H = AES_K(0^128)
        const H = encryptBlock(new Uint8Array(16), expandedKey, Nr);

        // J0 = IV || 0x00000001
        let J0 = new Uint8Array(16);
        J0.set(iv12, 0);
        J0[15] = 1;

        // CTR encryption starting from inc32(J0)
        let ctr = inc32(J0);
        const ciphertext = new Uint8Array(plaintext.length);

        for (let i = 0; i < plaintext.length; i += 16) {
            const ks = encryptBlock(ctr, expandedKey, Nr);
            const len = Math.min(16, plaintext.length - i);
            for (let j = 0; j < len; j++) ciphertext[i + j] = plaintext[i + j] ^ ks[j];
            ctr = inc32(ctr);
        }

        // tag = E(K, J0) XOR GHASH(H, AAD, C)
        const S = ghash(H, aad, ciphertext);
        const E0 = encryptBlock(J0, expandedKey, Nr);
        const tag = xor16(E0, S);

        return { ciphertext, tag };
    },

    decryptGCM: (ciphertext, key, iv12, tag, aad = new Uint8Array(0)) => {
        if (iv12.length !== 12) throw new Error('GCM IV must be 12 bytes');
        if (tag.length !== 16) throw new Error('GCM tag must be 16 bytes');

        const { expandedKey, Nr } = keyExpansion(key);

        const H = encryptBlock(new Uint8Array(16), expandedKey, Nr);

        let J0 = new Uint8Array(16);
        J0.set(iv12, 0);
        J0[15] = 1;

        const S = ghash(H, aad, ciphertext);
        const E0 = encryptBlock(J0, expandedKey, Nr);
        const expectedTag = xor16(E0, S);

        if (!constTimeEq(expectedTag, tag)) {
            throw new Error('Invalid authentication tag');
        }

        // CTR decrypt (same as encrypt)
        let ctr = inc32(J0);
        const plaintext = new Uint8Array(ciphertext.length);

        for (let i = 0; i < ciphertext.length; i += 16) {
            const ks = encryptBlock(ctr, expandedKey, Nr);
            const len = Math.min(16, ciphertext.length - i);
            for (let j = 0; j < len; j++) plaintext[i + j] = ciphertext[i + j] ^ ks[j];
            ctr = inc32(ctr);
        }

        return plaintext;
    }
};

module.exports = AES;