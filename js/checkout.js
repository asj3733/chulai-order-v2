/* ==================================================
🍜 初萊食麵｜checkout.js V6
結帳頁完整版本

修正版：

1. 購物車顯示
2. 購物車數量增減
3. 購物車刪除
4. 商品客製化選項顯示
5. 顧客資料記憶
6. 內用 / 外帶切換
7. 外帶：最快取餐 / 預約取餐
8. 內用不送 pickupMode / pickupDate / pickupTime
9. 預約日期
10. 平日 11:30～20:30
11. 六日 11:30～18:30
12. 訂單送出 GAS
13. 完整保留商品 options
14. 訂單成功彈窗
15. 防止重複送出
    ================================================== */

/* ==================================================
🔗 GAS API
================================================== */

const SCRIPT_URL =
“https://script.google.com/macros/s/AKfycbwFD8XzZCmF7AKly_L0LDqA5JoERcg0eex2PzQFU4n_aBWqw9GJsRV-4XcMM_GLET8MLw/exec”;

/* ==================================================
🛒 購物車
================================================== */

let cart = [];

try {

cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];

} catch (error) {

console.error(
    "購物車資料讀取失敗：",
    error
);
cart = [];

}

/* ==================================================
DOM
================================================== */

const orderList =
document.getElementById(
“order-list”
);

const orderTotal =
document.getElementById(
“order-total”
);

const customerName =
document.getElementById(
“customer-name”
);

const customerPhone =
document.getElementById(
“customer-phone”
);

const phoneError =
document.getElementById(
“phone-error”
);

const submitBtn =
document.getElementById(
“submit-order-btn”
);

const backBtn =
document.getElementById(
“back-order-btn”
);

const submitResult =
document.getElementById(
“submit-result”
);

const successModal =
document.getElementById(
“success-modal”
);

const successSummary =
document.getElementById(
“success-order-summary”
);

const successConfirmBtn =
document.getElementById(
“success-confirm-btn”
);

const welcomeCustomer =
document.getElementById(
“welcome-customer”
);

const welcomeName =
document.getElementById(
“welcome-name”
);

const takeoutOptions =
document.getElementById(
“takeout-options”
);

const reservationTimeArea =
document.getElementById(
“reservation-time-area”
);

const pickupDate =
document.getElementById(
“pickup-date”
);

const pickupTime =
document.getElementById(
“pickup-time”
);

/* ==================================================
🧹 HTML 防注入
================================================== */

