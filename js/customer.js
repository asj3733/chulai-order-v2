/* ==================================================
   🍜 初萊食麵｜客戶查詢系統
   customer.js 完整新版
================================================== */


/* ==================================================
   🔗 GAS API
================================================== */

const CUSTOMER_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwFD8XzZCmF7AKly_L0LDqA5JoERcg0eex2PzQFU4n_aBWqw9GJsRV-4XcMM_GLET8MLw/exec";


/* ==================================================
   DOM
================================================== */

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

const resultSection =
    document.getElementById(
        "customer-result"
    );

const notFoundSection =
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


/* ==================================================
   HTML 防注入
================================================== */

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


/* ==================================================
   清理手機號碼
================================================== */

function cleanPhone(
    phone
) {

    return String(
        phone || ""
    )

    .replace(
        /\D/g,
        ""
    )

    .slice(
        0,
        10
    );

}


/* ==================================================
   手機輸入限制
================================================== */

if (
    phoneInput
) {

    phoneInput.addEventListener(

        "input",

        function() {

            this.value =
                cleanPhone(
                    this.value
                );


            if (
                phoneError
            ) {

                phoneError.style.display =
                    "none";

                phoneError.textContent =
                    "";

            }

        }

    );

}


/* ==================================================
   顯示錯誤
================================================== */

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


/* ==================================================
   隱藏結果
================================================== */

function hideResults() {

    if (
        resultSection
    ) {

        resultSection.style.display =
            "none";

    }


    if (
        notFoundSection
    ) {

        notFoundSection.style.display =
            "none";

    }

}


/* ==================================================
   顯示查詢結果
================================================== */

