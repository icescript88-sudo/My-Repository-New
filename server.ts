import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("school.db");
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
const JWT_SECRET = process.env.JWT_SECRET || "impagme-secret-key-2024";

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT, -- admin, teacher, student, finance
    profile_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_no TEXT UNIQUE,
    name TEXT,
    bi TEXT UNIQUE,
    dob TEXT,
    guardian TEXT,
    contact TEXT,
    address TEXT,
    status TEXT DEFAULT 'Ativo',
    photo TEXT
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    bi TEXT UNIQUE,
    role TEXT, -- Secretário, Limpeza, Segurança, etc.
    contact TEXT,
    photo TEXT
  );

  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    bi TEXT UNIQUE,
    contact TEXT,
    degree TEXT,
    photo TEXT,
    cycle TEXT DEFAULT '2º Ciclo'
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    year TEXT,
    shift TEXT, -- Manhã, Tarde, Noite
    room_number TEXT,
    cycle TEXT DEFAULT '2º Ciclo'
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    cycle TEXT DEFAULT '2º Ciclo'
  );

  CREATE TABLE IF NOT EXISTS class_students (
    class_id INTEGER,
    student_id INTEGER,
    PRIMARY KEY (class_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS class_teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    teacher_id INTEGER,
    subject_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject_id INTEGER,
    class_id INTEGER,
    period TEXT, -- T1, T2, T3
    score REAL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    amount REAL,
    date TEXT,
    month TEXT,
    type TEXT, -- Propina, Matrícula, Multa
    receipt_no TEXT UNIQUE,
    status TEXT DEFAULT 'Pago' -- Pago, Pendente
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    class_id INTEGER,
    date TEXT,
    status TEXT -- Presente, Falta
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    date TEXT,
    category TEXT -- Salários, Manutenção, Material, etc.
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    message TEXT,
    type TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teacher_subjects (
    teacher_id INTEGER,
    subject_id INTEGER,
    PRIMARY KEY (teacher_id, subject_id)
  );

  CREATE TABLE IF NOT EXISTS school_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migration: add cycle column to subjects
try { db.exec("ALTER TABLE subjects ADD COLUMN cycle TEXT DEFAULT '2º Ciclo'"); } catch (_) {}
db.exec("UPDATE subjects SET cycle = '2º Ciclo' WHERE cycle IS NULL OR cycle = ''");

// Seed 2º Ciclo Subjects
const subjects2Ciclo = [
  "Base de Dados","Informática Aplicada a Gestão","Matematica","Economia",
  "Lingua portuguesa","T.I.C","T.L.P","Lingua inglesa","Educação Física",
  "O.G.E","O.A.E","I.A.G"
];
subjects2Ciclo.forEach(name => {
  const exists = db.prepare("SELECT id FROM subjects WHERE name = ? AND cycle = '2º Ciclo'").get(name);
  if (!exists) db.prepare("INSERT INTO subjects (name, cycle) VALUES (?, '2º Ciclo')").run(name);
});

// Seed 1º Ciclo Subjects
const subjects1Ciclo = [
  "Língua Portuguesa","Matemática","Ciências da Natureza","História",
  "Geografia","Educação Física","Educação Visual e Plástica",
  "Educação Musical","Língua Inglesa","Formação Pessoal e Social"
];
subjects1Ciclo.forEach(name => {
  const exists = db.prepare("SELECT id FROM subjects WHERE name = ? AND cycle = '1º Ciclo'").get(name);
  if (!exists) db.prepare("INSERT INTO subjects (name, cycle) VALUES (?, '1º Ciclo')").run(name);
});

// Seed default fee settings
const defaultFees: Record<string, string> = {
  fee_propina: '15000',     fee_matricula: '25000',     fee_multa: '5000',     fee_prova: '3000',
  fee_propina_1ciclo: '10000', fee_matricula_1ciclo: '15000', fee_multa_1ciclo: '3000', fee_prova_1ciclo: '2000'
};
for (const [key, value] of Object.entries(defaultFees)) {
  db.prepare("INSERT OR IGNORE INTO school_settings (key, value) VALUES (?, ?)").run(key, value);
}
db.prepare("INSERT OR IGNORE INTO school_settings (key, value) VALUES (?, ?)").run('school_year', '2026/2027');

// Migration: add cycle column to teachers table for existing databases
try { db.exec("ALTER TABLE teachers ADD COLUMN cycle TEXT DEFAULT '2º Ciclo'"); } catch (_) {}
db.exec("UPDATE teachers SET cycle = '2º Ciclo' WHERE cycle IS NULL OR cycle = ''");

// Migration: add cycle column to classes table for existing databases
try { db.exec("ALTER TABLE classes ADD COLUMN cycle TEXT DEFAULT '2º Ciclo'"); } catch (_) {}
db.exec("UPDATE classes SET cycle = '2º Ciclo' WHERE cycle IS NULL OR cycle = ''");
try { db.exec("ALTER TABLE classes ADD COLUMN academic_year TEXT DEFAULT '2025/2026'"); } catch (_) {}
db.exec("UPDATE classes SET academic_year = '2025/2026' WHERE academic_year IS NULL OR academic_year = ''")

// Seed Admin User if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hashedPassword, "admin");
}

async function startServer() {
  const app = express();
  const server = new HttpServer(app);
  const wss = new WebSocketServer({ noServer: true });

  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws, request) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        clients.set(decoded.id, ws);
        ws.on('close', () => clients.delete(decoded.id));
      } catch (e) {
        ws.close();
      }
    } else {
      ws.close();
    }
  });

  const sendNotification = (userId: number, notification: any) => {
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'NOTIFICATION', data: notification }));
    }
  };

  const createNotification = (userId: number, title: string, message: string, type: string) => {
    const info = db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)").run(userId, title, message, type);
    const notification = {
      id: info.lastInsertRowid,
      user_id: userId,
      title,
      message,
      type,
      is_read: 0,
      created_at: new Date().toISOString()
    };
    sendNotification(userId, notification);
    return notification;
  };

  const notifyAdmins = (title: string, message: string, type: string) => {
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin' OR role = 'finance'").all() as any[];
    admins.forEach(admin => {
      createNotification(admin.id, title, message, type);
    });
  };

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API ROUTES ---

  // Auth
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role, profile_id: user.profile_id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  app.post("/api/change-password", authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get((req as any).user.id) as any;

    if (user && bcrypt.compareSync(currentPassword, user.password)) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, (req as any).user.id);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Senha atual incorreta" });
    }
  });

  app.post("/api/admin/reset-password", authenticateToken, (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { userId, newPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, userId);
    res.json({ success: true });
  });

  app.get("/api/admin/users", authenticateToken, (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const users = db.prepare("SELECT id, username, role, profile_id FROM users ORDER BY role, username").all();
    res.json(users);
  });

  app.post("/api/admin/users", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'Campos obrigatórios em falta' });
    const valid = ['admin', 'teacher', 'finance', 'student'];
    if (!valid.includes(role)) return res.status(400).json({ error: 'Função inválida' });
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existing) return res.status(409).json({ error: 'Nome de utilizador já existe' });
    try {
      const hashed = bcrypt.hashSync(password, 10);
      const info = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(username, hashed, role);
      res.json({ id: info.lastInsertRowid, username, role });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/admin/users/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'Não pode eliminar a sua própria conta' });
    const target = db.prepare("SELECT role FROM users WHERE id = ?").get(req.params.id) as any;
    if (!target) return res.status(404).json({ error: 'Utilizador não encontrado' });
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Notifications
  app.get("/api/notifications", authenticateToken, (req, res) => {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all((req as any).user.id);
    res.json(notifications);
  });

  app.put("/api/notifications/:id/read", authenticateToken, (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, (req as any).user.id);
    res.json({ success: true });
  });

  app.put("/api/notifications/read-all", authenticateToken, (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run((req as any).user.id);
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get("/api/stats", authenticateToken, (req: any, res) => {
    const studentCount = db.prepare("SELECT COUNT(*) as count FROM students").get() as any;
    const teacherCount = db.prepare("SELECT COUNT(*) as count FROM teachers").get() as any;
    const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get() as any;

    const canSeeFinancial = req.user.role === 'admin' || req.user.role === 'finance';
    let revenue = 0, pending = 0, expenses = 0;
    if (canSeeFinancial) {
      const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'Pago'").get() as any;
      const pendingRevenue = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'Pendente'").get() as any;
      const totalExpenses = db.prepare("SELECT SUM(amount) as total FROM expenses").get() as any;
      revenue = totalRevenue.total || 0;
      pending = pendingRevenue.total || 0;
      expenses = totalExpenses.total || 0;
    }

    res.json({ students: studentCount.count, teachers: teacherCount.count, classes: classCount.count, revenue, pending, expenses });
  });

  // Per-cycle stats
  app.get("/api/stats/cycles", authenticateToken, (req: any, res) => {
    const cycles = ['1º Ciclo', '2º Ciclo'];
    const canSeeFinancial = req.user.role === 'admin' || req.user.role === 'finance';

    const result: any = {};
    for (const cycle of cycles) {
      const classCount = db.prepare("SELECT COUNT(*) as count FROM classes WHERE cycle = ?").get(cycle) as any;
      const studentCount = db.prepare(`
        SELECT COUNT(DISTINCT cs.student_id) as count
        FROM class_students cs
        JOIN classes c ON cs.class_id = c.id
        WHERE c.cycle = ?
      `).get(cycle) as any;
      const attendanceTotal = db.prepare(`
        SELECT COUNT(*) as total, SUM(CASE WHEN a.status = 'Presente' THEN 1 ELSE 0 END) as present
        FROM attendance a
        JOIN classes c ON a.class_id = c.id
        WHERE c.cycle = ?
      `).get(cycle) as any;

      const attendanceRate = attendanceTotal.total > 0
        ? Math.round((attendanceTotal.present / attendanceTotal.total) * 100)
        : null;

      let revenue = null, pending = null;
      if (canSeeFinancial) {
        const rev = db.prepare(`
          SELECT SUM(p.amount) as total FROM payments p
          JOIN students s ON p.student_id = s.id
          JOIN class_students cs ON s.id = cs.student_id
          JOIN classes c ON cs.class_id = c.id
          WHERE p.status = 'Pago' AND c.cycle = ?
        `).get(cycle) as any;
        const pend = db.prepare(`
          SELECT SUM(p.amount) as total FROM payments p
          JOIN students s ON p.student_id = s.id
          JOIN class_students cs ON s.id = cs.student_id
          JOIN classes c ON cs.class_id = c.id
          WHERE p.status = 'Pendente' AND c.cycle = ?
        `).get(cycle) as any;
        revenue = rev.total || 0;
        pending = pend.total || 0;
      }

      const teacherCount = db.prepare("SELECT COUNT(*) as count FROM teachers WHERE cycle = ?").get(cycle) as any;
      result[cycle] = { classes: classCount.count, students: studentCount.count, teachers: teacherCount.count, attendanceRate, revenue, pending };
    }
    res.json(result);
  });

  // Students
  app.get("/api/students", authenticateToken, (req, res) => {
    const students = db.prepare(`
      SELECT s.*, cs.class_id
      FROM students s
      LEFT JOIN class_students cs ON s.id = cs.student_id
    `).all();
    res.json(students);
  });

  app.post("/api/students", authenticateToken, (req, res) => {
    const { registration_no, name, bi, dob, guardian, contact, address, photo } = req.body;
    try {
      const info = db.prepare("INSERT INTO students (registration_no, name, bi, dob, guardian, contact, address, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(registration_no, name, bi, dob, guardian, contact, address, photo);
      // Create user account for student
      const hashedPassword = bcrypt.hashSync(bi, 10); // Default password is BI
      db.prepare("INSERT INTO users (username, password, role, profile_id) VALUES (?, ?, ?, ?)").run(bi, hashedPassword, 'student', info.lastInsertRowid);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/students/:id", authenticateToken, (req, res) => {
    const { registration_no, name, bi, dob, guardian, contact, address, photo } = req.body;
    try {
      const oldStudent = db.prepare("SELECT bi FROM students WHERE id = ?").get(req.params.id) as any;
      db.prepare("UPDATE students SET registration_no = ?, name = ?, bi = ?, dob = ?, guardian = ?, contact = ?, address = ?, photo = ? WHERE id = ?").run(registration_no, name, bi, dob, guardian, contact, address, photo, req.params.id);
      if (oldStudent && oldStudent.bi !== bi) {
        db.prepare("UPDATE users SET username = ? WHERE username = ? AND role = 'student'").run(bi, oldStudent.bi);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Teachers
  app.get("/api/teachers", authenticateToken, (req: any, res) => {
    const cycle = req.query.cycle as string | undefined;
    const teachers = (cycle
      ? db.prepare("SELECT * FROM teachers WHERE cycle = ?").all(cycle)
      : db.prepare("SELECT * FROM teachers").all()) as any[];
    const withSubjects = teachers.map(t => {
      const subjects = db.prepare(
        "SELECT s.id, s.name FROM subjects s JOIN teacher_subjects ts ON s.id = ts.subject_id WHERE ts.teacher_id = ? ORDER BY s.name ASC"
      ).all(t.id);
      return { ...t, subjects };
    });
    res.json(withSubjects);
  });

  app.get("/api/teachers/:id/subjects", authenticateToken, (req, res) => {
    const subjects = db.prepare(
      "SELECT s.id, s.name FROM subjects s JOIN teacher_subjects ts ON s.id = ts.subject_id WHERE ts.teacher_id = ? ORDER BY s.name ASC"
    ).all(req.params.id);
    res.json(subjects);
  });

  app.post("/api/teachers", authenticateToken, (req, res) => {
    const { name, bi, contact, degree, photo, subject_ids, cycle } = req.body;
    try {
      const info = db.prepare("INSERT INTO teachers (name, bi, contact, degree, photo, cycle) VALUES (?, ?, ?, ?, ?, ?)").run(name, bi, contact, degree, photo, cycle || '2º Ciclo');
      const teacherId = info.lastInsertRowid;
      const hashedPassword = bcrypt.hashSync(bi, 10);
      db.prepare("INSERT INTO users (username, password, role, profile_id) VALUES (?, ?, ?, ?)").run(bi, hashedPassword, 'teacher', teacherId);
      if (Array.isArray(subject_ids)) {
        const insertSubj = db.prepare("INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)");
        for (const sid of subject_ids) insertSubj.run(teacherId, sid);
      }
      res.json({ id: teacherId });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/teachers/:id", authenticateToken, (req, res) => {
    const { name, bi, contact, degree, photo, subject_ids, cycle } = req.body;
    try {
      const oldTeacher = db.prepare("SELECT bi FROM teachers WHERE id = ?").get(req.params.id) as any;
      db.prepare("UPDATE teachers SET name = ?, bi = ?, contact = ?, degree = ?, photo = ?, cycle = ? WHERE id = ?").run(name, bi, contact, degree, photo, cycle || '2º Ciclo', req.params.id);
      if (oldTeacher && oldTeacher.bi !== bi) {
        db.prepare("UPDATE users SET username = ? WHERE username = ? AND role = 'teacher'").run(bi, oldTeacher.bi);
      }
      if (Array.isArray(subject_ids)) {
        db.prepare("DELETE FROM teacher_subjects WHERE teacher_id = ?").run(req.params.id);
        const insertSubj = db.prepare("INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES (?, ?)");
        for (const sid of subject_ids) insertSubj.run(req.params.id, sid);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Classes
  app.get("/api/classes", authenticateToken, (req, res) => {
    const classes = db.prepare(`
      SELECT c.*, 
      (SELECT GROUP_CONCAT(student_id) FROM class_students WHERE class_id = c.id) as student_ids,
      (SELECT COUNT(*) FROM class_students WHERE class_id = c.id) as student_count
      FROM classes c
    `).all();
    res.json(classes);
  });

  app.post("/api/classes", authenticateToken, (req, res) => {
    const { name, year, shift, room_number, cycle, academic_year } = req.body;
    const info = db.prepare("INSERT INTO classes (name, year, shift, room_number, cycle, academic_year) VALUES (?, ?, ?, ?, ?, ?)").run(name, year, shift, room_number, cycle || '2º Ciclo', academic_year || '2026/2027');
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/classes/:id", authenticateToken, (req, res) => {
    const { name, year, shift, room_number, cycle, academic_year } = req.body;
    db.prepare("UPDATE classes SET name = ?, year = ?, shift = ?, room_number = ?, cycle = ?, academic_year = ? WHERE id = ?").run(name, year, shift, room_number, cycle || '2º Ciclo', academic_year || '2026/2027', req.params.id);
    res.json({ success: true });
  });

  // Student Portal Specific
  app.get("/api/student/dashboard", authenticateToken, (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'student') return res.sendStatus(403);

    const studentId = user.profile_id;
    
    // Get student info
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId) as any;
    
    // Get class info
    const classInfo = db.prepare(`
      SELECT c.* 
      FROM classes c
      JOIN class_students cs ON c.id = cs.class_id
      WHERE cs.student_id = ?
    `).get(studentId) as any;

    // Get payments
    const payments = db.prepare("SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC").all(studentId);

    res.json({
      student,
      class: classInfo || null,
      payments
    });
  });

  // Student Profile Detail (for Admin/Teacher)
  app.get("/api/students/:id/profile", authenticateToken, (req, res) => {
    const studentId = req.params.id;
    
    // Get student info
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId) as any;
    if (!student) return res.status(404).json({ error: "Aluno não encontrado" });
    
    // Get class info
    const classInfo = db.prepare(`
      SELECT c.* 
      FROM classes c
      JOIN class_students cs ON c.id = cs.class_id
      WHERE cs.student_id = ?
    `).get(studentId) as any;

    // Get payments
    const payments = db.prepare("SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC").all(studentId);

    // Get grades
    const grades = db.prepare(`
      SELECT g.*, sub.name as subject_name 
      FROM grades g 
      JOIN subjects sub ON g.subject_id = sub.id 
      WHERE g.student_id = ?
    `).all(studentId);

    res.json({
      student,
      class: classInfo || null,
      payments,
      grades
    });
  });

  // Fee Settings
  app.get("/api/settings/general", authenticateToken, (_req, res) => {
    const row = db.prepare("SELECT value FROM school_settings WHERE key = 'school_year'").get() as any;
    res.json({ school_year: row?.value ?? '2026/2027' });
  });

  app.put("/api/settings/general", authenticateToken, (req, res) => {
    const { school_year } = req.body;
    if (school_year) db.prepare("INSERT OR REPLACE INTO school_settings (key, value) VALUES ('school_year', ?)").run(String(school_year));
    res.json({ success: true });
  });

  app.get("/api/settings/fees", authenticateToken, (req, res) => {
    const rows = db.prepare("SELECT key, value FROM school_settings WHERE key LIKE 'fee_%'").all() as any[];
    const fees: Record<string, number> = {};
    for (const row of rows) fees[row.key] = parseFloat(row.value);
    res.json(fees);
  });

  app.put("/api/settings/fees", authenticateToken, (req, res) => {
    const keys = ['fee_propina','fee_matricula','fee_multa','fee_prova',
                  'fee_propina_1ciclo','fee_matricula_1ciclo','fee_multa_1ciclo','fee_prova_1ciclo'];
    const update = db.prepare("INSERT OR REPLACE INTO school_settings (key, value) VALUES (?, ?)");
    for (const key of keys) {
      if (req.body[key] !== undefined) update.run(key, String(req.body[key]));
    }
    res.json({ success: true });
  });

  // Student search for payments
  app.get("/api/students/search", authenticateToken, (req: any, res) => {
    const q = `%${req.query.q || ''}%`;
    const cycle = req.query.cycle as string | undefined;
    let results;
    if (cycle) {
      results = db.prepare(`
        SELECT s.id, s.name, s.registration_no, s.bi, c.name as class_name
        FROM students s
        LEFT JOIN class_students cs ON s.id = cs.student_id
        LEFT JOIN classes c ON cs.class_id = c.id
        WHERE (s.name LIKE ? OR s.bi LIKE ? OR s.registration_no LIKE ?)
          AND c.cycle = ?
        LIMIT 8
      `).all(q, q, q, cycle);
    } else {
      results = db.prepare(`
        SELECT s.id, s.name, s.registration_no, s.bi, c.name as class_name
        FROM students s
        LEFT JOIN class_students cs ON s.id = cs.student_id
        LEFT JOIN classes c ON cs.class_id = c.id
        WHERE s.name LIKE ? OR s.bi LIKE ? OR s.registration_no LIKE ?
        LIMIT 8
      `).all(q, q, q);
    }
    res.json(results);
  });

  // Auto-generate next receipt number
  app.get("/api/payments/next-receipt", authenticateToken, (req, res) => {
    const year = new Date().getFullYear();
    const last = db.prepare(
      "SELECT receipt_no FROM payments WHERE receipt_no LIKE ? ORDER BY id DESC LIMIT 1"
    ).get(`REC-${year}-%`) as any;
    let nextNum = 1;
    if (last) {
      const parts = last.receipt_no.split('-');
      nextNum = (parseInt(parts[2]) || 0) + 1;
    }
    res.json({ receipt_no: `REC-${year}-${String(nextNum).padStart(3, '0')}` });
  });

  // Payments
  app.get("/api/payments", authenticateToken, (req: any, res) => {
    const cycle = req.query.cycle as string | undefined;
    let payments;
    if (cycle) {
      payments = db.prepare(`
        SELECT p.*, s.name as student_name
        FROM payments p
        JOIN students s ON p.student_id = s.id
        LEFT JOIN class_students cs ON s.id = cs.student_id
        LEFT JOIN classes c ON cs.class_id = c.id
        WHERE c.cycle = ?
      `).all(cycle);
    } else {
      payments = db.prepare(`
        SELECT p.*, s.name as student_name 
        FROM payments p 
        JOIN students s ON p.student_id = s.id
      `).all();
    }
    res.json(payments);
  });

  app.post("/api/payments", authenticateToken, (req, res) => {
    const { student_id, amount, date, month, type, receipt_no, status } = req.body;
    try {
      const info = db.prepare("INSERT INTO payments (student_id, amount, date, month, type, receipt_no, status) VALUES (?, ?, ?, ?, ?, ?, ?)").run(student_id, amount, date, month, type, receipt_no, status || 'Pago');
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      if (e.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Este número de recibo já está em uso por outro registro." });
      } else {
        res.status(400).json({ error: e.message });
      }
    }
  });

  app.put("/api/payments/:id", authenticateToken, (req, res) => {
    const { student_id, amount, date, month, type, receipt_no, status } = req.body;
    try {
      const result = db.prepare("UPDATE payments SET student_id = ?, amount = ?, date = ?, month = ?, type = ?, receipt_no = ?, status = ? WHERE id = ?").run(
        Number(student_id), 
        Number(amount), 
        date, 
        month, 
        type, 
        receipt_no, 
        status, 
        req.params.id
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: "Pagamento não encontrado" });
      }
      
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error updating payment:", e);
      if (e.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Este número de recibo já está em uso por outro registro." });
      } else {
        res.status(400).json({ error: e.message });
      }
    }
  });

  // Grades
  app.get("/api/grades/:studentId", authenticateToken, (req, res) => {
    const grades = db.prepare(`
      SELECT g.*, sub.name as subject_name 
      FROM grades g 
      JOIN subjects sub ON g.subject_id = sub.id 
      WHERE g.student_id = ?
    `).all(req.params.studentId);
    res.json(grades);
  });

  app.post("/api/grades", authenticateToken, (req, res) => {
    const { student_id, subject_id, class_id, period, score } = req.body;
    const info = db.prepare("INSERT INTO grades (student_id, subject_id, class_id, period, score) VALUES (?, ?, ?, ?, ?)").run(student_id, subject_id, class_id, period, score);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/subjects/all", authenticateToken, (req: any, res) => {
    const cycle = req.query.cycle as string | undefined;
    const subjects = cycle
      ? db.prepare("SELECT * FROM subjects WHERE cycle = ? ORDER BY name ASC").all(cycle)
      : db.prepare("SELECT * FROM subjects ORDER BY name ASC").all();
    res.json(subjects);
  });

  app.get("/api/subjects", authenticateToken, (req: any, res) => {
    const user = req.user;
    const cycle = req.query.cycle as string | undefined;
    if (user.role === 'teacher') {
      const subjects = db.prepare(
        "SELECT s.* FROM subjects s JOIN teacher_subjects ts ON s.id = ts.subject_id WHERE ts.teacher_id = ? ORDER BY s.name ASC"
      ).all(user.profile_id);
      return res.json(subjects);
    }
    const subjects = cycle
      ? db.prepare("SELECT * FROM subjects WHERE cycle = ? ORDER BY name ASC").all(cycle)
      : db.prepare("SELECT * FROM subjects ORDER BY name ASC").all();
    res.json(subjects);
  });

  app.get("/api/classes/:classId/subjects/:subjectId/grades/:period", authenticateToken, (req, res) => {
    const { classId, subjectId, period } = req.params;
    const grades = db.prepare(`
      SELECT s.id as student_id, s.name as student_name, g.score, g.id as grade_id
      FROM students s
      JOIN class_students cs ON s.id = cs.student_id
      LEFT JOIN grades g ON s.id = g.student_id AND g.subject_id = ? AND g.class_id = ? AND g.period = ?
      WHERE cs.class_id = ?
      ORDER BY s.name ASC
    `).all(subjectId, classId, period, classId);
    res.json(grades);
  });

  app.post("/api/grades/batch", authenticateToken, (req, res) => {
    const { class_id, subject_id, period, grades } = req.body; // grades: [{student_id, score}]
    
    const insertOrUpdate = db.transaction((gradesList) => {
      for (const item of gradesList) {
        const existing = db.prepare("SELECT id FROM grades WHERE student_id = ? AND subject_id = ? AND class_id = ? AND period = ?").get(item.student_id, subject_id, class_id, period) as any;
        
        if (existing) {
          db.prepare("UPDATE grades SET score = ? WHERE id = ?").run(item.score, existing.id);
        } else {
          db.prepare("INSERT INTO grades (student_id, subject_id, class_id, period, score) VALUES (?, ?, ?, ?, ?)").run(item.student_id, subject_id, class_id, period, item.score);
        }
      }
    });

    try {
      insertOrUpdate(grades);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // DELETE Routes
  app.delete("/api/students/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'finance') return res.sendStatus(403);
    const id = req.params.id;
    db.transaction(() => {
      db.prepare("DELETE FROM class_students WHERE student_id = ?").run(id);
      db.prepare("DELETE FROM grades WHERE student_id = ?").run(id);
      db.prepare("DELETE FROM payments WHERE student_id = ?").run(id);
      db.prepare("DELETE FROM attendance WHERE student_id = ?").run(id);
      db.prepare("DELETE FROM users WHERE role = 'student' AND profile_id = ?").run(id);
      db.prepare("DELETE FROM students WHERE id = ?").run(id);
    })();
    res.json({ success: true });
  });

  app.delete("/api/teachers/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const id = req.params.id;
    db.transaction(() => {
      db.prepare("DELETE FROM teacher_subjects WHERE teacher_id = ?").run(id);
      db.prepare("DELETE FROM grades WHERE teacher_id = ?").run(id);
      db.prepare("DELETE FROM users WHERE role = 'teacher' AND profile_id = ?").run(id);
      db.prepare("DELETE FROM teachers WHERE id = ?").run(id);
    })();
    res.json({ success: true });
  });

  app.delete("/api/classes/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const id = req.params.id;
    db.transaction(() => {
      db.prepare("DELETE FROM class_students WHERE class_id = ?").run(id);
      db.prepare("DELETE FROM grades WHERE class_id = ?").run(id);
      db.prepare("DELETE FROM attendance WHERE class_id = ?").run(id);
      db.prepare("DELETE FROM classes WHERE id = ?").run(id);
    })();
    res.json({ success: true });
  });

  // Class Students Management
  app.get("/api/classes/:id/students", authenticateToken, (req, res) => {
    const students = db.prepare(`
      SELECT s.* 
      FROM students s
      JOIN class_students cs ON s.id = cs.student_id
      WHERE cs.class_id = ?
    `).all(req.params.id);
    res.json(students);
  });

  app.post("/api/classes/:id/students", authenticateToken, (req, res) => {
    const { student_id } = req.body;
    try {
      db.prepare("INSERT INTO class_students (class_id, student_id) VALUES (?, ?)").run(req.params.id, student_id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/classes/:id/students/:studentId", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM class_students WHERE class_id = ? AND student_id = ?").run(req.params.id, req.params.studentId);
    res.json({ success: true });
  });

  // Teacher-Class Assignment
  app.get("/api/classes/:id/teachers", authenticateToken, (req, res) => {
    const assignments = db.prepare(`
      SELECT ct.id, ct.teacher_id, t.name as teacher_name, t.degree,
             s.id as subject_id, s.name as subject_name
      FROM class_teachers ct
      JOIN teachers t ON ct.teacher_id = t.id
      JOIN subjects s ON ct.subject_id = s.id
      WHERE ct.class_id = ?
      ORDER BY t.name ASC
    `).all(req.params.id);
    res.json(assignments);
  });

  app.post("/api/classes/:id/teachers", authenticateToken, (req, res) => {
    const { teacher_id, subject_id } = req.body;
    try {
      const info = db.prepare("INSERT INTO class_teachers (class_id, teacher_id, subject_id) VALUES (?, ?, ?)").run(req.params.id, teacher_id, subject_id);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/classes/:id/teachers/:assignmentId", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM class_teachers WHERE id = ? AND class_id = ?").run(req.params.assignmentId, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/payments/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM payments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Attendance Routes
  app.get("/api/attendance", authenticateToken, (req: any, res) => {
    const { class_id, date } = req.query;
    if (class_id && date) {
      const records = db.prepare(`
        SELECT a.*, s.name as student_name, s.registration_no
        FROM attendance a
        JOIN students s ON s.id = a.student_id
        WHERE a.class_id = ? AND a.date = ?
        ORDER BY s.name
      `).all(class_id, date);
      return res.json(records);
    }
    if (class_id) {
      const records = db.prepare(`
        SELECT a.*, s.name as student_name, s.registration_no
        FROM attendance a
        JOIN students s ON s.id = a.student_id
        WHERE a.class_id = ?
        ORDER BY a.date DESC, s.name
      `).all(class_id);
      return res.json(records);
    }
    res.json([]);
  });

  app.post("/api/attendance/bulk", authenticateToken, (req: any, res) => {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'No records provided' });
    }
    try {
      const deleteStmt = db.prepare("DELETE FROM attendance WHERE class_id = ? AND date = ?");
      const insertStmt = db.prepare("INSERT INTO attendance (student_id, class_id, date, status) VALUES (?, ?, ?, ?)");
      const saveAll = db.transaction((recs: any[]) => {
        deleteStmt.run(recs[0].class_id, recs[0].date);
        for (const r of recs) {
          insertStmt.run(r.student_id, r.class_id, r.date, r.status);
        }
      });
      saveAll(records);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/attendance/summary", authenticateToken, (req: any, res) => {
    const { class_id, month, year } = req.query;
    if (!class_id || !month || !year) return res.status(400).json({ error: 'Missing params' });
    const pattern = `${year}-${String(month).padStart(2, '0')}%`;
    const summary = db.prepare(`
      SELECT 
        s.id, s.name, s.registration_no,
        COUNT(CASE WHEN a.status = 'Presente' THEN 1 END) as presencas,
        COUNT(CASE WHEN a.status = 'Falta' THEN 1 END) as faltas,
        COUNT(CASE WHEN a.status = 'Justificada' THEN 1 END) as justificadas,
        COUNT(a.id) as total_dias
      FROM students s
      JOIN class_students cs ON s.id = cs.student_id
      LEFT JOIN attendance a ON s.id = a.student_id AND a.class_id = ? AND a.date LIKE ?
      WHERE cs.class_id = ?
      GROUP BY s.id, s.name, s.registration_no
      ORDER BY s.name
    `).all(class_id, pattern, class_id);
    res.json(summary);
  });

  app.get("/api/attendance/dates", authenticateToken, (req: any, res) => {
    const { class_id, month, year } = req.query;
    if (!class_id || !month || !year) return res.status(400).json({ error: 'Missing params' });
    const pattern = `${year}-${String(month).padStart(2, '0')}%`;
    const dates = db.prepare(`
      SELECT DISTINCT date FROM attendance WHERE class_id = ? AND date LIKE ? ORDER BY date
    `).all(class_id, pattern);
    res.json(dates.map((d: any) => d.date));
  });

  // Expenses
  app.get("/api/expenses", authenticateToken, (req, res) => {
    const expenses = db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
    res.json(expenses);
  });

  app.post("/api/expenses", authenticateToken, (req, res) => {
    const { description, amount, date, category } = req.body;
    try {
      const info = db.prepare("INSERT INTO expenses (description, amount, date, category) VALUES (?, ?, ?, ?)").run(description, amount, date, category);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/expenses/:id", authenticateToken, (req, res) => {
    const { description, amount, date, category } = req.body;
    try {
      db.prepare("UPDATE expenses SET description = ?, amount = ?, date = ?, category = ? WHERE id = ?").run(description, amount, date, category, req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/expenses/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Staff Routes
  app.get("/api/staff", authenticateToken, (req, res) => {
    const staff = db.prepare("SELECT * FROM staff").all();
    res.json(staff);
  });

  app.post("/api/staff", authenticateToken, (req, res) => {
    const { name, bi, role, contact, photo } = req.body;
    try {
      const info = db.prepare("INSERT INTO staff (name, bi, role, contact, photo) VALUES (?, ?, ?, ?, ?)").run(name, bi, role, contact, photo);
      // If secretary, create user account
      if (role.toLowerCase().includes('secret')) {
        const hashedPassword = bcrypt.hashSync(bi, 10);
        db.prepare("INSERT INTO users (username, password, role, profile_id) VALUES (?, ?, ?, ?)").run(bi, hashedPassword, 'admin', info.lastInsertRowid);
      }
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/staff/:id", authenticateToken, (req, res) => {
    const { name, bi, role, contact, photo } = req.body;
    try {
      const oldStaff = db.prepare("SELECT bi, role FROM staff WHERE id = ?").get(req.params.id) as any;
      db.prepare("UPDATE staff SET name = ?, bi = ?, role = ?, contact = ?, photo = ? WHERE id = ?").run(name, bi, role, contact, photo, req.params.id);
      
      // Update user account if it exists (for secretaries)
      if (oldStaff && oldStaff.role.toLowerCase().includes('secret')) {
        db.prepare("UPDATE users SET username = ? WHERE username = ? AND role = 'admin'").run(bi, oldStaff.bi);
      } else if (role.toLowerCase().includes('secret')) {
        // If it wasn't a secretary before but now it is, create account
        const userExists = db.prepare("SELECT * FROM users WHERE username = ?").get(bi);
        if (!userExists) {
          const hashedPassword = bcrypt.hashSync(bi, 10);
          db.prepare("INSERT INTO users (username, password, role, profile_id) VALUES (?, ?, ?, ?)").run(bi, hashedPassword, 'admin', req.params.id);
        }
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/staff/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM staff WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM users WHERE profile_id = ? AND role != 'student' AND role != 'teacher'").run(req.params.id);
    res.json({ success: true });
  });

  // Global Search
  app.get("/api/search", authenticateToken, (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.json({ students: [], teachers: [], staff: [] });

    const searchTerm = `%${query}%`;
    
    const students = db.prepare("SELECT id, name, bi, registration_no, 'student' as type FROM students WHERE name LIKE ? OR bi LIKE ? OR registration_no LIKE ? LIMIT 5").all(searchTerm, searchTerm, searchTerm);
    const teachers = db.prepare("SELECT id, name, bi, 'teacher' as type FROM teachers WHERE name LIKE ? OR bi LIKE ? LIMIT 5").all(searchTerm, searchTerm);
    const staff = db.prepare("SELECT id, name, bi, role, 'staff' as type FROM staff WHERE name LIKE ? OR bi LIKE ? LIMIT 5").all(searchTerm, searchTerm);

    res.json({ students, teachers, staff });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 5000;
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
