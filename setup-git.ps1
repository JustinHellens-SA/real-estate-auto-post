# 🚀 Git Repository Setup - Windows PowerShell

# Run this script from C:\real-estate-auto-post

# ========================================
# STEP 1: Initialize Git
# ========================================

Write-Host "📦 Initializing Git repository..." -ForegroundColor Cyan

if (Test-Path .git) {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
}

# ========================================
# STEP 2: Add Files
# ========================================

Write-Host "`n📁 Adding files to Git..." -ForegroundColor Cyan
git add .

Write-Host "`n📊 Git Status:" -ForegroundColor Cyan
git status

# ========================================
# STEP 3: Commit
# ========================================

$commitMsg = Read-Host "`nEnter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Initial commit - Real Estate Auto Post"
}

Write-Host "`n💾 Committing changes..." -ForegroundColor Cyan
try {
    git commit -m $commitMsg
    Write-Host "✅ Changes committed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
}

# ========================================
# STEP 4: GitHub Setup
# ========================================

Write-Host "`n📡 GitHub Remote Setup" -ForegroundColor Cyan
Write-Host "`nBefore continuing:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/new"
Write-Host "2. Create a new repository named: real-estate-auto-post"
Write-Host "3. Do NOT initialize with README, .gitignore, or license"

$created = Read-Host "`nHave you created the GitHub repository? (y/n)"

if ($created -eq 'y' -or $created -eq 'Y') {
    $ghUsername = Read-Host "Enter your GitHub username"
    $repoUrl = "https://github.com/$ghUsername/real-estate-auto-post.git"
    
    # Check if remote exists
    try {
        $existingRemote = git remote get-url origin 2>$null
        Write-Host "⚠️  Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
        $update = Read-Host "Update it to $repoUrl? (y/n)"
        if ($update -eq 'y' -or $update -eq 'Y') {
            git remote set-url origin $repoUrl
            Write-Host "✅ Remote updated" -ForegroundColor Green
        }
    } catch {
        git remote add origin $repoUrl
        Write-Host "✅ Remote added" -ForegroundColor Green
    }
    
    # Set main branch
    git branch -M main
    Write-Host "✅ Branch renamed to 'main'" -ForegroundColor Green
    
    # Push
    Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Cyan
    try {
        git push -u origin main
        Write-Host "`n🎉 Success! Repository is live at:" -ForegroundColor Green
        Write-Host "   https://github.com/$ghUsername/real-estate-auto-post" -ForegroundColor Cyan
        Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
        Write-Host "1. SSH into your server: ssh justin@192.168.23.101"
        Write-Host "2. Follow DEPLOYMENT_QUICK_START.md"
    } catch {
        Write-Host "`n❌ Push failed. You may need to authenticate with GitHub." -ForegroundColor Red
        Write-Host "Try running: git push -u origin main" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n📋 Manual steps:" -ForegroundColor Yellow
    Write-Host "`n1. Create repo at: https://github.com/new"
    Write-Host "2. Run these commands:"
    Write-Host ""
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/real-estate-auto-post.git" -ForegroundColor Cyan
    Write-Host "   git branch -M main" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
}

Write-Host "`n✨ Script complete!" -ForegroundColor Green
