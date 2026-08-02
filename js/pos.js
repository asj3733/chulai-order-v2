/* =========================================
初萊食麵
POS 後台 V2
餐點解析修正版
========================================= */


/* =========================================
Google Apps Script API
========================================= */

const SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwFD8XzZCmF7AKly_L0LDqA5JoERcg0eex2PzQFU4n_aBWqw9GJsRV-4XcMM_GLET8MLw/exec";


/* =========================================
全域資料
========================================= */

let allOrders = [];

let currentFilter = "全部";


/* =========================================
DOM
========================================= */

const ordersContainer =
document.getElementById(
    "orders-container"
);

const todayOrderCount =
document.getElementById(
    "today-order-count"
);

const todayTotal =
document.getElementById(
    "today-total"
);

const pendingCount =
document.getElementById(
    "pending-count"
);

const systemStatus =
document.getElementById(
    "system-status"
);

const refreshBtn =
document.getElementById(
    "refresh-btn"
);

const orderModal =
document.getElementById(
    "order-modal"
);

const orderDetail =
document.getElementById(
    "order-detail"
);

const closeModal =
document.getElementById(
    "close-modal"
);


/* =========================================
HTML 防注入
========================================= */

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
取得訂單
========================================= */

async function loadOrders() {

    try {

        setSystemStatus(
            "🔄 正在更新訂單..."
        );

        const response =
            await fetch(
                SCRIPT_URL +
                "?action=getOrders&_=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "API HTTP 錯誤：" +
                response.status
            );

        }

        const result =
            await response.json();

        if (
            !result.success
        ) {

            throw new Error(
                result.error ||
                "取得訂單失敗"
            );

        }

        allOrders =
            Array.isArray(
                result.orders
            )
                ?
            result.orders
                :
            [];

        renderOrders();

        updateTodayStats();

        setSystemStatus(
            "🟢 已連線｜最後更新 " +
            formatTime(
                new Date()
            )
        );

    }
    catch (error) {

        console.error(
            "取得訂單失敗：",
            error
        );

        setSystemStatus(
            "🔴 連線失敗：" +
            error.message
        );

    }

}


/* =========================================
系統狀態
========================================= */

function setSystemStatus(
    message
) {

    if (
        systemStatus
    ) {

        systemStatus.textContent =
            message;

    }

}


/* =========================================
格式化時間
========================================= */

