/* =========================================
   🍜 初萊食麵
   客戶查詢系統
========================================= */


/* =========================================
   GAS API
   請放目前最新的 GAS /exec
========================================= */

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwde83nn5kmPM2zeZZ2mEZLQTBtZPFTYfvoSsqIClwkMV3voJCO4KUgvLquQQ7am1Nl_Q/exec";


/* =========================================
   DOM
========================================= */

const phoneInput =
    document.getElementById(
        "customer-phone"
    );


const searchBtn =
    document.getElementById(
        "customer-search-btn"
    );


const phoneError =
    document.getElementById(
        "phone-error"
    );


const resultBox =
    document.getElementById(
        "customer-result"
    );


const notFoundBox =
    document.getElementById(
        "customer-not-found"
    );


const resultName =
    document.getElementById(
        "result-name"
    );


const resultMessage =
    document.getElementById(
        "result-message"
    );


const orderCount =
    document.getElementById(
        "order-count"
    );


const lastOrderTime =
    document.getElementById(
        "last-order-time"
    );


const lastOrderContent =
    document.getElementById(
        "last-order-content"
    );


const favoriteItems =
    document.getElementById(
        "favorite-items"
    );


/* =========================================
   電話標準化
========================================= */

function normalizePhone(
    phone
) {

    let value =
        String(
            phone || ""
        );

    /*
        移除所有非數字
    */

    value =
        value.replace(
            /\D/g,
            ""
        );


    /*
        如果是台灣手機
        090xxxxxxxx
        統一轉成
        9xxxxxxxx
    */

    if (
        value.startsWith("8869")
    ) {

        value =
            value.substring(2);

    }


    if (
        value.startsWith("09")
    ) {

        value =
            value.substring(1);

    }


    return value;

}


/* =========================================
   顯示錯誤
========================================= */

function showError(
    message
) {

    if (!phoneError) {
        return;
    }


    phoneError.textContent =
        message;


    phoneError.style.display =
        "block";

}


/* =========================================
   清除錯誤
========================================= */

function clearError() {

    if (phoneError) {

        phoneError.textContent =
            "";

        phoneError.style.display =
            "none";

    }

}


/* =========================================
   HTML 防護
========================================= */

function escapeHTML(
    text
) {

    return String(
        text || ""
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
   電話輸入
========================================= */

if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        function() {

            this.value =
                this.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    10
                );

            clearError();

        }
    );

}


/* =========================================
   查詢
========================================= */

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchCustomer
    );

}


/* =========================================
   執行客戶查詢
========================================= */

async function searchCustomer() {


    clearError();


    if (!phoneInput) {
        return;
    }


    const rawPhone =
        phoneInput.value.trim();


    const phone =
        normalizePhone(
            rawPhone
        );


    /*
        台灣手機驗證
    */

    if (
        !/^9\d{8}$/.test(
            phone
        )
    ) {

        showError(
            "📱 請輸入正確的手機號碼，例如 0912345678"
        );

        phoneInput.focus();

        return;

    }


    if (
        !SCRIPT_URL ||
        SCRIPT_URL.includes(
            "請貼上"
        )
    ) {

        showError(
            "⚠️ 尚未設定查詢 API"
        );

        return;

    }


    /*
        查詢中
    */

    searchBtn.disabled =
        true;


    searchBtn.textContent =
        "🔍 查詢中...";


    if (resultBox) {

        resultBox.style.display =
            "none";

    }


    if (notFoundBox) {

        notFoundBox.style.display =
            "none";

    }


    try {


        /*
            使用 GET 查詢

            action:
            customerQuery

            phone:
            標準化電話
        */

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


        const data =
            await response.json();


        console.log(
            "客戶查詢結果：",
            data
        );


        if (
            data.success &&
            data.found
        ) {

            showCustomerResult(
                data
            );

        }

        else {

            showNotFound();

        }


    }

    catch (
        error
    ) {


        console.error(
            "客戶查詢錯誤：",
            error
        );


        showError(
            "⚠️ 查詢失敗，請稍後再試一次"
        );

    }


    finally {

        searchBtn.disabled =
            false;

        searchBtn.textContent =
            "🔍 查詢我的紀錄";

    }

}


/* =========================================
   顯示客戶資料
========================================= */

function showCustomerResult(
    data
) {


    if (notFoundBox) {

        notFoundBox.style.display =
            "none";

    }


    if (resultBox) {

        resultBox.style.display =
            "block";

    }


    const customer =
        data.customer ||
        data;


    const name =
        customer.name ||
        "貴賓";


    const count =
        customer.orderCount ||
        customer.orderCount === 0
            ? customer.orderCount
            : 0;


    const lastTime =
        customer.lastOrderTime ||
        "-";


    const lastContent =
        customer.lastOrderContent ||
        "-";


    const favorites =
        customer.favoriteItems ||
        customer.favorite ||
        "尚無資料";


    if (resultName) {

        resultName.textContent =
            `👋 ${name}，歡迎回來`;

    }


    if (resultMessage) {

        resultMessage.textContent =
            `您已經是初萊食麵的熟客了 ❤️`;

    }


    if (orderCount) {

        orderCount.textContent =
            count;

    }


    if (lastOrderTime) {

        lastOrderTime.textContent =
            formatDate(
                lastTime
            );

    }


    if (lastOrderContent) {

        lastOrderContent.innerHTML =
            escapeHTML(
                lastContent
            );

    }


    if (favoriteItems) {

        favoriteItems.innerHTML =
            escapeHTML(
                favorites
            );

    }

}


/* =========================================
   查無資料
========================================= */

function showNotFound() {


    if (resultBox) {

        resultBox.style.display =
            "none";

    }


    if (notFoundBox) {

        notFoundBox.style.display =
            "block";

    }

}


/* =========================================
   日期格式
========================================= */

function formatDate(
    value
) {


    if (
        !value ||
        value === "-"
    ) {

        return "-";

    }


    try {

        const date =
            new Date(
                value
            );


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );

        }


        return date.toLocaleDateString(
            "zh-TW",
            {

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"

            }
        );

    }

    catch (
        error
    ) {

        return String(
            value
        );

    }

}