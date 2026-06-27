module.exports = (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // req.clientIp yerine doğrudan req içine ekleyelim
    req.ip = clientIp;
    next(); // Sonraki işlemi başlatmak için next() fonksiyonunu çağırın
}