import { sequelize } from '../../config/database.js';

/**
 * Point Recap Controller
 * Handle rekapitulasi poin pelanggaran dan reward siswa
 */

/**
 * Get student point recap with filters
 */
export const getStudentPointRecap = async (req, res) => {
  try {
    const {
      academic_year_id,
      grade_id,
      class_id,
      student_id,
      sort_by = 'net_points',
      sort_order = 'DESC',
      page = 1,
      limit = 50
    } = req.query;

    if (!academic_year_id) {
      return res.status(400).json({
        success: false,
        message: 'Tahun ajaran wajib diisi'
      });
    }

    const offset = (page - 1) * limit;
    
    let whereConditions = ['s.school_id = ?'];
    const params = [req.user.school_id];
    
    whereConditions.push('s.academic_year_id = ?');
    params.push(academic_year_id);
    
    if (grade_id) {
      whereConditions.push('s.grade_id = ?');
      params.push(grade_id);
    }
    
    if (class_id) {
      whereConditions.push('s.class_id = ?');
      params.push(class_id);
    }
    
    if (student_id) {
      whereConditions.push('s.id = ?');
      params.push(student_id);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    let query = `
      SELECT 
        s.id as student_id,
        s.nis,
        s.nisn,
        s.name as student_name,
        s.gender,
        s.photo,
        c.name as class_name,
        g.name as grade_name,
        d.name as department_name,
        ay.name as academic_year_name,
        COALESCE(v.total_violations, 0) as total_violations,
        COALESCE(v.total_violation_points, 0) as total_violation_points,
        COALESCE(r.total_rewards, 0) as total_rewards,
        COALESCE(r.total_reward_points, 0) as total_reward_points,
        (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) as net_points,
        CASE 
          WHEN (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) > 0 THEN 'POSITIVE'
          WHEN (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) < 0 THEN 'NEGATIVE'
          ELSE 'NEUTRAL'
        END as point_category
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN grades g ON s.grade_id = g.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      LEFT JOIN (
        SELECT 
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT 
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE ${whereClause}
    `;
    
    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM students s WHERE ${whereClause}`;
    const countResult = await sequelize.query(countQuery, { 
      replacements: params, 
      type: sequelize.QueryTypes.SELECT 
    });
    const total = countResult[0].total;
    
    // Add sorting and pagination
    query += ` ORDER BY ${sort_by} ${sort_order} LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    
    const rows = await sequelize.query(query, { 
      replacements: params, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching student point recap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data rekapitulasi siswa',
      error: error.message 
    });
  }
};

/**
 * Get single student point detail
 */
export const getStudentPointDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { academic_year_id } = req.query;

    if (!academic_year_id) {
      return res.status(400).json({
        success: false,
        message: 'Tahun ajaran wajib diisi'
      });
    }
    
      
    // Get student recap
    const recapQuery = `
      SELECT 
        s.id as student_id,
        s.nis,
        s.nisn,
        s.name as student_name,
        s.gender,
        s.photo,
        c.name as class_name,
        g.name as grade_name,
        d.name as department_name,
        ay.name as academic_year_name,
        COALESCE(v.total_violations, 0) as total_violations,
        COALESCE(v.total_violation_points, 0) as total_violation_points,
        COALESCE(r.total_rewards, 0) as total_rewards,
        COALESCE(r.total_reward_points, 0) as total_reward_points,
        (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) as net_points
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN grades g ON s.grade_id = g.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      LEFT JOIN (
        SELECT 
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT 
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE s.id = ? AND s.school_id = ? AND s.academic_year_id = ?
    `;
    
    const recapRows = await sequelize.query(recapQuery, { 
      replacements: [id, req.user.school_id, academic_year_id], 
      type: sequelize.QueryTypes.SELECT 
    });
    
    if (recapRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data siswa tidak ditemukan'
      });
    }
    
    const recap = recapRows[0];
    
    // Get violation details
    const violationQuery = `
      SELECT 
        sv.id,
        sv.date,
        sv.location,
        sv.description,
        sv.status,
        vt.name as type_name,
        vt.point,
        vl.name as level_name,
        va.action_name
      FROM student_violations sv
      INNER JOIN violation_types vt ON sv.type_id = vt.id
      INNER JOIN violation_levels vl ON vt.level_id = vl.id
      LEFT JOIN violation_actions va ON sv.action_id = va.id
      INNER JOIN students s ON sv.student_id = s.id
      WHERE sv.student_id = ?
        AND sv.status IN ('APPROVED', 'ACTIONED')
        AND s.academic_year_id = ?
      ORDER BY sv.date DESC
    `;
    
    const violationParams = [id, academic_year_id];
    
    const violations = await sequelize.query(violationQuery, { 
      replacements: violationParams, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    // Get reward details
    const rewardQuery = `
      SELECT 
        sr.id,
        sr.date,
        sr.location,
        sr.description,
        sr.status,
        rt.name as type_name,
        rt.point,
        rl.name as level_name,
        ra.action_name
      FROM student_rewards sr
      INNER JOIN reward_types rt ON sr.type_id = rt.id
      INNER JOIN reward_levels rl ON rt.level_id = rl.id
      LEFT JOIN reward_actions ra ON sr.action_id = ra.id
      INNER JOIN students s ON sr.student_id = s.id
      WHERE sr.student_id = ?
        AND sr.status IN ('APPROVED', 'ACTIONED')
        AND s.academic_year_id = ?
      ORDER BY sr.date DESC
    `;
    
    const rewardParams = [id, academic_year_id];
    
    const rewards = await sequelize.query(rewardQuery, { 
      replacements: rewardParams, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    res.json({
      success: true,
      data: {
        recap,
        violations,
        rewards
      }
    });
  } catch (error) {
    console.error('Error fetching student point detail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil detail poin siswa',
      error: error.message 
    });
  }
};

/**
 * Get class point recap
 */
export const getClassPointRecap = async (req, res) => {
  try {
    const { academic_year_id, grade_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['c.school_id = ?'];
    const params = [req.user.school_id];

    if (academic_year_id) {
      whereConditions.push('c.academic_year_id = ?');
      params.push(academic_year_id);
    }

    if (grade_id) {
      whereConditions.push('c.grade_id = ?');
      params.push(grade_id);
    }

    const whereClause = whereConditions.join(' AND ');

    // Main query with real-time calculation
    let query = `
      SELECT
        c.id as class_id,
        c.name as class_name,
        g.name as grade_name,
        d.name as department_name,
        ay.name as academic_year_name,
        COUNT(DISTINCT s.id) as total_students,
        COALESCE(SUM(v.total_violations), 0) as total_violations,
        COALESCE(SUM(v.total_violation_points), 0) as total_violation_points,
        COALESCE(SUM(r.total_rewards), 0) as total_rewards,
        COALESCE(SUM(r.total_reward_points), 0) as total_reward_points,
        COALESCE(SUM(r.total_reward_points) - SUM(v.total_violation_points), 0) as total_net_points,
        COALESCE(AVG(r.total_reward_points - v.total_violation_points), 0) as avg_net_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) > 0 THEN 1 ELSE 0 END) as students_with_positive_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) < 0 THEN 1 ELSE 0 END) as students_with_negative_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) = 0 THEN 1 ELSE 0 END) as students_with_zero_points
      FROM classes c
      LEFT JOIN grades g ON c.grade_id = g.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
      LEFT JOIN students s ON c.id = s.class_id
      LEFT JOIN (
        SELECT
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE ${whereClause}
      GROUP BY c.id, c.name, g.name, d.name, ay.name
      HAVING total_students > 0
    `;

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT c.id
        FROM classes c
        LEFT JOIN students s ON c.id = s.class_id
        WHERE ${whereClause}
        GROUP BY c.id
        HAVING COUNT(DISTINCT s.id) > 0
      ) as counted
    `;
    const countResult = await sequelize.query(countQuery, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });
    const total = countResult[0].total;

    // Add sorting and pagination
    query += ` ORDER BY avg_net_points DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const rows = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching class point recap:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rekapitulasi kelas',
      error: error.message
    });
  }
};

