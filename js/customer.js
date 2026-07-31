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


const loadingBox =
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
   🧹 HTML 防注入
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
   📱 清理手機號碼
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
   📱 手機輸入限制
================================================== */

if (
    phoneInput
) {

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
   📅 日期格式
================================================== */

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


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


    return (

        date.getFullYear() +

        "/" +

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +

        "/" +

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        ) +

        " " +

        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        ) +

        ":" +

        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        )

    );

}


/* ==================================================
   🍜 商品顯示
================================================== */

function renderItems(
    items
) {

    if (
        !Array.isArray(
            items
        ) ||
        items.length === 0
    ) {

        return "目前沒有商品資料";

    }


    return items

        .map(

            function(
                item
            ) {

                const name =
                    escapeHTML(
                        item.name ||
                        "商品"
                    );


                const qty =
                    Number(
                        item.qty ||
                        1
                    );


                let options = "";


                if (
                    item.options
                ) {

                    const list = [];


                    if (
                        item.options.noodle
                    ) {

                        list.push(

                            item.options.noodle

                        );

                    }


                    if (
                        item.options.spicy
                    ) {

                        list.push(

                            item.options.spicy

                        );

                    }


                    if (
                        item.options.vegetable ===
                        false
                    ) {

                        list.push(
                            "不加菜"
                        );

                    }


                    if (
                        item.options.onion ===
                        false
                    ) {

                        list.push(
                            "不加蔥"
                        );

                    }


                    if (
                        item.options.sauce
                    ) {

                        if (
                            Array.isArray(
                                item.options.sauce
                            )
                        ) {

                            list.push(

                                item.options.sauce.join(
                                    "＋"
                                )

                            );

                        }

                        else {

                            list.push(

                                item.options.sauce

                            );

                        }

                    }


                    if (
                        list.length > 0
                    ) {

                        options =

                            "<div>" +

                            escapeHTML(

                                list.join(
                                    "・"
                                )

                            ) +

                            "</div>";

                    }

                }


                return `

                    <div class="customer-order-item">

                        <strong>

                            ${name}

                            ×

                            ${qty}

                        </strong>

                        ${options}

                    </div>

                `;

            }

        )

        .join("");

}


/* ==================================================
   📋 顯示單筆訂單
================================================== */

