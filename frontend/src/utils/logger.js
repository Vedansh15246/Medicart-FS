/**
 * Advanced logging utility that saves logs to localStorage and console
 */

class Logger {
  constructor(storageKey = "app_logs") {
    this.storageKey = storageKey;
    this.maxLogs = 500; // Max logs to keep in storage
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      console.error("Failed to load logs from storage:", e);
      return [];
    }
  }

  saveLogs() {
    try {
      // Keep only last N logs
      const logsToSave = this.logs.slice(-this.maxLogs);
      localStorage.setItem(this.storageKey, JSON.stringify(logsToSave));
    } catch (e) {
      console.error("Failed to save logs to storage:", e);
    }
  }

  addLog(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      url: window.location.pathname,
    };

    this.logs.push(logEntry);
    this.saveLogs();

    // Also log to console
    const consoleMethod = console[level.toLowerCase()] || console.log;
    if (data) {
      consoleMethod(`[${timestamp}] [${level}] ${message}`, data);
    } else {
      consoleMethod(`[${timestamp}] [${level}] ${message}`);
    }
  }

  debug(message, data = null) {
    this.addLog("DEBUG", message, data);
  }

  info(message, data = null) {
    this.addLog("INFO", message, data);
  }

  warn(message, data = null) {
    this.addLog("WARN", message, data);
  }

  error(message, data = null) {
    this.addLog("ERROR", message, data);
  }

  logApiRequest(method, url, headers = {}, data = null) {
    this.info("🌐 API REQUEST", {
      method,
      url,
      headers: this.sanitizeHeaders(headers),
      data: data ? (typeof data === "object" ? JSON.stringify(data).substring(0, 100) : data) : null,
    });
  }

  logApiResponse(method, url, status, data = null) {
    this.info("✅ API RESPONSE", {
      method,
      url,
      status,
      dataSize: data ? (typeof data === "object" ? JSON.stringify(data).length : data.length) : 0,
    });
  }

  logApiError(method, url, status, error) {
    this.error("❌ API ERROR", {
      method,
      url,
      status,
      error: error.message || error,
    });
  }

  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = sanitized.Authorization.substring(0, 20) + "...";
    }
    return sanitized;
  }

  getLogs(filter = null) {
    if (!filter) return this.logs;

    return this.logs.filter((log) => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.message && !log.message.includes(filter.message)) return false;
      if (filter.since) {
        const since = new Date(filter.since);
        return new Date(log.timestamp) >= since;
      }
      return true;
    });
  }

  exportLogs() {
    const logsText = this.logs
      .map((log) => {
        let entry = `[${log.timestamp}] [${log.level}] ${log.message}`;
        if (log.data) {
          entry += ` | ${JSON.stringify(log.data)}`;
        }
        return entry;
      })
      .join("\n");

    return logsText;
  }

  downloadLogs() {
    const logs = this.exportLogs();
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(logs));
    element.setAttribute("download", `logs_${new Date().toISOString()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
    console.log("Logs cleared");
  }
}

export default new Logger("medicart_logs");