/**
 * Get grade point recap
 */
export const getGradePointRecap = async (req, res) => {
  try {
    const { academic_year_id } = req.query;

    let whereConditions = ['g.school_id = ?'];
    const params = [req.user.school_id];

    if (academic_year_id) {
      whereConditions.push('g.academic_year_id = ?');
      params.push(academic_year_id);
    }

    const whereClause = whereConditions.join(' AND ');

    // Main query with real-time calculation
    const query = `
      SELECT
        g.id as grade_id,
        g.name as grade_name,
        g.level,
        ay.name as academic_year_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT c.id) as total_classes,
        COALESCE(SUM(v.total_violations), 0) as total_violations,
        COALESCE(SUM(v.total_violation_points), 0) as total_violation_points,
        COALESCE(SUM(r.total_rewards), 0) as total_rewards,
        COALESCE(SUM(r.total_reward_points), 0) as total_reward_points,
        COALESCE(SUM(r.total_reward_points - v.total_violation_points), 0) as total_net_points,
        COALESCE(AVG(r.total_reward_points - v.total_violation_points), 0) as avg_net_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) > 0 THEN 1 ELSE 0 END) as students_with_positive_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) < 0 THEN 1 ELSE 0 END) as students_with_negative_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) = 0 THEN 1 ELSE 0 END) as students_with_zero_points
      FROM grades g
      LEFT JOIN academic_years ay ON g.academic_year_id = ay.id
      LEFT JOIN classes c ON g.id = c.grade_id
      LEFT JOIN students s ON c.id = s.class_id
      LEFT JOIN (
        SELECT
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE ${whereClause}
      GROUP BY g.id, g.name, g.level, ay.name
      HAVING total_students > 0
      ORDER BY g.level ASC
    `;

    const rows = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching grade point recap:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rekapitulasi tingkat',
      error: error.message
    });
  }
};

