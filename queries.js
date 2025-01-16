import { db } from './db.js';

// Получить список всех учеников, не посетивших ни одного занятия
export async function getStudentsWithoutLessons() {
    const studentsWithoutLessons = await db.find({
        selector: {
            type: 'student',
            class_id: "class_6B_2024"
        }
    });

    const studentsWithoutAttendance = studentsWithoutLessons.docs.filter(student => {
        return !student.journal_entries.some(entry => entry.entry_type === 'Посещение' && entry.grade === 1);
    });

    return studentsWithoutAttendance;
}

// Получить среднюю оценку по предмету для каждого ученика
export async function getAverageGradeForStudents() {
    const studentsWithGrades = await db.find({
        selector: {
            type: 'student',
            class_id: "class_6B_2024"
        }
    });

    const studentGrades = studentsWithGrades.docs.map(student => {
        const grades = student.journal_entries.filter(entry => entry.entry_type === 'Оценка');
        const averageGrade = grades.reduce((acc, entry) => acc + entry.grade, 0) / grades.length;
        return {
            studentId: student._id,
            averageGrade: averageGrade
        };
    });

    return studentGrades;
}

// Получить список всех родителей, участвующих в родительских собраниях, и количество собраний
export async function getParentMeetings() {
    const parentMeetings = await db.find({
        selector: {
            type: 'parent_meeting',
        }
    });

    const parentParticipation = parentMeetings.docs.reduce((acc, meeting) => {
        meeting.parents.forEach(parent => {
            if (!acc[parent.id]) {
                acc[parent.id] = { name: parent.name, count: 0 };
            }
            acc[parent.id].count += 1;
        });
        return acc;
    }, {});

    const parentsList = Object.values(parentParticipation);
    return parentsList;
}

// Получить расписание занятий для указанного класса на ближайшую неделю
export async function getLessonScheduleForNextWeek() {
    const lessonsThisWeek = await db.find({
        selector: {
            type: 'lesson_schedule',
            class_id: "class_6B_2024",
            date: { $gte: '2024-02-20', $lte: '2024-02-27' }
        }
    });

    return lessonsThisWeek.docs;
}

// Получить список всех родителей и количество учеников, относящихся к ним
export async function getParentStudentCount() {
    const students = await db.find({
        selector: {
            type: 'student'
        }
    });

    const parentStudentCount = students.docs.reduce((acc, student) => {
        student.parents.forEach(parent => {
            if (!acc[parent.id]) {
                acc[parent.id] = { name: parent.name, studentCount: 0 };
            }
            acc[parent.id].studentCount += 1;
        });
        return acc;
    }, {});

    const parentsList = Object.values(parentStudentCount);
    return parentsList;
}