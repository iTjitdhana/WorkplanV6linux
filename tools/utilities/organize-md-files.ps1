# Script to organize .md files into categories
Write-Host "Organizing .md files..." -ForegroundColor Green

# Create directories if they don't exist
$directories = @("docs\guides", "docs\fixes", "docs\updates", "docs\deployment", "docs\system")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Define file categories
$guides = @(
    "QUICK_START_GUIDE.md",
    "NODEJS_INSTALLATION_GUIDE.md", 
    "LOGS_PAGE_GUIDE.md",
    "MONITORING_SYSTEM_GUIDE.md",
    "IP_192_168_0_94_SETUP_GUIDE.md",
    "QUICK_IP_SETUP.md",
    "ENVIRONMENT_SETUP.md",
    "SETUP_AFTER_CLONE.md",
    "PERFORMANCE_OPTIMIZATION_GUIDE.md",
    "FONT_UPDATE_GUIDE.md",
    "DATABASE_FIX_GUIDE.md",
    "DOCKER_UPDATE_GUIDE.md"
)

$deployment = @(
    "PRODUCTION_DEPLOYMENT_GUIDE.md",
    "PRODUCTION_DEPLOYMENT.md",
    "BUILD_AND_PUSH_GUIDE.md",
    "DOCKER_REGISTRY_GUIDE.md",
    "DOCKER_UPDATE_GUIDE.md",
    "QUICK_DEPLOYMENT_GUIDE.md",
    "SERVER_DEPLOYMENT_GUIDE.md",
    "SERVER_SETUP_GUIDE.md",
    "PRODUCTION_REMOTE_DB_SETUP.md",
    "DEPLOYMENT_SUMMARY.md",
    "DEPLOYMENT.md"
)

$fixes = @(
    "FIX_API_URL_ISSUE.md",
    "FIX_DELETE_SAVE_ISSUES.md",
    "FIX_SEARCH_ISSUE.md",
    "FIX_NPM_EXECUTION_POLICY.md",
    "FIX_NODEJS_ISSUES.md",
    "NETWORK_ACCESS_FIX.md",
    "QUERY_OPTIMIZATION_FIX.md",
    "SYNC_ISSUE_FIX.md",
    "DRAFT_DELETE_FIX.md",
    "DRAFT_DUPLICATE_FIX.md",
    "DROPDOWN_ADD_NEW_FIX.md",
    "DUPLICATE_DATA_FIX.md",
    "FINAL_BAT_FIX_SUMMARY.md",
    "BAT_FILES_FIX_SUMMARY.md",
    "Google_Apps_Script_Fix.md"
)

$updates = @(
    "PRODUCTION_LOGS_UPDATE.md",
    "REPORTS_SYSTEM_UPDATE.md",
    "REPORTS_SYSTEM_IMPROVEMENTS.md",
    "REPORTS_LAYOUT_UPDATE.md",
    "REPORTS_DATA_LIMIT_UPDATE.md",
    "WEEKLY_VIEW_UPDATE.md",
    "WEEKLY_VIEW_DATA_FIX.md",
    "WEEKLY_VIEW_DEFAULT_JOBS_FILTER.md",
    "TIMETABLE_MERGE_UPDATE.md",
    "CALENDAR_PICKER_UPDATE.md",
    "CURRENT_DATE_FILTER_UPDATE.md",
    "DATE_FORMAT_LAYOUT_UPDATE.md",
    "DATETIME_INPUT_UPDATE.md",
    "BACKGROUND_COLOR_UPDATE.md",
    "PRINT_BUTTON_UPDATE.md",
    "DOCKER_UPDATE_SUMMARY.md",
    "PULL_UPDATE_GUIDE.md"
)

$system = @(
    "README.md",
    "RefactoredAppStructure.md",
    "LOGS_SYSTEM_README.md",
    "NEW_JOBS_SYSTEM_README.md",
    "Machine_Mapping_Logic.md",
    "SQL_JOB_CODE_ANALYSIS.md",
    "server-env-config.md",
    "SCRIPTS_ORGANIZATION_SUMMARY.md",
    "BAT_FILES_ORGANIZATION.md",
    "LIMIT_FIX_EXPLANATION.md",
    "DATABASE_MISMATCH_ISSUE.md",
    "Task.md",
    "Traks.md",
    "req.md"
)

# Move files to appropriate directories
function Move-Files {
    param($files, $destination)
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            try {
                Move-Item $file $destination -Force
                Write-Host "Moved $file to $destination" -ForegroundColor Green
            }
            catch {
                Write-Host "Error moving $file" -ForegroundColor Red
            }
        }
        else {
            Write-Host "File not found: $file" -ForegroundColor Yellow
        }
    }
}

# Execute moves
Write-Host "Moving guide files..." -ForegroundColor Cyan
Move-Files $guides "docs\guides"

Write-Host "Moving deployment files..." -ForegroundColor Cyan
Move-Files $deployment "docs\deployment"

Write-Host "Moving fix files..." -ForegroundColor Cyan
Move-Files $fixes "docs\fixes"

Write-Host "Moving update files..." -ForegroundColor Cyan
Move-Files $updates "docs\updates"

Write-Host "Moving system files..." -ForegroundColor Cyan
Move-Files $system "docs\system"

Write-Host "Organization complete!" -ForegroundColor Green

# Show remaining .md files
Write-Host "`nRemaining .md files in root:" -ForegroundColor Yellow
Get-ChildItem -Filter "*.md" | ForEach-Object { Write-Host $_.Name -ForegroundColor Gray }
