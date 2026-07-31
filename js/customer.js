/* ==================================================
   🍜 初萊食麵｜客戶查詢系統 V2
================================================== */


/* ==================================================
   🔗 GAS API
================================================== */

const SCRIPT_URL =
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


const loading =
    document.getElementById(
        "customer-loading"
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


const totalSpent =
    document.getElementById(
        "total-spent"
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


const orderHistory =
    document.getElementById(
        "order-history"
    );


/* ==================================================
   HTML 防注入
================================================== */

function escapeHTML(
    text
) {

    return String(
        text ?? ""
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
   金額格式
================================================== */

function formatMoney(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "zh-TW"
    );

}


/* ==================================================
   日期格式
================================================== */

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    return String(
        value
    );

}


/* ==================================================
   手機號碼限制
================================================== */

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


            if (phoneError) {

                phoneError.style.display =
                    "none";

                phoneError.textContent =
                    "";

            }

        }

    );


    phoneInput.addEventListener(

        "keydown",

        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                searchCustomer();

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

    if (!phoneError) {

        alert(
            message
        );

        return;

    }


    phoneError.textContent =
        message;


    phoneError.style.display =
        "block";

}


/* ==================================================
   查詢客戶
================================================== */

async function searchCustomer() {


    const phone =
        phoneInput
            ? phoneInput.value.trim()
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
            "請輸入正確的手機號碼，例如 0903392687"
        );

        if (phoneInput) {

            phoneInput.focus();

        }

        return;

    }


    /* ================================================
       開始查詢
    ================================================ */

    if (searchBtn) {

        searchBtn.disabled =
            true;

        searchBtn.textContent =
            "🔍 查詢中...";

    }


    if (loading) {

        loading.style.display =
            "block";

    }


    if (resultBox) {

        resultBox.style.display =
            "none";

    }


    if (notFoundBox) {

        notFoundBox.style.display =
            "none";

    }


    try {


        /* ============================================
           呼叫 GAS
        ============================================ */

        const url =

            SCRIPT_URL +

            "?action=queryCustomer&phone=" +

            encodeURIComponent(
                phone
            );


        const response =

            await fetch(
                url,
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "伺服器回應錯誤：" +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "客戶查詢結果：",
            result
        );


        /* ============================================
           查詢失敗
        ============================================ */

        if (
            !result ||
            result.success !== true
        ) {

            showNotFound();

            return;

        }


        /* ============================================
           確認真的有訂單
        ============================================ */

        const orders =

            Array.isArray(
                result.orders
            )

                ? result.orders

                : [];


        const count =

            Number(
                result.orderCount ||
                orders.length ||
                0
            );


        if (
            count <= 0 &&
            orders.length === 0
        ) {

            showNotFound();

            return;

        }


        /* ============================================
           顯示完整結果
        ============================================ */

        renderCustomerResult(
            result
        );


    }

    catch (
        error
    ) {

        console.error(
            "客戶查詢錯誤：",
            error
        );


        showError(

            "查詢失敗，請稍後再試。"

        );

    }

    finally {


        if (loading) {

            loading.style.display =
                "none";

        }


        if (searchBtn) {

            searchBtn.disabled =
                false;

            searchBtn.textContent =
                "🔍 查詢我的訂單";

        }

    }

}


/* ==================================================
   顯示查無資料
================================================== */

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


/* ==================================================
   顯示查詢結果
================================================== */

function renderCustomerResult(
    result
) {


    if (notFoundBox) {

        notFoundBox.style.display =
            "none";

    }


    if (resultBox) {

        resultBox.style.display =
            "block";

    }


    /* ================================================
       訂單
    ================================================ */

    const orders =

        Array.isArray(
            result.orders
        )

            ? result.orders

            : [];


    /* ================================================
       最新訂單
    ================================================ */

    const lastOrder =

        result.lastOrder

            ? result.lastOrder

            : orders.length > 0

                ? orders[
                    orders.length - 1
                ]

                : null;


    /* ================================================
       姓名
    ================================================ */

    const name =

        lastOrder &&
        lastOrder.name

            ? lastOrder.name

            : "貴賓";


    if (resultName) {

        resultName.textContent =

            "👋 " +
            name +

            "，歡迎回來！";

    }


    if (resultMessage) {

        resultMessage.textContent =

            "很高興再次見到您，這裡是您的初萊食麵訂單紀錄";

    }


    /* ================================================
       訂單數量
    ================================================ */

    if (orderCount) {

        orderCount.textContent =

            result.orderCount ||
            orders.length ||
            0;

    }


    /* ================================================
       累計消費
    ================================================ */

    const spent =

        orders.reduce(

            function(
                total,
                order
            ) {

                return total +

                    Number(
                        order.total ||
                        0
                    );

            },

            0

        );


    if (totalSpent) {

        totalSpent.textContent =

            "NT$" +

            formatMoney(
                spent
            );

    }


    /* ================================================
       最近訂單時間
    ================================================ */

    if (lastOrderTime) {

        lastOrderTime.textContent =

            lastOrder

                ? formatDate(
                    lastOrder.date
                )

                : "-";

    }


    /* ================================================
       最近一次訂單
    ================================================ */

    renderLastOrder(
        lastOrder
    );


    /* ================================================
       常點餐點
    ================================================ */

    renderFavoriteItems(

        Array.isArray(
            result.favoriteItems
        )

            ? result.favoriteItems

            : []

    );


    /* ================================================
       歷史訂單
    ================================================ */

    renderOrderHistory(
        orders
    );

}


/* ==================================================
   最近一次訂單
================================================== */

