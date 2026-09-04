DROP DATABASE IF EXISTS shoots_db;

CREATE DATABASE shoots_db;

SET
  GLOBAL group_concat_max_len = 2560;

USE shoots_db;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE bio (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  bio_name VARCHAR(100),
  bio_img_url VARCHAR(255) NOT NULL,
  bio_text VARCHAR(2000) NOT NULL
);

CREATE TABLE models (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE photographers (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE tags (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE shoots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shoot_date DATE,
  display_order INT DEFAULT NULL
);

CREATE TABLE photos (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shoot_id INT NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT NULL,
  FOREIGN KEY (shoot_id) REFERENCES shoots(id) ON DELETE CASCADE
);

CREATE TABLE shoot_photographers (
  shoot_id INT NOT NULL,
  photographer_id INT NOT NULL,
  PRIMARY KEY (shoot_id, photographer_id),
  FOREIGN KEY (shoot_id) REFERENCES shoots(id) ON DELETE CASCADE,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
);

CREATE TABLE shoot_models (
  shoot_id INT NOT NULL,
  model_id INT NOT NULL,
  PRIMARY KEY (shoot_id, model_id),
  FOREIGN KEY (shoot_id) REFERENCES shoots(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

CREATE TABLE shoot_tags (
  shoot_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (shoot_id, tag_id),
  FOREIGN KEY (shoot_id) REFERENCES shoots(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE revoked_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_signature VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expires_at (expires_at)
);

-- automating deletion of revoked tokens: runs every 5 mins (DEV VERSION), purges tokens older than 2 mins
SET
  GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS purge_expired_revoked_tokens;

CREATE EVENT purge_expired_revoked_tokens ON SCHEDULE EVERY 5 MINUTE STARTS CURRENT_TIMESTAMP DO
DELETE FROM
  revoked_tokens
WHERE
  created_at < NOW() - INTERVAL 2 MINUTE;

-- automating deletion of revoked tokens: runs every 24 hours (PROD VERSION), purges tokens older than 7 days
-- CREATE EVENT purge_expired_revoked_tokens
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO
--   DELETE FROM revoked_tokens
--   WHERE created_at < NOW() - INTERVAL 7 DAY;
-- select statement to see how many times the purge has run
SELECT
  EVENT_NAME,
  STATUS,
  INTERVAL_VALUE,
  INTERVAL_FIELD,
  STARTS,
  LAST_EXECUTED
FROM
  information_schema.EVENTS
WHERE
  EVENT_NAME = "purge_expired_revoked_tokens";