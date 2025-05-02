const momoConfig = {
    partnerCode: 'MOMO',
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    requestType: 'payWithMethod',
    //redirectUrl: 'https://be-hote-luxury.vercel.app/booking/momo_return',
    redirectUrl: 'http://localhost:9000/booking/momo_return',
    //ipnUrl: 'https://be-hote-luxury.vercel.app/booking/momo_ipn',
    ipnUrl: 'http://localhost:9000/booking/momo_ipn',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
};

export default momoConfig;