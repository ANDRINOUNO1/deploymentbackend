 const { ContactMessage } = require('../_helpers/db');
const { Op } = require('sequelize');

class ContactMessageService {
  // Create a new contact message
  async createMessage(messageData) {
    try {
      const message = await ContactMessage.create({
        name: messageData.name,
        email: messageData.email,
        phone: messageData.phone,
        subject: messageData.subject,
        message: messageData.message,
        status: 'unread'
      });

      return {
        success: true,
        message: 'Contact message submitted successfully',
        data: message
      };
    } catch (error) {
      console.error('Error creating contact message:', error);
      return {
        success: false,
        message: 'Failed to submit contact message',
        error: error.message
      };
    }
  }

  // Get all contact messages with optional filtering
  async getAllMessages(filters = {}) {
    try {
      const whereClause = {};
      
      // Status filter
      if (filters.status && ['unread', 'read', 'replied'].includes(filters.status)) {
        whereClause.status = filters.status;
      }

      // Search filter
      if (filters.search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { subject: { [Op.like]: `%${filters.search}%` } },
          { message: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      // Date range filter
      if (filters.startDate && filters.endDate) {
        whereClause.createdAt = {
          [Op.between]: [filters.startDate, filters.endDate]
        };
      }

      const messages = await ContactMessage.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'createdAt', 'updatedAt']
      });

      return {
        success: true,
        data: messages,
        count: messages.length
      };
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return {
        success: false,
        message: 'Failed to fetch contact messages',
        error: error.message
      };
    }
  }

  // Get a single contact message by ID
  async getMessageById(id) {
    try {
      const message = await ContactMessage.findByPk(id);
      
      if (!message) {
        return {
          success: false,
          message: 'Contact message not found'
        };
      }

      return {
        success: true,
        data: message
      };
    } catch (error) {
      console.error('Error fetching contact message:', error);
      return {
        success: false,
        message: 'Failed to fetch contact message',
        error: error.message
      };
    }
  }

  // Update message status
  async updateMessageStatus(id, status) {
    try {
      const message = await ContactMessage.findByPk(id);
      
      if (!message) {
        return {
          success: false,
          message: 'Contact message not found'
        };
      }

      if (!['unread', 'read', 'replied'].includes(status)) {
        return {
          success: false,
          message: 'Invalid status value'
        };
      }

      await message.update({ status });
      
      return {
        success: true,
        message: 'Message status updated successfully',
        data: message
      };
    } catch (error) {
      console.error('Error updating message status:', error);
      return {
        success: false,
        message: 'Failed to update message status',
        error: error.message
      };
    }
  }

  // Delete a contact message
  async deleteMessage(id) {
    try {
      const message = await ContactMessage.findByPk(id);
      
      if (!message) {
        return {
          success: false,
          message: 'Contact message not found'
        };
      }

      await message.destroy();
      
      return {
        success: true,
        message: 'Contact message deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting contact message:', error);
      return {
        success: false,
        message: 'Failed to delete contact message',
        error: error.message
      };
    }
  }

  // Get message statistics
  async getMessageStats() {
    try {
      const totalMessages = await ContactMessage.count();
      const unreadMessages = await ContactMessage.count({ where: { status: 'unread' } });
      const readMessages = await ContactMessage.count({ where: { status: 'read' } });
      const repliedMessages = await ContactMessage.count({ where: { status: 'replied' } });

      return {
        success: true,
        data: {
          total: totalMessages,
          unread: unreadMessages,
          read: readMessages,
          replied: repliedMessages
        }
      };
    } catch (error) {
      console.error('Error fetching message statistics:', error);
      return {
        success: false,
        message: 'Failed to fetch message statistics',
        error: error.message
      };
    }
  }

  // Mark message as read
  async markAsRead(id) {
    return this.updateMessageStatus(id, 'read');
  }

  // Mark message as replied
  async markAsReplied(id) {
    return this.updateMessageStatus(id, 'replied');
  }
}

module.exports = new ContactMessageService(); 