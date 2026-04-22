'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

const SCHEMA = `
CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'soil_nutrient_db'}\`;
USE \`${process.env.DB_NAME || 'soil_nutrient_db'}\`;

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)    NOT NULL,
  email       VARCHAR(150)    NOT NULL UNIQUE,
  password    VARCHAR(255)    NOT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS soil_reports (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id             INT UNSIGNED    NOT NULL,
  nitrogen            DECIMAL(6,2)    NOT NULL COMMENT 'mg/kg',
  phosphorus          DECIMAL(6,2)    NOT NULL COMMENT 'mg/kg',
  potassium           DECIMAL(6,2)    NOT NULL COMMENT 'mg/kg',
  ph                  DECIMAL(4,2)    NOT NULL,
  soil_type           VARCHAR(50)     NOT NULL,
  fertilizer_suggestion TEXT          NOT NULL,
  crop_recommendation TEXT            NOT NULL,
  notes               TEXT            NULL,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_soil_reports_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

(async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    await connection.query(SCHEMA);
    console.log('✅ Database migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
})();
