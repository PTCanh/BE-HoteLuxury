import { Configuration, OpenAIApi } from 'openai';
import hotelService from "../services/HotelService.js";
import locationService from "../services/LocationService.js";
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
- Khi đặt, người dùng có thể chọn hình thức thanh toán "Online" hoặc "Trực tiếp"
- Nếu chọn hình thức "Online", người dùng có thể thanh toán bằng thẻ ngân hàng
+ Khi người dùng thanh toán online thành công thì đơn đặt phòng sẽ được tự động duyệt.
+ Lưu ý, chúng tôi không hoàn trả tiền nên người dùng cần cân nhắc trước khi chọn phương thức thanh toán này
- Nếu chọn hình thức "Trực tiếp", đơn đặt phòng sẽ cần được xác nhận từ bên chủ khách sạn
+ Nếu đơn đặt phòng chưa được xác nhận thì người dùng có thể hủy đơn ấy.
+ Nếu đơn đặt phòng đã được xác nhận thì người dùng cần liên hệ với chủ khách sạn để xin phép được hủy đơn.
- Người dùng có thể đánh giá sau khi ở xong
Nếu người dùng hỏi về khách sạn rẻ nhất hoặc thông tin động, bạn sẽ dùng dữ liệu từ backend.
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
            const response = await hotelService.userFilterHotel(questionLocationName);
            messages.push({
                role: 'assistant',
                content: `Dữ liệu khách sạn ở ${questionLocationName} từ máy chủ: ${JSON.stringify(response)}.`
            });
        }
    }

    messages.push({ role: 'user', content: question });

    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
    });

    return completion.data.choices[0].message.content;
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