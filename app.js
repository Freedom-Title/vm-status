const DATA_URL = "state-public.json";

let servers = [];
let lastSuccessfulLoad = null;

async function loadStatus() {
    try {
        const res = await fetch(DATA_URL + "?t=" + Date.now());
        const data = await res.json();

        servers = data;
        lastSuccessfulLoad = new Date();

        render();
    } catch (err) {
        console.error("Failed to load state-public.json", err);
    }
}

function render() {
    const container = document.getElementById("serverList");
    container.innerHTML = "";

    const now = new Date();

    servers.forEach(server => {
        const since = new Date(server.since);
        const diffMs = now - since;

        const uptime = formatDuration(diffMs);

        const card = document.createElement("div");
        card.classList.add("card");

        const isOnline =
            server.status.toUpperCase() === "UP" ||
            server.status.toUpperCase() === "ONLINE";

        card.classList.add(isOnline ? "online" : "offline");

        card.innerHTML = `
            <div class="server-name">${server.name}</div>
            <div class="status ${isOnline ? "online" : "offline"}">
                ${isOnline ? "ONLINE" : "OFFLINE"}
            </div>
            <div class="uptime">
                ${isOnline ? "Running for" : "Down for"}:
                <span class="uptime-counter" data-since="${server.since}">
                    ${uptime}
                </span>
            </div>
        `;

        container.appendChild(card);
    });

    if (lastSuccessfulLoad) {
        document.getElementById("lastUpdated").textContent =
            "Last updated: " + lastSuccessfulLoad.toLocaleString();
    } else {
        document.getElementById("lastUpdated").textContent =
            "Last updated: --";
    }
}

function updateUptimes() {
    const now = new Date();

    document.querySelectorAll(".uptime-counter").forEach(el => {
        const since = new Date(el.dataset.since);
        el.textContent = formatDuration(now - since);
    });
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const h = hours % 24;
    const m = minutes % 60;
    const s = seconds % 60;

    if (days > 0) {
        return `${days}d ${h}h ${m}m`;
    }

    if (hours > 0) {
        return `${hours}h ${m}m ${s}s`;
    }

    return `${minutes}m ${s}s`;
}

// Initial load
loadStatus();

// Refresh data from GitHub every 60 seconds
setInterval(loadStatus, 60000);

// Update only the timers every second
setInterval(updateUptimes, 1000);
