const db = require('../database');

class Vehicle {
  // Create a new vehicle
  static create(vehicleData) {
    return new Promise((resolve, reject) => {
      const { vehicle_type, vehicle_number, model, color, is_ev, owner_name, email, employee_student_id } = vehicleData;

      const sql = `
        INSERT INTO vehicles (vehicle_type, vehicle_number, model, color, is_ev, owner_name, email, employee_student_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [vehicle_type, vehicle_number, model, color, is_ev ? 1 : 0, owner_name, email, employee_student_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...vehicleData });
        }
      });
    });
  }

  // Find vehicle by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find vehicle by vehicle number
  static findByVehicleNumber(vehicle_number) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM vehicles WHERE vehicle_number = ?', [vehicle_number], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Search vehicles by number, owner name, email, or employee/student ID
  static search(searchTerm) {
    return new Promise((resolve, reject) => {
      // Remove spaces from search term for better matching
      const normalizedSearchTerm = searchTerm.replace(/\s+/g, '');

      const sql = `
        SELECT * FROM vehicles
        WHERE REPLACE(vehicle_number, ' ', '') LIKE ? OR REPLACE(owner_name, ' ', '') LIKE ? OR email LIKE ? OR employee_student_id LIKE ?
        ORDER BY created_at DESC
      `;

      db.all(sql, [`%${normalizedSearchTerm}%`, `%${normalizedSearchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get all vehicles with pagination and optional email filtering
  static findAll(limit = 50, offset = 0, email = null) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM vehicles';
      let params = [];

      if (email) {
        sql += ' WHERE email = ?';
        params.push(email);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Update vehicle
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      values.push(id);

      const sql = `
        UPDATE vehicles
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Vehicle not found'));
        } else {
          resolve({ id, ...updateData });
        }
      });
    });
  }

  // Delete vehicle
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM vehicles WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Vehicle not found'));
        } else {
          resolve({ message: 'Vehicle deleted successfully' });
        }
      });
    });
  }

  // Get vehicle statistics
  static getStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          COUNT(*) as total_vehicles,
          SUM(CASE WHEN is_ev = 1 THEN 1 ELSE 0 END) as total_ev,
          SUM(CASE WHEN vehicle_type = 'car' THEN 1 ELSE 0 END) as total_cars,
          SUM(CASE WHEN vehicle_type = 'bike' THEN 1 ELSE 0 END) as total_bikes
        FROM vehicles
      `;

      db.get(sql, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = Vehicle;
