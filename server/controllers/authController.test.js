const bcrypt = require('bcryptjs');
const User = require('../models/User');

test('should return true if password matches', async () => {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
  });

  const isMatch = await bcrypt.compare(password, user.password);
  expect(isMatch).toBe(true);
});

test('should return false if password does not match', async () => {
  const password = 'password123';
  const wrongPassword = 'wrongpassword';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
  });

  const isMatch = await bcrypt.compare(wrongPassword, user.password);
  expect(isMatch).toBe(false);
});