const moment = require('moment-timezone');
const config = require('./config');

class Utils {
    // Format time
    static getTime(timezone = config.TIMEZONE) {
        return moment().tz(timezone).format('hh:mm A');
    }

    // Format date
    static getDate(timezone = config.TIMEZONE) {
        return moment().tz(timezone).format('YYYY-MM-DD');
    }

    // Format timestamp
    static getTimestamp(timezone = config.TIMEZONE) {
        return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
    }

    // Calculate uptime
    static getUptime(uptimeSeconds) {
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        return { hours, minutes, seconds };
    }

    // Format uptime string
    static formatUptime(uptimeSeconds) {
        const { hours, minutes, seconds } = this.getUptime(uptimeSeconds);
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    // Clean number
    static cleanNumber(number) {
        return number.replace(/[^0-9]/g, '');
    }

    // Sleep function
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = Utils;