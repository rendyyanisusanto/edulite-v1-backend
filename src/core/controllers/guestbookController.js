import { Guestbook, School, User } from "../models/index.js";
import { Op } from "sequelize";

// Get all guestbooks with pagination and filters
export const getAllGuestbooks = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      guest_type, 
      date_from, 
      date_to,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { school_id };

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by guest_type
    if (guest_type) {
      whereClause.guest_type = guest_type;
    }

    // Filter by date range
    if (date_from && date_to) {
      whereClause.visit_date = {
        [Op.between]: [date_from, date_to]
      };
    } else if (date_from) {
      whereClause.visit_date = {
        [Op.gte]: date_from
      };
    } else if (date_to) {
      whereClause.visit_date = {
        [Op.lte]: date_to
      };
    }

    // Search by guest name, phone, or related_person
    if (search) {
      whereClause[Op.or] = [
        { guest_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { related_person: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: guestbooks } = await Guestbook.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["visit_date", "DESC"], ["checkin_time", "DESC"]],
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      data: guestbooks,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllGuestbooks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get guestbook by ID
export const getGuestbookById = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const guestbook = await Guestbook.findOne({
      where: { id, school_id },
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!guestbook) {
      return res.status(404).json({ error: "Guestbook entry not found" });
    }

    res.status(200).json({ data: guestbook });
  } catch (error) {
    console.error("Error in getGuestbookById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create new guestbook entry (check-in)
export const createGuestbook = async (req, res) => {
  try {
    const { school_id, id: user_id } = req.user;
    const {
      guest_name,
      guest_type,
      phone,
      address,
      purpose,
      related_person,
      visit_date,
      note,
    } = req.body;

    // Validation
    if (!guest_name || !guest_type || !visit_date) {
      return res.status(400).json({
        error: "guest_name, guest_type, and visit_date are required",
      });
    }

    // Set checkin_time to current time
    const checkin_time = new Date();

    const guestbook = await Guestbook.create({
      school_id,
      guest_name,
      guest_type,
      phone,
      address,
      purpose,
      related_person,
      visit_date,
      checkin_time,
      status: "IN",
      note,
      created_by: user_id,
      updated_by: user_id,
    });

    res.status(201).json({
      message: "Guest checked in successfully",
      data: guestbook,
    });
  } catch (error) {
    console.error("Error in createGuestbook:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update guestbook entry
export const updateGuestbook = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const {
      guest_name,
      guest_type,
      phone,
      address,
      purpose,
      related_person,
      visit_date,
      note,
    } = req.body;

    const guestbook = await Guestbook.findOne({
      where: { id, school_id },
    });

    if (!guestbook) {
      return res.status(404).json({ error: "Guestbook entry not found" });
    }

    // Don't allow updating if already checked out
    if (guestbook.status === "OUT") {
      return res.status(400).json({
        error: "Cannot update a checked out entry",
      });
    }

    await guestbook.update({
      guest_name: guest_name || guestbook.guest_name,
      guest_type: guest_type || guestbook.guest_type,
      phone: phone !== undefined ? phone : guestbook.phone,
      address: address !== undefined ? address : guestbook.address,
      purpose: purpose !== undefined ? purpose : guestbook.purpose,
      related_person: related_person !== undefined ? related_person : guestbook.related_person,
      visit_date: visit_date || guestbook.visit_date,
      note: note !== undefined ? note : guestbook.note,
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Guestbook entry updated successfully",
      data: guestbook,
    });
  } catch (error) {
    console.error("Error in updateGuestbook:", error);
    res.status(500).json({ error: error.message });
  }
};

// Check-out guest
export const checkoutGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const { note } = req.body;

    const guestbook = await Guestbook.findOne({
      where: { id, school_id },
    });

    if (!guestbook) {
      return res.status(404).json({ error: "Guestbook entry not found" });
    }

    if (guestbook.status === "OUT") {
      return res.status(400).json({ error: "Guest already checked out" });
    }

    const checkout_time = new Date();

    await guestbook.update({
      checkout_time,
      status: "OUT",
      note: note || guestbook.note,
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Guest checked out successfully",
      data: guestbook,
    });
  } catch (error) {
    console.error("Error in checkoutGuest:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete guestbook entry
export const deleteGuestbook = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const guestbook = await Guestbook.findOne({
      where: { id, school_id },
    });

    if (!guestbook) {
      return res.status(404).json({ error: "Guestbook entry not found" });
    }

    await guestbook.destroy();

    res.status(200).json({ message: "Guestbook entry deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGuestbook:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get guestbook statistics
export const getGuestbookStatistics = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { year, month } = req.query;

    // Build where clause
    const whereClause = { school_id };

    // Filter by year and/or month
    if (year) {
      if (month) {
        // Specific month and year
        const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of month
        
        whereClause.visit_date = {
          [Op.between]: [startDate, endDate]
        };
      } else {
        // Whole year
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        
        whereClause.visit_date = {
          [Op.between]: [startDate, endDate]
        };
      }
    }

    // Get all guestbooks
    const guestbooks = await Guestbook.findAll({
      where: whereClause,
      order: [["visit_date", "DESC"]],
    });

    // Calculate statistics
    const stats = {
      total: guestbooks.length,
      checkedIn: 0,
      checkedOut: 0,
      byGuestType: {},
      byMonth: {},
      byDay: {},
      averageVisitDuration: 0,
      topVisitPurposes: {},
      topRelatedPersons: {},
    };

    let totalDuration = 0;
    let completedVisits = 0;

    // Initialize guest types
    const guestTypes = ['ORTU', 'ALUMNI', 'VENDOR', 'INSTANSI', 'TAMU', 'LAINNYA'];
    guestTypes.forEach(type => stats.byGuestType[type] = 0);

    // Process guestbooks
    guestbooks.forEach(gb => {
      // Count by status
      if (gb.status === "IN") {
        stats.checkedIn++;
      } else {
        stats.checkedOut++;
      }

      // Count by guest type
      stats.byGuestType[gb.guest_type] = (stats.byGuestType[gb.guest_type] || 0) + 1;

      // Count by month
      const date = new Date(gb.visit_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;

      // Count by day of week
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = dayNames[date.getDay()];
      stats.byDay[dayName] = (stats.byDay[dayName] || 0) + 1;

      // Calculate visit duration
      if (gb.checkout_time && gb.checkin_time) {
        const duration = (new Date(gb.checkout_time) - new Date(gb.checkin_time)) / (1000 * 60); // in minutes
        totalDuration += duration;
        completedVisits++;
      }

      // Top visit purposes
      if (gb.purpose) {
        stats.topVisitPurposes[gb.purpose] = (stats.topVisitPurposes[gb.purpose] || 0) + 1;
      }

      // Top related persons
      if (gb.related_person) {
        stats.topRelatedPersons[gb.related_person] = (stats.topRelatedPersons[gb.related_person] || 0) + 1;
      }
    });

    // Calculate average duration
    if (completedVisits > 0) {
      stats.averageVisitDuration = Math.round(totalDuration / completedVisits);
    }

    // Sort and limit top purposes
    stats.topVisitPurposes = Object.entries(stats.topVisitPurposes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    // Sort and limit top related persons
    stats.topRelatedPersons = Object.entries(stats.topRelatedPersons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    // Sort months
    const sortedMonths = {};
    Object.keys(stats.byMonth).sort().forEach(key => {
      sortedMonths[key] = stats.byMonth[key];
    });
    stats.byMonth = sortedMonths;

    res.status(200).json({ data: stats });
  } catch (error) {
    console.error("Error in getGuestbookStatistics:", error);
    res.status(500).json({ error: error.message });
  }
};
