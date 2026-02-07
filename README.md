# AES Backend (SIS)

Backend implementation of AES encryption from scratch (FIPS-197) with multiple modes of operation.

## Features
- AES-128 / AES-192 / AES-256
- ECB, CBC, CTR, GCM (AEAD)
- PKCS#7 padding
- Custom random number generator
- No cryptographic libraries used

## Setup
```bash
npm install
node server.js