function showResult(
    data
) {

    if (
        !resultSection
    ) {

        return;

    }


    const order =
        data.order ||
        {};


    /* ================================================
       姓名
    ================================================ */

    if (
        resultName
    ) {

        resultName.textContent =

            "歡迎回來，" +

            (
                order.name ||
                "顧客"
            );

    }


    if (
        resultMessage
    ) {

        resultMessage.textContent =

            "這是您最近一次的訂單紀錄";

    }


    /* ================================================
       訂單次數
       
       目前後端回傳的是最後一筆
       因此這裡顯示「最近一筆」
    ================================================ */

    if (
        orderCount
    ) {

        orderCount.textContent =
            "1";

    }


    /* ================================================
       最近訂單時間
    ================================================ */

    if (
        lastOrderTime
    ) {

        lastOrderTime.textContent =

            order.date ||

            "-";

    }


    /* ================================================
       商品
    ================================================ */

    let itemsHTML =
        "";


    if (
        Array.isArray(
            order.items
        ) &&
        order.items.length > 0
    ) {

        itemsHTML =

            order.items

                .map(

                    function(item) {

                        return `

                            <div class="customer-item-row">

                                <span>

                                    🍜

                                    ${escapeHTML(
                                        item.name
                                    )}

                                    ×

                                    ${Number(
                                        item.qty ||
                                        1
                                    )}

                                </span>

                            </div>

                        `;

                    }

                )

                .join(
                    ""
                );

    }

    else if (
        order.itemsText
    ) {

        itemsHTML = `

            <div class="customer-items-text">

                ${escapeHTML(
                    order.itemsText
                )}

            </div>

        `;

    }

    else {

        itemsHTML =

            "目前沒有商品資料";

    }


    /* ================================================
       訂單資訊
    ================================================ */

    if (
        lastOrderContent
    ) {

        lastOrderContent.innerHTML = `

            <div class="customer-order-detail">

                <div class="customer-detail-row">

                    <span>🆔 訂單編號</span>

                    <strong>

                        ${escapeHTML(
                            order.orderId ||
                            "-"
                        )}

                    </strong>

                </div>


                <div class="customer-detail-row">

                    <span>📅 訂單時間</span>

                    <strong>

                        ${escapeHTML(
                            order.date ||
                            "-"
                        )}

                    </strong>

                </div>


                <div class="customer-detail-row">

                    <span>🍽 取餐方式</span>

                    <strong>

                        ${escapeHTML(
                            order.orderType ||
                            "-"
                        )}

                    </strong>

                </div>


                ${
                    order.pickupMode
                    ? `

                    <div class="customer-detail-row">

                        <span>⏰ 取餐模式</span>

                        <strong>

                            ${escapeHTML(
                                order.pickupMode
                            )}

                        </strong>

                    </div>

                    `
                    : ""
                }


                ${
                    order.pickupDate
                    ? `

                    <div class="customer-detail-row">

                        <span>📅 預約日期</span>

                        <strong>

                            ${escapeHTML(
                                order.pickupDate
                            )}

                        </strong>

                    </div>

                    `
                    : ""
                }


                ${
                    order.pickupTime
                    ? `

                    <div class="customer-detail-row">

                        <span>⏰ 預約時間</span>

                        <strong>

                            ${escapeHTML(
                                order.pickupTime
                            )}

                        </strong>

                    </div>

                    `
                    : ""
                }


                ${
                    order.tableware
                    ? `

                    <div class="customer-detail-row">

                        <span>🍴 餐具</span>

                        <strong>

                            ${escapeHTML(
                                order.tableware
                            )}

                        </strong>

                    </div>

                    `
                    : ""
                }


                <div class="customer-order-items">

                    <h4>

                        🍜 訂購餐點

                    </h4>

                    ${itemsHTML}

                </div>


                <div class="customer-detail-row customer-total-row">

                    <span>💰 訂單金額</span>

                    <strong>

                        NT$${Number(
                            order.total ||
                            0
                        )}

                    </strong>

                </div>


                ${
                    order.note
                    ? `

                    <div class="customer-note">

                        📝 備註：

                        ${escapeHTML(
                            order.note
                        )}

                    </div>

                    `
                    : ""
                }


                <div class="customer-status">

                    📌 訂單狀態：

                    <strong>

                        ${escapeHTML(
                            order.status ||
                            "新訂單"
                        )}

                    </strong>

                </div>

            </div>

        `;

    }


    /* ================================================
       常點餐點
       
       目前只取得最後一筆
       所以先顯示最近訂購餐點
    ================================================ */

    if (
        favoriteItems
    ) {

        if (
            Array.isArray(
                order.items
            ) &&
            order.items.length > 0
        ) {

            favoriteItems.innerHTML =

                order.items

                    .map(

                        function(item) {

                            return `

                                <span class="favorite-item">

                                    ⭐

                                    ${escapeHTML(
                                        item.name
                                    )}

                                </span>

                            `;

                        }

                    )

                    .join(
                        ""
                    );

        }

        else {

            favoriteItems.textContent =
                "尚無資料";

        }

    }


    resultSection.style.display =
        "block";


    if (
        notFoundSection
    ) {

        notFoundSection.style.display =
            "none";

    }


    resultSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


/* ==================================================
   查無訂單
================================================== */

function showNotFound(
    message
) {

    if (
        resultSection
    ) {

        resultSection.style.display =
            "none";

    }


    if (
        notFoundSection
    ) {

        notFoundSection.style.display =
            "block";

    }


    if (
        message
    ) {

        const p =
            notFoundSection.querySelector(
                "p"
            );


        if (
            p
        ) {

            p.innerHTML =

                escapeHTML(
                    message
                ) +

                "<br><br>歡迎開始您的第一筆訂單！";

        }

    }


    if (
        notFoundSection
    ) {

        notFoundSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


/* ==================================================
   查詢訂單
================================================== */

async function searchCustomerOrder() {

    const phone =
        phoneInput
            ? cleanPhone(
                phoneInput.value
            )
            : "";


    /* ================================================
       驗證手機
    ================================================ */

    if (
        !/^09\d{8}$/.test(
            phone
        )
    ) {

        showError(
            "請輸入正確的 10 位數手機號碼"
        );


        if (
            phoneInput
        ) {

            phoneInput.focus();

        }


        return;

    }


    hideResults();


    if (
        phoneError
    ) {

        phoneError.style.display =
            "none";

    }


    /* ================================================
       查詢按鈕 Loading
    ================================================ */

    const originalText =

        searchBtn

            ? searchBtn.textContent

            : "🔍 查詢我的紀錄";


    if (
        searchBtn
    ) {

        searchBtn.disabled =
            true;

        searchBtn.textContent =
            "⏳ 查詢中...";

    }


    try {

        const url =

            CUSTOMER_SCRIPT_URL +

            "?action=findLastOrder&phone=" +

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

                "伺服器連線失敗"

            );

        }


        const result =

            await response.json();


        console.log(

            "客戶查詢結果：",

            result

        );


        if (
            result.success &&
            result.order
        ) {

            showResult(
                result
            );

        }

        else {

            showNotFound(

                result.message ||

                "找不到此手機號碼的訂單紀錄"

            );

        }

    }

    catch (
        error
    ) {

        console.error(

            "查詢失敗：",

            error

        );


        showError(

            "查詢失敗，請確認網路連線後再試一次"

        );

    }

    finally {

        if (
            searchBtn
        ) {

            searchBtn.disabled =
                false;

            searchBtn.textContent =
                originalText;

        }

    }

}


/* ==================================================
   查詢按鈕
================================================== */

if (
    searchBtn
) {

    searchBtn.addEventListener(

        "click",

        searchCustomerOrder

    );

}


/* ==================================================
   Enter 查詢
================================================== */

if (
    phoneInput
) {

    phoneInput.addEventListener(

        "keydown",

        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                searchCustomerOrder();

            }

        }

    );

}


/* ==================================================
   初始化
================================================== */

console.log(

    "🍜 初萊食麵 customer.js 已載入"

);