function renderOrder(
    order
) {

    if (
        !order
    ) {

        return "";

    }


    return `

        <div class="customer-order-detail">

            <p>

                🆔 訂單編號：

                <strong>

                    ${escapeHTML(
                        order.orderId
                    )}

                </strong>

            </p>


            <p>

                📅 下單時間：

                ${escapeHTML(

                    formatDate(
                        order.date
                    )

                )}

            </p>


            <p>

                🍽 取餐方式：

                ${escapeHTML(

                    order.orderType ||
                    "-"

                )}

            </p>


            ${
                order.pickupMode

                ? `

                    <p>

                        ⏰ 取餐模式：

                        ${escapeHTML(
                            order.pickupMode
                        )}

                    </p>

                `

                : ""

            }


            ${
                order.pickupDate

                ? `

                    <p>

                        📅 預約日期：

                        ${escapeHTML(
                            order.pickupDate
                        )}

                    </p>

                `

                : ""

            }


            ${
                order.pickupTime

                ? `

                    <p>

                        ⏰ 預約時間：

                        ${escapeHTML(
                            order.pickupTime
                        )}

                    </p>

                `

                : ""

            }


            ${
                order.tableware

                ? `

                    <p>

                        🍴 餐具：

                        ${escapeHTML(
                            order.tableware
                        )}

                    </p>

                `

                : ""

            }


            <div class="customer-order-items">

                ${renderItems(
                    order.items
                )}

            </div>


            <div class="customer-order-total">

                💰 訂單金額：

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

                    <p>

                        📝 備註：

                        ${escapeHTML(
                            order.note
                        )}

                    </p>

                `

                : ""

            }


            <p>

                📌 訂單狀態：

                <strong>

                    ${escapeHTML(

                        order.status ||
                        "新訂單"

                    )}

                </strong>

            </p>

        </div>

    `;

}


/* ==================================================
   ⭐ 顯示常點餐點
================================================== */

function renderFavorites(
    favorites
) {

    if (
        !favorites ||
        Object.keys(
            favorites
        ).length === 0
    ) {

        return "目前還沒有足夠的點餐紀錄";

    }


    const list =

        Object.entries(
            favorites
        )

        .sort(

            function(
                a,
                b
            ) {

                return b[1] - a[1];

            }

        );


    return list

        .slice(
            0,
            5
        )

        .map(

            function(
                item
            ) {

                return `

                    <div class="favorite-item">

                        ⭐

                        ${escapeHTML(
                            item[0]
                        )}

                        <strong>

                            ${item[1]}

                            次

                        </strong>

                    </div>

                `;

            }

        )

        .join("");

}


/* ==================================================
   📦 顯示歷史訂單
================================================== */

function renderHistory(
    orders
) {

    if (
        !Array.isArray(
            orders
        ) ||
        orders.length === 0
    ) {

        return "目前沒有訂單紀錄";

    }


    return orders

        .map(

            function(
                order,
                index
            ) {

                return `

                    <details class="customer-history-item">

                        <summary>

                            📦 第 ${

                                orders.length -
                                index

                            } 筆訂單

                            ｜

                            NT$${Number(

                                order.total ||

                                0

                            )}

                        </summary>


                        <div>

                            ${renderOrder(
                                order
                            )}

                        </div>

                    </details>

                `;

            }

        )

        .join("");

}


/* ==================================================
   🎉 顯示查詢結果
================================================== */

function showResult(
    data
) {

    const orders =
        data.orders || [];


    const latest =
        data.latestOrder ||
        orders[0];


    if (
        !latest
    ) {

        showNotFound();

        return;

    }


    if (
        resultName
    ) {

        resultName.textContent =

            "歡迎回來，" +

            (
                latest.name ||
                "顧客"
            );

    }


    if (
        resultMessage
    ) {

        resultMessage.textContent =

            "這是您的訂單紀錄";

    }


    if (
        orderCount
    ) {

        orderCount.textContent =

            orders.length;

    }


    if (
        lastOrderTime
    ) {

        lastOrderTime.textContent =

            formatDate(
                latest.date
            );

    }


    if (
        lastOrderContent
    ) {

        lastOrderContent.innerHTML =

            renderOrder(
                latest
            );

    }


    if (
        favoriteItems
    ) {

        favoriteItems.innerHTML =

            renderFavorites(

                data.favorites

            );

    }


    if (
        orderHistory
    ) {

        orderHistory.innerHTML =

            renderHistory(
                orders
            );

    }


    if (
        loadingBox
    ) {

        loadingBox.style.display =
            "none";

    }


    if (
        notFoundBox
    ) {

        notFoundBox.style.display =
            "none";

    }


    if (
        resultBox
    ) {

        resultBox.style.display =
            "block";

    }


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/* ==================================================
   ❌ 查無資料
================================================== */

function showNotFound() {

    if (
        loadingBox
    ) {

        loadingBox.style.display =
            "none";

    }


    if (
        resultBox
    ) {

        resultBox.style.display =
            "none";

    }


    if (
        notFoundBox
    ) {

        notFoundBox.style.display =
            "block";

    }

}


/* ==================================================
   🔍 執行查詢
================================================== */

async function searchCustomer() {

    const phone =
        cleanPhone(

            phoneInput

                ? phoneInput.value

                : ""

        );


    if (
        !/^09\d{8}$/.test(
            phone
        )
    ) {

        if (
            phoneError
        ) {

            phoneError.textContent =

                "請輸入正確的手機號碼";

            phoneError.style.display =
                "block";

        }

        return;

    }


    if (
        phoneError
    ) {

        phoneError.style.display =
            "none";

    }


    if (
        resultBox
    ) {

        resultBox.style.display =
            "none";

    }


    if (
        notFoundBox
    ) {

        notFoundBox.style.display =
            "none";

    }


    if (
        loadingBox
    ) {

        loadingBox.style.display =
            "block";

    }


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

            SCRIPT_URL +

            "?action=findCustomerOrders&phone=" +

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
            !data.success
        ) {

            showNotFound();

            return;

        }


        showResult(
            data
        );

    }

    catch (
        error
    ) {

        console.error(
            error
        );


        if (
            loadingBox
        ) {

            loadingBox.style.display =
                "none";

        }


        if (
            phoneError
        ) {

            phoneError.textContent =

                "查詢系統暫時無法使用，請稍後再試";

            phoneError.style.display =
                "block";

        }

    }

    finally {

        if (
            searchBtn
        ) {

            searchBtn.disabled =
                false;

            searchBtn.textContent =
                "🔍 查詢我的訂單";

        }

    }

}


/* ==================================================
   🔍 查詢按鈕
================================================== */

if (
    searchBtn
) {

    searchBtn.addEventListener(

        "click",

        searchCustomer

    );

}


/* ==================================================
   ⌨️ Enter 查詢
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

                searchCustomer();

            }

        }

    );

}


console.log(

    "🍜 初萊食麵｜客戶查詢 V2 已載入"

);