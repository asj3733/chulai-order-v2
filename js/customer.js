/* =========================================
   初萊食麵
   customer.js
   客戶查詢正式版
========================================= */


/* =========================================
   GAS API
========================================= */

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwFD8XzZCmF7AKly_L0LDqA5JoERcg0eex2PzQFU4n_aBWqw9GJsRV-4XcMM_GLET8MLw/exec";


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


const customerResult =
    document.getElementById(
        "customer-result"
    );


const customerNotFound =
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
   手機號碼格式整理
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


    /*
        886912345678
        →
        0912345678
    */

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


    /*
        912345678
        →
        0912345678
    */

    if (

        value.length === 9

        &&

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
   顯示錯誤
========================================= */

function showError(
    message
) {


    if (
        phoneError
    ) {


        phoneError.textContent =
            message;


        phoneError.style.display =
            "block";

    }

}


/* =========================================
   清除錯誤
========================================= */

function clearError() {


    if (
        phoneError
    ) {


        phoneError.textContent =
            "";


        phoneError.style.display =
            "none";

    }

}


/* =========================================
   顯示客戶資料
========================================= */

function showCustomerResult(
    customer
) {


    /*
        隱藏查無資料
    */

    if (
        customerNotFound
    ) {


        customerNotFound.style.display =
            "none";

    }


    /*
        顯示結果
    */

    if (
        customerResult
    ) {


        customerResult.style.display =
            "block";

    }


    /*
        姓名
    */

    if (
        resultName
    ) {


        resultName.textContent =

            "👋 歡迎回來，"

            +

            (

                customer.name

                ||

                "熟客"

            );

    }


    /*
        歡迎訊息
    */

    if (
        resultMessage
    ) {


        resultMessage.textContent =

            "很高興再次見到您 ❤️";

    }


    /*
        訂單次數
    */

    if (
        orderCount
    ) {


        orderCount.textContent =

            customer.orderCount

            ||

            "0";

    }


    /*
        最後訂單時間
    */

    if (
        lastOrderTime
    ) {


        lastOrderTime.textContent =

            customer.lastOrderTime

            ||

            "尚無資料";

    }


    /*
        最後訂單內容
    */

    if (
        lastOrderContent
    ) {


        lastOrderContent.textContent =

            customer.lastOrderContent

            ||

            "尚無資料";

    }


    /*
        常點餐點
    */

    if (
        favoriteItems
    ) {


        favoriteItems.textContent =

            customer.favoriteItems

            ||

            "尚無資料";

    }


    /*
        滾動到結果
    */

    setTimeout(

        function() {


            if (
                customerResult
            ) {


                customerResult.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"

                });

            }

        },

        200

    );

}


/* =========================================
   顯示查無資料
========================================= */

function showCustomerNotFound() {


    /*
        隱藏成功結果
    */

    if (
        customerResult
    ) {


        customerResult.style.display =
            "none";

    }


    /*
        顯示查無資料
    */

    if (
        customerNotFound
    ) {


        customerNotFound.style.display =
            "block";


        customerNotFound.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });

    }

}


/* =========================================
   查詢客戶
========================================= */

async function searchCustomer() {


    clearError();


    /*
        隱藏舊結果
    */

    if (
        customerResult
    ) {


        customerResult.style.display =
            "none";

    }


    if (
        customerNotFound
    ) {


        customerNotFound.style.display =
            "none";

    }


    /*
        取得電話
    */

    const phone =

        normalizePhone(

            phoneInput

                ?

            phoneInput.value

                :

            ""

        );


    /*
        電話驗證
    */

    if (
        !/^09\d{8}$/.test(
            phone
        )
    ) {


        showError(

            "📱 請輸入正確的手機號碼，例如 0903392687"

        );


        if (
            phoneInput
        ) {


            phoneInput.focus();

        }


        return;

    }


    /*
        查詢中
    */

    if (
        searchBtn
    ) {


        searchBtn.disabled =
            true;


        searchBtn.textContent =
            "🔍 查詢中...";

    }


    try {


        /*
            建立 API 網址
        */

        const queryURL =

            SCRIPT_URL

            +

            "?action=customerQuery&phone="

            +

            encodeURIComponent(
                phone
            );


        /*
            呼叫 GAS
        */

        const response =

            await fetch(
                queryURL
            );


        /*
            HTTP 錯誤
        */

        if (
            !response.ok
        ) {


            throw new Error(

                "GAS API 連線失敗"

            );

        }


        /*
            取得 JSON
        */

        const data =

            await response.json();


        /*
            API 回傳錯誤
        */

        if (
            !data.success
        ) {


            throw new Error(

                data.message

                ||

                "查詢失敗"

            );

        }


        /*
            找到客戶
        */

        if (

            data.found === true

            &&

            data.customer

        ) {


            showCustomerResult(

                data.customer

            );

        }


        /*
            查無客戶
        */

        else {


            showCustomerNotFound();

        }


    }


    catch (
        error
    ) {


        console.error(

            "❌ 客戶查詢錯誤：",

            error

        );


        showError(

            "⚠️ 查詢失敗，請確認網路連線後再試一次。"

        );

    }


    finally {


        /*
            恢復按鈕
        */

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
   查詢按鈕
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


    /*
        只允許數字
    */

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
   初始化
========================================= */

console.log(

    "🍜 初萊食麵 customer.js 正式版已載入"

);