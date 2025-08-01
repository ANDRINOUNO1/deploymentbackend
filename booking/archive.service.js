const db = require('../_helpers/db');
const { Archive, Room } = db;

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
    return await Archive.findAll({
        include: [{
            model: Room,
            attributes: ['room_number', 'room_type']
        }]
    });
}

async function getArchiveById(id) {
    return await Archive.findByPk(id, {
        include: [{
            model: Room,
            attributes: ['room_number', 'room_type']
        }]
    });
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
