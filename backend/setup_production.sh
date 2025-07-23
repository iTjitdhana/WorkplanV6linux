#!/bin/bash

echo "🚀 Setting up WorkplansV4 for Production Server"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for better security."
fi

# Step 1: Check MySQL installation
print_status "Checking MySQL installation..."
if command -v mysql &> /dev/null; then
    print_status "MySQL is installed"
    mysql --version
else
    print_error "MySQL is not installed. Installing MySQL..."
    # Ubuntu/Debian
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install mysql-server -y
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install mysql-server -y
    else
        print_error "Please install MySQL manually"
        exit 1
    fi
fi

# Step 2: Start MySQL service
print_status "Starting MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Step 3: Check MySQL status
print_status "Checking MySQL status..."
sudo systemctl status mysql --no-pager -l

# Step 4: Create database and user
print_status "Setting up database..."
echo "Please enter MySQL root password (leave empty if no password):"
read -s MYSQL_ROOT_PASSWORD

# Create database
mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS esp_tracker;" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "Database 'esp_tracker' created successfully"
else
    print_warning "Database creation failed or already exists"
fi

# Import database schema if exists
if [ -f "esp_tracker (6).sql" ]; then
    print_status "Importing database schema..."
    mysql -u root -p${MYSQL_ROOT_PASSWORD} esp_tracker < "esp_tracker (6).sql"
    print_status "Database schema imported"
elif [ -f "../esp_tracker (6).sql" ]; then
    print_status "Importing database schema from parent directory..."
    mysql -u root -p${MYSQL_ROOT_PASSWORD} esp_tracker < "../esp_tracker (6).sql"
    print_status "Database schema imported"
else
    print_warning "Database schema file not found. You may need to import it manually."
fi

# Step 5: Create .env file
print_status "Creating production environment file..."
cat > .env << EOF
# Production Environment Variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=${MYSQL_ROOT_PASSWORD}
DB_NAME=esp_tracker
DB_PORT=3306

# Server Configuration
PORT=3101
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=http://192.168.0.94:3011

# API Rate Limit
API_RATE_LIMIT=1000
EOF

print_status ".env file created"

# Step 6: Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Step 7: Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Step 8: Test database connection
print_status "Testing database connection..."
node -e "
const { testConnection } = require('./config/database');
testConnection().then(() => {
    console.log('✅ Database connection test completed');
    process.exit(0);
}).catch(err => {
    console.error('❌ Database connection test failed:', err.message);
    process.exit(1);
});
"

# Step 9: Setup PM2 for process management
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 for process management..."
    sudo npm install -g pm2
fi

print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo ""
print_status "🎉 Production setup completed!"
echo ""
echo "Next steps:"
echo "1. Check if the application is running: pm2 status"
echo "2. View logs: pm2 logs"
echo "3. Access the API at: http://192.168.0.94:3101"
echo "4. Make sure port 3101 is open in firewall"
echo ""
echo "To manage the application:"
echo "- Stop: pm2 stop esp-tracker-backend"
echo "- Restart: pm2 restart esp-tracker-backend"
echo "- View logs: pm2 logs esp-tracker-backend" 