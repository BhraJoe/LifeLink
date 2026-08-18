import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data', 'users.json');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'lifelink-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const router = express.Router();

const users = new Map();
const missingPersons = new Map();
const incidents = new Map();

async function loadUsers() {
  try {
    const raw = await readFile(DATA_FILE, 'utf-8');
    const list = JSON.parse(raw);
    for (const u of list) {
      users.set(u.id, u);
    }
  } catch {
    // file may not exist yet
  }
}

async function persistUsers() {
  const list = Array.from(users.values());
  await writeFile(DATA_FILE, JSON.stringify(list, null, 2));
}

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

const editProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = users.get(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

router.post('/auth/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    
    const existing = Array.from(users.values()).find(u => u.email === data.email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    users.set(user.id, user);
    await persistUsers();
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    const user = Array.from(users.values()).find(u => u.email === data.email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/auth/me', authMiddleware, (req, res) => {
  const user = req.user;
  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
    },
  });
});

router.put('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const data = editProfileSchema.parse(req.body);
    const user = req.user;

    const existing = Array.from(users.values()).find(u => u.email === data.email && u.id !== user.id);
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    user.fullName = data.fullName;
    user.email = data.email;
    user.phoneNumber = data.phoneNumber;
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    await persistUsers();
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Update failed' });
  }
});

router.post('/auth/profile/avatar', authMiddleware, async (req, res) => {
  try {
    const { image, contentType } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const user = req.user;
    user.avatar = `data:${contentType};base64,${image}`;

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Avatar upload failed' });
  }
});

router.post('/auth/forgot-password', async (req, res) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const user = Array.from(users.values()).find(u => u.email === data.email);
    
    if (user) {
      res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    } else {
      res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Request failed' });
  }
});

router.get('/missing-persons', authMiddleware, (req, res) => {
  const { status, verifiedOnly, search } = req.query;
  let results = Array.from(missingPersons.values());

  if (status) results = results.filter(r => r.status === status);
  if (verifiedOnly === 'true') results = results.filter(r => r.verified);
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(r => r.fullName.toLowerCase().includes(s));
  }

  res.json({ missingPersons: results });
});

router.post('/missing-persons', authMiddleware, (req, res) => {
  const { fullName, age, gender, lastSeenLocation, description, status, contactInfo } = req.body;
  const record = {
    id: Date.now().toString(),
    fullName: fullName || 'Unknown',
    age: age || 'Unknown',
    gender: gender || 'Unknown',
    lastSeenLocation: lastSeenLocation || 'Unknown',
    description: description || '',
    status: status || 'missing',
    verified: false,
    contactInfo: contactInfo || {},
    sightings: [],
    createdAt: new Date().toISOString(),
  };

  missingPersons.set(record.id, record);
  res.status(201).json({ missingPerson: record });
});

router.post('/missing-persons/:id/sighting', authMiddleware, (req, res) => {
  const { id } = req.params;
  const record = missingPersons.get(id);
  if (!record) {
    return res.status(404).json({ message: 'Missing person not found' });
  }

  const sighting = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  record.sightings.push(sighting);
  res.json({ sighting });
});

router.get('/incidents', authMiddleware, (req, res) => {
  const { type, status, search } = req.query;
  let results = Array.from(incidents.values());

  if (type) results = results.filter(r => r.type === type);
  if (status) results = results.filter(r => r.status === status);
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(r => r.title.toLowerCase().includes(s) || r.description.toLowerCase().includes(s));
  }

  res.json({ incidents: results });
});

router.get('/incidents/:id', authMiddleware, (req, res) => {
  const incident = incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }
  res.json({ incident });
});

router.post('/incidents', authMiddleware, (req, res) => {
  const { title, type, description, location, severity } = req.body;
  const incident = {
    id: Date.now().toString(),
    title: title || 'Untitled',
    type: type || 'general',
    description: description || '',
    location: location || {},
    severity: severity || 'medium',
    status: 'active',
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
  };

  incidents.set(incident.id, incident);
  res.status(201).json({ incident });
});

router.patch('/incidents/:id/status', authMiddleware, (req, res) => {
  const incident = incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  const { status } = req.body;
  incident.status = status;
  res.json({ incident });
});

router.post('/sos/live-location', authMiddleware, (req, res) => {
  const { latitude, longitude, accuracy, timestamp } = req.body;
  res.json({
    message: 'Live location shared successfully',
    location: { latitude, longitude, accuracy, timestamp },
  });
});

app.use('/api', router);

app.listen(PORT, async () => {
  await loadUsers();
  console.log(`LifeLink backend running on http://localhost:${PORT}`);
});
