# 🪟 Windows Deployment Files

ไฟล์และสคริปต์สำหรับการ Deploy ระบบ WorkplanV6 บน Windows

## 📁 ไฟล์ในโฟลเดอร์นี้

### Batch Files (.bat)
- `run-development.bat` - รันระบบในโหมด development
- `run-production.bat` - รันระบบในโหมด production
- `setup-github.bat` - ตั้งค่า GitHub repository
- `setup-system.bat` - ตั้งค่าระบบ
- `start-workplan-system.bat` - เริ่มระบบ Workplan
- `upload-to-linux.bat` - อัพโหลดไฟล์ไป Linux Server

### PowerShell Scripts (.ps1)
- `upload-with-powershell.ps1` - อัพโหลดไฟล์ด้วย PowerShell

## 🚀 การใช้งาน

### รันระบบ
```cmd
# ดับเบิลคลิกไฟล์ .bat ที่ต้องการ
# หรือรันใน Command Prompt
run-production.bat
```

### ตั้งค่า GitHub
```cmd
setup-github.bat
```

### อัพโหลดไป Linux
```cmd
upload-to-linux.bat
```

### PowerShell
```powershell
# รันใน PowerShell as Administrator
.\upload-with-powershell.ps1
```

## ⚠️ หมายเหตุ

- ไฟล์ .bat ใช้สำหรับ Windows Command Prompt
- ไฟล์ .ps1 ใช้สำหรับ PowerShell
- บางไฟล์ต้องรันในโหมด Administrator

---

**อัปเดทล่าสุด:** 23 กันยายน 2567
