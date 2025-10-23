# 📊 How to Run Finance Reports - Complete Guide

## 🚀 Getting Started

### 1. Prerequisites Setup
First, ensure your system is ready:

```bash
# 1. Run migrations to create the reports table
php artisan migrate

# 2. Seed sample data (optional)
php artisan db:seed --class=ReportSeeder

# 3. Start your Laravel development server
php artisan serve

# 4. Start your frontend build process (in another terminal)
npm run dev
```

### 2. Access the Reports System
Navigate to: `http://localhost:8000/finance/reports`

## 📋 Step-by-Step Usage Guide

### Step 1: Create Your First Report
1. **Access Reports**: Go to `/finance/reports` in your browser
2. **Click "Create Report"**: Blue button in top-right corner
3. **Fill the Form**:
   - **Name**: "Monthly Income Statement - October 2025"
   - **Description**: "Revenue and expenses for October"
   - **Type**: Select "Income Statement" from dropdown
   - **Date Range**: 
     - From: 2025-10-01
     - To: 2025-10-31
   - **Format**: PDF or Excel
4. **Submit**: Click "Create Report"

### Step 2: Monitor Report Generation
- Report appears in list with "Pending" status
- Status changes to "Processing" when job starts
- Status becomes "Available" when complete (with green badge)
- If something goes wrong, status shows "Failed" (with red badge)

### Step 3: Download Your Report
- Once status is "Available", click the three-dot menu (⋯)
- Select "Download" from dropdown
- File downloads automatically to your browser's download folder

## 🎯 Available Report Types

### 1. Income Statement
**Purpose**: Shows revenue, expenses, and profit/loss
**Best For**: Monthly/quarterly financial performance
**Parameters**: Date range (from/to)

### 2. Balance Sheet
**Purpose**: Shows assets, liabilities, and equity at a point in time
**Best For**: Financial position snapshot
**Parameters**: As of date

### 3. Cash Flow Statement
**Purpose**: Shows cash inflows and outflows
**Best For**: Understanding cash movement
**Parameters**: Date range (from/to)

### 4. Trial Balance
**Purpose**: Lists all account balances for verification
**Best For**: Account verification and audit preparation
**Parameters**: As of date

### 5. Expense Report
**Purpose**: Detailed breakdown of expenses by category
**Best For**: Cost analysis and budgeting
**Parameters**: Date range, grouping options

## 🔧 Behind the Scenes - How It Works

### Report Generation Process:
```
1. User submits form → 2. Record saved to database → 3. Job queued
                                                          ↓
6. User downloads ← 5. Status: Available ← 4. Background processing
```

### Technical Flow:
1. **Form Submission**: React form sends data to `ReportController@store`
2. **Database Record**: Report saved with "pending" status
3. **Job Dispatch**: `GenerateReportJob` queued for background processing
4. **Data Processing**: `ReportGeneratorService` pulls real data from:
   - Transactions
   - Invoices
   - Expenses
   - Accounts
5. **File Generation**: PDF/Excel created and stored in `storage/app/reports/`
6. **Status Update**: Report marked as "available" with file path
7. **Download**: Secure download through `ReportController@download`

## 🛠️ Advanced Usage

### Manual Job Processing (for testing)
```bash
# Process specific report
php artisan reports:process-queue --sync --report=1

# Process all pending reports
php artisan queue:work

# View job status
php artisan queue:failed
```

### Debugging Report Generation
```bash
# Check logs
tail -f storage/logs/laravel.log

# Test report service directly
php artisan tinker
> $service = new \App\Services\Finance\ReportGeneratorService();
> $report = \App\Models\Finance\Report::find(1);
> $data = $service->generateReport($report);
```

## 📊 Sample Data Structure

### Income Statement Output:
```json
{
  "period": "2025-10-01 to 2025-10-31",
  "revenue": {
    "sales_revenue": 50000,
    "service_revenue": 25000,
    "total": 75000
  },
  "expenses": {
    "operating_expenses": 30000,
    "administrative_expenses": 15000,
    "total": 45000
  },
  "net_income": 30000
}
```

## 🔐 Security Features

### File Security:
- Files stored outside web root in `storage/app/reports/`
- Download URLs validated for security
- User authentication required
- File paths sanitized

### Access Control:
- Must be logged in to access reports
- Users can only see their own reports (configurable)
- Admin users can see all reports

## 🚨 Troubleshooting

### Common Issues:

#### 1. Report Stuck in "Pending"
**Cause**: Queue not processing
**Solution**:
```bash
php artisan queue:work
```

#### 2. Report Shows "Failed"
**Cause**: Data processing error
**Solution**: Check logs and verify your financial data exists
```bash
tail -f storage/logs/laravel.log
```

#### 3. Download Not Working
**Cause**: File path or permissions issue
**Solution**: Check file exists and storage permissions
```bash
ls -la storage/app/reports/
chmod -R 755 storage/
```

#### 4. Empty Reports
**Cause**: No financial data in date range
**Solution**: Verify you have transactions/invoices in the selected period

## 🎯 Quick Test Scenario

### Test the Complete Flow:
1. **Create Test Data**:
   ```bash
   php artisan db:seed --class=FinanceCategoriesSeeder
   ```

2. **Create Report**:
   - Name: "Test Report"
   - Type: "Income Statement" 
   - Date: Last month's range

3. **Process Job**:
   ```bash
   php artisan queue:work --once
   ```

4. **Check Result**:
   - Refresh reports page
   - Status should be "Available"
   - Download should work

## 📈 Production Tips

### For Live Environment:
```bash
# Set up supervisor for queue workers
sudo apt install supervisor

# Configure queue worker in /etc/supervisor/conf.d/laravel-worker.conf
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work
autostart=true
autorestart=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log

# Start supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

### Performance Optimization:
- Use Redis for queue driver (faster than database)
- Set up job batching for multiple reports
- Implement report caching for frequently requested reports
- Use chunked processing for large datasets

---

🎉 **You're all set!** The finance reports system is now ready to generate real financial reports from your ERP data.

Navigate to `/finance/reports` to get started!