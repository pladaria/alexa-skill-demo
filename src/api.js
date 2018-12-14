const fetch = require('node-fetch').default;

module.exports.apiCall = async (method, params = {}) => {
    const deviceFamily = 'wbteNCLH4mncE2ffKH35wvWlAEHIuWUTT8EfQu5K';
    const installationId = 'testinginstallationid';
    const user = process.env.USER;
    const pass = process.env.PASS;

    const res = await fetch('https://api-msngr.tuenti.com/index.msngr.php', {
        method: 'POST',
        headers: {
            'X-Tuenti-Authentication': `user=${user},password=${pass},installation-id=${installationId},device-family=${deviceFamily}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: 'msngr-3',
            requests: [[method, params]],
            screen: 'xhdpi'
        })
    });

    const data = await res.json();
    console.log({ method, params, response: data[0] });

    return data[0];
};
