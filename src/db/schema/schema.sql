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

CREATE TABLE photographers (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  photographer_name VARCHAR(255) NOT NULL
);

CREATE TABLE models (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  model_name VARCHAR(255) NOT NULL
);

CREATE TABLE tags (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(255) NOT NULL
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