function escapeHTML(text) {

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
💰 計算總金額
================================================== */

function getTotal() {

return cart.reduce(
    function(
        total,
        item
    ) {
        return total +
            Number(
                item.price || 0
            ) *
            Number(
                item.qty || 0
            );
    },
    0
);

}

/* ==================================================
💾 儲存購物車
================================================== */

function saveCart() {

try {
    localStorage.setItem(
        "cart",
        JSON.stringify(
            cart
        )
    );
} catch (error) {
    console.error(
        "購物車儲存失敗：",
        error
    );
}

}

/* ==================================================
🛒 顯示購物車
================================================== */

function renderCheckoutCart() {

if (!orderList) {
    return;
}
if (
    cart.length === 0
) {
    orderList.innerHTML = `
        <div class="empty-cart">
            🛒 尚未加入商品
            <br><br>
            <button
                type="button"
                id="go-order-btn">
                ← 返回點餐
            </button>
        </div>
    `;
    if (orderTotal) {
        orderTotal.textContent =
            "0";
    }
    const goOrderBtn =
        document.getElementById(
            "go-order-btn"
        );
    if (goOrderBtn) {
        goOrderBtn.onclick =
            function() {
                window.location.href =
                    "order.html";
            };
    }
    return;
}
let html = "";
cart.forEach(
    function(
        item,
        index
    ) {
        const price =
            Number(
                item.price || 0
            );
        const qty =
            Number(
                item.qty || 1
            );
        const subtotal =
            price * qty;
        const options =
            item.options || {};
        const optionList =
            [];
        /* 麵條 */
        if (
            options.noodle
        ) {
            optionList.push(
                options.noodle
            );
        }
        /* 辣度 */
        if (
            options.spicy
        ) {
            optionList.push(
                options.spicy
            );
        }
        /* 青菜 */
        if (
            options.vegetable === false
        ) {
            optionList.push(
                "不加菜"
            );
        }
        /* 蔥 */
        if (
            options.onion === false
        ) {
            optionList.push(
                "不加蔥"
            );
        }
        /* 醬料 */
        if (
            options.sauce
        ) {
            if (
                Array.isArray(
                    options.sauce
                )
            ) {
                optionList.push(
                    options.sauce.join(
                        "＋"
                    )
                );
            } else {
                optionList.push(
                    options.sauce
                );
            }
        }
        let optionsHTML =
            "";
        if (
            optionList.length > 0
        ) {
            optionsHTML = `
                <div class="checkout-item-options">
                    ${escapeHTML(
                        optionList.join(
                            " ・ "
                        )
                    )}
                </div>
            `;
        }
        html += `
            <div
                class="checkout-order-item"
                data-index="${index}">
                <div class="checkout-item-info">
                    <h3>
                        ${escapeHTML(
                            item.name ||
                            "商品"
                        )}
                    </h3>
                    ${optionsHTML}
                    <div class="checkout-item-price">
                        NT$${price}
                    </div>
                </div>
                <div class="checkout-item-actions">
                    <div class="checkout-qty">
                        <button
                            type="button"
                            class="checkout-minus"
                            data-index="${index}">
                            −
                        </button>
                        <span>
                            ${qty}
                        </span>
                        <button
                            type="button"
                            class="checkout-plus"
                            data-index="${index}">
                            ＋
                        </button>
                    </div>
                    <strong>
                        NT$${subtotal}
                    </strong>
                    <button
                        type="button"
                        class="checkout-delete"
                        data-index="${index}">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }
);
orderList.innerHTML =
    html;
if (orderTotal) {
    orderTotal.textContent =
        getTotal();
}
bindCheckoutButtons();

}

/* ==================================================
➕➖🗑️ 購物車按鈕
================================================== */

function bindCheckoutButtons() {

document
    .querySelectorAll(
        ".checkout-minus"
    )
    .forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    const index =
                        Number(
                            this.dataset.index
                        );
                    if (
                        !cart[index]
                    ) {
                        return;
                    }
                    cart[index].qty =
                        Number(
                            cart[index].qty ||
                            1
                        ) - 1;
                    if (
                        cart[index].qty <= 0
                    ) {
                        cart.splice(
                            index,
                            1
                        );
                    }
                    saveCart();
                    renderCheckoutCart();
                }
            );
        }
    );
document
    .querySelectorAll(
        ".checkout-plus"
    )
    .forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    const index =
                        Number(
                            this.dataset.index
                        );
                    if (
                        !cart[index]
                    ) {
                        return;
                    }
                    const qty =
                        Number(
                            cart[index].qty ||
                            1
                        );
                    if (
                        qty < 99
                    ) {
                        cart[index].qty =
                            qty + 1;
                    }
                    saveCart();
                    renderCheckoutCart();
                }
            );
        }
    );
document
    .querySelectorAll(
        ".checkout-delete"
    )
    .forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    const index =
                        Number(
                            this.dataset.index
                        );
                    if (
                        !cart[index]
                    ) {
                        return;
                    }
                    const name =
                        cart[index].name ||
                        "商品";
                    if (
                        confirm(
                            "確定要移除「" +
                            name +
                            "」嗎？"
                        )
                    ) {
                        cart.splice(
                            index,
                            1
                        );
                        saveCart();
                        renderCheckoutCart();
                    }
                }
            );
        }
    );

}

/* ==================================================
👤 載入顧客資料
================================================== */

function loadCustomer() {

const savedName =
    localStorage.getItem(
        "customerName"
    );
const savedPhone =
    localStorage.getItem(
        "customerPhone"
    );
if (
    customerName &&
    savedName
) {
    customerName.value =
        savedName;
}
if (
    customerPhone &&
    savedPhone
) {
    customerPhone.value =
        savedPhone;
}
if (
    savedName &&
    welcomeCustomer &&
    welcomeName
) {
    welcomeName.textContent =
        savedName;
    welcomeCustomer.style.display =
        "block";
}

}

/* ==================================================
📱 手機號碼限制
================================================== */

if (customerPhone) {

customerPhone.addEventListener(
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
        }
    }
);

}

/* ==================================================
🍜 取得目前內用 / 外帶
================================================== */

function getSelectedOrderType() {

const selected =
    document.querySelector(
        'input[name="order-type"]:checked'
    );
if (!selected) {
    return "內用";
}
const value =
    String(
        selected.value || ""
    ).trim();
/*
   只接受兩種值
   避免 HTML value 寫錯
*/
if (
    value === "外帶"
) {
    return "外帶";
}
return "內用";

}

/* ==================================================
🍜 取餐方式 UI
================================================== */

function updateOrderTypeUI() {

const orderType =
    getSelectedOrderType();
console.log(
    "📍 目前訂單方式：",
    orderType
);
if (
    orderType === "外帶"
) {
    if (takeoutOptions) {
        takeoutOptions.style.display =
            "block";
    }
} else {
    /*
       內用：
       隱藏外帶相關選項
    */
    if (takeoutOptions) {
        takeoutOptions.style.display =
            "none";
    }
    if (reservationTimeArea) {
        reservationTimeArea.style.display =
            "none";
    }
}

}

document
.querySelectorAll(
‘input[name=“order-type”]’
)
.forEach(

    function(input) {
        input.addEventListener(
            "change",
            function() {
                updateOrderTypeUI();
            }
        );
    }
);

/* ==================================================
⏰ 取餐模式
================================================== */

function getSelectedPickupMode() {

const selected =
    document.querySelector(
        'input[name="pickup-mode"]:checked'
    );
if (!selected) {
    return "";
}
return String(
    selected.value || ""
).trim();

}

function updatePickupModeUI() {

const orderType =
    getSelectedOrderType();
const pickupMode =
    getSelectedPickupMode();
/*
   只有外帶才處理
*/
if (
    orderType !== "外帶"
) {
    if (reservationTimeArea) {
        reservationTimeArea.style.display =
            "none";
    }
    return;
}
if (
    pickupMode === "預約取餐"
) {
    if (reservationTimeArea) {
        reservationTimeArea.style.display =
            "block";
    }
    generatePickupDates();
} else {
    if (reservationTimeArea) {
        reservationTimeArea.style.display =
            "none";
    }
}

}

document
.querySelectorAll(
‘input[name=“pickup-mode”]’
)
.forEach(

    function(input) {
        input.addEventListener(
            "change",
            function() {
                updatePickupModeUI();
            }
        );
    }
);

/* ==================================================
📅 取得日期 YYYY-MM-DD
================================================== */

function formatDateValue(date) {

const year =
    date.getFullYear();
const month =
    String(
        date.getMonth() + 1
    ).padStart(
        2,
        "0"
    );
const day =
    String(
        date.getDate()
    ).padStart(
        2,
        "0"
    );
return (
    year +
    "-" +
    month +
    "-" +
    day
);

}

/* ==================================================
📅 產生預約日期
================================================== */

function generatePickupDates() {

if (!pickupDate) {
    return;
}
const oldValue =
    pickupDate.value;
pickupDate.innerHTML = `
    <option value="">
        請選擇日期
    </option>
`;
const today =
    new Date();
today.setHours(
    0,
    0,
    0,
    0
);
for (
    let i = 0;
    i < 7;
    i++
) {
    const date =
        new Date(
            today
        );
    date.setDate(
        today.getDate() +
        i
    );
    const value =
        formatDateValue(
            date
        );
    const week =
        [
            "日",
            "一",
            "二",
            "三",
            "四",
            "五",
            "六"
        ][
            date.getDay()
        ];
    const option =
        document.createElement(
            "option"
        );
    option.value =
        value;
    option.textContent =
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
        "（" +
        week +
        "）";
    pickupDate.appendChild(
        option
    );
}
if (oldValue) {
    const exists =
        Array.from(
            pickupDate.options
        )
        .some(
            function(option) {
                return (
                    option.value ===
                    oldValue
                );
            }
        );
    if (exists) {
        pickupDate.value =
            oldValue;
    }
}
generatePickupTimes();

}

/* ==================================================
⏰ 取得營業結束時間
================================================== */

function getBusinessClosingTime(
dateString
) {

if (!dateString) {
    return "20:30";
}
const parts =
    dateString.split(
        "-"
    );
if (
    parts.length !== 3
) {
    return "20:30";
}
const year =
    Number(
        parts[0]
    );
const month =
    Number(
        parts[1]
    ) - 1;
const day =
    Number(
        parts[2]
    );
const date =
    new Date(
        year,
        month,
        day
    );
const weekDay =
    date.getDay();
if (
    weekDay === 0 ||
    weekDay === 6
) {
    return "18:30";
}
return "20:30";

}

/* ==================================================
⏰ 產生預約時間
================================================== */

function generatePickupTimes() {

if (!pickupTime) {
    return;
}
const selectedDate =
    pickupDate
        ? pickupDate.value
        : "";
const closingTime =
    getBusinessClosingTime(
        selectedDate
    );
const oldValue =
    pickupTime.value;
pickupTime.innerHTML = "";
const defaultOption =
    document.createElement(
        "option"
    );
defaultOption.value =
    "";
defaultOption.textContent =
    "請選擇取餐時間";
pickupTime.appendChild(
    defaultOption
);
const startTotal =
    11 * 60 +
    30;
const closingParts =
    closingTime.split(
        ":"
    );
const closeHour =
    Number(
        closingParts[0]
    );
const closeMinute =
    Number(
        closingParts[1]
    );
const closeTotal =
    closeHour * 60 +
    closeMinute;
for (
    let time =
        startTotal;
    time <=
        closeTotal;
    time += 30
) {
    const hour =
        Math.floor(
            time / 60
        );
    const minute =
        time % 60;
    const timeValue =
        String(
            hour
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        String(
            minute
        ).padStart(
            2,
            "0"
        );
    const option =
        document.createElement(
            "option"
        );
    option.value =
        timeValue;
    option.textContent =
        timeValue;
    pickupTime.appendChild(
        option
    );
}
if (oldValue) {
    const exists =
        Array.from(
            pickupTime.options
        )
        .some(
            function(option) {
                return (
                    option.value ===
                    oldValue
                );
            }
        );
    if (exists) {
        pickupTime.value =
            oldValue;
    }
}

}

/* ==================================================
📅 日期變更
================================================== */

if (pickupDate) {

pickupDate.addEventListener(
    "change",
    function() {
        generatePickupTimes();
    }
);

}

/* ==================================================
🔍 驗證表單
================================================== */

function validateForm() {

const name =
    customerName
        ? customerName.value.trim()
        : "";
const phone =
    customerPhone
        ? customerPhone.value.trim()
        : "";
const orderType =
    getSelectedOrderType();
const pickupMode =
    getSelectedPickupMode();
if (!name) {
    alert(
        "請輸入姓名"
    );
    if (customerName) {
        customerName.focus();
    }
    return false;
}
if (
    !/^09\d{8}$/.test(
        phone
    )
) {
    if (phoneError) {
        phoneError.style.display =
            "block";
    } else {
        alert(
            "請輸入正確的手機號碼"
        );
    }
    if (customerPhone) {
        customerPhone.focus();
    }
    return false;
}
if (
    cart.length === 0
) {
    alert(
        "購物車目前沒有商品"
    );
    return false;
}
/*
   ⭐ 只有外帶才驗證預約
*/
if (
    orderType === "外帶" &&
    pickupMode === "預約取餐"
) {
    if (
        !pickupDate ||
        !pickupDate.value
    ) {
        alert(
            "請選擇取餐日期"
        );
        return false;
    }
    if (
        !pickupTime ||
        !pickupTime.value
    ) {
        alert(
            "請選擇取餐時間"
        );
        return false;
    }
    const closingTime =
        getBusinessClosingTime(
            pickupDate.value
        );
    if (
        pickupTime.value >
        closingTime
    ) {
        alert(
            "您選擇的日期營業至 " +
            closingTime +
            "，請重新選擇取餐時間"
        );
        generatePickupTimes();
        return false;
    }
}
return true;

}

/* ==================================================
📦 建立訂單資料
================================================== */

function buildOrderData() {

/*
   ⭐⭐⭐ 最重要修正 ⭐⭐⭐
   統一從 getSelectedOrderType()
   取得內用 / 外帶
   不再直接把 HTML 的值
   原封不動送出去
*/
const orderType =
    getSelectedOrderType();
const pickupMode =
    getSelectedPickupMode();
const tableware =
    document.querySelector(
        'input[name="tableware"]:checked'
    );
const noteElement =
    document.getElementById(
        "customer-note"
    );
/*
   ⭐ 只有外帶才保留取餐資料
*/
const finalPickupMode =
    orderType === "外帶"
        ? pickupMode
        : "";
const finalPickupDate =
    orderType === "外帶" &&
    pickupMode === "預約取餐" &&
    pickupDate
        ? pickupDate.value
        : "";
const finalPickupTime =
    orderType === "外帶" &&
    pickupMode === "預約取餐" &&
    pickupTime
        ? pickupTime.value
        : "";
const finalTableware =
    orderType === "外帶" &&
    tableware
        ? tableware.value
        : "";
const orderData = {
    action:
        "createOrder",
    name:
        customerName
            ? customerName.value.trim()
            : "",
    phone:
        customerPhone
            ? customerPhone.value.trim()
            : "",
    /*
       ⭐ 正確送出：
       內用 / 外帶
    */
    orderType:
        orderType,
    /*
       ⭐ 外帶才有
    */
    pickupMode:
        finalPickupMode,
    /*
       ⭐ 預約外帶才有
    */
    pickupDate:
        finalPickupDate,
    pickupTime:
        finalPickupTime,
    /*
       ⭐ 外帶才有餐具
    */
    tableware:
        finalTableware,
    note:
        noteElement
            ? noteElement.value.trim()
            : "",
    total:
        getTotal(),
    /*
       ⭐ 完整商品資料
       保留：
       name
       price
       qty
       options
       GAS / LINE 可以讀取
    */
    items:
        cart.map(
            function(item) {
                return {
                    name:
                        String(
                            item.name ||
                            ""
                        ),
                    price:
                        Number(
                            item.price ||
                            0
                        ),
                    qty:
                        Number(
                            item.qty ||
                            1
                        ),
                    options:
                        item.options ||
                        {}
                };
            }
        )
};
/*
   ⭐⭐⭐ 送出前完整檢查 ⭐⭐⭐
*/
console.log(
    "================================"
);
console.log(
    "📦 最終訂單資料：",
    orderData
);
console.log(
    "📍 訂單方式：",
    orderData.orderType
);
console.log(
    "⏰ 取餐方式：",
    orderData.pickupMode
);
console.log(
    "📅 取餐日期：",
    orderData.pickupDate
);
console.log(
    "🕐 取餐時間：",
    orderData.pickupTime
);
console.log(
    "🍴 餐具：",
    orderData.tableware
);
console.log(
    "🛒 商品：",
    orderData.items
);
console.log(
    "================================"
);
return orderData;

}

/* ==================================================
📲 送出訂單
================================================== */

async function submitOrder() {

if (
    !validateForm()
) {
    return;
}
if (
    submitBtn &&
    submitBtn.disabled
) {
    return;
}
const orderData =
    buildOrderData();
/*
   儲存顧客資料
*/
localStorage.setItem(
    "customerName",
    orderData.name
);
localStorage.setItem(
    "customerPhone",
    orderData.phone
);
/*
   防止重複送出
*/
if (submitBtn) {
    submitBtn.disabled =
        true;
    submitBtn.textContent =
        "📲 訂單送出中...";
}
if (submitResult) {
    submitResult.style.display =
        "block";
    submitResult.innerHTML = `
        ⏳ 正在送出訂單，請稍候...
    `;
}
try {
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
                    JSON.stringify(
                        orderData
                    )
            }
        );
    const result =
        await response.json();
    console.log(
        "📥 GAS 回傳：",
        result
    );
    if (
        !result.success
    ) {
        throw new Error(
            result.message ||
            "訂單送出失敗"
        );
    }
    /*
       顯示成功
    */
    showSuccessModal(
        orderData,
        result
    );
    /*
       清空購物車
    */
    cart = [];
    saveCart();
    renderCheckoutCart();
}
catch (error) {
    console.error(
        "送出訂單失敗：",
        error
    );
    if (submitResult) {
        submitResult.innerHTML = `
            ❌ 訂單送出失敗
            <br><br>
            ${escapeHTML(
                error.message
            )}
            <br><br>
            請稍後再試一次
        `;
    }
    if (submitBtn) {
        submitBtn.disabled =
            false;
        submitBtn.textContent =
            "📲 送出訂單";
    }
}

}

/* ==================================================
🎉 成功彈窗
================================================== */

function showSuccessModal(

orderData,
result

) {

if (
    !successModal ||
    !successSummary
) {
    return;
}
let itemsHTML =
    "";
orderData.items.forEach(
    function(item) {
        const price =
            Number(
                item.price ||
                0
            );
        const qty =
            Number(
                item.qty ||
                1
            );
        const options =
            item.options ||
            {};
        const optionList =
            [];
        if (
            options.noodle
        ) {
            optionList.push(
                options.noodle
            );
        }
        if (
            options.spicy
        ) {
            optionList.push(
                options.spicy
            );
        }
        if (
            options.vegetable === false
        ) {
            optionList.push(
                "不加菜"
            );
        }
        if (
            options.onion === false
        ) {
            optionList.push(
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
                optionList.push(
                    options.sauce.join(
                        "＋"
                    )
                );
            } else {
                optionList.push(
                    options.sauce
                );
            }
        }
        itemsHTML += `
            <div class="success-item">
                <div>
                    <span>
                        ${escapeHTML(
                            item.name
                        )}
                        ×
                        ${qty}
                    </span>
                    ${
                        optionList.length > 0
                            ? `
                                <small
                                    style="
                                        display:block;
                                        margin-top:4px;
                                        opacity:.8;
                                    ">
                                    ${escapeHTML(
                                        optionList.join(
                                            " ・ "
                                        )
                                    )}
                                </small>
                            `
                            : ""
                    }
                </div>
                <strong>
                    NT$${
                        price *
                        qty
                    }
                </strong>
            </div>
        `;
    }
);
/*
   顯示內用 / 外帶
*/
const orderTypeText =
    orderData.orderType ||
    "內用";
let pickupInfoHTML =
    "";
if (
    orderTypeText === "外帶"
) {
    pickupInfoHTML = `
        <div class="success-pickup">
            🛍️ 外帶
            ${
                orderData.pickupMode
                    ? "｜" +
                      escapeHTML(
                          orderData.pickupMode
                      )
                    : ""
            }
            ${
                orderData.pickupDate
                    ? "<br>📅 " +
                      escapeHTML(
                          orderData.pickupDate
                      )
                    : ""
            }
            ${
                orderData.pickupTime
                    ? " " +
                      escapeHTML(
                          orderData.pickupTime
                      )
                    : ""
            }
        </div>
    `;
} else {
    pickupInfoHTML = `
        <div class="success-pickup">
            🍽️ 內用
        </div>
    `;
}
successSummary.innerHTML = `
    <div class="success-order-id">
        🆔 訂單編號：
        <strong>
            ${escapeHTML(
                result.orderId ||
                ""
            )}
        </strong>
    </div>
    <div class="success-customer">
        👤 ${escapeHTML(
            orderData.name
        )}
        <br>
        📱 ${escapeHTML(
            orderData.phone
        )}
    </div>
    ${pickupInfoHTML}
    <div class="success-items">
        ${itemsHTML}
    </div>
    <div class="success-total">
        訂單合計
        <strong>
            NT$${orderData.total}
        </strong>
    </div>
`;
successModal.style.display =
    "flex";
document.body.style.overflow =
    "hidden";

}

/* ==================================================
❌ 關閉成功彈窗
================================================== */

function closeSuccessModal() {

if (successModal) {
    successModal.style.display =
        "none";
}
document.body.style.overflow =
    "";
window.location.href =
    "index.html";

}

/* ==================================================
🔙 返回修改
================================================== */

if (backBtn) {

backBtn.addEventListener(
    "click",
    function() {
        window.location.href =
            "order.html";
    }
);

}

/* ==================================================
📲 送出按鈕
================================================== */

if (submitBtn) {

submitBtn.addEventListener(
    "click",
    submitOrder
);

}

/* ==================================================
🎉 成功按鈕
================================================== */

if (successConfirmBtn) {

successConfirmBtn.addEventListener(
    "click",
    closeSuccessModal
);

}

/* ==================================================
點擊成功視窗背景
================================================== */

if (successModal) {

successModal.addEventListener(
    "click",
    function(event) {
        if (
            event.target ===
            successModal
        ) {
            closeSuccessModal();
        }
    }
);

}

/* ==================================================
ESC 關閉成功視窗
================================================== */

document.addEventListener(

"keydown",
function(event) {
    if (
        event.key ===
        "Escape"
    ) {
        if (
            successModal &&
            successModal.style.display !==
            "none"
        ) {
            closeSuccessModal();
        }
    }
}

);

/* ==================================================
🚀 初始化
================================================== */

loadCustomer();

renderCheckoutCart();

/*
初始化：
內用 / 外帶
*/

updateOrderTypeUI();

/*
初始化：
最快取餐 / 預約取餐
*/

updatePickupModeUI();

console.log(
“🍜 初萊食麵 checkout.js V6 已成功載入”
);

console.log(
“🛒 目前購物車：”,
cart
);