/**
 * Get real-time class point summary
 */
export const getClassPointSummary = async (req, res) => {
  try {
    const { academic_year_id, grade_id, class_id } = req.query;

    if (!academic_year_id) {
      return res.status(400).json({
        success: false,
        message: 'Tahun ajaran wajib diisi'
      });
    }

    const school_id = req.user.school_id;

    let whereConditions = ['c.school_id = ?'];
    const params = [school_id];

    whereConditions.push('c.academic_year_id = ?');
    params.push(academic_year_id);

    if (grade_id) {
      whereConditions.push('c.grade_id = ?');
      params.push(grade_id);
    }

    if (class_id) {
      whereConditions.push('c.id = ?');
      params.push(class_id);
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT
        c.id as class_id,
        c.name as class_name,
        g.name as grade_name,
        d.name as department_name,
        COUNT(DISTINCT s.id) as total_students,
        COALESCE(SUM(v.total_violations), 0) as total_violations,
        COALESCE(SUM(v.total_violation_points), 0) as total_violation_points,
        COALESCE(SUM(r.total_rewards), 0) as total_rewards,
        COALESCE(SUM(r.total_reward_points), 0) as total_reward_points,
        COALESCE(SUM(r.total_reward_points - v.total_violation_points), 0) as total_net_points,
        COALESCE(AVG(r.total_reward_points - v.total_violation_points), 0) as avg_net_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) > 0 THEN 1 ELSE 0 END) as students_with_positive_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) < 0 THEN 1 ELSE 0 END) as students_with_negative_points,
        SUM(CASE WHEN (r.total_reward_points - v.total_violation_points) = 0 THEN 1 ELSE 0 END) as students_with_zero_points
      FROM classes c
      LEFT JOIN grades g ON c.grade_id = g.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN students s ON c.id = s.class_id
      LEFT JOIN (
        SELECT
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
        GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
        GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE ${whereClause}
      GROUP BY c.id, c.name, g.name, d.name
      HAVING total_students > 0
      ORDER BY avg_net_points DESC
    `;

    const rows = await sequelize.query(query, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching class point summary:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data ringkasan poin kelas',
      error: error.message
    });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { academic_year_id } = req.query;
    const school_id = req.user.school_id;

    if (!academic_year_id) {
      return res.status(400).json({
        success: false,
        message: 'Tahun ajaran wajib diisi'
      });
    }
    
      
    // Overall statistics with real-time calculation
    const overallStats = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        COALESCE(SUM(v.total_violations), 0) as total_violations,
        COALESCE(SUM(v.total_violation_points), 0) as total_violation_points,
        COALESCE(SUM(r.total_rewards), 0) as total_rewards,
        COALESCE(SUM(r.total_reward_points), 0) as total_reward_points,
        COALESCE(SUM(r.total_reward_points - v.total_violation_points), 0) as total_net_points,
        COALESCE(AVG(r.total_reward_points - v.total_violation_points), 0) as avg_net_points,
        SUM(CASE WHEN (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) > 0 THEN 1 ELSE 0 END) as students_with_positive,
        SUM(CASE WHEN (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) < 0 THEN 1 ELSE 0 END) as students_with_negative,
        SUM(CASE WHEN (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) = 0 THEN 1 ELSE 0 END) as students_with_zero
      FROM students s
      LEFT JOIN (
        SELECT 
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT 
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE s.school_id = ? AND s.academic_year_id = ?
    `, { 
      replacements: [school_id, academic_year_id],
      type: sequelize.QueryTypes.SELECT 
    });
    
    // Top 10 best students
    const topStudents = await sequelize.query(`
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.nis,
        c.name as class_name,
        (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) as net_points,
        COALESCE(r.total_rewards, 0) as total_rewards,
        COALESCE(v.total_violations, 0) as total_violations
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN (
        SELECT 
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT 
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE s.school_id = ? AND s.academic_year_id = ?
      ORDER BY net_points DESC
      LIMIT 10
    `, { 
      replacements: [school_id, academic_year_id],
      type: sequelize.QueryTypes.SELECT 
    });
    
    // Bottom 10 students (need attention)
    const bottomStudents = await sequelize.query(`
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.nis,
        c.name as class_name,
        (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) as net_points,
        COALESCE(v.total_violations, 0) as total_violations,
        COALESCE(r.total_rewards, 0) as total_rewards
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN (
        SELECT 
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT 
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE s.school_id = ? AND s.academic_year_id = ?
      ORDER BY net_points ASC
      LIMIT 10
    `, { 
      replacements: [school_id, academic_year_id],
      type: sequelize.QueryTypes.SELECT 
    });
    
    // Class ranking
    const classRanking = await sequelize.query(`
      SELECT 
        c.id as class_id,
        c.name as class_name,
        g.name as grade_name,
        COUNT(DISTINCT s.id) as total_students,
        AVG(COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) as avg_net_points,
        SUM(COALESCE(v.total_violations, 0)) as total_violations,
        SUM(COALESCE(r.total_rewards, 0)) as total_rewards
      FROM classes c
      LEFT JOIN grades g ON c.grade_id = g.id
      LEFT JOIN students s ON c.id = s.class_id AND s.school_id = ? AND s.academic_year_id = ?
      LEFT JOIN (
        SELECT 
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT 
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE c.school_id = ?
      GROUP BY c.id, c.name, g.name
      HAVING total_students > 0
      ORDER BY avg_net_points DESC
    `, { 
      replacements: [school_id, academic_year_id, school_id],
      type: sequelize.QueryTypes.SELECT 
    });
    
    res.json({
      success: true,
      data: {
        overall: overallStats[0] || {},
        topStudents: topStudents || [],
        bottomStudents: bottomStudents || [],
        classRanking: classRanking || []
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengambil data dashboard',
      error: error.message 
    });
  }
};