function formatTime(
    date
) {

    return date.toLocaleTimeString(
        "zh-TW",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


/* =========================================
⭐ 核心修正版
解析餐點資料
========================================= */

function parseItems(items) {

    /*
    ① 已經是陣列
    */

    if (
        Array.isArray(items)
    ) {

        return normalizeItems(
            items
        );

    }


    /*
    ② 沒有資料
    */

    if (
        items === null ||
        items === undefined ||
        items === ""
    ) {

        return [];

    }


    /*
    ③ 如果是物件
    */

    if (
        typeof items ===
        "object"
    ) {

        /*
        有些資料可能是：

        {
            items: [...]
        }

        */

        if (
            Array.isArray(
                items.items
            )
        ) {

            return normalizeItems(
                items.items
            );

        }

        /*
        單一商品物件
        */

        if (
            items.name
        ) {

            return normalizeItems([
                items
            ]);

        }

    }


    /*
    ④ 字串格式
    */

    if (
        typeof items ===
        "string"
    ) {

        let text =
            items.trim();


        /*
        嘗試 JSON.parse
        */

        try {

            const parsed =
                JSON.parse(
                    text
                );


            /*
            JSON 陣列
            */

            if (
                Array.isArray(
                    parsed
                )
            ) {

                return normalizeItems(
                    parsed
                );

            }


            /*
            JSON 物件內含 items
            */

            if (
                parsed &&
                Array.isArray(
                    parsed.items
                )
            ) {

                return normalizeItems(
                    parsed.items
                );

            }


            /*
            JSON 單一商品
            */

            if (
                parsed &&
                parsed.name
            ) {

                return normalizeItems([
                    parsed
                ]);

            }

        }
        catch (
            error
        ) {

            console.warn(
                "JSON 餐點解析失敗，嘗試文字格式：",
                text
            );

        }


        /*
        ⑤ 如果是舊格式文字
        例如：

        肉燥乾麵（小） x 1
        水餃 x 2

        */

        return parseLegacyTextItems(
            text
        );

    }


    return [];

}


/* =========================================
標準化餐點
========================================= */

function normalizeItems(
    items
) {

    if (
        !Array.isArray(
            items
        )
    ) {

        return [];

    }

    return items
        .map(
            function(item) {

                if (
                    typeof item ===
                    "string"
                ) {

                    return {
                        name:
                            item,
                        qty:
                            1,
                        price:
                            0,
                        options:
                            {}
                    };

                }

                if (
                    !item ||
                    typeof item !==
                    "object"
                ) {

                    return null;

                }

                return {

                    id:
                        item.id ||
                        "",

                    name:
                        item.name ||
                        item.productName ||
                        item.title ||
                        "餐點",

                    qty:
                        Number(
                            item.qty ||
                            item.quantity ||
                            1
                        ),

                    price:
                        Number(
                            item.price ||
                            item.unitPrice ||
                            0
                        ),

                    options:
                        item.options ||
                        item.custom ||
                        {}

                };

            }
        )
        .filter(
            function(item) {

                return (
                    item !== null
                );

            }
        );

}


/* =========================================
舊文字格式解析
========================================= */

function parseLegacyTextItems(
    text
) {

    if (
        !text
    ) {

        return [];

    }

    /*
    先處理常見分隔符號
    */

    const lines =
        text
            .split(
                /\n|,\s*(?=[^\d])|、/
            )
            .map(
                function(line) {
                    return line.trim();
                }
            )
            .filter(
                function(line) {
                    return line !== "";
                }
            );


    return lines.map(
        function(line) {

            let name =
                line;

            let qty =
                1;


            /*
            支援：

            商品 x 2
            商品 × 2
            商品 * 2
            */

            const match =
                line.match(
                    /(.+?)\s*[xX×＊*]\s*(\d+)\s*$/
                );


            if (
                match
            ) {

                name =
                    match[1].trim();

                qty =
                    Number(
                        match[2]
                    );

            }


            return {

                name:
                    name,

                qty:
                    qty,

                price:
                    0,

                options:
                    {}

            };

        }
    );

}


/* =========================================
客製化文字
========================================= */

function getOptionsText(
    options
) {

    if (
        !options
    ) {

        return "";

    }


    /*
    如果 options 是字串
    */

    if (
        typeof options ===
        "string"
    ) {

        return options;

    }


    const list = [];


    /*
    麵體
    */

    if (
        options.noodle
    ) {

        list.push(
            "麵體：" +
            options.noodle
        );

    }


    /*
    辣度
    */

    if (
        options.spicy
    ) {

        list.push(
            "辣度：" +
            options.spicy
        );

    }


    /*
    菜
    */

    if (
        options.vegetable ===
        false
    ) {

        list.push(
            "不加菜"
        );

    }


    /*
    蔥
    */

    if (
        options.onion ===
        false
    ) {

        list.push(
            "不加蔥"
        );

    }


    /*
    醬料
    */

    if (
        options.sauce
    ) {

        if (
            Array.isArray(
                options.sauce
            )
        ) {

            list.push(
                "醬料：" +
                options.sauce.join(
                    "、"
                )
            );

        }
        else {

            list.push(
                "醬料：" +
                options.sauce
            );

        }

    }


    /*
    其他客製選項
    */

    if (
        options.addon
    ) {

        list.push(
            "加料：" +
            options.addon
        );

    }


    if (
        options.note
    ) {

        list.push(
            options.note
        );

    }


    return list.join(
        "、"
    );

}


/* =========================================
今日統計
========================================= */

function updateTodayStats() {

    const today =
        new Date();

    const todayString =
        today.toLocaleDateString(
            "zh-TW"
        );

    let orderCount =
        0;

    let total =
        0;

    let pending =
        0;


    allOrders.forEach(
        function(order) {

            if (
                !order.createdAt
            ) {

                return;

            }


            const orderDate =
                new Date(
                    order.createdAt
                );


            if (
                isNaN(
                    orderDate.getTime()
                )
            ) {

                return;

            }


            const orderDateString =
                orderDate
                    .toLocaleDateString(
                        "zh-TW"
                    );


            if (
                orderDateString !==
                todayString
            ) {

                return;

            }


            orderCount++;


            total +=
                Number(
                    order.total ||
                    0
                );


            if (
                order.status !==
                "已完成"
                &&
                order.status !==
                "取消"
            ) {

                pending++;

            }

        }
    );


    if (
        todayOrderCount
    ) {

        todayOrderCount.textContent =
            orderCount;

    }


    if (
        todayTotal
    ) {

        todayTotal.textContent =
            "NT$" +
            total.toLocaleString();

    }


    if (
        pendingCount
    ) {

        pendingCount.textContent =
            pending;

    }

}


/* =========================================
訂單排序
========================================= */

function sortOrders(
    orders
) {

    return orders.sort(
        function(a, b) {

            return (
                new Date(
                    b.createdAt
                )
                -
                new Date(
                    a.createdAt
                )
            );

        }
    );

}


/* =========================================
顯示訂單
========================================= */

function renderOrders() {

    if (
        !ordersContainer
    ) {

        return;

    }


    let orders =
        currentFilter ===
        "全部"

            ?

        allOrders

            :

        allOrders.filter(
            function(order) {

                return (
                    order.status ===
                    currentFilter
                );

            }
        );


    orders =
        sortOrders(
            orders
        );


    if (
        orders.length ===
        0
    ) {

        ordersContainer.innerHTML = `
            <div class="empty-orders">
                📭 目前沒有符合條件的訂單
            </div>
        `;

        return;

    }


    ordersContainer.innerHTML =
        orders.map(
            function(order) {

                return renderOrderCard(
                    order
                );

            }
        ).join("");


    bindOrderButtons();

}


/* =========================================
訂單卡片
========================================= */

function renderOrderCard(
    order
) {

    const statusClass =
        getStatusClass(
            order.status
        );


    const items =
        parseItems(
            order.items
        );


    let itemsHTML =
        "";


    if (
        items.length >
        0
    ) {

        itemsHTML =
            items.map(
                function(item) {

                    const optionsText =
                        getOptionsText(
                            item.options
                        );


                    const qty =
                        Number(
                            item.qty ||
                            1
                        );


                    const price =
                        Number(
                            item.price ||
                            0
                        );


                    return `
                        <div class="order-item">

                            <div>

                                <div class="item-name">

                                    ${escapeHTML(
                                        item.name ||
                                        "餐點"
                                    )}

                                    ×

                                    ${qty}

                                </div>


                                ${
                                    optionsText
                                        ?

                                    `<div class="item-options">
                                        ↳ ${escapeHTML(
                                            optionsText
                                        )}
                                    </div>`

                                        :

                                    ""
                                }

                            </div>


                            <div class="item-price">

                                NT$${(
                                    price *
                                    qty
                                ).toLocaleString()}

                            </div>

                        </div>
                    `;

                }
            ).join("");

    }

    else {

        itemsHTML = `
            <div class="item-options">
                🍜 目前沒有可解析的餐點資料
            </div>
        `;

    }


    const nextStatus =
        getNextStatus(
            order.status
        );


    return `

        <article class="order-card">


            <div class="order-card-header">

                <div>

                    <div class="order-id">

                        🆔 ${escapeHTML(
                            order.orderId
                        )}

                    </div>


                    <div class="order-time">

                        ⏰ ${escapeHTML(
                            order.createdAt ||
                            ""
                        )}

                    </div>

                </div>


                <span class="order-status ${statusClass}">

                    ${getStatusIcon(
                        order.status
                    )}

                    ${escapeHTML(
                        order.status ||
                        "新訂單"
                    )}

                </span>

            </div>



            <div class="order-customer">

                <div class="customer-name">

                    👤 ${escapeHTML(
                        order.name ||
                        "現場客人"
                    )}

                </div>


                <div class="customer-info">

                    📱 ${escapeHTML(
                        order.phone ||
                        "未提供"
                    )}

                    <br>

                    🍽 取餐方式：

                    ${escapeHTML(
                        order.pickupType ||
                        "外帶"
                    )}

                    ${
                        order.pickupTime

                            ?

                        `<br>
                        ⏰ 取餐時間：
                        ${escapeHTML(
                            order.pickupTime
                        )}`

                            :

                        ""
                    }

                    ${
                        order.payment

                            ?

                        `<br>
                        💳 付款方式：
                        ${escapeHTML(
                            order.payment
                        )}`

                            :

                        ""
                    }

                </div>

            </div>



            <div class="order-items">

                ${itemsHTML}

            </div>



            <div class="order-total">

                <span>

                    💰 合計

                </span>


                <strong>

                    NT$${Number(
                        order.total ||
                        0
                    ).toLocaleString()}

                </strong>

            </div>



            <div class="order-actions">


                ${
                    nextStatus

                        ?

                    `

                    <button

                        type="button"

                        class="status-action-btn"

                        data-order-id="${escapeHTML(
                            order.orderId
                        )}"

                        data-next-status="${escapeHTML(
                            nextStatus
                        )}"

                    >

                        ${getStatusIcon(
                            nextStatus
                        )}

                        ${nextStatus}

                    </button>

                    `

                        :

                    `

                    <button

                        type="button"

                        class="status-action-btn"

                        disabled

                    >

                        已完成

                    </button>

                    `
                }



                <button

                    type="button"

                    class="status-action-btn cancel-order-btn"

                    data-order-id="${escapeHTML(
                        order.orderId
                    )}"

                    ${
                        order.status ===
                        "已完成"

                            ?

                        "disabled"

                            :

                        ""
                    }

                >

                    ❌ 取消訂單

                </button>



                <button

                    type="button"

                    class="detail-btn"

                    data-order-id="${escapeHTML(
                        order.orderId
                    )}"

                >

                    📋 查看完整訂單

                </button>


            </div>


        </article>

    `;

}


