
module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        roomNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
        roomTypeId: { type: DataTypes.INTEGER, allowNull: false },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    };

    const options = {
        timestamps: false,
        tableName: 'Rooms'
    };

    const Room = sequelize.define('Room', attributes, options);
    
    Room.seedDefaults = async function () {
        function generateRooms() {
            const rooms = [];
            let roomId = 1;

            const roomTypes = [
                { id: 1, type: 'Classic', basePrice: 120.00, floors: [1, 2], perFloor: 9 },
                { id: 2, type: 'Deluxe', basePrice: 200.00, floors: [1, 2, 3], perFloor: 5 },
                { id: 3, type: 'Prestige', basePrice: 350.00, floors: [2, 3], perFloor: 4 },
                { id: 4, type: 'Luxury', basePrice: 800.00, floors: [4], perFloor: 6 }
            ];

            const totalFloors = Math.max(...roomTypes.flatMap(rt => rt.floors));

            for (let floor = 1; floor <= totalFloors; floor++) {
                let roomCounter = 1; // numbering starts fresh per floor

                for (const roomType of roomTypes) {
                    if (roomType.floors.includes(floor)) {
                        for (let i = 0; i < roomType.perFloor; i++) {
                            const roomNumber = `${floor}${String(roomCounter).padStart(2, '0')}`;
                            rooms.push({
                                id: roomId++,
                                roomNumber,
                                roomTypeId: roomType.id,
                                price: roomType.basePrice,
                                isAvailable: true
                            });
                            roomCounter++;
                        }
                    }
                }
            }

            return rooms;
        }

        const rooms = generateRooms();

        for (const room of rooms) {
            await Room.findOrCreate({
                where: { roomNumber: room.roomNumber, roomTypeId: room.roomTypeId },
                defaults: room
            });
        }

        console.log(`✅ ${rooms.length} rooms seeded successfully`);
    };



    return Room;
};
