create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  role text default 'student'
);

create table topics (
  id serial primary key,
  name text not null,
  description text
);

create table questions (
  id serial primary key,
  topic_id int references topics(id),
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text
);

create table attempts (
  id serial primary key,
  user_id uuid references users(id),
  question_id int references questions(id),
  is_correct boolean,
  created_at timestamp default now()
);