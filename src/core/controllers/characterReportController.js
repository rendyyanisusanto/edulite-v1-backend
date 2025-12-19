import { Student, StudentViolation, StudentReward, CounselingCase, CounselingSession, ClassRoom, RewardType, ViolationType, ViolationLevel, Department } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Character Report Controller
 * Handle student character report data aggregation
 */

/**
 * Get complete character report for a student
 */
export const getStudentCharacterReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academic_year } = req.query;

        // Build date filter for academic year
        let dateFilter = {};
        if (academic_year) {
            // Assuming academic year format: "2024/2025"
            const startYear = parseInt(academic_year.split('/')[0]);
            dateFilter = {
                [Op.gte]: new Date(`${startYear}-07-01`), // Start of academic year (July)
                [Op.lt]: new Date(`${startYear + 1}-07-01`) // End of academic year
            };
        }

        // Get student data with class info
        const student = await Student.findOne({
            where: { id: studentId },
            include: [
                {
                    model: ClassRoom,
                    as: 'class',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Department,
                            as: 'department',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            attributes: ['id', 'nis', 'nisn', 'name', 'photo']
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Siswa tidak ditemukan'
            });
        }

        // Get violations
        const violationsWhere = { student_id: studentId };
        if (academic_year) {
            violationsWhere.date = dateFilter;
        }

        const violations = await StudentViolation.findAll({
            where: violationsWhere,
            include: [
                {
                    model: ViolationType,
                    as: 'type',
                    attributes: ['name', 'point'],
                    include: [
                        {
                            model: ViolationLevel,
                            as: 'level',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            attributes: ['id', 'date', 'description'],
            order: [['date', 'DESC']]
        });

        // Get rewards
        const rewardsWhere = { student_id: studentId };
        if (academic_year) {
            rewardsWhere.date = dateFilter;
        }

        const rewards = await StudentReward.findAll({
            where: rewardsWhere,
            include: [
                {
                    model: RewardType,
                    as: 'rewardType',
                    attributes: ['name', 'point']
                }
            ],
            attributes: ['id', 'date', 'description'],
            order: [['date', 'DESC']]
        });

        // Get counseling cases
        const casesWhere = { student_id: studentId };
        if (academic_year) {
            casesWhere.created_at = dateFilter;
        }

        const counselingCases = await CounselingCase.findAll({
            where: casesWhere,
            attributes: ['id', 'issue_title', 'category', 'level', 'status', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        // Calculate summary
        const totalViolations = violations.length;
        const totalViolationPoints = violations.reduce((sum, v) => sum + (v.type?.point || 0), 0);
        const totalRewards = rewards.length;
        const totalRewardPoints = rewards.reduce((sum, r) => sum + (r.rewardType?.point || 0), 0);
        const totalCounselingCases = counselingCases.length;
        const activeCases = counselingCases.filter(c => ['OPEN', 'IN_PROGRESS'].includes(c.status)).length;

        // Generate character conclusion
        const characterConclusion = generateCharacterConclusion({
            total_violations: totalViolations,
            total_violation_points: totalViolationPoints,
            total_rewards: totalRewards,
            total_reward_points: totalRewardPoints,
            total_counseling_cases: totalCounselingCases,
            active_cases: activeCases
        });

        // Format violations data
        const violationsData = violations.map(v => ({
            date: v.date,
            type: v.type?.name || '-',
            level: v.type?.level?.name || '-',
            points: v.type?.point || 0,
            action: v.description || '-'
        }));

        // Format rewards data
        const rewardsData = rewards.map(r => ({
            date: r.date,
            type: r.rewardType?.name || '-',
            points: r.rewardType?.point || 0,
            description: r.description || '-'
        }));

        // Format counseling data
        const counselingData = counselingCases.map(c => ({
            date: c.created_at,
            title: c.issue_title,
            category: c.category,
            level: c.level,
            status: c.status
        }));

        // Combine actions history from violations and counseling
        const actionsHistory = [
            ...violations.map(v => ({
                date: v.date,
                type: 'PELANGGARAN',
                description: `${v.type?.name || 'Pelanggaran'} - ${v.description || 'Tindakan'}`,
                result: v.description || '-'
            })),
            ...counselingCases.map(c => ({
                date: c.created_at,
                type: 'KONSELING',
                description: `${c.issue_title} (${c.category})`,
                result: c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'Selesai' : 'Dalam Proses'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: {
                student: {
                    id: student.id,
                    nis: student.nis,
                    nisn: student.nisn,
                    name: student.name,
                    photo: student.photo,
                    class: student.class?.name || '-',
                    major: student.class?.department?.name || '-'
                },
                summary: {
                    total_violations: totalViolations,
                    total_violation_points: totalViolationPoints,
                    total_rewards: totalRewards,
                    total_reward_points: totalRewardPoints,
                    total_counseling_cases: totalCounselingCases,
                    active_cases: activeCases
                },
                violations: violationsData,
                rewards: rewardsData,
                counseling_cases: counselingData,
                actions_history: actionsHistory,
                character_conclusion: characterConclusion
            }
        });
    } catch (error) {
        console.error('Error fetching character report:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil rapor karakter',
            error: error.message
        });
    }
};

/**
 * Generate character conclusion based on summary data
 */
function generateCharacterConclusion(summary) {
    let conclusion = "";

    // Analyze violations
    if (summary.total_violations === 0) {
        conclusion += "Siswa menunjukkan disiplin yang sangat baik tanpa catatan pelanggaran. ";
    } else if (summary.total_violations <= 3) {
        conclusion += "Siswa memiliki beberapa pelanggaran ringan yang perlu mendapat perhatian dan bimbingan. ";
    } else if (summary.total_violations <= 7) {
        conclusion += "Siswa memerlukan bimbingan intensif terkait kedisiplinan dan tata tertib sekolah. ";
    } else {
        conclusion += "Siswa memerlukan perhatian khusus dan pembinaan berkelanjutan untuk perbaikan perilaku. ";
    }

    // Analyze rewards
    if (summary.total_rewards > 5) {
        conclusion += "Prestasi dan perilaku positif siswa sangat patut diapresiasi dan menjadi teladan. ";
    } else if (summary.total_rewards > 0) {
        conclusion += "Siswa menunjukkan beberapa pencapaian positif yang perlu terus dikembangkan. ";
    } else {
        conclusion += "Siswa diharapkan dapat lebih aktif dalam kegiatan positif dan berprestasi. ";
    }

    // Analyze counseling
    if (summary.total_counseling_cases > 0) {
        conclusion += `Siswa telah mengikuti ${summary.total_counseling_cases} sesi konseling. `;
        if (summary.active_cases > 0) {
            conclusion += "Masih terdapat kasus yang memerlukan tindak lanjut dan pendampingan berkelanjutan. ";
        } else {
            conclusion += "Semua kasus konseling telah terselesaikan dengan baik. ";
        }
    }

    // Overall conclusion
    const netPoints = summary.total_reward_points - summary.total_violation_points;
    if (netPoints > 50) {
        conclusion += "Secara keseluruhan, karakter siswa sangat baik dan patut dipertahankan.";
    } else if (netPoints > 0) {
        conclusion += "Secara keseluruhan, karakter siswa cukup baik dengan beberapa area yang perlu perbaikan.";
    } else if (netPoints > -50) {
        conclusion += "Siswa perlu meningkatkan kedisiplinan dan perilaku positif.";
    } else {
        conclusion += "Siswa memerlukan bimbingan intensif untuk perbaikan karakter dan perilaku.";
    }

    return conclusion;
}
