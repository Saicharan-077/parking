const fs = require('fs');
const path = require('path');

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
    is_ev: isEv ? 1 : 0,
    owner_name: ownerName,
    email: email,
    phone_number: phoneNumber,
    employee_student_id: employeeId
  };
}

function generateSeedSQL(count = 8000) {
  console.log(`📝 Generating SQL file with ${count} vehicles...`);

  let sql = '-- Seed data for vehicles table\n';
  sql += '-- Generated on ' + new Date().toISOString() + '\n\n';
  sql += 'INSERT INTO vehicles (vehicle_type, vehicle_number, model, color, is_ev, owner_name, email, phone_number, employee_student_id) VALUES\n';

  const vehicles = [];
  const usedNumbers = new Set();

  for (let i = 0; i < count; i++) {
    let vehicle;
    let attempts = 0;
    do {
      vehicle = generateRandomVehicle();
      attempts++;
      if (attempts > 100) {
        // Force unique by adding suffix
        vehicle.vehicle_number += `-${i}`;
        break;
      }
    } while (usedNumbers.has(vehicle.vehicle_number));

    usedNumbers.add(vehicle.vehicle_number);

    const values = `('${vehicle.vehicle_type}', '${vehicle.vehicle_number}', '${vehicle.model}', '${vehicle.color}', ${vehicle.is_ev}, '${vehicle.owner_name}', '${vehicle.email}', '${vehicle.phone_number}', '${vehicle.employee_student_id}')`;

    vehicles.push(values);

    if ((i + 1) % 1000 === 0) {
      console.log(`📝 Generated ${i + 1} vehicles...`);
    }
  }

  sql += vehicles.join(',\n') + ';\n';

  const outputPath = path.join(__dirname, '..', 'seed.sql');
  fs.writeFileSync(outputPath, sql);

  console.log(`✅ SQL file generated: ${outputPath}`);
  console.log(`📊 Contains ${count} INSERT statements`);
}

// Run the generator
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2]) : 8000;
  generateSeedSQL(count);
}

module.exports = { generateSeedSQL };
