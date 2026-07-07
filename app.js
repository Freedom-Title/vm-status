//delcare json files for status
const DATA_URL = "state-public.json";
const HEARTBEAT_URL = "heartbeat-public.json";

async function loadStatus() {
    try {
        const res = await fetch(DATA_URL + "?t=" + Date.now());
        const data = await res.json();

        render(data);

        document.getElementById("lastUpdated").textContent =
            "Last updated: " + new Date().toLocaleString();

    } catch (err) {
        console.error("Failed to load state-public.json", err);
    }
}
async function loadHeartbeat() {
    try {
        const res = await fetch(HEARTBEAT_URL + "?t=" + new Date().getTime());
        const data = await res.json();

        const heartbeatTime = new Date(data.heartbeat);
        const now = new Date();

        const ageSeconds = Math.floor((now - heartbeatTime) / 1000);

        const element = document.getElementById("heartbeatStatus");

        if (ageSeconds < 30) {
            element.innerHTML =
                `🟢 Monitoring Active<br>
                 Last heartbeat: ${heartbeatTime.toLocaleTimeString()}<br>
                 Data age: ${ageSeconds} seconds`;
        }
        else if (ageSeconds < 120) {
            element.innerHTML =
                `🟡 Monitoring Delayed<br>
                 Last heartbeat: ${heartbeatTime.toLocaleTimeString()}<br>
                 Data age: ${ageSeconds} seconds`;
        }
        else {
            element.innerHTML =
                `🔴 Monitoring Offline<br>
                 Last heartbeat: ${heartbeatTime.toLocaleTimeString()}<br>
                 Data age: ${ageSeconds} seconds`;
        }

    } catch (err) {
        console.error("Failed to load heartbeat status", err);

        document.getElementById("heartbeatStatus").innerHTML =
            "🔴 Unable to verify monitoring status";
    }
}

function render(data) {
    const container = document.getElementById("serverList");
    container.innerHTML = "";

    const now = new Date(); // snapshot only during render

    data.forEach(server => {
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
                ${isOnline ? "Running for" : "Down for"}: ${uptime}
            </div>
        `;

        container.appendChild(card);
    });
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const h = hours % 24;
    const m = minutes % 60;

    if (days > 0) return `${days}d ${h}h ${m}m`;
    if (hours > 0) return `${hours}h ${m}m`;
    return `${minutes}m`;
}

// initial load
loadStatus();
loadHeartbeat();

// refresh FULL PAGE DATA every 15 seconds
setInterval(loadStatus, 15000);
setInterval(loadHeartbeat, 15000);
