import { App, SchoolApp } from "../models/index.js";

// Get all apps
export const getAllApps = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: apps } = await App.findAndCountAll({
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: apps,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get app by ID
export const getAppById = async (req, res) => {
  try {
    const app = await App.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "App not found" });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create app
export const createApp = async (req, res) => {
  try {
    const { code, name, description, base_url } = req.body;
    const app = await App.create({
      code,
      name,
      description,
      base_url,
    });
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update app
export const updateApp = async (req, res) => {
  try {
    const { code, name, description, base_url } = req.body;
    const app = await App.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "App not found" });
    }
    await app.update({
      code,
      name,
      description,
      base_url,
      updated_at: new Date(),
    });
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete app
export const deleteApp = async (req, res) => {
  try {
    const app = await App.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ message: "App not found" });
    }
    await app.destroy();
    res.json({ message: "App deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
