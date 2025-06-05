import cron from 'node-cron';
import Booking from '../models/Booking.js'; // Đường dẫn đến model Booking
import Voucher from '../models/Voucher.js'; // Đường dẫn đến model Voucher
import User from '../models/User.js';       // Nếu cần lấy thêm thông tin user

const generateVoucherCode = () => {
    const prefix = 'BK'; // Định danh cố định, ví dụ 'BK' = Booking

    const now = new Date(); // Lấy thời gian hiện tại

    const timePart = now.getFullYear().toString().slice(-2)       // Lấy 2 số cuối năm, ví dụ: 2025 → "25"
        + String(now.getMonth() + 1).padStart(2, '0')               // Tháng (0-11) → cộng 1 → luôn có 2 chữ số
        + String(now.getDate()).padStart(2, '0')                    // Ngày, luôn 2 chữ số
        + String(now.getHours()).padStart(2, '0')                   // Giờ (24h), luôn 2 chữ số
        + String(now.getMinutes()).padStart(2, '0');                // Phút, luôn 2 chữ số

    const randomPart = Math.floor(1000 + Math.random() * 9000);   // Số ngẫu nhiên từ 1000 → 9999

    return `${prefix}${timePart}${randomPart}`; // Gộp tất cả thành mã hoàn chỉnh
};
// Cron job chạy mỗi ngày lúc 23:59
cron.schedule('59 23 * * *', async () => {
    const now = new Date();
    const today = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Nếu ngày mai là ngày 1 => hôm nay là ngày cuối tháng
    if (tomorrow.getDate() === 1) {
        try {
            const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

            // Lấy top 3 user có tổng price (booking đã xác nhận) cao nhất trong tháng
            const topUsers = await Booking.aggregate([
                {
                    $match: {
                        isConfirmed: true,
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        totalPrice: { $sum: { $toDouble: '$price' } }
                    }
                },
                { $sort: { totalPrice: -1 } },
                { $limit: 3 }
            ]);

            if (topUsers.length === 0) return; // Không có ai => không tạo voucher

            // Tạo voucher cho từng user
            const ranks = [
                { name: "GOLDEN", value: 200000 },
                { name: "SILVER", value: 100000 },
                { name: "BRONZE", value: 50000 }
            ];

            for (let i = 0; i < topUsers.length && i < ranks.length; i++) {
                const user = topUsers[i];
                const { name, value } = ranks[i];
                const expiredAtUTC0 = new Date(today.getFullYear(), today.getMonth() + 1, 28)
                const expiredAt = new Date(expiredAtUTC0.getTime() + 7 * 60 * 60 * 1000);
                const valueString = value.toLocaleString('vi-VN') + 'đ'
                await Voucher.create({
                    code: `${name}VIP${generateVoucherCode()}${user._id}`,
                    description: `Voucher dành cho khách hàng ${name} VIP tháng ${today.getMonth() + 1}/${today.getFullYear()}`,
                    content:`Giảm ${valueString} cho tất cả đơn`,
                    userId: user._id,
                    discountType: "fixed",
                    discountValue: value,
                    expiredAt
                });
            }

            console.log('🎉 Vouchers created for top 3 users of the month.');
        } catch (err) {
            console.error('Voucher creation failed:', err);
        }
    }
});
