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

ALTER TABLE users
ADD COLUMN xp INTEGER DEFAULT 0,
ADD COLUMN level INTEGER DEFAULT 1,
ADD COLUMN streak INTEGER DEFAULT 0,
ADD COLUMN badges JSONB DEFAULT '[]',
ADD COLUMN points INTEGER DEFAULT 0,
ADD COLUMN referral_code TEXT UNIQUE,
ADD COLUMN referred_by TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS otp_hash TEXT,
ADD COLUMN IF NOT EXISTS otp_expires_at BIGINT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT NULL;
ADD COLUMN IF NOT EXISTS 	advice TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS 	mode TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS	 img_public_id TEXT


CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(150) NOT NULL,
    level VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    skill_img TEXT,
    skill_img_public_id TEXT,
    youtubelink TEXT,
    learningpoint TEXT,
    portfolio_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
ADD COLUMN IF NOT EXISTS 	advice TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS 	mode TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS	 img_public_id TEXT


CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(255) NOT NULL,
  description TEXT,

  category VARCHAR(100),   -- AI, Web Dev, Design, etc

  type VARCHAR(50),        -- workshop | challenge | hackathon

  mode VARCHAR(50) DEFAULT 'virtual',

  start_time TIMESTAMP,
  end_time TIMESTAMP,

  banner_url TEXT,

  max_attendees INT DEFAULT 1000,

  attendees_count INT DEFAULT 0,

  modules JSONB,   -- 👈 VERY IMPORTANT (tasks, snippets, resources)

  is_live BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_attendance (
  id SERIAL PRIMARY KEY ,

  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR(255),

  joined_at TIMESTAMP DEFAULT NOW()
);


-- ================= TASK SUBMISSIONS TABLE =================

