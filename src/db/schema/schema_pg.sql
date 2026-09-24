DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS bio CASCADE;

CREATE TABLE bio (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  img_url TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS model CASCADE;

CREATE TABLE model (
  id INT generated always as identity primary key,
  name text NOT null unique,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX model_name_lower_unique ON model (LOWER(name));

DROP TABLE IF EXISTS photographer CASCADE;

CREATE TABLE photographer (
  id INT generated always as identity primary key,
  name text NOT null unique,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX photographer_name_lower_unique ON photographer (LOWER(name));

DROP TABLE IF EXISTS tag CASCADE;

CREATE TABLE tag (
  id INT generated always as identity primary key,
  name text NOT null unique,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX tag_name_lower_unique ON tag (LOWER(name));

DROP TABLE IF EXISTS shoot CASCADE;

CREATE TABLE shoot (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shoot_display_order ON shoot(display_order);

DROP TABLE IF EXISTS photo CASCADE;

CREATE TABLE photo (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shoot_id INT NOT NULL,
  img_url TEXT NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shoot_id) REFERENCES shoot(id) ON DELETE CASCADE
);

CREATE INDEX idx_photo_shoot_id ON photo(shoot_id);

DROP TABLE IF EXISTS shoot_model CASCADE;

CREATE TABLE shoot_model (
  shoot_id INT NOT NULL,
  model_id INT NOT NULL,
  PRIMARY KEY (shoot_id, model_id),
  FOREIGN KEY (shoot_id) REFERENCES shoot(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES model(id) ON DELETE CASCADE
);

-- Index the secondary foreign key for reverse lookups and cascade deletes
CREATE INDEX idx_shoot_model_model_id ON shoot_model(model_id);

DROP TABLE IF EXISTS shoot_photographer CASCADE;

CREATE TABLE shoot_photographer (
  shoot_id INT NOT NULL,
  photographer_id INT NOT NULL,
  PRIMARY KEY (shoot_id, photographer_id),
  FOREIGN KEY (shoot_id) REFERENCES shoot(id) ON DELETE CASCADE,
  FOREIGN KEY (photographer_id) REFERENCES photographer(id) ON DELETE CASCADE
);

-- Index the secondary foreign key for reverse lookups and cascade deletes
CREATE INDEX idx_shoot_photographer_photographer_id ON shoot_photographer(photographer_id);

DROP TABLE IF EXISTS shoot_tag CASCADE;

CREATE TABLE shoot_tag (
  shoot_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (shoot_id, tag_id),
  FOREIGN KEY (shoot_id) REFERENCES shoot(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);

-- Index the secondary foreign key for reverse lookups and cascade deletes
CREATE INDEX idx_shoot_tag_tag_id ON shoot_tag(tag_id);

DROP TABLE IF EXISTS revoked_token CASCADE;

CREATE TABLE revoked_token (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_signature TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revoked_token_expires_at ON revoked_token (expires_at);

-- requires a chron job to run to periodically delete the expired tokens: 
-- probabilistic clean up strategy preferred