const momoConfig = {
    partnerCode: 'MOMO',
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    requestType: 'payWithMethod',
    redirectUrl: 'http://localhost:9000/booking/momo_return',
    ipnUrl: 'http://localhost:9000/booking/momo_ipn',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
};

export default momoConfig;