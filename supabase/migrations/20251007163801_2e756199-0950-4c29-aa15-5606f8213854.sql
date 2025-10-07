-- Make user admin
INSERT INTO user_roles (user_id, role)
VALUES ('ed69e084-3456-43b2-bc7f-d8b04bc6095c', 'admin')
ON CONFLICT DO NOTHING;