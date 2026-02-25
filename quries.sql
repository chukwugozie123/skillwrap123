-- table for users

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hash_password TEXT NOT NULL,
    img_url TEXT,
	advice TEXT,
	bio TEXT,
	mode TEXT DEFAULT NULL,
	email_verified BOOLEAN DEFAULT false,
	otp_hash TEXT,
	otp_expires_at BIGINT,
	 advice TEXT DEFAULT NULL;
	 img_public_id TEXT
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- table for users skill
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	title VARCHAR(100) NOT NULL,
	description VARCHAR(150) not NULL,
    level VARCHAR(50) NOT NULL,
	category VARCHAR(100) NOT NULL,
	skill_img Text
	skill_img_public_id TEXT,
	youtubelink TEXT,
	learningpoint TEXT,
	portfolio_link TEXT
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- exchange_skills table
CREATE TABLE exchange_skills (
	id SERIAL PRIMARY KEY, 
	from_user_id INT REFERENCES users(id), -- The user who wants to exchange skill
	to_user_id INTEGER REFERENCES users(id), -- the user who is requested to exchange
	skill_offered_id INT REFERENCES skills(id), --the skill the user is offering
	skill_requested_id INTEGER REFERENCES skills(id), -- the skill the they want in exchange
	status VARCHAR(20) DEFAULT 'pending', -- status,
  	exchange_status VARCHAR(20) DEFAULT 'in progress', 
	Created_at TIMESTAMP DEFAULT NOW()
	mode TEXT
	note TEXT
);


CREATE TABLE notifications (
	exchange_id INT REFERENCES exchange_skills(id),
	id SERIAL PRIMARY KEY,
	sender_id INT REFERENCES users(id),
	receiver_id INT REFERENCES users(id),
	message TEXT,
	is_read BOOLEAN,
	metadata json,
	roomId INT,
	Created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
	exchange_id INT REFERENCES exchange_skills(id),
    from_user_id INT REFERENCES users(id),
	to_user_id INT REFERENCES users(id),
	skill_offered_id INT REFERENCES skills(id),
	skill_requested_id INT REFERENCES skills(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CREATE TABLE exchange_messages (
--   id SERIAL PRIMARY KEY,
--   exchange_id INT REFERENCES exchange_skills(id),
--   sender VARCHAR(50),
--   message TEXT,
--   image_url TEXT,
--   created_at TIMESTAMP DEFAULT NOW()
-- );


CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    exchange_id INTEGER REFERENCES exchanges(id) ON DELETE CASCADE,
    name VARCHAR(255) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	ALTER TABLE rooms
ADD COLUMN duration INTEGER,
ADD COLUMN intensity VARCHAR(50),
ADD COLUMN steps INTEGER,
ADD COLUMN goal TEXT,
ADD COLUMN rules TEXT;
);

CREATE TABLE room_members (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'text',
    file_url TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS otp_hash TEXT,
ADD COLUMN IF NOT EXISTS otp_expires_at BIGINT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT NULL;



-- join table
SELECT fullname, username, title, description, category
FROM users
JOIN skills
ON users.id = user_id



INSERT INTO users (fullname, username, email, hash_password, img_url)
VALUES (
    'Felix Umeche',                        -- full name
    'felixumeche',                          -- username (must be unique)
    'felixumeche@example.com',              -- email (must be unique)
    '$2b$12$e0MYzXyjpJS7Pd0RVvHwHeFx2T0OG2eZQnJq1g8y3EiQ6mK9d9o2', -- hashed password
    'https://randomuser.me/api/portraits/men/75.jpg'  -- image URL
);