function renderLastOrder(
    order
) {


    if (!lastOrderContent) {

        return;

    }


    if (!order) {

        lastOrderContent.innerHTML =

            "目前沒有訂單紀錄";

        return;

    }


    const pickupText =

        order.pickupDate

            ? (

                "📅 取餐日期：" +

                escapeHTML(
                    order.pickupDate
                ) +

                "<br>" +

                "⏰ 取餐時間：" +

                escapeHTML(
                    order.pickupTime ||
                    "-"
                )

            )

            : "";


    lastOrderContent.innerHTML = `

        <div class="last-order-card">


            <div class="order-id">

                🆔 訂單編號：

                ${escapeHTML(
                    order.orderId ||
                    "-"
                )}

            </div>


            <div class="order-detail-line">

                📅 訂單時間：

                ${escapeHTML(
                    order.date ||
                    "-"
                )}

            </div>


            <div class="order-detail-line">

                🍜 取餐方式：

                ${escapeHTML(
                    order.orderType ||
                    "-"
                )}

            </div>


            ${
                order.pickupMode

                    ? `

                        <div class="order-detail-line">

                            ⏰ 取餐模式：

                            ${escapeHTML(
                                order.pickupMode
                            )}

                        </div>

                    `

                    : ""
            }


            ${
                pickupText

                    ? `

                        <div class="order-detail-line">

                            ${pickupText}

                        </div>

                    `

                    : ""
            }


            ${
                order.tableware

                    ? `

                        <div class="order-detail-line">

                            🍴 餐具：

                            ${escapeHTML(
                                order.tableware
                            )}

                        </div>

                    `

                    : ""
            }


            <div class="order-items-text">

                🛒 訂購內容

                <br><br>

                ${escapeHTML(
                    order.itemsText ||
                    "無商品資料"
                )}

            </div>


            ${
                order.note

                    ? `

                        <div class="order-detail-line">

                            📝 備註：

                            ${escapeHTML(
                                order.note
                            )}

                        </div>

                    `

                    : ""
            }


            <div class="order-total">

                合計 NT$

                ${formatMoney(
                    order.total
                )}

            </div>


        </div>

    `;

}


/* ==================================================
   常點餐點
================================================== */

function renderFavoriteItems(
    items
) {


    if (!favoriteItems) {

        return;

    }


    if (
        !items ||
        items.length === 0
    ) {

        favoriteItems.innerHTML =

            "目前還沒有常點餐點";

        return;

    }


    const sortedItems =

        [...items]

            .sort(

                function(
                    a,
                    b
                ) {

                    return Number(
                        b.qty || 0
                    )

                    -

                    Number(
                        a.qty || 0
                    );

                }

            );


    let html =

        '<div class="favorite-list">';


    sortedItems.forEach(

        function(
            item
        ) {

            html += `

                <div class="favorite-item">

                    <span class="favorite-name">

                        ⭐

                        ${escapeHTML(
                            item.name ||
                            "-"
                        )}

                    </span>


                    <span class="favorite-count">

                        ${Number(
                            item.qty ||
                            0
                        )}

                        次

                    </span>

                </div>

            `;

        }

    );


    html +=

        "</div>";


    favoriteItems.innerHTML =
        html;

}


/* ==================================================
   歷史訂單
================================================== */

function renderOrderHistory(
    orders
) {


    if (!orderHistory) {

        return;

    }


    if (
        !orders ||
        orders.length === 0
    ) {

        orderHistory.innerHTML =

            "目前沒有訂單紀錄";

        return;

    }


    let html =

        '<div class="order-history-list">';


    /* 最新的排前面 */

    const sortedOrders =

        [...orders].reverse();


    sortedOrders.forEach(

        function(
            order
        ) {


            const pickup =

                order.pickupDate

                    ? (

                        escapeHTML(
                            order.pickupDate
                        ) +

                        " " +

                        escapeHTML(
                            order.pickupTime ||
                            ""
                        )

                    )

                    : "";


            html += `

                <div class="history-order">


                    <div class="history-header">


                        <span class="history-date">

                            ${escapeHTML(
                                order.date ||
                                "-"
                            )}

                        </span>


                        <span class="history-status">

                            ${escapeHTML(
                                order.status ||
                                "訂單"
                            )}

                        </span>


                    </div>


                    <div class="history-id">

                        🆔

                        ${escapeHTML(
                            order.orderId ||
                            "-"
                        )}

                    </div>


                    <div class="history-items">

                        ${escapeHTML(
                            order.itemsText ||
                            "無商品資料"
                        )}

                    </div>


                    ${
                        pickup

                            ? `

                                <div class="history-pickup">

                                    📅 預約取餐：

                                    ${pickup}

                                </div>

                            `

                            : ""
                    }


                    <div class="history-footer">


                        <span>

                            ${escapeHTML(
                                order.orderType ||
                                ""
                            )}

                        </span>


                        <span class="history-total">

                            NT$

                            ${formatMoney(
                                order.total
                            )}

                        </span>


                    </div>


                </div>

            `;

        }

    );


    html +=

        "</div>";


    orderHistory.innerHTML =
        html;

}


/* ==================================================
   查詢按鈕
================================================== */

if (searchBtn) {

    searchBtn.addEventListener(

        "click",

        searchCustomer

    );

}


/* ==================================================
   載入之前查詢的手機
================================================== */

const savedPhone =

    localStorage.getItem(
        "customerPhone"
    );


if (
    phoneInput &&
    savedPhone &&
    /^09\d{8}$/.test(
        savedPhone
    )
) {

    phoneInput.value =
        savedPhone;

}


/* ==================================================
   完成
================================================== */

console.log(
    "🍜 初萊食麵｜客戶查詢系統 V2 已載入"
);