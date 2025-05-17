import OpenAI from 'openai';
import hotelService from "../services/HotelService.js";
import locationService from "../services/LocationService.js";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // recommended to use env variable
});

// Simulated dynamic data (replace this with your MongoDB queries)


const systemPrompt = {
    role: 'system',
    content: `
Bạn là một trợ lý chatbot cho website đặt phòng khách sạn. 
Bạn trả lời bằng tiếng Việt. 
Website có các tính năng sau:
- Người dùng có thể tìm kiếm khách sạn theo địa điểm, địa chỉ khách sạn hoặc tên khách sạn (ví dụ: Đà Nẵng)
- Người dùng cần đăng nhập để đặt phòng
- Để đặt phòng, cần vào trang thông tin khách sạn và ấn "đặt" ở loại phòng mong muốn
- Khi đặt, sau khi nhập đủ thông tin, người dùng có thể chọn phương thức thanh toán "Online" hoặc "Trực tiếp"
+ Lưu ý, đơn đặt phòng của cả hai loại phương thức thanh toán đều cần được xác nhận bởi chủ khách sạn để được chuyển từ đơn đặt phòng "Chờ xác nhận" sang đơn đặt phòng "Sắp tới"
- Nếu chọn hình thức "Online" và chọn nút "Đặt", người dùng sẽ chuyển qua trang thanh toán, tại đây có thể thanh toán bằng thẻ ngân hàng
+ Đơn đặt phòng loại này không thể hủy
+ Lưu ý, chúng tôi không hoàn trả tiền nên người dùng cần cân nhắc trước khi chọn phương thức thanh toán này
- Nếu chọn hình thức "Trực tiếp" và chọn nút "Đặt", người dùng sẽ được chuyển qua trang đơn đặt phòng "Chờ xác nhận" của bạn
+ Nếu đơn đặt phòng chưa được xác nhận thì người dùng có thể hủy đơn ấy tại đơn đặt phòng "Chờ xác nhận", chỉ đơn đặt phòng có phương thức thanh toán là "Trực tiếp" mới có thể hủy được
+ Nếu đơn đặt phòng đã được xác nhận thì người dùng không thể hủy đơn này nữa
- Người dùng có thể đánh giá khách sạn ở trong đơn đặt phòng "Đã hoàn thành", mỗi đơn đặt phòng sau khi kết thúc sẽ được chuyển qua "Đã hoàn thành" và chỉ có thể đánh giá một lần
Nếu người dùng hỏi về khách sạn rẻ nhất, bạn sẽ dùng dữ liệu từ backend. Còn những câu hỏi động khác thì trả về "Xin lỗi, tôi không thể tìm kiếm thông tin này"
`
};

// Detect question type
function detectIntent(question) {
    if (question.includes('rẻ nhất')) {
        return 'cheapest_hotel';
    }
    return 'static';
}

export async function handleChat(question) {
    const intent = detectIntent(question);

    let messages = [systemPrompt];

    if (intent === 'cheapest_hotel') {
        const locationResponse = await locationService.getAllLocation();
        const locations = locationResponse.data;
        const locationName = locations.map(location => location.locationName);

        const questionLower = question.toLowerCase();
        const questionLocationName = locationName.find(loc =>
            questionLower.includes(loc.toLowerCase())
        );

        if (!questionLocationName) {
            messages.push({
                role: 'assistant',
                content: 'Xin lỗi, tôi không nhận diện được địa điểm bạn muốn tìm khách sạn. Bạn có thể nói rõ hơn không?'
            });
        } else {
            let filter = {}
            filter.filter = questionLocationName
            const response = await hotelService.userFilterHotel(filter);
            const hotelWithMinPrice = response.data.reduce((minHotel, currentHotel) => {
                return Number(currentHotel.minPrice) < Number(minHotel.minPrice) ? currentHotel : minHotel;
            });
            messages.push({
                role: 'assistant',
                content: `Khách sạn rẻ nhất ở ${questionLocationName} trong hôm nay khi ở 1 người lớn và 1 phòng là ${hotelWithMinPrice.hotelName} với giá ${hotelWithMinPrice.minPrice}.`
            });
        }
    }

    messages.push({ role: 'user', content: question });

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // or 'gpt-4'
        messages
    });
    //console.log(response.choices[0].message.content)
    return response.choices[0].message.content;
}

export const chatbotController = async (req, res) => {
    const { question } = req.body;

    try {
        const reply = await handleChat(question);
        res.json({ answer: reply });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error contacting OpenAI.");
    }
}