/**
 * Export point recap to Excel
 */
export const exportPointRecap = async (req, res) => {
  try {
    const { academic_year_id, grade_id, class_id } = req.query;

    if (!academic_year_id) {
      return res.status(400).json({
        success: false,
        message: 'Tahun ajaran wajib diisi'
      });
    }
    
      
    let whereConditions = ['s.school_id = ?', 's.academic_year_id = ?'];
    const params = [req.user.school_id, academic_year_id];
    
    if (grade_id) {
      whereConditions.push('s.grade_id = ?');
      params.push(grade_id);
    }
    
    if (class_id) {
      whereConditions.push('s.class_id = ?');
      params.push(class_id);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const query = `
      SELECT 
        s.nis,
        s.nisn,
        s.name as student_name,
        s.gender,
        c.name as class_name,
        g.name as grade_name,
        d.name as department_name,
        ay.name as academic_year_name,
        COALESCE(v.total_violations, 0) as total_violations,
        COALESCE(v.total_violation_points, 0) as total_violation_points,
        COALESCE(r.total_rewards, 0) as total_rewards,
        COALESCE(r.total_reward_points, 0) as total_reward_points,
        (COALESCE(r.total_reward_points, 0) - COALESCE(v.total_violation_points, 0)) as net_points
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN grades g ON s.grade_id = g.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
      LEFT JOIN (
        SELECT 
          sv.student_id,
          COUNT(*) as total_violations,
          SUM(vt.point) as total_violation_points
        FROM student_violations sv
        INNER JOIN violation_types vt ON sv.type_id = vt.id
        WHERE sv.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sv.student_id
      ) v ON s.id = v.student_id
      LEFT JOIN (
        SELECT 
          sr.student_id,
          COUNT(*) as total_rewards,
          SUM(rt.point) as total_reward_points
        FROM student_rewards sr
        INNER JOIN reward_types rt ON sr.type_id = rt.id
        WHERE sr.status IN ('APPROVED', 'ACTIONED')
                  GROUP BY sr.student_id
      ) r ON s.id = r.student_id
      WHERE ${whereClause}
      ORDER BY net_points DESC
    `;
    
    const rows = await sequelize.query(query, { 
      replacements: params, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    res.json({
      success: true,
      data: rows,
      message: 'Data siap untuk diekspor'
    });
  } catch (error) {
    console.error('Error exporting point recap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengekspor data',
      error: error.message 
    });
  }
};
