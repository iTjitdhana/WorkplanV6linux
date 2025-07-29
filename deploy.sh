#!/bin/bash

# 🚀 WorkplansV4 Auto Deployment Script
# สำหรับการ deploy ระบบไปยัง production server

set -e  # หยุดการทำงานทันทีหากมี error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for better security."
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install package
install_package() {
    local package=$1
    if ! command_exists $package; then
        print_status "Installing $package..."
        if command_exists apt; then
            sudo apt update
            sudo apt install -y $package
        elif command_exists yum; then
            sudo yum install -y $package
        else
            print_error "Package manager not found. Please install $package manually."
            exit 1
        fi
    else
        print_status "$package is already installed"
    fi
}

# Function to setup MySQL
setup_mysql() {
    print_header "Setting up MySQL Database"
    
    # Install MySQL if not installed
    if ! command_exists mysql; then
        print_status "Installing MySQL..."
        if command_exists apt; then
            sudo apt update
            sudo apt install mysql-server -y
        elif command_exists yum; then
            sudo yum install mysql-server -y
        fi
    fi
    
    # Start and enable MySQL
    print_status "Starting MySQL service..."
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    # Check MySQL status
    if sudo systemctl is-active --quiet mysql; then
        print_status "MySQL is running"
    else
        print_error "MySQL failed to start"
        exit 1
    fi
    
    # Setup database
    print_status "Setting up database..."
    echo "Please enter MySQL root password (leave empty if no password):"
    read -s MYSQL_ROOT_PASSWORD
    
    # Create database
    mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS esp_tracker;" 2>/dev/null || {
        print_warning "Database creation failed or already exists"
    }
    
    # Import database schema if exists
    if [ -f "backend/esp_tracker (6).sql" ]; then
        print_status "Importing database schema..."
        mysql -u root -p${MYSQL_ROOT_PASSWORD} esp_tracker < "backend/esp_tracker (6).sql"
        print_status "Database schema imported"
    else
        print_warning "Database schema file not found. You may need to import it manually."
    fi
    
    # Store password for later use
    echo $MYSQL_ROOT_PASSWORD > .mysql_password
    chmod 600 .mysql_password
}

# Function to setup Node.js
setup_nodejs() {
    print_header "Setting up Node.js"
    
    if ! command_exists node; then
        print_status "Installing Node.js 18..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_status "Node.js is already installed"
        node --version
    fi
    
    # Install PM2 globally
    if ! command_exists pm2; then
        print_status "Installing PM2..."
        sudo npm install -g pm2
    else
        print_status "PM2 is already installed"
    fi
}

# Function to setup backend
setup_backend() {
    print_header "Setting up Backend"
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file
    print_status "Creating backend environment file..."
    MYSQL_PASSWORD=$(cat ../.mysql_password 2>/dev/null || echo "your_mysql_password")
    
    cat > .env << EOF
# Production Environment Variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=${MYSQL_PASSWORD}
DB_NAME=esp_tracker
DB_PORT=3306

# Server Configuration
PORT=3101
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=http://$(hostname -I | awk '{print $1}'):3011

# API Rate Limit
API_RATE_LIMIT=1000
EOF
    
    print_status "Backend environment file created"
    
    # Test database connection
    print_status "Testing database connection..."
    node -e "
const { testConnection } = require('./config/database');
testConnection().then(() => {
    console.log('✅ Backend database connection test completed');
    process.exit(0);
}).catch(err => {
    console.error('❌ Backend database connection test failed:', err.message);
    process.exit(1);
});
" || {
        print_error "Backend database connection test failed"
        exit 1
    }
    
    cd ..
}

# Function to setup frontend
setup_frontend() {
    print_header "Setting up Frontend"
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create .env.local file
    print_status "Creating frontend environment file..."
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:3101
EOF
    
    print_status "Frontend environment file created"
    
    # Build for production
    print_status "Building frontend for production..."
    npm run build
    
    cd ..
}

