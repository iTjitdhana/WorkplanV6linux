# Node.js Installation Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 ติดตั้ง Node.js และ npm" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 ขั้นตอนการติดตั้ง:" -ForegroundColor Yellow
Write-Host "1. ตรวจสอบ Node.js ที่มีอยู่" -ForegroundColor White
Write-Host "2. ติดตั้ง Node.js ด้วย winget" -ForegroundColor White
Write-Host "3. ตรวจสอบการติดตั้ง" -ForegroundColor White

Write-Host ""
Write-Host "🔍 ตรวจสอบ Node.js..." -ForegroundColor Green

# ตรวจสอบ Node.js ที่มีอยู่
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js ติดตั้งแล้ว: $nodeVersion" -ForegroundColor Green
        
        # ตรวจสอบ npm
        try {
            $npmVersion = npm --version 2>$null
            if ($npmVersion) {
                Write-Host "✅ npm ติดตั้งแล้ว: $npmVersion" -ForegroundColor Green
                Write-Host ""
                Write-Host "🎉 Node.js และ npm พร้อมใช้งาน!" -ForegroundColor Green
                Read-Host "กด Enter เพื่อออก"
                exit 0
            }
        } catch {
            Write-Host "❌ ไม่พบ npm" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ ไม่พบ Node.js" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 เริ่มติดตั้ง Node.js..." -ForegroundColor Yellow

# ตรวจสอบ winget
try {
    $wingetVersion = winget --version 2>$null
    if ($wingetVersion) {
        Write-Host "✅ พบ winget: $wingetVersion" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "📦 ติดตั้ง Node.js ด้วย winget..." -ForegroundColor Yellow
        winget install OpenJS.NodeJS --accept-source-agreements --accept-package-agreements
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ ติดตั้ง Node.js สำเร็จ!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🔄 กรุณาเปิด PowerShell ใหม่เพื่อให้ PATH ทำงาน" -ForegroundColor Yellow
            Write-Host "หรือรันไฟล์นี้อีกครั้งเพื่อตรวจสอบ" -ForegroundColor Yellow
        } else {
            Write-Host ""
            Write-Host "❌ การติดตั้งล้มเหลว" -ForegroundColor Red
            Write-Host "กรุณาลองวิธีอื่น" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ ไม่พบ winget" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 วิธีติดตั้ง Node.js แบบอื่น:" -ForegroundColor Yellow
        Write-Host "1. ไปที่ https://nodejs.org/" -ForegroundColor White
        Write-Host "2. ดาวน์โหลด Node.js LTS version" -ForegroundColor White
        Write-Host "3. รันไฟล์ติดตั้ง" -ForegroundColor White
    }
} catch {
    Write-Host "❌ ไม่พบ winget" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 วิธีติดตั้ง Node.js แบบอื่น:" -ForegroundColor Yellow
    Write-Host "1. ไปที่ https://nodejs.org/" -ForegroundColor White
    Write-Host "2. ดาวน์โหลด Node.js LTS version" -ForegroundColor White
    Write-Host "3. รันไฟล์ติดตั้ง" -ForegroundColor White
}

Write-Host ""
Read-Host "กด Enter เพื่อออก" 