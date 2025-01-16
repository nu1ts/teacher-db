//документация по валидации: https://docs.couchdb.org/en/latest/ddocs/ddocs.html#validate-document-update-functions

export async function setupValidation(db) {
    const validationDesignDoc = {
        _id: '_design/validation_design',
        validate_doc_update: `
        function(newDoc, oldDoc, userCtx) {
            if (newDoc.type === 'teacher') {
                if (typeof newDoc.name !== 'string' || newDoc.name.trim().length === 0) {
                    throw {forbidden: 'Teacher name is required and must be a non-empty string.'};
                }
                if (typeof newDoc.email !== 'string' || newDoc.email.indexOf('@') === -1) {
                    throw {forbidden: 'Teacher email is required and must contain "@" symbol.'};
                }
            }

            if (newDoc.type === 'class') {
                if (typeof newDoc.number !== 'number' || newDoc.number < 1 || newDoc.number > 11) {
                    throw {forbidden: 'Class number must be a number between 1 and 11.'};
                }
                if (typeof newDoc.letter !== 'string' || newDoc.letter.length !== 1 || newDoc.letter < 'А' || newDoc.letter > 'Я') {
                    throw {forbidden: 'Class letter must be a single Cyrillic character between А and Я.'};
                }
                if (typeof newDoc.year !== 'number' || newDoc.year < 2018) {
                    throw {forbidden: 'Class year must be a number greater than or equal to 2018.'};
                }
            }

            if (newDoc.type === 'student') {
                if (typeof newDoc.name !== 'string' || newDoc.name.trim().length === 0) {
                    throw {forbidden: 'Student name is required and must be a non-empty string.'};
                }
                if (!newDoc.date_of_birth || new Date(newDoc.date_of_birth).toString() === 'Invalid Date') {
                    throw {forbidden: 'Date of birth is required and must be a valid date.'};
                }
                const birthDate = new Date(newDoc.date_of_birth);
                const minDate = new Date('2018-06-15');
                if (birthDate < minDate) {
                    throw {forbidden: 'Date of birth must be after June 15, 2018.'};
                }
            }

            if (newDoc.type === 'lesson_schedule') {
                if (!newDoc.date || new Date(newDoc.date).toString() === 'Invalid Date') {
                    throw {forbidden: 'Lesson date is required and must be a valid date.'};
                }
                if (!newDoc.time || typeof newDoc.time !== 'string') {
                    throw {forbidden: 'Lesson time is required and must be a string in HH:MM format.'};
                }
                const lessonTime = newDoc.time.split(':');
                const hour = parseInt(lessonTime[0], 10);
                if (isNaN(hour) || hour < 7 || hour > 20) {
                    throw {forbidden: 'Lesson time must be between 07:00 and 20:59.'};
                }
            }

            if (newDoc.type === 'journal_entry') {
                if (!['Оценка', 'Посещение'].includes(newDoc.entry_type)) {
                    throw {forbidden: 'Invalid journal entry type. Must be "Оценка" or "Посещение".'};
                }
                if (newDoc.entry_type === 'Оценка') {
                    if (typeof newDoc.grade !== 'number' || newDoc.grade < 2 || newDoc.grade > 5) {
                        throw {forbidden: 'Grade for "Оценка" must be a number between 2 and 5.'};
                    }
                }
                if (newDoc.entry_type === 'Посещение') {
                    if (typeof newDoc.grade !== 'number' || (newDoc.grade !== 0 && newDoc.grade !== 1)) {
                        throw {forbidden: 'Attendance for "Посещение" must be 0 or 1.'};
                    }
                }
            }
        }
        `
    };

    try {
        const existingDoc = await db.get(validationDesignDoc._id);
        validationDesignDoc._rev = existingDoc._rev;
        console.log('Validation design document already exists. Updating...');
    } catch (error) {
        if (error.statusCode === 404) {
            console.log('Validation design document does not exist. Creating...');
        } else {
            throw error;
        }
    }

    try {
        await db.insert(validationDesignDoc);
        console.log('Validation design document set up successfully.');
    } catch (error) {
        console.error('Error setting up validation design document:', error);
    }
}