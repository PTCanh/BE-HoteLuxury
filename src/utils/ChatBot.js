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
- Nếu người dùng tìm theo địa điểm, địa chỉ khách sạn thì sẽ chuyển đến trang lọc khách sạn, ở trang này người dùng có thể lọc theo các tiêu chí 
của trang web như thời gian, địa điểm, số người, số phòng, và lọc theo một số thông tin về khách sạn như tên, loại hình, số sao, giá tiền.
Còn nếu người dùng tìm theo tên khách sạn thì sẽ vào trực tiếp trang thông tin khách sạn
- Người dùng cần đăng nhập để đặt phòng
- Để đặt phòng, cần vào trang thông tin khách sạn và ấn "đặt" ở loại phòng mong muốn
- Khi ấn "đặt", nếu người dùng chưa đăng nhập thì sẽ chuyển qua trang đăng nhập để đăng nhập vào tài khoản của mình, sau khi đăng nhập 
thành công sẽ quay lại trang thông tin khách sạn trước đó. Còn nếu đã đăng nhập rồi thì sẽ chuyển qua trang đặt phòng
- Ở trang đặt phòng, sau khi nhập đủ thông tin, người dùng có thể chọn phương thức thanh toán "Online" hoặc "Trực tiếp"
+ Lưu ý, đơn đặt phòng của cả hai loại phương thức thanh toán đều cần được xác nhận bởi chủ khách sạn để được chuyển từ đơn đặt phòng "Chờ xác nhận" sang đơn đặt phòng "Sắp tới"
- Nếu chọn hình thức "Online" và chọn nút "Đặt", người dùng sẽ chuyển qua trang thanh toán, tại đây có thể thanh toán bằng thẻ ngân hàng
+ Đơn đặt phòng loại này không thể hủy
+ Lưu ý, chúng tôi không hoàn trả tiền nên người dùng cần cân nhắc trước khi chọn phương thức thanh toán này
- Nếu chọn hình thức "Trực tiếp" và chọn nút "Đặt", người dùng sẽ được chuyển qua trang đơn đặt phòng "Chờ xác nhận" của bạn
+ Nếu đơn đặt phòng chưa được xác nhận thì người dùng có thể hủy đơn ấy tại đơn đặt phòng "Chờ xác nhận", chỉ đơn đặt phòng có phương thức thanh toán là "Trực tiếp" mới có thể hủy được
+ Nếu đơn đặt phòng đã được xác nhận thì người dùng không thể hủy đơn này nữa
- Người dùng có thể đánh giá khách sạn ở trong đơn đặt phòng "Đã hoàn thành", mỗi đơn đặt phòng sau khi kết thúc sẽ được chuyển qua "Đã hoàn thành" và chỉ có thể đánh giá một lần
- Đơn đặt phòng không thể thay đổi thông tin cho dù là ngày, thông tin người đặt hay thông tin phòng
- Website không hỗ trợ hoàn tiền cho bất kỳ trường hợp nào
- Phương thực thanh toán "Trực tiếp" chính là thanh toán trực tiếp tại khách sạn khi nhận phòng
- Phiếu giảm giá (Voucher) được sử dụng ở trang thông tin đơn đặt phòng và chỉ những phiếu giảm giá có giá nhỏ nhất để sử dụng phù hợp với giá của đơn mới được hiển thị
- Điểm (LuxuryPoint) được sử dụng ở trang thông tin đơn đặt phòng, mỗi 100.000 VNĐ đã sử dụng để đặt phòng thành công sẽ được tặng 1 điểm (có làm tròn xuống ở mỗi đơn), mỗi 1 điểm ứng với giảm 1.000 VNĐ và tối đa chỉ được sử dụng 200 điểm cho 1 đơn
- Lịch sử điểm hiển thị mô tả thông tin tăng hoặc giảm của điểm
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

// memory store (in-memory per session)
const chatSessions = {}; // key: userId or sessionId

export async function handleChat(sessionId, question) {
    if (!chatSessions[sessionId]) {
        chatSessions[sessionId] = {
            messages: [systemPrompt],
            previousIntent: null,
            previousQuestion: null
        };
    }

    const session = chatSessions[sessionId];
    let intent = detectIntent(question);

    if (intent === 'static' && session.previousIntent === 'cheapest_hotel') {
        question = session.previousQuestion + " " + question;
        intent = 'cheapest_hotel';
    }
    // add user's message
    session.messages.push({ role: "user", content: question });
    session.previousQuestion = question;
    session.previousIntent = intent;

    if (intent === 'cheapest_hotel') {
        session.previousIntent = 'cheapest_hotel';
        session.previousQuestion = question;
        const locationResponse = await locationService.getAllLocation();
        const locations = locationResponse.data;
        const locationName = locations.map(location => location.locationName);

        const questionLower = question.toLowerCase();
        const questionLocationName = locationName.find(loc =>
            questionLower.includes(loc.toLowerCase())
        );

        if (!questionLocationName) {
            const reply = 'Xin lỗi, tôi không nhận diện được địa điểm bạn muốn tìm khách sạn. Bạn có thể nói rõ hơn không?';
            session.messages.push({
                role: 'assistant',
                content: reply
            });
            return reply;
        } else {
            let filter = {}
            filter.filter = questionLocationName
            const response = await hotelService.userFilterHotel(filter);
            const hotelWithMinPrice = response.data.reduce((minHotel, currentHotel) => {
                return Number(currentHotel.minPrice) < Number(minHotel.minPrice) ? currentHotel : minHotel;
            });
            const formattedPrice = Number(hotelWithMinPrice.minPrice).toLocaleString('vi-VN') + ' VND';
            const reply = `Khách sạn rẻ nhất ở ${questionLocationName} trong hôm nay khi ở 1 người lớn và 1 phòng là ${hotelWithMinPrice.hotelName} với giá ${formattedPrice}.`;
            session.previousIntent = 'static';
            session.messages.push({
                role: 'assistant',
                content: reply
            });
            return reply;
        }
    }

    // send to OpenAI
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // or 'gpt-4'
        messages: session.messages
    });
    //console.log(response.choices[0].message.content)


    // add assistant reply to history
    const assistantReply = response.choices[0].message.content;
    session.messages.push({ role: "assistant", content: assistantReply });

    // console.log(session.messages)
    // console.log(response.choices[0].message.content)
    // console.log(assistantReply)
    return assistantReply;
}

export const chatbotController = async (req, res) => {
    const { sessionId, question } = req.body;

    try {
        const reply = await handleChat(sessionId, question);
        res.json({ answer: reply });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error contacting OpenAI.");
    }
}