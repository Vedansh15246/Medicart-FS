# 📝 LOG OUTPUT CONFIGURATION GUIDE

## Where Are Logs Going Right Now?

### 📺 Console (Terminal) - DEFAULT
```
Your Terminal Window
     ↓
[DEBUG] 📍 [JWT FILTER] START
[DEBUG] ✂️  Extracting token
[DEBUG] ✅ JWT SIGNATURE VERIFIED
     ...
```

When you run:
```bash
mvn spring-boot:run -f admin-catalogue-service/pom.xml
```

All logs print to the terminal window. **Logs disappear when you close the terminal.**

---

## How to Save Logs to a File (Optional)

### Option 1: Enable File Logging

Open [application.properties](microservices/admin-catalogue-service/src/main/resources/application.properties) and uncomment:

```properties
# 📝 SAVE LOGS TO FILE (Optional - uncomment to enable)
logging.file.name=logs/admin-catalogue-service.log
logging.file.max-size=10MB
logging.file.max-history=10
```

This will:
- ✅ Save logs to `logs/admin-catalogue-service.log`
- ✅ Create new file when size reaches 10MB
- ✅ Keep 10 previous versions (admin-catalogue-service.log.1, .log.2, etc)

### Option 2: Save to Custom Location

```properties
# Save to specific directory
logging.file.name=C:/Users/SHAHID/OneDrive/Desktop/Project/microservices/admin-catalogue-service/logs/service.log
```

---

## 📂 Log File Location

Once enabled, logs will be saved at:

```
📁 c:\Users\SHAHID\OneDrive\Desktop\Project\microservices\admin-catalogue-service\
  📁 logs\  ← LOGS FOLDER (auto-created)
    📄 admin-catalogue-service.log  ← CURRENT LOG
    📄 admin-catalogue-service.log.1  ← PREVIOUS LOG (if rotated)
    📄 admin-catalogue-service.log.2
    📄 admin-catalogue-service.log.3
    ...
```

---

## 🔄 Both Console + File

By default, when you enable file logging:
- ✅ Logs STILL print to console
- ✅ Logs ALSO saved to file

So you get both!

---

## 📋 Log Configuration Options

| Property | Purpose | Example |
|----------|---------|---------|
| `logging.file.name` | File path | `logs/app.log` |
| `logging.file.max-size` | When to rotate | `10MB` |
| `logging.file.max-history` | Keep how many old files | `10` |
| `logging.pattern.file` | File log format | Custom format |
| `logging.pattern.console` | Console log format | Custom format |

---

## 🧪 Test It

### Step 1: Enable File Logging
Uncomment lines in application.properties:
```properties
logging.file.name=logs/admin-catalogue-service.log
logging.file.max-size=10MB
logging.file.max-history=10
```

### Step 2: Restart Service
```bash
mvn clean install -f admin-catalogue-service/pom.xml
mvn spring-boot:run -f admin-catalogue-service/pom.xml
```

### Step 3: Make a Request
```bash
curl http://localhost:8082/medicines
```

### Step 4: Check Log File
```bash
# Navigate to logs folder
cd admin-catalogue-service
ls logs/
cat logs/admin-catalogue-service.log
```

---

## 📊 Console Output Example

```
════════════════════════════════════════════════════════════════
📍 [JWT FILTER] START
METHOD: GET | URI: /medicines
════════════════════════════════════════════════════════════════

🔍 [JWT FILTER] Reading Authorization header
📋 Header value: NULL

⚠️  Authorization header is NULL
→ Passing request to next filter

🔷 [GET /medicines] REQUEST RECEIVED
✅ [GET /medicines] RESPONSE SENT: 5 medicines
```

This appears in BOTH console and log file (if enabled).

---

## 🎯 Which Option to Use?

### Use Console Only (Default)
- ✅ For development/testing
- ✅ When you're actively watching the terminal
- ✅ Don't need logs after shutdown
- ✅ Simpler setup (no files to manage)

### Use File Logging
- ✅ For production
- ✅ When you need logs after shutdown
- ✅ For long-running services
- ✅ For debugging issues after they happen
- ✅ For compliance/audit trails

---

## 💡 Pro Tip

Enable file logging while testing - you can:
1. Watch console in real-time
2. Save logs to file for later review
3. Search logs with grep: `grep "JWT SIGNATURE VERIFIED" logs/admin-catalogue-service.log`
4. Keep logs if service crashes

---

## Current Status

**File logging:** ⏸️ Disabled (but configured and ready)

To enable:
1. Open application.properties
2. Uncomment the 3 logging.file.* lines
3. Save & restart service

That's it! Logs will now be saved to `logs/admin-catalogue-service.log` 📝