# Function to setup PM2 ecosystem
setup_pm2() {
    print_header "Setting up PM2 Process Manager"
    
    # Create ecosystem config
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'workplans-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3101
      }
    },
    {
      name: 'workplans-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3011
      }
    }
  ]
}
EOF
    
    print_status "PM2 ecosystem config created"
    
    # Start applications with PM2
    print_status "Starting applications with PM2..."
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
    
    print_status "PM2 setup completed"
}

# Function to setup firewall
setup_firewall() {
    print_header "Setting up Firewall"
    
    # Install UFW if not installed
    install_package ufw
    
    # Configure firewall
    print_status "Configuring firewall..."
    sudo ufw allow 22    # SSH
    sudo ufw allow 80    # HTTP
    sudo ufw allow 443   # HTTPS
    sudo ufw allow 3011  # Frontend
    sudo ufw allow 3101  # Backend
    
    # Enable firewall
    echo "y" | sudo ufw enable
    
    print_status "Firewall configured"
}

# Function to create backup script
setup_backup() {
    print_header "Setting up Database Backup"
    
    # Create backup script
    cat > /home/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups"
mkdir -p $BACKUP_DIR

# Get MySQL password from file
MYSQL_PASSWORD=$(cat /path/to/WorkplansV4/.mysql_password 2>/dev/null || echo "")

if [ -n "$MYSQL_PASSWORD" ]; then
    mysqldump -u root -p${MYSQL_PASSWORD} esp_tracker > $BACKUP_DIR/esp_tracker_$DATE.sql
else
    mysqldump -u root -p esp_tracker > $BACKUP_DIR/esp_tracker_$DATE.sql
fi

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: esp_tracker_$DATE.sql"
EOF
    
    chmod +x /home/backup_db.sh
    
    # Setup cron job for daily backup
    print_status "Setting up daily backup cron job..."
    (crontab -l 2>/dev/null; echo "0 2 * * * /home/backup_db.sh") | crontab -
    
    print_status "Backup script created and scheduled"
}

# Function to display final information
show_final_info() {
    print_header "Deployment Completed Successfully!"
    
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo "🎉 Your WorkplansV4 system is now deployed!"
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend: http://${SERVER_IP}:3011"
    echo "   Backend API: http://${SERVER_IP}:3101"
    echo "   Tracker: http://${SERVER_IP}:3011/tracker"
    echo ""
    echo "🔧 Management Commands:"
    echo "   Check status: pm2 status"
    echo "   View logs: pm2 logs"
    echo "   Restart all: pm2 restart all"
    echo "   Stop all: pm2 stop all"
    echo ""
    echo "📊 Monitoring:"
    echo "   Resource usage: pm2 monit"
    echo "   Process info: pm2 show workplans-backend"
    echo "   Process info: pm2 show workplans-frontend"
    echo ""
    echo "🔄 Update Commands:"
    echo "   git pull origin main"
    echo "   cd backend && npm install"
    echo "   cd ../frontend && npm install && npm run build"
    echo "   pm2 restart all"
    echo ""
    echo "📞 If you encounter any issues, check:"
    echo "   - PM2 logs: pm2 logs"
    echo "   - MySQL status: sudo systemctl status mysql"
    echo "   - Firewall status: sudo ufw status"
    echo ""
}

# Main deployment function
main() {
    print_header "WorkplansV4 Auto Deployment"
    
    # Check if we're in the right directory
    if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
        print_error "Please run this script from the WorkplansV4 root directory"
        exit 1
    fi
    
    # Install required packages
    install_package git
    install_package curl
    
    # Setup components
    setup_mysql
    setup_nodejs
    setup_backend
    setup_frontend
    setup_pm2
    setup_firewall
    setup_backup
    
    # Show final information
    show_final_info
    
    # Cleanup
    rm -f .mysql_password
    
    print_status "Deployment completed! 🚀"
}

# Run main function
main "$@" 