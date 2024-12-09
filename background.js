// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(`======接收到获取${request.url}的cookie请求======`);
    console.log(`======获取${request.url}的cookie名称:${request.name}======`);
    if (request.action === "getCookie") {
        let cookieNames = request.name.split(',');
        let cookieValues = {};
        let cookieCount = 0;
        let cookieTotal = cookieNames.length;
        for (let i = 0; i < cookieTotal; i++) {
            const cookie = cookieNames[i];
            // 获取指定URL和名称的cookie值
            chrome.cookies.get({ url: request.url, name: cookie }, function(cookie) {
                if (cookie) {
                    console.log(`======获取到${request.url}的cookie:${cookie.name}======`);
                    console.log(`======${request.url} ${cookie.name}:${cookie.value}`);
                    cookieValues[cookie.name] = cookie.value;
                } else {
                    console.log(`======未获取到${request.url}的cookie:${cookie.name}======`);
                    cookieValues[cookie.name] = null;
                }
                cookieCount++;
                console.log(`======cookieCount:${cookieCount} cookieTotal:${cookieTotal}======`);
                if (cookieCount === cookieTotal) {
                    console.log(`======响应${request.url}的cookie: ${JSON.stringify(cookieValues)}======`);
                    sendResponse({ cookieValues: cookieValues });
                }
            });
            
        }
        // 返回true表示异步响应
        return true;
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getOrigin") {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length > 0) {
                let tab = tabs[0];
                let url = new URL(tab.url);
                let origin = url.origin;
                console.log('Current tab origin:', origin);
                sendResponse({ origin: origin });
            } else {
                sendResponse({ origin: null });
            }
        });
        return true; // 返回true表示异步响应
    }
});