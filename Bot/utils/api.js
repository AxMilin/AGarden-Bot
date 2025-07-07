const https = require("https");
const net = require("net");
const { BRIDGE_HOST, BRIDGE_PORT } = require("../config");

async function fetchStockData() {
    const options = {
        method: "GET",
        hostname: "growagarden.gg",
        path: "/api/stock",
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            priority: "u=1, i",
            referer: "https://growagarden.gg/stocks",
            "trpc-accept": "application/json",
            "x-trpc-source": "gag"
        }
    };

    const fetchRaw = () =>
        new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    try {
                        const body = Buffer.concat(chunks).toString();
                        resolve(JSON.parse(body));
                    } catch (err) {
                        reject(new Error("Failed to parse JSON: " + err.message));
                    }
                });
            });

            req.on("error", (e) => reject(e));
            req.end();
        });

    const extractCounts = (items) =>
        items.map((item) => ({
            name: item.name || "Unknown Item",
            stock: item.value?.toString() ?? "0"
        }));

    const extractLastSeen = (items) =>
        items.map((item) => ({
            name: item.name || "Unknown",
            seen: item.seen ?? null,
            emoji: item.emoji || "❓"
        }));

    try {
        const data = await fetchRaw();

        return {
            Data: {
                gear: extractCounts(data.gearStock || []),
                seeds: extractCounts(data.seedsStock || []),
                egg: extractCounts(data.eggStock || []),
                cosmetics: extractCounts(data.cosmeticsStock || [])
            },
            lastSeen: {
                Seeds: extractLastSeen(data.lastSeen?.Seeds || []),
                Gears: extractLastSeen(data.lastSeen?.Gears || []),
                Eggs: extractLastSeen(data.lastSeen?.Eggs || []),
                Honey: extractLastSeen(data.lastSeen?.Honey || []),
                Weather: extractLastSeen(data.lastSeen?.Weather || [])
            }
        };
    } catch (err) {
        console.error("Error fetching stock data:", err);
        return null;
    }
}

const fetchWeatherData = async () => {
    const options = {
        method: "GET",
        hostname: "growagarden.gg",
        path: "/api/weather/stats",
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            referer: "https://growagarden.gg/weather",
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (err) {
                    reject(new Error("Failed to parse weather JSON: " + err.message));
                }
            });
        });

        req.on("error", reject);
        req.end();
    });
};

const fetchRestockTime = async () => {
    const pad = (n) => (n < 10 ? '0' + n : n);

    const now = new Date();
    const timezone = 'America/New_York';
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const formatTime = (timestamp) =>
        new Date(timestamp).toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone,
        });

    const timeSince = (timestamp) => {
        const diff = Date.now() - timestamp;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    const getResetTimes = (interval) => {
        const elapsed = now.getTime() - today.getTime();
        const last = today.getTime() + Math.floor(elapsed / interval) * interval;
        const next = today.getTime() + Math.ceil(elapsed / interval) * interval;
        return { last, next };
    };

    const makeCountdown = (ms) =>
        `${pad(Math.floor(ms / 3.6e6))}h ${pad(Math.floor((ms % 3.6e6) / 6e4))}m ${pad(Math.floor((ms % 6e4) / 1000))}s`;

    const egg = getResetTimes(30 * 60 * 1000);
    const gear = getResetTimes(5 * 60 * 1000);
    const cosmetic = getResetTimes(4 * 3600 * 1000);
    const night = getResetTimes(3600 * 1000);

    return {
        egg: {
            timestamp: egg.next,
            countdown: makeCountdown(egg.next - now.getTime()),
            LastRestock: formatTime(egg.last),
            timeSinceLastRestock: timeSince(egg.last),
        },
        gear: {
            timestamp: gear.next,
            countdown: makeCountdown(gear.next - now.getTime()),
            LastRestock: formatTime(gear.last),
            timeSinceLastRestock: timeSince(gear.last),
        },
        seeds: {
            timestamp: gear.next,
            countdown: makeCountdown(gear.next - now.getTime()),
            LastRestock: formatTime(gear.last),
            timeSinceLastRestock: timeSince(gear.last),
        },
        cosmetic: {
            timestamp: cosmetic.next,
            countdown: makeCountdown(cosmetic.next - now.getTime()),
            LastRestock: formatTime(cosmetic.last),
            timeSinceLastRestock: timeSince(cosmetic.last),
        },
        SwarmEvent: {
            timestamp: night.next,
            countdown: makeCountdown(night.next - now.getTime()),
            LastRestock: formatTime(night.last),
            timeSinceLastRestock: timeSince(night.last),
        },
    };
};

// 👇 NEW FUNCTION ADDED HERE
async function pingBridge(host = BRIDGE_HOST, port = BRIDGE_PORT, timeout = 3000) {
    return new Promise((resolve) => {
        const start = Date.now();
        const socket = new net.Socket();

        socket.setTimeout(timeout);

        socket.on('connect', () => {
            const latency = Date.now() - start;
            socket.destroy();
            resolve(latency);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve('Timeout');
        });

        socket.on('error', () => {
            socket.destroy();
            resolve('Error');
        });

        socket.connect(port, host);
    });
}

module.exports = {
    fetchStockData,
    fetchWeatherData,
    fetchRestockTime,
    pingBridge, // 👈 export added here
};
