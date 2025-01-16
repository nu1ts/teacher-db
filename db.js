import nano from 'nano';
import { setupValidation } from './validation.js';

const couch = nano('http://admin:password@185.128.104.231:5984');

async function createDatabaseIfNotExists(dbName) {
    try {
        const dbList = await couch.db.list();
        if (!dbList.includes(dbName)) {
            await couch.db.create(dbName);
            console.log(`Database "${dbName}" created successfully.`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }
        
        const db = couch.db.use(dbName);
        await setupValidation(db);
    } catch (error) {
        console.error(`Error creating database "${dbName}":`, error);
    }
}

const dbName = 'teacher-db';
await createDatabaseIfNotExists(dbName);
const db = couch.db.use(dbName);

async function createIndexes() {
    try {
        await db.createIndex({
            index: { fields: ['class_id'] },
            name: 'class_id_index',
            type: 'json',
        });
        console.log('Index on class_id created successfully.');
    } catch (error) {
        console.error('Error creating index on class_id:', error);
    }
}

function validateStudent(student) {
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(student.date_of_birth).getFullYear();
    if (birthYear > currentYear - 6 || birthYear < currentYear - 18) {
        throw new Error('Invalid student age.');
    }
    return true;
}

async function addDocument(document) {
    try {
        const existingDoc = await db.get(document._id);
        if (existingDoc) {
            console.log(`Document "${document._id}" already exists. Updating...`);
            await updateDocument(document._id, document);
        }
    } catch (error) {
        if (error.statusCode === 404) {
            console.log(`Document "${document._id}" does not exist. Adding...`);
            if (document.type === 'student') {
                validateStudent(document);
            }
            await db.insert(document);
            console.log(`Document "${document._id}" added successfully.`);
        } else {
            console.error(`Error adding or updating document "${document._id}":`, error);
        }
    }
}

async function updateStudentCount(classId) {
    try {
        const classDoc = await db.get(classId);
        const newStudentCount = classDoc.students.length;
        classDoc.student_count = newStudentCount;
        await db.insert(classDoc);
        console.log(`Student count for class "${classId}" updated successfully.`);
    } catch (error) {
        console.error(`Error updating student count for class "${classId}":`, error);
    }
}

async function updateDocument(docId, newDoc) {
    try {
        const existingDoc = await db.get(docId);
        newDoc._rev = existingDoc._rev;
        await db.insert(newDoc);
        console.log(`Document "${docId}" updated successfully.`);
    } catch (error) {
        if (error.statusCode === 409) {
            console.log('Conflict error: document already exists or is being updated.');
        } else {
            console.error('Error updating document:', error);
        }
    }
}

async function getDocumentById(id) {
    try {
        const document = await db.get(id);
        console.log(`Document "${id}" retrieved successfully:`, document);
        return document;
    } catch (error) {
        console.error(`Error retrieving document "${id}":`, error);
        return null;
    }
}

export {
    addDocument,
    getDocumentById,
    updateDocument,
    createIndexes,
    updateStudentCount,
};