/* =========================================
狀態 Class
========================================= */

function getStatusClass(
    status
) {

    const map = {

        "新訂單":
            "status-new",

        "已接單":
            "status-accepted",

        "製作中":
            "status-making",

        "可取餐":
            "status-ready",

        "已完成":
            "status-completed",

        "取消":
            "status-cancelled"

    };


    return (

        map[
            status
        ]

        ||

        "status-new"

    );

}


/* =========================================
狀態 Icon
========================================= */

function getStatusIcon(
    status
) {

    const map = {

        "新訂單":
            "🔴",

        "已接單":
            "🟡",

        "製作中":
            "🟠",

        "可取餐":
            "🟢",

        "已完成":
            "✅",

        "取消":
            "❌"

    };


    return (

        map[
            status
        ]

        ||

        "📋"

    );

}


/* =========================================
下一個狀態
========================================= */

function getNextStatus(
    status
) {

    const flow = {

        "新訂單":
            "已接單",

        "已接單":
            "製作中",

        "製作中":
            "可取餐",

        "可取餐":
            "已完成"

    };


    return (

        flow[
            status
        ]

        ||

        null

    );

}


/* =========================================
綁定按鈕
========================================= */

function bindOrderButtons() {


    document
        .querySelectorAll(
            ".status-action-btn:not(.cancel-order-btn)"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const orderId =
                            this.dataset.orderId;


                        const nextStatus =
                            this.dataset.nextStatus;


                        updateOrderStatus(

                            orderId,

                            nextStatus

                        );

                    }
                );

            }
        );



    document
        .querySelectorAll(
            ".cancel-order-btn"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const orderId =
                            this.dataset.orderId;


                        if (
                            confirm(
                                "確定要取消這筆訂單嗎？"
                            )
                        ) {

                            updateOrderStatus(

                                orderId,

                                "取消"

                            );

                        }

                    }
                );

            }
        );



    document
        .querySelectorAll(
            ".detail-btn"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const orderId =
                            this.dataset.orderId;


                        openOrderDetail(
                            orderId
                        );

                    }
                );

            }
        );

}


