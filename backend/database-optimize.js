const db = require('./database');

// Database optimization script
function optimizeDatabase() {
  console.log('🔧 Optimizing database...');
  
  // Create indexes for better performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_vehicles_email ON vehicles(email)',
    'CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_number ON vehicles(vehicle_number)',
    'CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
    'CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)'
  ];
  
  indexes.forEach((sql, index) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`❌ Failed to create index ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Created index ${index + 1}`);
      }
    });
  });
  
  // Analyze tables for query optimization
  db.run('ANALYZE', (err) => {
    if (err) {
      console.error('❌ Failed to analyze database:', err.message);
    } else {
      console.log('✅ Database analysis completed');
    }
  });
  
  console.log('🚀 Database optimization completed');
}

// Run if called directly
if (require.main === module) {
  optimizeDatabase();
  setTimeout(() => process.exit(0), 1000);
}

module.exports = { optimizeDatabase };