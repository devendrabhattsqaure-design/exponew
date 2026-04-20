const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.adminPanelUser.findUnique({
      where: { email },
      include: { turf: true }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role, turfId: admin.turfId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        turfId: admin.turfId,
        turfName: admin.turf?.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Register (General)
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, role, secretKey } = req.body;

    // Optional: Protect Super Admin registration with a secret key
    if (role === 'SUPER_ADMIN' && secretKey !== 'SUPER_ADMIN_SECRET') {
        return res.status(403).json({ error: 'Unauthorized role assignment' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.adminPanelUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'TURF_ADMIN'
      }
    });

    res.status(201).json({ message: 'Admin created successfully', id: admin.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Turf Admin (Super Admin only)
exports.createTurfAdmin = async (req, res) => {
  try {
    const { name, email, turfId } = req.body;

    // Default password as requested: name@12345
    const defaultPassword = `${name}@12345`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const admin = await prisma.adminPanelUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TURF_ADMIN',
        turfId
      }
    });

    res.status(201).json({
      message: 'Turf Admin created successfully',
      credentials: {
        email,
        password: defaultPassword
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