/* =========================================
更新訂單狀態
========================================= */

async function updateOrderStatus(

    orderId,

    status

) {

    try {

        setSystemStatus(
            "🔄 正在更新訂單..."
        );


        const response =
            await fetch(

                SCRIPT_URL,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:

                        JSON.stringify({

                            action:
                                "updateOrderStatus",

                            orderId:
                                orderId,

                            status:
                                status

                        })

                }

            );


        const result =
            await response.json();


        if (
            !result.success
        ) {

            throw new Error(

                result.error ||

                "更新失敗"

            );

        }


        setSystemStatus(

            "🟢 訂單狀態已更新：" +

            status

        );


        await loadOrders();

    }
    catch (
        error
    ) {

        console.error(
            error
        );


        alert(

            "更新訂單失敗：\n" +

            error.message

        );


        setSystemStatus(

            "🔴 更新失敗"

        );

    }

}


/* =========================================
查看訂單詳細
========================================= */

function openOrderDetail(
    orderId
) {

    const order =
        allOrders.find(
            function(item) {

                return (

                    String(
                        item.orderId
                    )

                    ===

                    String(
                        orderId
                    )

                );

            }
        );


    if (
        !order
    ) {

        return;

    }


    const items =
        parseItems(
            order.items
        );


    let itemsHTML =
        "";


    if (
        items.length >
        0
    ) {

        itemsHTML =
            items.map(
                function(item) {

                    const optionsText =
                        getOptionsText(
                            item.options
                        );


                    const qty =
                        Number(
                            item.qty ||
                            1
                        );


                    const price =
                        Number(
                            item.price ||
                            0
                        );


                    return `

                        <div

                            style="

                                padding:12px 0;

                                border-bottom:1px solid #eee;

                            "

                        >

                            <strong>

                                ${escapeHTML(
                                    item.name ||
                                    "餐點"
                                )}

                                ×

                                ${qty}

                            </strong>


                            ${

                                optionsText

                                    ?

                                `

                                <div

                                    style="

                                        margin-top:5px;

                                        font-size:13px;

                                        color:#777;

                                    "

                                >

                                    ↳ ${escapeHTML(
                                        optionsText
                                    )}

                                </div>

                                `

                                    :

                                ""

                            }


                            <div

                                style="

                                    margin-top:5px;

                                "

                            >

                                NT$${(

                                    price *

                                    qty

                                ).toLocaleString()}

                            </div>


                        </div>

                    `;

                }
            ).join("");

    }
    else {

        itemsHTML = `

            <div>

                🍜 目前沒有可解析的餐點資料

            </div>

        `;

    }


    orderDetail.innerHTML = `

        <h2>

            📋 訂單詳細

        </h2>


        <p>

            🆔 ${escapeHTML(
                order.orderId
            )}

        </p>


        <p>

            👤 ${escapeHTML(
                order.name ||
                "現場客人"
            )}

        </p>


        <p>

            📱 ${escapeHTML(
                order.phone ||
                "未提供"
            )}

        </p>


        <p>

            🍽 ${escapeHTML(
                order.pickupType ||
                "外帶"
            )}

        </p>


        ${
            order.note

                ?

            `<p>

                📝 備註：

                ${escapeHTML(
                    order.note
                )}

            </p>`

                :

            ""
        }


        <hr>


        <h3>

            🍜 餐點

        </h3>


        ${itemsHTML}


        <div

            style="

                display:flex;

                justify-content:space-between;

                margin-top:20px;

                font-size:20px;

                font-weight:bold;

            "

        >

            <span>

                合計

            </span>


            <span>

                NT$${Number(

                    order.total ||

                    0

                ).toLocaleString()}

            </span>

        </div>

    `;


    orderModal.classList.add(
        "show"
    );

}


