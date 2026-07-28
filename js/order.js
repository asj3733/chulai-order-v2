/* =========================================
   初萊食麵
   點餐頁｜回頭客查詢
   使用正式 Customer Query GAS
========================================= */

const CUSTOMER_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbza3pmlU-MY4VZWU8gE3dSVxKVqpW3D9jia7ZlH3X7CWPNLtu96f1TE2YNGnCDKKdCD/exec";


const welcomePhone =
    document.getElementById("welcome-phone");


const welcomeSearchBtn =
    document.getElementById("welcome-search-btn");


const welcomeResult =
    document.getElementById("welcome-result");


/* =========================================
   手機號碼格式整理
========================================= */

function normalizeCustomerPhone(phone) {

    let value =
        String(phone || "")
        .replace(/\D/g, "");

    if (value.startsWith("886")) {

        value =
            "0" +
            value.substring(3);

    }

    if (
        value.length === 9 &&
        value.startsWith("9")
    ) {

        value =
            "0" +
            value;

    }

    return value;

}


/* =========================================
   HTML 安全處理
========================================= */

function escapeCustomerText(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   查詢按鈕
========================================= */

if (welcomeSearchBtn) {

    welcomeSearchBtn.addEventListener(
        "click",
        searchWelcomeCustomer
    );

}


/* =========================================
   電話輸入
========================================= */

if (welcomePhone) {

    welcomePhone.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                .replace(/\D/g, "")
                .slice(0, 10);

        }
    );


    welcomePhone.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                searchWelcomeCustomer();

            }

        }
    );

}


/* =========================================
   客戶查詢
========================================= */

async function searchWelcomeCustomer() {

    if (
        !welcomePhone ||
        !welcomeResult
    ) {

        return;

    }


    const phone =
        normalizeCustomerPhone(
            welcomePhone.value
        );


    /* =====================================
       電話驗證
    ===================================== */

    if (
        !/^09\d{8}$/.test(phone)
    ) {

        welcomeResult.style.display =
            "block";


        welcomeResult.innerHTML = `

            <div class="welcome-error">

                📱 請輸入正確的手機號碼

            </div>

        `;


        return;

    }


    /* =====================================
       查詢中
    ===================================== */

    welcomeSearchBtn.disabled =
        true;


    welcomeSearchBtn.textContent =
        "🔍 查詢中...";


    welcomeResult.style.display =
        "block";


    welcomeResult.innerHTML = `

        <div class="welcome-loading">

            🔍 正在查詢您的訂單紀錄...

        </div>

    `;


    try {

        const url =

            CUSTOMER_SCRIPT_URL

            +

            "?action=customerQuery&phone="

            +

            encodeURIComponent(phone);


        console.log(
            "正式客戶查詢 API：",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "API 連線失敗"
            );

        }


        const data =
            await response.json();


        console.log(
            "正式客戶查詢結果：",
            data
        );


        /* =================================
           找到客戶
        ================================= */

        if (
            data.success &&
            data.found &&
            data.customer
        ) {

            const customer =
                data.customer;


            /* 儲存資料 */

            localStorage.setItem(
                "customerName",
                customer.name || ""
            );


            localStorage.setItem(
                "customerPhone",
                customer.phone || phone
            );


            /* 顯示回頭客 */

            welcomeResult.innerHTML = `

                <div class="welcome-success">

                    <h3>

                        👋 歡迎回來，
                        ${escapeCustomerText(
                            customer.name || "貴賓"
                        )}！

                    </h3>


                    <p>

                        很高興再次為您服務 ❤️

                    </p>


                    <div class="last-order-box">

                        <strong>
                            📋 最近一次訂單
                        </strong>


                        <div class="last-order-text">

                            ${escapeCustomerText(
                                customer.lastOrderContent ||
                                "目前沒有訂單內容"
                            )}

                        </div>

                    </div>


                    <div class="customer-order-info">

                        🍜 累計訂單：
                        <strong>
                            ${customer.orderCount || 0}
                        </strong>
                        次

                        <br>

                        🕒 最近訂單：

                        ${escapeCustomerText(
                            customer.lastOrderTime ||
                            "尚無資料"
                        )}

                    </div>


                    <div class="customer-favorite-info">

                        ⭐ 常點餐點

                        <br>

                        ${escapeCustomerText(
                            customer.favoriteItems ||
                            "尚無資料"
                        )}

                    </div>


                </div>

            `;

        }


        /* =================================
           第一次訂餐
        ================================= */

        else {

            welcomeResult.innerHTML = `

                <div class="welcome-new">

                    <h3>

                        👋 歡迎來到初萊食麵！

                    </h3>


                    <p>

                        這是您第一次使用線上點餐，

                        請開始選擇您喜歡的餐點 🍜

                    </p>

                </div>

            `;

        }


    }

    catch (error) {

        console.error(
            "客戶查詢錯誤：",
            error
        );


        welcomeResult.innerHTML = `

            <div class="welcome-error">

                ⚠️ 客戶資料查詢失敗

                <br><br>

                請稍後再試一次。

            </div>

        `;

    }

    finally {

        if (welcomeSearchBtn) {

            welcomeSearchBtn.disabled =
                false;


            welcomeSearchBtn.textContent =
                "🔍 查詢";

        }

    }

}


/* =========================================
   初始化
========================================= */

console.log(
    "🍜 初萊食麵｜正式客戶查詢系統已載入"
);