/* =========================================
   初萊食麵 V4
   客戶查詢正式版
========================================= */


/* =========================================
   GAS API
========================================= */

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbza3pmlU-MY4VZWU8gE3dSVxKVqpW3D9jia7ZlH3X7CWPNLtu96f1TE2YNGnCDKKdCD/exec";


/* =========================================
   DOM
========================================= */

const phoneInput =
    document.getElementById(
        "customer-phone"
    );


const searchBtn =
    document.getElementById(
        "search-customer-btn"
    );


const resultBox =
    document.getElementById(
        "customer-result"
    );


/* =========================================
   電話格式
========================================= */

function normalizePhone(
    phone
) {

    let value =
        String(
            phone ||
            ""
        )

        .replace(
            /\D/g,
            ""
        );


    if (
        value.startsWith(
            "886"
        )
    ) {

        value =
            "0" +
            value.substring(
                3
            );

    }


    if (
        value.length === 9 &&
        value.startsWith(
            "9"
        )
    ) {

        value =
            "0" +
            value;

    }


    return value;

}


/* =========================================
   顯示查詢結果
========================================= */

function showResult(
    data
) {


    if (
        !resultBox
    ) {

        return;

    }


    if (
        !data.found
    ) {


        resultBox.innerHTML = `

            <div class="customer-empty">

                <div class="customer-result-icon">
                    🔍
                </div>

                <h2>
                    尚未找到訂單紀錄
                </h2>

                <p>
                    這個手機號碼目前還沒有在初萊食麵留下訂單。
                </p>

                <a
                    href="order.html"
                    class="customer-order-btn">

                    🍜 開始第一次點餐

                </a>

            </div>

        `;


        resultBox.style.display =
            "block";


        return;

    }


    const customer =
        data.customer;


    const orderCount =
        Number(
            customer.orderCount ||
            0
        );


    const lastOrderTime =
        customer.lastOrderTime ||
        "尚無資料";


    const lastOrderContent =
        customer.lastOrderContent ||
        "尚無資料";


    const favoriteItems =
        customer.favoriteItems ||
        "尚無資料";


    resultBox.innerHTML = `

        <div class="customer-success">

            <div class="customer-result-icon">
                🎉
            </div>


            <h2>

                👋 歡迎回來，
                ${escapeHTML(
                    customer.name
                )}

            </h2>


            <p class="customer-welcome">

                感謝您再次光臨
                <strong>
                    初萊食麵
                </strong>
                ❤️

            </p>


            <div class="customer-stats">


                <div class="customer-stat-card">

                    <span>
                        🍜
                    </span>

                    <strong>
                        第 ${orderCount} 次
                    </strong>

                    <small>
                        累計訂單
                    </small>

                </div>


                <div class="customer-stat-card">

                    <span>
                        🕒
                    </span>

                    <strong>
                        ${escapeHTML(
                            lastOrderTime
                        )}
                    </strong>

                    <small>
                        最近訂單
                    </small>

                </div>


            </div>


            <div class="customer-info-card">

                <h3>
                    📋 最近一次訂單
                </h3>

                <p>
                    ${escapeHTML(
                        lastOrderContent
                    )}
                </p>

            </div>


            <div class="customer-info-card">

                <h3>
                    ⭐ 常點餐點
                </h3>

                <p>
                    ${escapeHTML(
                        favoriteItems
                    )}
                </p>

            </div>


            <a
                href="order.html"
                class="customer-order-btn">

                🍜 再點一次

            </a>


        </div>

    `;


    resultBox.style.display =
        "block";


    resultBox.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });

}


/* =========================================
   查詢客戶
========================================= */

async function searchCustomer() {


    if (
        !phoneInput
    ) {

        return;

    }


    const phone =
        normalizePhone(
            phoneInput.value
        );


    if (
        !/^09\d{8}$/.test(
            phone
        )
    ) {


        alert(
            "📱 請輸入正確的手機號碼"
        );


        phoneInput.focus();


        return;

    }


    if (
        searchBtn
    ) {

        searchBtn.disabled =
            true;


        searchBtn.textContent =
            "🔍 查詢中...";

    }


    if (
        resultBox
    ) {

        resultBox.style.display =
            "block";


        resultBox.innerHTML = `

            <div class="customer-loading">

                <div class="loading-icon">
                    🔍
                </div>

                <p>
                    正在查詢您的訂單紀錄...
                </p>

            </div>

        `;

    }


    try {


        const url =

            SCRIPT_URL

            +

            "?action=customerQuery&phone="

            +

            encodeURIComponent(
                phone
            );


        const response =
            await fetch(
                url
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "API 連線失敗"
            );

        }


        const data =
            await response.json();


        console.log(
            "客戶查詢結果：",
            data
        );


        if (
            !data.success
        ) {

            throw new Error(

                data.message
                ||
                "查詢失敗"

            );

        }


        showResult(
            data
        );


    }

    catch (
        error
    ) {


        console.error(
            "客戶查詢錯誤：",
            error
        );


        if (
            resultBox
        ) {

            resultBox.innerHTML = `

                <div class="customer-error">

                    <div class="customer-result-icon">
                        ⚠️
                    </div>

                    <h2>
                        查詢失敗
                    </h2>

                    <p>
                        請確認網路連線後再試一次。
                    </p>

                </div>

            `;

        }

    }

    finally {


        if (
            searchBtn
        ) {

            searchBtn.disabled =
                false;


            searchBtn.textContent =
                "🔍 查詢我的紀錄";

        }

    }

}


/* =========================================
   按鈕
========================================= */

if (
    searchBtn
) {


    searchBtn.addEventListener(

        "click",

        searchCustomer

    );

}


/* =========================================
   Enter 查詢
========================================= */

if (
    phoneInput
) {


    phoneInput.addEventListener(

        "keydown",

        function(
            event
        ) {


            if (
                event.key ===
                "Enter"
            ) {


                event.preventDefault();


                searchCustomer();

            }

        }

    );

}


/* =========================================
   防止 HTML 注入
========================================= */

function escapeHTML(
    text
) {


    return String(
        text ||
        ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================
   初始化
========================================= */

console.log(
    "🍜 初萊食麵 V4 customer.js 已載入"
);