CREATE TABLE task_submissions (
    id SERIAL PRIMARY KEY,

    event_id INTEGER REFERENCES events(event_no) ON DELETE CASCADE,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    task_title VARCHAR(255) NOT NULL,

    github_link TEXT,

    live_link TEXT,

    file_url TEXT,

    note TEXT,

    status VARCHAR(50) DEFAULT 'submitted',

    submitted_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS recent_activities (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    activity_type VARCHAR(100) NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    related_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    related_skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
    related_exchange_id INTEGER REFERENCES exchange_skills(id) ON DELETE SET NULL,

    metadata JSONB DEFAULT '{}'::jsonb,

    icon VARCHAR(100),
    color VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(20),
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_achievement
    FOREIGN KEY(achievement_id)
    REFERENCES achievements(id)
    ON DELETE CASCADE,

    UNIQUE(user_id, achievement_id)

);
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


-- ================= EVENTS TABLE =================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_no SERIAL UNIQUE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  category VARCHAR(100),

  type VARCHAR(50),

  difficulty TEXT,

  mode VARCHAR(50) DEFAULT 'virtual',

  start_time TIMESTAMP,
  end_time TIMESTAMP,

  banner_url TEXT,

  max_attendees INT DEFAULT 1000,

  attendees_count INT DEFAULT 0,

  modules JSONB DEFAULT '[]'::jsonb,

  files JSONB DEFAULT '[]'::jsonb,

  requirements JSONB DEFAULT '[]'::jsonb,

  judging_criteria JSONB DEFAULT '[]'::jsonb,

  deliverables JSONB DEFAULT '[]'::jsonb,

  technologies JSONB DEFAULT '[]'::jsonb,

  rewards JSONB DEFAULT '[]'::jsonb,

  is_live BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_ai_analysis (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

event_id INT REFERENCES events(event_no) ON DELETE CASCADE,


ai_model VARCHAR(100),

event_summary TEXT,

event_type VARCHAR(50),

learning_objectives JSONB DEFAULT '[]'::jsonb,

generated_modules JSONB DEFAULT '[]'::jsonb,

recommended_skills JSONB DEFAULT '[]'::jsonb,

difficulty_score INT,

created_at TIMESTAMP DEFAULT NOW()

);

CREATE TABLE IF NOT EXISTS event_ai_messages (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

event_id INT REFERENCES events(event_no)
ON DELETE CASCADE,


user_id INTEGER REFERENCES users(id)
ON DELETE SET NULL,


message TEXT NOT NULL,


sender VARCHAR(20) DEFAULT 'user',
-- user or ai


created_at TIMESTAMP DEFAULT NOW()

);


CREATE TABLE IF NOT EXISTS event_ai_report (
id SERIAL PRIMARY KEY,
event_id INT REFERENCES events(event_no),
user_id INT REFERENCES users(id),
module TEXT,
question TEXT,
user_answer TEXT,
ai_score INT,
feedback TEXT,
created_at TIMESTAMP DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS event_ai_student_memory (

    id SERIAL PRIMARY KEY,

    event_id INT REFERENCES events(event_no)
    ON DELETE CASCADE,

    user_id INT REFERENCES users(id)
    ON DELETE CASCADE,


    strengths JSONB DEFAULT '[]',

    weaknesses JSONB DEFAULT '[]',

    learning_style VARCHAR(50) DEFAULT 'unknown',

    average_score INT DEFAULT 0,

    modules_completed INT DEFAULT 0,

    ai_summary TEXT DEFAULT '',


    updated_at TIMESTAMP DEFAULT NOW(),


    UNIQUE(event_id, user_id)

);

-- ================= EVENT ATTENDANCE =================

CREATE TABLE IF NOT EXISTS event_attendance (
  id SERIAL PRIMARY KEY,

  event_id INT REFERENCES events(event_no) ON DELETE CASCADE,

  user_id VARCHAR(255),

  joined_at TIMESTAMP DEFAULT NOW()
);



-- ================= TASK SUBMISSIONS =================

CREATE TABLE IF NOT EXISTS task_submissions (
    id SERIAL PRIMARY KEY,

    event_id INTEGER REFERENCES events(event_no) ON DELETE CASCADE,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    task_title VARCHAR(255) NOT NULL,

    github_link TEXT,

    live_link TEXT,

    file_url TEXT,

    note TEXT,

    status VARCHAR(50) DEFAULT 'submitted',

    submitted_at TIMESTAMP DEFAULT NOW()
);



-- ================= RECENT ACTIVITIES =================

CREATE TABLE IF NOT EXISTS recent_activities (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    activity_type VARCHAR(100) NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    related_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    related_skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,

    related_exchange_id INTEGER REFERENCES exchange_skills(id) ON DELETE SET NULL,

    metadata JSONB DEFAULT '{}'::jsonb,

    icon VARCHAR(100),

    color VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ================= XP SYSTEM =================

CREATE TABLE IF NOT EXISTS xp_transactions (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id),

    xp_amount INTEGER NOT NULL,

    action_type VARCHAR(50),

    created_at TIMESTAMP DEFAULT NOW()
);



-- ================= BADGES =================

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100),

    description TEXT
);



CREATE TABLE IF NOT EXISTS user_badges (
    user_id INTEGER REFERENCES users(id),

    badge_id INTEGER REFERENCES badges(id),

    icon TEXT,

    earned_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY(user_id,badge_id)
);

INSERT INTO achievements
(name, description, icon, reward_points)

VALUES

(
'First Skill Created',
'Created your first skill on SkillWrap',
'✨',
20
),

(
'10 Skills Uploaded',
'Uploaded 10 different skills',
'🚀',
100
),

(
'50 Skills Uploaded',
'Uploaded 50 different skills',
'🏆',
500
),

(
'First Request Sent',
'Sent your first exchange request',
'📨',
5
),

(
'15 Requests Sent',
'Sent 15 exchange requests',
'🔥',
15
),

(
'First Exchange Completed',
'Completed your first skill exchange',
'🔁',
40
),

(
'10 Exchanges Completed',
'Completed 10 successful exchanges',
'⭐',
150
),

(
'20 Exchanges Completed',
'Completed 20 successful exchanges',
'👑',
300
);



-- ================= SAMPLE EVENTS =================


