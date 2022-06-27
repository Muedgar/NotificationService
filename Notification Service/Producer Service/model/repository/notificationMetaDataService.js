const notificationModel = require("../notificationRequestModel");

// dealing with database operations
class NotificationRepository {
    async getAllNotifications() {
        try {
            const allNotifications = await notificationModel.find({});
            return allNotifications;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = NotificationRepository;