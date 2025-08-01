const db = require('../_helpers/db');
const Archive = db.Archive;

module.exports = {
    createArchive,
    getAllArchives,
    getArchiveById,
    updateArchive,
    deleteArchive
};

async function createArchive(data) {
    return await Archive.create(data);
}

async function getAllArchives() {
    return await Archive.findAll();
}

async function getArchiveById(id) {
    return await Archive.findByPk(id);
}

async function updateArchive(id, data) {
    const archive = await getArchiveById(id);
    if (!archive) return null;
    return await archive.update(data);
}

async function deleteArchive(id) {
    const archive = await getArchiveById(id);
    if (!archive) return null;
    await archive.destroy();
    return true;
}