INSERT INTO events (
title,
description,
category,
type,
mode,
start_time,
end_time,
banner_url,
max_attendees,
attendees_count,
modules,
is_live
)

VALUES

(
'UI Design Masterclass',
'Learn modern UI/UX principles and build stunning interfaces.',
'Design',
'workshop',
'virtual',
NOW() + INTERVAL '3 days',
NOW() + INTERVAL '5 days',
'https://images.unsplash.com/photo-1558655146-d09347e92766',
300,
89,

'[
{
"type":"intro",
"title":"Design Thinking",
"content":"Understand user-first design principles."
},
{
"type":"task",
"title":"Wireframe Task",
"content":"Design a landing page wireframe."
},
{
"type":"snippet",
"title":"Figma Template",
"content":"Use Figma starter UI kit"
}
]'::jsonb,

false
);



INSERT INTO events (

event_no,
title,
description,
category,
type,
difficulty,
requirements,
judging_criteria,
deliverables,
technologies,
rewards,
modules,
mode,
start_time,
end_time,
banner_url,
max_attendees,
attendees_count,
is_live

)

VALUES

(

2,

'Build AI Apps in 48 Hours',

'Create AI apps',

'AI',

'challenge',

'Intermediate',


'[
"Build responsive UI",
"Use AI API"
]'::jsonb,


'[
{
"title":"Creativity",
"score":"25%"
},
{
"title":"Functionality",
"score":"35%"
},
{
"title":"UI/UX",
"score":"20%"
},
{
"title":"Performance",
"score":"20%"
}
]'::jsonb,


'[
{
"title":"GitHub Repo"
},
{
"title":"Live Demo Link"
}
]'::jsonb,


'[
"Next.js",
"OpenAI API"
]'::jsonb,


'[
"+500 XP",
"Winner Badge",
"Mentorship Access"
]'::jsonb,


'[
{
"type":"intro",
"title":"Welcome to the Challenge",
"content":"Build real AI-powered apps using modern tools."
},
{
"type":"task",
"title":"Task 1",
"content":"Build a modern landing page."
},
{
"type":"task",
"title":"Task 2",
"content":"Integrate AI API."
},
{
"type":"resource",
"title":"Resources",
"content":"OpenAI Docs, Next.js Docs"
},
{
"type":"snippet",
"title":"Starter Code",
"content":"npx create-next-app@latest ai-challenge-app"
}
]'::jsonb,


'virtual',

NOW() + INTERVAL '2 hours',

NOW() + INTERVAL '50 hours',

'https://images.unsplash.com/photo-1677442136019-21780ecad995',

1000,

0,

false

)

ON CONFLICT(event_no)

DO UPDATE SET

title = EXCLUDED.title,

description = EXCLUDED.description,

category = EXCLUDED.category,

type = EXCLUDED.type,

difficulty = EXCLUDED.difficulty,

requirements = EXCLUDED.requirements,

judging_criteria = EXCLUDED.judging_criteria,

deliverables = EXCLUDED.deliverables,

technologies = EXCLUDED.technologies,

rewards = EXCLUDED.rewards,

modules = EXCLUDED.modules,

mode = EXCLUDED.mode,

start_time = EXCLUDED.start_time,

end_time = EXCLUDED.end_time,

banner_url = EXCLUDED.banner_url,

max_attendees = EXCLUDED.max_attendees,

attendees_count = EXCLUDED.attendees_count,

is_live = EXCLUDED.is_live;


CREATE TABLE exchange_notes(

id SERIAL PRIMARY KEY,

exchange_id INTEGER REFERENCES exchange_skills(id)
ON DELETE CASCADE,

user_id INTEGER REFERENCES users(id)
ON DELETE CASCADE,

content TEXT,

updated_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE exchange_files(

id SERIAL PRIMARY KEY,

exchange_id INTEGER,

user_id INTEGER,

filename VARCHAR(255),

file_url TEXT,

file_type VARCHAR(100),

created_at TIMESTAMP DEFAULT NOW()

);