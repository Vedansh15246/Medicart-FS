# 📍 LOG FILES LOCATION - WHERE TO FIND LOGS

## Main Log File for 403 Error Debugging

### Primary Log File Location:
```
c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log
```

### Or this path:
```
C:\Users\2460603\OneDrive - Cognizant\Desktop\Project\microservices\admin-catalogue-service\logs\admin-catalogue-service.log
```

---

## How Logs Are Created

When you run the admin-catalogue-service:

```powershell
cd microservices/admin-catalogue-service
java -jar target/admin-catalogue-service-1.0.0.jar
```

The logs folder is automatically created at:
```
microservices/admin-catalogue-service/logs/
```

And the main log file is:
```
admin-catalogue-service.log
```

---

## Other Service Logs

### Auth Service Logs:
```
c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\auth-service\logs\auth-service.log
```

### API Gateway Logs:
```
c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\api-gateway\logs\api-gateway.log
```

---

## How to View the Log File

### Option 1: PowerShell - View Last 50 Lines
```powershell
Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 50
```

### Option 2: PowerShell - Watch Logs in Real-Time (NEW LOGS AS THEY COME)
```powershell
Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Wait
```

### Option 3: PowerShell - Filter for 403 Errors Only
```powershell
Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Wait | Select-String "403|FORBIDDEN|ERROR"
```

### Option 4: Open File Directly
```powershell
notepad "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log"
```

---

## Step by Step to Get Logs and Share with Me

### Step 1: Start Service (if not running)
```powershell
cd c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service
java -jar target/admin-catalogue-service-1.0.0.jar
```

### Step 2: Make POST /batches Request
- Use Postman
- Or use frontend UI
- Send request with Authorization header

### Step 3: Get Last 100 Lines of Logs
```powershell
Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 100 | Out-File "c:\Users\2460603\Desktop\LOGS_FOR_DEBUG.txt"
```

### Step 4: Send This File to Me
The file `LOGS_FOR_DEBUG.txt` on your Desktop will have the logs

---

## What Logs Will Show

When you make POST /batches request, logs will show:

```
🔍 REQUEST ENTRY POINT - ADMIN-CATALOGUE-SERVICE (8082)
├─ Method: POST | Path: /batches
├─ Authorization: Present ✓ or NULL ❌
├─ X-User-Id: 1
└─ Response Status: 200 OK ✅ or 403 FORBIDDEN ❌

If 403 appears, logs will show:
└─ ROOT CAUSE ANALYSIS
   ├─ JWT FILTER LOG MESSAGES
   ├─ SECURITY CONFIG DECISION
   └─ EXACT ERROR REASON
```

---

## Console Output (Alternative)

If you don't want to check file, you can also see logs in terminal:

### When running service:
```powershell
java -jar target/admin-catalogue-service-1.0.0.jar
```

All logs appear in terminal/console in real-time!

Scroll up in console to see:
- Request entry logs
- JWT filter logs
- 403 error message (if any)
- Root cause analysis

---

## Summary

| What | Where |
|------|-------|
| **Main Log File** | `admin-catalogue-service\logs\admin-catalogue-service.log` |
| **View Last 50 Lines** | `Get-Content "path" -Tail 50` |
| **Watch Live** | `Get-Content "path" -Wait` |
| **Filter 403 Errors** | `Get-Content "path" -Wait \| Select-String "403"` |
| **Console Output** | Terminal where you ran `java -jar` |

---

## Quick Commands Copy-Paste

### View Last 100 Lines:
```powershell
Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 100
```

### Watch for 403 in Real-Time:
```powershell
Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Wait | Select-String "403|ERROR"
```

### Save Logs to File:
```powershell
Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 200 | Out-File "c:\Users\2460603\Desktop\LOGS.txt"
```

---

## NOW DO THIS:

1. ✅ Rebuild admin-catalogue-service:
   ```powershell
   cd microservices/admin-catalogue-service
   mvn clean install -DskipTests
   ```

2. ✅ Start service:
   ```powershell
   java -jar target/admin-catalogue-service-1.0.0.jar
   ```

3. ✅ Make POST /batches request from Postman or Frontend

4. ✅ Copy logs:
   ```powershell
   Get-Content "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\microservices\admin-catalogue-service\logs\admin-catalogue-service.log" -Tail 150 | Out-File "c:\Users\2460603\Desktop\LOGS.txt"
   ```

5. ✅ Open `c:\Users\2460603\Desktop\LOGS.txt` and **send me the content**

**Then I'll tell you EXACTLY what's wrong and how to fix it!** 🎯
