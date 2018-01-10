export class Utils {

    static randomString(length, chars) {
        var mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        var result = '';
        for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }
    
    static formatTimeZoneOffset(offset) {
        const isPositive = offset > 0;
        offset = Math.abs(offset);
        return (isPositive ? '+' : '-') + Utils.pad2(parseInt(offset / 3600, 10)) + ':' + Utils.pad2(offset % 3600);
    }

    static pad2(number) {
        return (number < 10 ? '0' : '') + number
    }
}
