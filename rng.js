// rng.js
class CustomRNG {
    constructor() {
        // Инициализируем сид при создании
        this.state = this.collectEntropy();
    }

    collectEntropy() {
        // Источник 1: High Resolution Time (аналог chrono)
        const now = process.hrtime.bigint();
        
        // Источник 2: Process ID и использование памяти
        const pid = BigInt(process.pid);
        const memory = BigInt(process.memoryUsage().heapUsed);

        // Микшируем энтропию
        let entropy = now ^ (pid << 1n) ^ (memory >> 1n);
        
        // Перемешиваем биты (Mixer)
        entropy ^= (entropy >> 33n);
        entropy *= 0xff51afd7ed558ccdn;
        entropy ^= (entropy >> 33n);
        entropy *= 0xc4ceb9fe1a85ec53n;
        entropy ^= (entropy >> 33n);

        return entropy; // Возвращаем BigInt
    }

    next() {
        // LCG константы (как в C++)
        // X_{n+1} = (a * X_n + c) mod 2^64
        // В JS BigInt автоматически поддерживает любую длину, но нам нужно эмулировать 64 бита
        // Поэтому используем маску 0xFFFFFFFFFFFFFFFFn
        this.state = (this.state * 6364136223846793005n + 1442695040888963407n) & 0xFFFFFFFFFFFFFFFFn;
        return this.state;
    }

    nextByte() {
        // Берем старшие 8 бит
        const val = (this.next() >> 56n) & 0xFFn;
        return Number(val);
    }

    getBytes(size) {
        const buffer = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            buffer[i] = this.nextByte();
        }
        return buffer;
    }
}

module.exports = CustomRNG;