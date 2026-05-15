INSERT INTO users (id, first_name, last_name, email, password_hash)
VALUES
  (1, 'Alice', 'Johnson', 'alice@example.com', '$2b$10$7x1QCY59AfuIoP6RYYGf0u9A4mEPO8btf9vP9f1JfGI7AJj4P7L3K'),
  (2, 'Bob', 'Smith', 'bob@example.com', '$2b$10$4J7Q9Y1wE3wW5QWx7x0K9.Ju1mYXfse7QmNOKv9MTRAs5QhQJMYsW')
ON CONFLICT (id) DO NOTHING;

INSERT INTO kudos (id, description, type, created_by_user_id, for_user_id)
VALUES
  (1, 'Thanks for fixing the flaky build pipeline.', 'teamwork', 1, 2),
  (2, 'Great support during onboarding.', 'support', 2, 1),
  (3, 'Excellent documentation improvements.', 'quality', 1, 1)
ON CONFLICT (id) DO NOTHING;
