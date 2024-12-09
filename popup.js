
let sourceUrl = document.querySelector("#sourceUrl");
let targetUrl = document.querySelector("#targetUrl");
let cookies = document.querySelector("#cookies");
let tip = document.querySelector("#tips");

// 当输入值改变时保存到存储中
sourceUrl.addEventListener('change', function() {
    chrome.storage.local.set({ sourceUrl: sourceUrl.value });
});

targetUrl.addEventListener('change', function() {
    chrome.storage.local.set({ targetUrl: targetUrl.value });
});

cookies.addEventListener('change', function() {
    chrome.storage.local.set({ cookies: cookies.value });
});

// 页面加载时从存储中获取之前的值
chrome.storage.local.get(['sourceUrl', 'targetUrl', 'cookies'], function(result) {
    if (result.sourceUrl) sourceUrl.value = result.sourceUrl;
    if (result.targetUrl) targetUrl.value = result.targetUrl;
    if (result.cookies) cookies.value = result.cookies;
});

chrome.runtime.sendMessage({ action: "getOrigin" }, function (response) {
    console.log(`======获取当前标签页的origin:${response.origin}======`);
    if (response.origin) {
        targetUrl.value = response.origin;
    }
});

document.getElementById('getCookieButton').addEventListener('click', function () {
    // 发送消息到background脚本，请求获取cookie
    console.log(`======正在获取目标网站${targetUrl.value}的cookie======`);
    chrome.runtime.sendMessage({
        action: "getCookie",
        url: sourceUrl.value,
        name: cookies.value
    }, function (response) {
        console.log(`======获取到源网站${sourceUrl.value}的cookie: ${JSON.stringify(response)}======`);
        console.log(response.cookieValues);
        for (const key in response.cookieValues) {
            console.log(key);
            if (Object.prototype.hasOwnProperty.call(response.cookieValues, key)) {
                const cookie = response.cookieValues[key];
                console.log(`======${sourceUrl.value} ${key}:${cookie}`);
                chrome.cookies.set({
                    url: targetUrl.value,
                    name: key,
                    value: cookie
                }, (data) => {
                    console.log(`======设置目标网站${targetUrl.value}的cookie: yht_access_token======`);
                    console.log(`======${targetUrl.value} yht_access_token:${data.value}`);
                    let pTip = document.createElement('p');

                    if (data.value) {
                        pTip.innerHTML = `获取${key}成功`;
                    } else {
                        pTip.innerHTML = `获取${key}失败`;
                    }
                    tip.appendChild(pTip);
                    setTimeout(() => {
                        tip.removeChild(pTip);
                    }, 3000);
                });
            }
        }

    });
});