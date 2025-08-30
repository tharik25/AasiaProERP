// Entry point for Express backend
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/steel_fab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


// Project schema and model (with PO details)
const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: String,
  po: {
    poNumber: String,
    poDate: Date,
    poAmount: Number,
  }
});

const Project = mongoose.model('Project', projectSchema);

// API routes

// Get all projects (with PO details)
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});


// Add new project
app.post('/api/projects', async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.status(201).json(project);
});

// Add or update PO details for a project
app.post('/api/projects/:id/po', async (req, res) => {
  const { id } = req.params;
  const { poNumber, poDate, poAmount } = req.body;
  const project = await Project.findById(id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  project.po = { poNumber, poDate, poAmount };
  await project.save();
  res.json(project);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
