require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/user');
const demoRoutes = require('./routes/demo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user', userRoutes);
app.use('/api/demo', demoRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
});

app.listen(PORT, () => {
  console.log(`StyleComplex server running on http://localhost:${PORT}`);
  console.log(`Email: ${process.env.RESEND_API_KEY ? 'enabled' : 'disabled (no RESEND_API_KEY)'}`);
});