/* =========================================
關閉 Modal
========================================= */

if (
    closeModal
) {

    closeModal.addEventListener(

        "click",

        function() {

            orderModal.classList.remove(

                "show"

            );

        }

    );

}


if (
    orderModal
) {

    orderModal.addEventListener(

        "click",

        function(event) {

            if (

                event.target ===

                orderModal

            ) {

                orderModal.classList.remove(

                    "show"

                );

            }

        }

    );

}


/* =========================================
篩選按鈕
========================================= */

document
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(

        function(button) {

            button.addEventListener(

                "click",

                function() {

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(

                            function(btn) {

                                btn.classList.remove(

                                    "active"

                                );

                            }

                        );


                    this.classList.add(

                        "active"

                    );


                    currentFilter =

                        this.dataset.filter;


                    renderOrders();

                }

            );

        }

    );


/* =========================================
手動更新
========================================= */

if (
    refreshBtn
) {

    refreshBtn.addEventListener(

        "click",

        function() {

            loadOrders();

        }

    );

}


/* =========================================
每 10 秒自動更新
========================================= */

setInterval(

    function() {

        loadOrders();

    },

    10000

);


/* =========================================
初始化
========================================= */

loadOrders();


console.log(

    "🍜 初萊食麵 POS 後台 V2 已載入"

);