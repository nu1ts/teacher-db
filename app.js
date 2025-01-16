import { addDocument, updateStudentCount } from './db.js';

async function addNewClass() {
    const newClassDoc = {
        _id: "class_6B_2024",
        type: "class",
        number: 6,
        letter: "Б",
        year: 2024,
        teacher: {
            id: "teacher_2",
            name: "Сидор Сидоров",
        },
        students: ["student_3", "student_4"],
        student_count: 2
    };

    await addDocument(newClassDoc);
    await updateStudentCount(newClassDoc._id);
}

async function addNewTeacher() {
    const newTeacherDoc = {
        _id: "teacher_2",
        type: "teacher",
        name: "Сидор Сидоров",
        email: "sidorov@example.com",
        phones: ["+79113334455"],
        subjects: [{ id: "subject_3", name: "История" }],
        classes: ["class_6B_2024"],
    };

    await addDocument(newTeacherDoc);
}

async function addNewSubject() {
    const newSubjectDoc = {
        _id: "subject_3",
        type: "subject",
        name: "История",
        description: "История древнего мира и средневековья.",
    };

    await addDocument(newSubjectDoc);
}

async function addNewStudent() {
    const newStudentDoc1 = {
        _id: "student_3",
        type: "student",
        name: "Мария Петрова",
        date_of_birth: "2019-03-25",
        address: "г. Санкт-Петербург, ул. Малиновая, д. 12",
        class_id: "class_6B_2024",
        parents: [
            { id: "parent_4", name: "Петр Петрович", phones: ["+79114445566"] },
        ],
    };
    
    const newStudentDoc2 = {
        _id: "student_4",
        type: "student",
        name: "Иван Иванов",
        date_of_birth: "2019-05-14",
        address: "г. Санкт-Петербург, ул. Березовая, д. 5",
        class_id: "class_6B_2024",
        parents: [
            { id: "parent_5", name: "Анна Ивановна", phones: ["+79115556677"] },
        ],
    };    

    await addDocument(newStudentDoc1);
    await addDocument(newStudentDoc2);

    await updateStudentCount("class_6B_2024");
}

async function addNewLessonSchedule() {
    const lesson1 = {
        _id: "lesson_class_6B_2024_2024-02-20_10:00",
        type: "lesson_schedule",
        class_id: "class_6B_2024",
        date: "2024-02-20",
        time: "10:00",
        subject: { id: "subject_3", name: "История" },
        location: "Аудитория 203"
    };

    const lesson2 = {
        _id: "lesson_class_6B_2024_2024-02-20_12:00",
        type: "lesson_schedule",
        class_id: "class_6B_2024",
        date: "2024-02-20",
        time: "12:00",
        subject: { id: "subject_3", name: "История" },
        location: "Аудитория 204"
    };

    await addDocument(lesson1);
    await addDocument(lesson2);
}

(async function addNewData() {
    await addNewClass();
    await addNewTeacher();
    await addNewSubject();
    await addNewStudent();
    await addNewLessonSchedule();
})();