import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data', 'users.json');
const SOS_DATA_FILE = join(__dirname, 'data', 'sos-events.json');
const INCIDENTS_DATA_FILE = join(__dirname, 'data', 'incidents.json');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'lifelink-secret-key-change-in-production';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const router = express.Router();

const users = new Map();
const missingPersons = new Map();
const incidents = new Map();
const sosEvents = new Map();

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
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(list, null, 2));
}

async function loadSosEvents() {
  try {
    const raw = await readFile(SOS_DATA_FILE, 'utf-8');
    for (const event of JSON.parse(raw)) {
      sosEvents.set(event.id, event);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function persistSosEvents() {
  await mkdir(dirname(SOS_DATA_FILE), { recursive: true });
  await writeFile(SOS_DATA_FILE, JSON.stringify(Array.from(sosEvents.values()), null, 2));
}

async function loadIncidents() {
  try {
    const raw = await readFile(INCIDENTS_DATA_FILE, 'utf-8');
    for (const incident of JSON.parse(raw)) {
      incidents.set(incident.id, incident);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function persistIncidents() {
  await mkdir(dirname(INCIDENTS_DATA_FILE), { recursive: true });
  await writeFile(INCIDENTS_DATA_FILE, JSON.stringify(Array.from(incidents.values()), null, 2));
}

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must contain at least 2 characters').max(100).regex(/^[a-zA-Z\s'-]+$/, 'Full name must contain letters only'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().regex(/^(?:0\d{9}|(?:\+?233)\d{9})$/, 'Enter 0241234567 or +233241234567'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

const editProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must contain at least 2 characters').max(100).regex(/^[a-zA-Z\s'-]+$/, 'Full name must contain letters only'),
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().regex(/^(?:0\d{9}|(?:\+?233)\d{9})$/, 'Enter 0241234567 or +233241234567'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const sosEventSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  accuracy: z.number().finite().nonnegative().optional(),
});
const hospitalSearchSchema = z.object({
  q: z.string().trim().min(2).max(120),
});

let nominatimQueue = Promise.resolve();
let lastNominatimRequestAt = 0;

function fetchNominatim(url) {
  const request = nominatimQueue.then(async () => {
    const waitMs = Math.max(0, 1000 - (Date.now() - lastNominatimRequestAt));
    if (waitMs > 0) {
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
    lastNominatimRequestAt = Date.now();
    return fetch(url, {
      headers: {
        'User-Agent': 'LifeLink/1.0 (+https://github.com/BhraJoe/LifeLink)',
        'Accept-Language': 'en',
      },
    });
  });
  nominatimQueue = request.then(() => undefined, () => undefined);
  return request;
}

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
    data.email = data.email.trim().toLowerCase();
    
    const existing = Array.from(users.values()).find(u => u.email.toLowerCase() === data.email);
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
    data.email = data.email.trim().toLowerCase();
    
    const user = Array.from(users.values()).find(u => u.email.toLowerCase() === data.email);
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
    data.email = data.email.trim().toLowerCase();
    const user = req.user;

    const existing = Array.from(users.values()).find(u => u.email.toLowerCase() === data.email && u.id !== user.id);
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
    const email = data.email.trim().toLowerCase();
    const user = Array.from(users.values()).find(u => u.email.toLowerCase() === email);
    
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
  const result = z.object({
    fullName: z.string().trim().min(2).max(100).regex(/^[a-zA-Z\s'-]+$/),
    age: z.union([z.number().int().min(0).max(120), z.string().regex(/^(|[0-9]|[1-9]\d|1\d{2}|120)$/)]).optional(),
    gender: z.enum(['Male', 'Female']).optional(),
    lastSeenLocation: z.string().trim().min(1).max(200),
    description: z.string().max(1000).optional(),
    contactPhone: z.string().regex(/^(?:0\d{9}|(?:\+?233)\d{9})$/),
  }).safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message });
  }

  const { fullName, age, gender, lastSeenLocation, description, contactPhone } = result.data;
  const record = {
    id: Date.now().toString(),
    fullName: fullName || 'Unknown',
    age: age || 'Unknown',
    gender: gender || 'Unknown',
    lastSeenLocation: lastSeenLocation || 'Unknown',
    description: description || '',
    status: status || 'missing',
    verified: false,
    contactPhone,
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

router.get('/hospitals/search', authMiddleware, async (req, res) => {
  const parsed = hospitalSearchSchema.safeParse({ q: req.query.q });
  if (!parsed.success) {
    return res.status(400).json({ message: 'Search query must be between 2 and 120 characters' });
  }

  const query = parsed.data.q;
  const searchTerms = /\bhospital\b/i.test(query) ? query : `${query} hospital`;
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    extratags: '1',
    limit: '20',
    q: searchTerms,
  });

  try {
    const response = await fetchNominatim(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`
    );
    if (!response.ok) {
      console.error(`Hospital search provider returned ${response.status}`);
      return res.status(502).json({ message: 'Hospital search service is temporarily unavailable' });
    }

    const results = await response.json();
    if (!Array.isArray(results)) {
      throw new Error('Hospital search provider returned an invalid response');
    }
    res.json({ results });
  } catch (error) {
    console.error('Hospital search proxy failed:', error);
    res.status(502).json({ message: 'Hospital search service is temporarily unavailable' });
  }
});

router.post('/incidents', authMiddleware, async (req, res) => {
  const { title, type, description, location, severity, images } = req.body;
  const incident = {
    id: Date.now().toString(),
    title: title || 'Untitled',
    type: type || 'general',
    description: description || '',
    location: location || {},
    images: Array.isArray(images) ? images : [],
    severity: severity || 'medium',
    status: 'active',
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
  };

  incidents.set(incident.id, incident);
  await persistIncidents();
  res.status(201).json({ incident });
});

router.patch('/incidents/:id/like', authMiddleware, async (req, res) => {
  const incident = incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  const { userId } = req.user;
  const alreadyLiked = incident.likedBy && incident.likedBy.includes(userId);
  if (alreadyLiked) {
    incident.likedBy = incident.likedBy.filter(id => id !== userId);
  } else {
    incident.likedBy = incident.likedBy ? [...incident.likedBy, userId] : [userId];
  }
  incident.likes = (incident.likedBy || []).length;
  await persistIncidents();
  res.json({ incident });
});

router.get('/incidents/:id/comments', authMiddleware, (req, res) => {
  const incident = incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }
  res.json({ comments: incident.comments || [] });
});

router.post('/incidents/:id/comments', authMiddleware, async (req, res) => {
  const incident = incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const author = req.user.fullName || req.user.email || 'User';

  const comment = {
    id: Date.now().toString(),
    text: text.trim(),
    userId: req.user.id,
    author,
    avatar: req.user.avatar || null,
    createdAt: new Date().toISOString(),
  };

  incident.comments = incident.comments || [];
  incident.comments.push(comment);
  await persistIncidents();
  res.json({ incident });
});

router.patch('/incidents/:id/comments/:commentId/like', authMiddleware, async (req, res) => {
  const incident = incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  const comment = incident.comments?.find(c => c.id === req.params.commentId);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  const { userId } = req.user;
  comment.likedBy = comment.likedBy || [];
  const alreadyLiked = comment.likedBy.includes(userId);
  if (alreadyLiked) {
    comment.likedBy = comment.likedBy.filter(id => id !== userId);
  } else {
    comment.likedBy.push(userId);
  }
  comment.likes = comment.likedBy.length;
  await persistIncidents();
  res.json({ incident, comment });
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

router.post('/sos', authMiddleware, async (req, res) => {
  try {
    const location = sosEventSchema.parse(req.body);
    const event = {
      id: randomUUID(),
      userId: req.user.id,
      ...location,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    sosEvents.set(event.id, event);
    try {
      await persistSosEvents();
    } catch (error) {
      sosEvents.delete(event.id);
      console.error('Failed to persist SOS event:', error);
      return res.status(500).json({ message: 'SOS could not be recorded' });
    }

    res.status(201).json({ sosEvent: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Failed to create SOS event:', error);
    res.status(500).json({ message: 'SOS could not be recorded' });
  }
});

router.patch('/sos/:id/cancel', authMiddleware, async (req, res) => {
  const event = sosEvents.get(req.params.id);
  if (!event || event.userId !== req.user.id) {
    return res.status(404).json({ message: 'SOS event not found' });
  }

  const previousStatus = event.status;
  const previousUpdatedAt = event.updatedAt;
  event.status = 'cancelled';
  event.updatedAt = new Date().toISOString();

  try {
    await persistSosEvents();
    res.json({ sosEvent: event });
  } catch (error) {
    event.status = previousStatus;
    if (previousUpdatedAt) {
      event.updatedAt = previousUpdatedAt;
    } else {
      delete event.updatedAt;
    }
    console.error('Failed to cancel SOS event:', error);
    res.status(500).json({ message: 'SOS could not be cancelled' });
  }
});

app.use('/api', router);

async function startServer() {
  await loadUsers();
  await loadSosEvents();
  await loadIncidents();
  app.listen(PORT, () => {
    console.log(`LifeLink backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start LifeLink backend:', error);
  process.exit(1);
});
