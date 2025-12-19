import {
    Achievement,
    AchievementParticipant,
    AchievementResult,
    AchievementDocument,
    Student,
    ClassRoom,
    School,
    AcademicYear
} from "../models/index.js";
import { Op } from "sequelize";
import * as XLSX from "xlsx";

/**
 * Get achievement report with filters
 */
export const getAchievementReport = async (req, res) => {
    try {
        const {
            academic_year_id,
            date_from,
            date_to,
            level,
            event_type,
            status, // 'juara' or 'partisipasi'
            student_id,
            class_id,
            page = 1,
            limit = 20,
            sort_by = 'event_date',
            sort_order = 'DESC'
        } = req.query;

        const school_id = req.user.school_id;

        // Build where clause for achievements
        const achievementWhere = { school_id };

        if (date_from && date_to) {
            achievementWhere.event_date = {
                [Op.between]: [date_from, date_to]
            };
        } else if (date_from) {
            achievementWhere.event_date = { [Op.gte]: date_from };
        } else if (date_to) {
            achievementWhere.event_date = { [Op.lte]: date_to };
        }

        if (level) {
            achievementWhere.level = level;
        }

        if (event_type) {
            achievementWhere.event_type = event_type;
        }

        // Build where clause for participants
        const participantWhere = { role: 'Peserta' };

        // Build where clause for students
        const studentWhere = {};
        if (student_id) {
            studentWhere.id = student_id;
        }
        if (class_id) {
            studentWhere.class_id = class_id;
        }
        if (academic_year_id) {
            studentWhere.academic_year_id = academic_year_id;
        }

        // Build where clause for results (status filter)
        const resultWhere = {};
        if (status === 'juara') {
            resultWhere.rank = {
                [Op.or]: [
                    { [Op.like]: '%Juara%' },
                    { [Op.like]: '%Medali%' },
                    { [Op.like]: '%Emas%' },
                    { [Op.like]: '%Perak%' },
                    { [Op.like]: '%Perunggu%' }
                ]
            };
        } else if (status === 'partisipasi') {
            resultWhere.rank = {
                [Op.or]: [
                    { [Op.like]: '%Partisipasi%' },
                    { [Op.like]: '%Peserta%' },
                    { [Op.is]: null }
                ]
            };
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Get achievements with participants and results
        const { count, rows: achievements } = await Achievement.findAndCountAll({
            where: achievementWhere,
            include: [
                {
                    model: AchievementParticipant,
                    as: 'participants',
                    required: false, // Changed to false to get all
                    include: [
                        {
                            model: Student,
                            as: 'student',
                            required: false, // Changed to false
                            include: [
                                {
                                    model: ClassRoom,
                                    as: 'class',
                                    attributes: ['id', 'name']
                                }
                            ]
                        },
                        {
                            model: AchievementResult,
                            as: 'results',
                            required: false
                        }
                    ]
                },
                {
                    model: AchievementDocument,
                    as: 'documents',
                    required: false
                }
            ],
            order: [[sort_by, sort_order]],
            distinct: true
        });

        // Format response with filtering
        let formattedData = achievements.flatMap(achievement =>
            achievement.participants
                .filter(p => {
                    // Filter by role
                    if (p.role !== 'Peserta') return false;

                    // Filter by student existence
                    if (!p.student) return false;

                    // Filter by student_id
                    if (student_id && p.student.id !== parseInt(student_id)) return false;

                    // Filter by class_id
                    if (class_id && p.student.class_id !== parseInt(class_id)) return false;

                    // Filter by academic_year_id
                    if (academic_year_id && p.student.academic_year_id !== parseInt(academic_year_id)) return false;

                    // Filter by status (juara/partisipasi)
                    if (status) {
                        const rank = p.results?.[0]?.rank;
                        if (status === 'juara' && !isJuara(rank)) return false;
                        if (status === 'partisipasi' && isJuara(rank)) return false;
                    }

                    return true;
                })
                .map(participant => ({
                    achievement_id: achievement.id,
                    event_date: achievement.event_date,
                    title: achievement.title,
                    student_name: participant.student?.name,
                    student_id: participant.student?.id,
                    class_name: participant.student?.class?.name,
                    event_type: achievement.event_type,
                    level: achievement.level,
                    rank: participant.results?.[0]?.rank || 'Partisipasi',
                    status: isJuara(participant.results?.[0]?.rank) ? 'JUARA' : 'PARTISIPASI',
                    certificate: achievement.documents?.find(doc => doc.file_path)?.file_path || null,
                    organizer: achievement.organizer,
                    location: achievement.location
                }))
        );

        // Manual pagination
        const totalCount = formattedData.length;
        const totalPages = Math.ceil(totalCount / limitNum);
        const paginatedData = formattedData.slice(offset, offset + limitNum);

        res.json({
            data: paginatedData,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        console.error('Error getting achievement report:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get report summary statistics
 */
export const getReportSummary = async (req, res) => {
    try {
        const {
            academic_year_id,
            date_from,
            date_to,
            level,
            event_type,
            student_id,
            class_id
        } = req.query;

        const school_id = req.user.school_id;

        // Build where clauses (same as main report)
        const achievementWhere = { school_id };

        if (date_from && date_to) {
            achievementWhere.event_date = { [Op.between]: [date_from, date_to] };
        } else if (date_from) {
            achievementWhere.event_date = { [Op.gte]: date_from };
        } else if (date_to) {
            achievementWhere.event_date = { [Op.lte]: date_to };
        }

        if (level) achievementWhere.level = level;
        if (event_type) achievementWhere.event_type = event_type;

        const participantWhere = { role: 'Peserta' };

        const studentWhere = {};
        if (student_id) {
            studentWhere.id = student_id;
        }
        if (class_id) studentWhere.class_id = class_id;
        if (academic_year_id) studentWhere.academic_year_id = academic_year_id;

        // Get all achievements matching filters
        const achievements = await Achievement.findAll({
            where: achievementWhere,
            include: [
                {
                    model: AchievementParticipant,
                    as: 'participants',
                    required: true,
                    include: [
                        {
                            model: Student,
                            as: 'student',
                            where: studentWhere,
                            required: true
                        },
                        {
                            model: AchievementResult,
                            as: 'results',
                            required: false
                        }
                    ]
                }
            ]
        });

        // Calculate statistics
        let totalLomba = 0;
        let totalJuara = 0;
        let totalPartisipasi = 0;
        let prestasiNasional = 0;
        let prestasiProvinsi = 0;

        const processedAchievements = new Set();

        achievements.forEach(achievement => {
            achievement.participants
                .filter(p => p.role === 'Peserta')
                .forEach(participant => {
                    const achievementKey = `${achievement.id}-${participant.student?.id}`;

                    if (!processedAchievements.has(achievementKey)) {
                        processedAchievements.add(achievementKey);
                        totalLomba++;

                        const rank = participant.results?.[0]?.rank;
                        if (isJuara(rank)) {
                            totalJuara++;
                        } else {
                            totalPartisipasi++;
                        }

                        if (achievement.level === 'Nasional' || achievement.level === 'Internasional') {
                            prestasiNasional++;
                        } else if (achievement.level === 'Provinsi') {
                            prestasiProvinsi++;
                        }
                    }
                });
        });

        res.json({
            data: {
                total_lomba: totalLomba,
                total_juara: totalJuara,
                total_partisipasi: totalPartisipasi,
                prestasi_nasional: prestasiNasional,
                prestasi_provinsi: prestasiProvinsi
            }
        });
    } catch (error) {
        console.error('Error getting report summary:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get per-student view
 */
export const getPerStudentView = async (req, res) => {
    try {
        const {
            academic_year_id,
            date_from,
            date_to,
            level,
            event_type,
            class_id
        } = req.query;

        const school_id = req.user.school_id;

        // Build where clauses
        const achievementWhere = { school_id };
        if (date_from && date_to) {
            achievementWhere.event_date = { [Op.between]: [date_from, date_to] };
        }
        if (level) achievementWhere.level = level;
        if (event_type) achievementWhere.event_type = event_type;

        const studentWhere = { school_id };
        if (class_id) studentWhere.class_id = class_id;
        if (academic_year_id) studentWhere.academic_year_id = academic_year_id;

        // Get students with their achievements
        const students = await Student.findAll({
            where: studentWhere,
            include: [
                {
                    model: ClassRoom,
                    as: 'class',
                    attributes: ['id', 'name']
                },
                {
                    model: AchievementParticipant,
                    as: 'achievementParticipants',
                    required: false,
                    where: { role: 'Peserta' },
                    include: [
                        {
                            model: Achievement,
                            as: 'achievement',
                            where: achievementWhere,
                            required: false
                        },
                        {
                            model: AchievementResult,
                            as: 'results',
                            required: false
                        }
                    ]
                }
            ]
        });

        // Aggregate data per student
        const studentData = students.map(student => {
            const participants = student.achievementParticipants || [];
            const juaraList = [];
            let jumlahLomba = 0;
            let jumlahJuara = 0;

            participants.forEach(participant => {
                if (participant.achievement) {
                    jumlahLomba++;
                    const rank = participant.results?.[0]?.rank;
                    if (isJuara(rank)) {
                        jumlahJuara++;
                        juaraList.push({
                            rank,
                            level: participant.achievement.level,
                            title: participant.achievement.title
                        });
                    }
                }
            });

            // Find highest achievement
            const prestasiTertinggi = findHighestAchievement(juaraList);

            return {
                student_id: student.id,
                student_name: student.name,
                class_name: student.class?.name || '-',
                jumlah_lomba: jumlahLomba,
                jumlah_juara: jumlahJuara,
                prestasi_tertinggi: prestasiTertinggi
            };
        }).filter(s => s.jumlah_lomba > 0); // Only show students with achievements

        res.json({ data: studentData });
    } catch (error) {
        console.error('Error getting per-student view:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get per-class view
 */
export const getPerClassView = async (req, res) => {
    try {
        const {
            academic_year_id,
            date_from,
            date_to,
            level,
            event_type
        } = req.query;

        const school_id = req.user.school_id;

        // Build where clauses
        const achievementWhere = { school_id };
        if (date_from && date_to) {
            achievementWhere.event_date = { [Op.between]: [date_from, date_to] };
        }
        if (level) achievementWhere.level = level;
        if (event_type) achievementWhere.event_type = event_type;

        const studentWhere = { school_id };
        if (academic_year_id) studentWhere.academic_year_id = academic_year_id;

        // Get classes with students and achievements
        const classes = await ClassRoom.findAll({
            where: { school_id },
            include: [
                {
                    model: Student,
                    as: 'students',
                    where: studentWhere,
                    required: false,
                    include: [
                        {
                            model: AchievementParticipant,
                            as: 'achievementParticipants',
                            required: false,
                            where: { role: 'Peserta' },
                            include: [
                                {
                                    model: Achievement,
                                    as: 'achievement',
                                    where: achievementWhere,
                                    required: false
                                },
                                {
                                    model: AchievementResult,
                                    as: 'results',
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // Aggregate data per class
        const classData = classes.map(classRoom => {
            let totalPrestasi = 0;
            let totalJuara = 0;
            let prestasiNasional = 0;

            classRoom.students.forEach(student => {
                student.achievementParticipants?.forEach(participant => {
                    if (participant.achievement) {
                        totalPrestasi++;
                        const rank = participant.results?.[0]?.rank;
                        if (isJuara(rank)) {
                            totalJuara++;
                        }
                        if (participant.achievement.level === 'Nasional' || participant.achievement.level === 'Internasional') {
                            prestasiNasional++;
                        }
                    }
                });
            });

            return {
                class_id: classRoom.id,
                class_name: classRoom.name,
                total_prestasi: totalPrestasi,
                total_juara: totalJuara,
                prestasi_nasional: prestasiNasional
            };
        }).filter(c => c.total_prestasi > 0); // Only show classes with achievements

        res.json({ data: classData });
    } catch (error) {
        console.error('Error getting per-class view:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Export report to Excel
 */
export const exportReportExcel = async (req, res) => {
    try {
        // Use same filters as main report
        const reportData = await getReportDataForExport(req);

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Main report sheet
        const mainData = reportData.map(item => ({
            'Tanggal': item.event_date,
            'Nama Lomba': item.title,
            'Nama Siswa': item.student_name,
            'Kelas': item.class_name,
            'Kategori': item.event_type,
            'Tingkat': item.level,
            'Hasil': item.rank,
            'Status': item.status,
            'Penyelenggara': item.organizer,
            'Lokasi': item.location
        }));

        const worksheet = XLSX.utils.json_to_sheet(mainData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Prestasi');

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=laporan_prestasi.xlsx');

        res.send(buffer);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Export report to PDF
 */
export const exportReportPDF = async (req, res) => {
    try {
        // For now, return a simple message
        // In production, use a PDF library like pdfkit or puppeteer
        res.json({
            message: 'PDF export will be implemented with pdfkit or puppeteer',
            note: 'Use Excel export for now'
        });
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper functions
function isJuara(rank) {
    if (!rank) return false;
    const juaraKeywords = ['juara', 'medali', 'emas', 'perak', 'perunggu', 'winner', 'champion'];
    return juaraKeywords.some(keyword => rank.toLowerCase().includes(keyword));
}

function findHighestAchievement(juaraList) {
    if (juaraList.length === 0) return '-';

    // Priority: Nasional/Internasional > Provinsi > Kabupaten > Kecamatan > Sekolah
    const levelPriority = {
        'Internasional': 5,
        'Nasional': 4,
        'Provinsi': 3,
        'Kabupaten': 2,
        'Kecamatan': 1,
        'Sekolah': 0
    };

    // Sort by level priority
    juaraList.sort((a, b) => {
        const priorityA = levelPriority[a.level] || 0;
        const priorityB = levelPriority[b.level] || 0;
        return priorityB - priorityA;
    });

    const highest = juaraList[0];
    return `${highest.rank} - ${highest.level}`;
}

async function getReportDataForExport(req) {
    const {
        academic_year_id,
        date_from,
        date_to,
        level,
        event_type,
        status,
        student_id,
        class_id
    } = req.query;

    const school_id = req.user.school_id;

    const achievementWhere = { school_id };
    if (date_from && date_to) {
        achievementWhere.event_date = { [Op.between]: [date_from, date_to] };
    }
    if (level) achievementWhere.level = level;
    if (event_type) achievementWhere.event_type = event_type;

    const participantWhere = { role: 'Peserta' };

    const studentWhere = {};
    if (student_id) {
        studentWhere.id = student_id;
    }
    if (class_id) studentWhere.class_id = class_id;
    if (academic_year_id) studentWhere.academic_year_id = academic_year_id;

    const resultWhere = {};
    if (status === 'juara') {
        resultWhere.rank = {
            [Op.or]: [
                { [Op.like]: '%Juara%' },
                { [Op.like]: '%Medali%' }
            ]
        };
    }

    const achievements = await Achievement.findAll({
        where: achievementWhere,
        include: [
            {
                model: AchievementParticipant,
                as: 'participants',
                required: true,
                include: [
                    {
                        model: Student,
                        as: 'student',
                        where: studentWhere,
                        required: true,
                        include: [
                            {
                                model: ClassRoom,
                                as: 'class',
                                attributes: ['id', 'name']
                            }
                        ]
                    },
                    {
                        model: AchievementResult,
                        as: 'results',
                        where: Object.keys(resultWhere).length > 0 ? resultWhere : undefined,
                        required: status ? true : false
                    }
                ]
            }
        ],
        order: [['event_date', 'DESC']]
    });

    return achievements.flatMap(achievement =>
        achievement.participants
            .filter(p => p.role === 'Peserta')
            .map(participant => ({
                event_date: achievement.event_date,
                title: achievement.title,
                student_name: participant.student?.name,
                class_name: participant.student?.class?.name,
                event_type: achievement.event_type,
                level: achievement.level,
                rank: participant.results?.[0]?.rank || 'Partisipasi',
                status: isJuara(participant.results?.[0]?.rank) ? 'JUARA' : 'PARTISIPASI',
                organizer: achievement.organizer,
                location: achievement.location
            }))
    );
}
