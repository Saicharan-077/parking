// Import database connection module
const db = require('../database');

// Vehicle model class for database operations
class Vehicle {
  // Create a new vehicle record in the database
  static create(vehicleData) {
    return new Promise((resolve, reject) => {
      // Destructure vehicle data from input
      const { vehicle_type, vehicle_number, model, color, is_ev, owner_name, email, phone_number, employee_student_id } = vehicleData;

      // SQL query to insert new vehicle record
      const sql = `
        INSERT INTO vehicles (vehicle_type, vehicle_number, model, color, is_ev, owner_name, email, phone_number, employee_student_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Execute insert query with parameterized values
      db.run(sql, [vehicle_type, vehicle_number, model, color, is_ev ? 1 : 0, owner_name, email, phone_number, employee_student_id], function(err) {
        if (err) {
          reject(err); // Reject promise on error
        } else {
          resolve({ id: this.lastID, ...vehicleData }); // Resolve with new record ID and data
        }
      });
    });
  }

  // Retrieve a vehicle record by its unique ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      // Execute SELECT query to find vehicle by ID
      db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err); // Reject on database error
        } else {
          resolve(row); // Resolve with vehicle data or null if not found
        }
      });
    });
  }

  // Retrieve a vehicle record by its vehicle number (unique identifier)
  static findByVehicleNumber(vehicle_number) {
    return new Promise((resolve, reject) => {
      // Execute SELECT query to find vehicle by number
      db.get('SELECT * FROM vehicles WHERE vehicle_number = ?', [vehicle_number], (err, row) => {
        if (err) {
          reject(err); // Reject on database error
        } else {
          resolve(row); // Resolve with vehicle data or null if not found
        }
      });
    });
  }

  // Search vehicles across multiple fields for flexible querying
  static search(searchTerm) {
    return new Promise((resolve, reject) => {
      // Normalize search term by removing spaces for better matching
      const normalizedSearchTerm = searchTerm.replace(/\s+/g, '');

      // SQL query to search across vehicle number, owner name, email, and employee/student ID
      const sql = `
        SELECT * FROM vehicles
        WHERE REPLACE(vehicle_number, ' ', '') LIKE ? OR REPLACE(owner_name, ' ', '') LIKE ? OR email LIKE ? OR employee_student_id LIKE ?
        ORDER BY created_at DESC
      `;

      // Execute search query with wildcard patterns
      db.all(sql, [`%${normalizedSearchTerm}%`, `%${normalizedSearchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
        if (err) {
          reject(err); // Reject on database error
        } else {
          resolve(rows); // Resolve with array of matching vehicle records
        }
      });
    });
  }

  // Retrieve all vehicles with pagination and optional email filtering
  static findAll(limit = 50, offset = 0, email = null) {
    return new Promise((resolve, reject) => {
      // Base SQL query for selecting all vehicles
      let sql = 'SELECT * FROM vehicles';
      let params = [];

      // Add email filter if provided (for user-specific queries)
      if (email) {
        sql += ' WHERE email = ?';
        params.push(email);
      }

      // Add ordering, limit, and offset for pagination
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      // Execute query to get paginated results
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err); // Reject on database error
        } else {
          resolve(rows); // Resolve with array of vehicle records
        }
      });
    });
  }

  // Update an existing vehicle record with new data
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      // Get field names and values from update data
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);

      // Create SET clause for SQL UPDATE statement
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      values.push(id); // Add ID to parameters for WHERE clause

      // SQL query to update vehicle record
      const sql = `
        UPDATE vehicles
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      // Execute update query
      db.run(sql, values, function(err) {
        if (err) {
          reject(err); // Reject on database error
        } else if (this.changes === 0) {
          reject(new Error('Vehicle not found')); // Reject if no rows were affected
        } else {
          resolve({ id, ...updateData }); // Resolve with updated data
        }
      });
    });
  }

  // Remove a vehicle record from the database
  static delete(id) {
    return new Promise((resolve, reject) => {
      // Execute DELETE query for specified vehicle ID
      db.run('DELETE FROM vehicles WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err); // Reject on database error
        } else if (this.changes === 0) {
          reject(new Error('Vehicle not found')); // Reject if no rows were affected
        } else {
          resolve({ message: 'Vehicle deleted successfully' }); // Resolve with success message
        }
      });
    });
  }

  // Retrieve aggregated statistics about vehicles in the database
  static getStats() {
    return new Promise((resolve, reject) => {
      // SQL query to calculate various vehicle statistics
      const sql = `
        SELECT
          COUNT(*) as total_vehicles,
          SUM(CASE WHEN is_ev = 1 THEN 1 ELSE 0 END) as total_ev,
          SUM(CASE WHEN vehicle_type = 'car' THEN 1 ELSE 0 END) as total_cars,
          SUM(CASE WHEN vehicle_type = 'bike' THEN 1 ELSE 0 END) as total_bikes
        FROM vehicles
      `;

      // Execute aggregate query
      db.get(sql, (err, row) => {
        if (err) {
          reject(err); // Reject on database error
        } else {
          resolve(row); // Resolve with statistics object
        }
      });
    });
  }
}

// Export the Vehicle class for use in other modules
module.exports = Vehicle;
