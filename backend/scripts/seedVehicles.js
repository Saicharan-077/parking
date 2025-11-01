const Vehicle = require('../models/Vehicle');

// Sample data for seeding vehicles
const vehicleTypes = ['car', 'bike', 'ev'];
const carModels = ['Toyota Camry', 'Honda Civic', 'Ford Mustang', 'BMW 3 Series', 'Mercedes C-Class', 'Audi A4', 'Tesla Model 3', 'Nissan Altima'];
const bikeModels = ['Honda CB Shine', 'Bajaj Pulsar', 'Yamaha R15', 'Royal Enfield Classic 350', 'KTM Duke 200', 'Suzuki Gixxer'];
const colors = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow'];
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Robert', 'Maria'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

function generateRandomVehicle() {
  const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
  const isEv = vehicleType === 'ev' ? true : Math.random() < 0.3;
  const model = vehicleType === 'car' ? carModels[Math.floor(Math.random() * carModels.length)] :
              vehicleType === 'bike' ? bikeModels[Math.floor(Math.random() * bikeModels.length)] :
              'Tesla Model S';

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const ownerName = `${firstName} ${lastName}`;
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;

  // Generate Indian vehicle number format (e.g., AP 12 AB 1234)
  const states = ['AP', 'TS', 'KA', 'TN', 'MH', 'GJ', 'RJ', 'UP', 'DL', 'HR'];
  const state = states[Math.floor(Math.random() * states.length)];
  const district = Math.floor(Math.random() * 99).toString().padStart(2, '0');
  const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const vehicleNumber = `${state} ${district} ${letters} ${numbers}`;

  const employeeId = `EMP${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
  const phoneNumber = `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`;

  return {
    vehicle_type: vehicleType,
    vehicle_number: vehicleNumber,
    model: model,
    color: colors[Math.floor(Math.random() * colors.length)],
    is_ev: isEv,
    owner_name: ownerName,
    email: email,
    phone_number: phoneNumber,
    employee_student_id: employeeId
  };
}

async function seedVehicles(count = 8000) {
  console.log(`🌱 Starting to seed ${count} vehicles...`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < count; i++) {
    try {
      const vehicleData = generateRandomVehicle();
      await Vehicle.create(vehicleData);
      successCount++;

      if ((i + 1) % 1000 === 0) {
        console.log(`✅ Seeded ${i + 1} vehicles...`);
      }
    } catch (error) {
      errorCount++;
      if (error.message.includes('UNIQUE constraint failed')) {
        // Retry with a new vehicle number if duplicate
        i--;
        continue;
      }
      console.error(`❌ Error seeding vehicle ${i + 1}:`, error.message);
    }
  }

  console.log(`🎉 Seeding completed!`);
  console.log(`✅ Successfully seeded: ${successCount} vehicles`);
  console.log(`❌ Errors: ${errorCount}`);

  // Get final stats
  try {
    const stats = await Vehicle.getStats();
    console.log(`📊 Final database stats:`);
    console.log(`   Total vehicles: ${stats.total_vehicles}`);
    console.log(`   Total EVs: ${stats.total_ev}`);
    console.log(`   Total cars: ${stats.total_cars}`);
    console.log(`   Total bikes: ${stats.total_bikes}`);
  } catch (error) {
    console.error('Error getting stats:', error.message);
  }

  process.exit(0);
}

// Run the seeding function
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 8000;
  seedVehicles(count);
}

module.exports = { seedVehicles };
