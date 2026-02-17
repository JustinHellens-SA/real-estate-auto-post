#!/bin/bash
#
# Git Repository Setup Script
# Run this locally before deploying
#

set -e

echo "🚀 Setting up Git repository for Real Estate Auto-Post"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Add files
echo ""
echo "📁 Adding files to Git..."
git add .

# Show status
echo ""
echo "📊 Git status:"
git status

# Commit
echo ""
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Initial commit - Real Estate Auto Post"
fi

git commit -m "$COMMIT_MSG" || echo "⚠️  No changes to commit"

# Remote
echo ""
echo "📡 GitHub Remote Setup"
echo ""
echo "Before continuing:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository named: real-estate-auto-post"
echo "3. Do NOT initialize with README, .gitignore, or license"
echo ""
read -p "Have you created the GitHub repository? (y/n): " CREATED

if [ "$CREATED" = "y" ] || [ "$CREATED" = "Y" ]; then
    read -p "Enter your GitHub username: " GH_USERNAME
    
    REPO_URL="https://github.com/$GH_USERNAME/real-estate-auto-post.git"
    
    # Check if remote already exists
    if git remote get-url origin >/dev/null 2>&1; then
        echo "⚠️  Remote 'origin' already exists"
        read -p "Update it to $REPO_URL? (y/n): " UPDATE
        if [ "$UPDATE" = "y" ] || [ "$UPDATE" = "Y" ]; then
            git remote set-url origin "$REPO_URL"
            echo "✅ Remote updated"
        fi
    else
        git remote add origin "$REPO_URL"
        echo "✅ Remote added"
    fi
    
    # Set main branch
    git branch -M main
    
    # Push
    echo ""
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    
    echo ""
    echo "🎉 Success! Repository is live at:"
    echo "   https://github.com/$GH_USERNAME/real-estate-auto-post"
    echo ""
    echo "📋 Next steps:"
    echo "1. SSH into your server: ssh justin@192.168.23.101"
    echo "2. Follow DEPLOYMENT_QUICK_START.md"
    echo ""
else
    echo ""
    echo "📋 Manual steps:"
    echo ""
    echo "1. Create repo at: https://github.com/new"
    echo "2. Run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/real-estate-auto-post.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
fi
