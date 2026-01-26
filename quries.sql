-- table for users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hash_password TEXT NOT NULL,
    img_url TEXT,
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
	exchange_id INT REFERENCES exchange_skills(id)
	id SERIAL PRIMARY KEY,
	sender_id INT REFERENCES users(id),
	receiver_id INT REFERENCES users(id),
	message TEXT,
	is_read BOOLEAN,
	metadata json,
	roomId INT,
	Created_at TIMESTAMP DEFAULT NOW()
)


-- reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
	exchange_id INT REFERENCES exchange_skills(id)
    from_user_id INT REFERENCES users(id),
	to_user_id INT REFERENCES users(id),
	skill_offered_id INT REFERENCES skills(id),
	skill_requested_id INT REFERENCES skills(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exchange_messages (
  id SERIAL PRIMARY KEY,
  exchange_id INT REFERENCES exchange_skills(id),
  sender VARCHAR(50),
  message TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
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



