const Notification = require('../models/Notification');
const { getChannel } = require('../config/rabbitmq');
const dotenv = require('dotenv');
dotenv.config();

exports.createNotification = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  try {
      const notification = new Notification({ userId, message });
      await notification.save();

      // Push message to the queue
      const channel = getChannel();
      const queue = 'notifications';
      const msg = JSON.stringify({ userId, message });

      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(' [x] Sent %s', msg);

      res.status(201).json(notification);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


