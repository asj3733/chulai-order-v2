/* =========================================
初萊食麵
POS 後台 V1
========================================= */

/* =========================================
Google Apps Script API
========================================= */

const SCRIPT_URL =
“https://script.google.com/macros/s/AKfycbza3pmlU-MY4VZWU8gE3dSVxKVqpW3D9jia7ZlH3X7CWPNLtu96f1TE2YNGnCDKKdCD/exec”;

/* =========================================
全域資料
========================================= */

let allOrders = [];

let currentFilter = “全部”;

/* =========================================
DOM
========================================= */

const ordersContainer =
document.getElementById(
“orders-container”
);

const todayOrderCount =
document.getElementById(
“today-order-count”
);

const todayTotal =
document.getElementById(
“today-total”
);

const pendingCount =
document.getElementById(
“pending-count”
);

const systemStatus =
document.getElementById(
“system-status”
);

const refreshBtn =
document.getElementById(
“refresh-btn”
);

const orderModal =
document.getElementById(
“order-modal”
);

const orderDetail =
document.getElementById(
“order-detail”
);

const closeModal =
document.getElementById(
“close-modal”
);

/* =========================================
HTML 防注入
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
                method:
                    "GET",
                cache:
                    "no-store"
            }
        );
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
            ? result.orders
            : [];
    renderOrders();
    updateTodayStats();
    setSystemStatus(
        "🟢 已連線｜最後更新 " +
        formatTime(
            new Date()
        )
    );
}
catch (
    error
) {
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
        hour:
            "2-digit",
        minute:
            "2-digit",
        second:
            "2-digit"
    }
);

}

/* =========================================
格式化訂單內容
========================================= */

function parseItems(
items
) {

if (
    Array.isArray(
        items
    )
) {
    return items;
}
if (
    typeof items ===
    "string"
) {
    try {
        const parsed =
            JSON.parse(
                items
            );
        if (
            Array.isArray(
                parsed
            )
        ) {
            return parsed;
        }
    }
    catch (
        error
    ) {
        return [];
    }
}
return [];

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
const list = [];
if (
    options.noodle
) {
    list.push(
        "麵體：" +
        options.noodle
    );
}
if (
    options.spicy
) {
    list.push(
        "辣度：" +
        options.spicy
    );
}
if (
    options.vegetable ===
    false
) {
    list.push(
        "不加菜"
    );
}
if (
    options.onion ===
    false
) {
    list.push(
        "不加蔥"
    );
}
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
    today
        .toLocaleDateString(
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
const itemsHTML =
    items.length > 0
        ?
    items.map(
        function(item) {
            const optionsText =
                getOptionsText(
                    item.options
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
                            ${Number(
                                item.qty ||
                                1
                            )}
                        </div>
                        ${
                            optionsText
                                ?
                            `<div class="item-options">
                                ${escapeHTML(
                                    optionsText
                                )}
                            </div>`
                                :
                            ""
                        }
                    </div>
                    <div class="item-price">
                        NT$${(
                            Number(
                                item.price ||
                                0
                            )
                            *
                            Number(
                                item.qty ||
                                1
                            )
                        ).toLocaleString()}
                    </div>
                </div>
            `;
        }
    ).join("")
        :
    `
        <div class="item-options">
            餐點資料格式無法解析
        </div>
    `;
const nextStatus =
    getNextStatus(
        order.status
    );
return `
    <article
        class="order-card">
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
            <span
                class="order-status ${statusClass}">
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
                    `<br>⏰ 取餐時間：${escapeHTML(
                        order.pickupTime
                    )}`
                        :
                    ""
                }
                ${
                    order.payment
                        ?
                    `<br>💳 付款方式：${escapeHTML(
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
                    )}">
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
                    disabled>
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
                }>
                ❌ 取消訂單
            </button>
            <button
                type="button"
                class="detail-btn"
                data-order-id="${escapeHTML(
                    order.orderId
                )}">
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
const itemsHTML =
    items.map(
        function(item) {
            const optionsText =
                getOptionsText(
                    item.options
                );
            return `
                <div
                    style="
                        padding:12px 0;
                        border-bottom:1px solid #eee;
                    ">
                    <strong>
                        ${escapeHTML(
                            item.name ||
                            "餐點"
                        )}
                        ×
                        ${Number(
                            item.qty ||
                            1
                        )}
                    </strong>
                    ${
                        optionsText
                            ?
                        `<div
                            style="
                                margin-top:5px;
                                font-size:13px;
                                color:#777;
                            ">
                            ${escapeHTML(
                                optionsText
                            )}
                        </div>`
                            :
                        ""
                    }
                    <div
                        style="
                            margin-top:5px;
                        ">
                        NT$${(
                            Number(
                                item.price ||
                                0
                            )
                            *
                            Number(
                                item.qty ||
                                1
                            )
                        ).toLocaleString()}
                    </div>
                </div>
            `;
        }
    ).join("");
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
        ">
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
“.filter-btn”
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

"🍜 初萊食麵 POS 後台 V1 已載入"

);