/* =========================================
🍜 初萊食麵
checkout.js｜結帳頁面完整相容版本

相容：
menu.js
order.js
checkout.html

購物車格式：
{
id: “O001”,
name: “黑輪”,
price: 10,
qty: 1,
type: “oden”,
options: {
sauce: “醬油膏”
}
}

支援：
🍜 麵類
🍚 米粉
🍢 關東煮
🐷 手工大腸
🥟 水餃
🍽️ 一般小菜／湯類／其他
========================================= */

/* =========================================
🛒 讀取購物車
========================================= */

let cart = [];

function loadCart() {

try {
    const savedCart =
        localStorage.getItem("cart");
    if (!savedCart) {
        cart = [];
        return;
    }
    const parsedCart =
        JSON.parse(savedCart);
    cart =
        Array.isArray(parsedCart)
            ? parsedCart
            : [];
} catch (error) {
    console.error(
        "❌ 購物車讀取失敗：",
        error
    );
    cart = [];
}

}

/* =========================================
💾 儲存購物車
========================================= */

function saveCart() {

try {
    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
} catch (error) {
    console.error(
        "❌ 購物車儲存失敗：",
        error
    );
}

}

/* =========================================
📌 DOM
========================================= */

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

const customerNote =
document.getElementById(
“customer-note”
);

const submitOrderBtn =
document.getElementById(
“submit-order-btn”
);

const backOrderBtn =
document.getElementById(
“back-order-btn”
);

const submitResult =
document.getElementById(
“submit-result”
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

const successModal =
document.getElementById(
“success-modal”
);

const successOrderSummary =
document.getElementById(
“success-order-summary”
);

const successConfirmBtn =
document.getElementById(
“success-confirm-btn”
);

/* =========================================
🛡 HTML 防注入
========================================= */

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

/* =========================================
💰 購物車總金額
========================================= */

function getCartTotal() {

return cart.reduce(
    function(
        total,
        item
    ) {
        const price =
            Number(
                item.price || 0
            );
        const qty =
            Number(
                item.qty || 0
            );
        return (
            total +
            price * qty
        );
    },
    0
);

}

/* =========================================
🔢 購物車商品總數量
========================================= */

function getCartCount() {

return cart.reduce(
    function(
        total,
        item
    ) {
        return (
            total +
            Number(
                item.qty || 0
            )
        );
    },
    0
);

}

/* =========================================
🧾 取得商品客製化顯示文字
========================================= */

function getOptionList(item) {

const optionList = [];
const options =
    item &&
    item.options
        ? item.options
        : {};
/* =====================================
   🍜 麵條
===================================== */
if (
    options.noodle
) {
    optionList.push(
        options.noodle
    );
}
/* =====================================
   🌶️ 辣度
===================================== */
if (
    options.spicy
) {
    optionList.push(
        options.spicy
    );
}
/* =====================================
   🥬 不加菜
===================================== */
if (
    options.vegetable === false
) {
    optionList.push(
        "不加菜"
    );
}
/* =====================================
   🧅 不加蔥
===================================== */
if (
    options.onion === false
) {
    optionList.push(
        "不加蔥"
    );
}
/* =====================================
   🥣 醬料
===================================== */
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
    }
    else {
        optionList.push(
            options.sauce
        );
    }
}
return optionList;

}

/* =========================================
🛒 顯示訂單商品
========================================= */

function renderOrderList() {

if (!orderList) {
    console.error(
        "❌ 找不到 #order-list"
    );
    return;
}
/* =====================================
   空購物車
===================================== */
if (
    !Array.isArray(cart) ||
    cart.length === 0
) {
    orderList.innerHTML = `
        <div class="empty-order">
            🛒 尚未加入商品
            <br><br>
            <button
                type="button"
                id="empty-order-back-btn">
                ← 返回選擇餐點
            </button>
        </div>
    `;
    const emptyBackBtn =
        document.getElementById(
            "empty-order-back-btn"
        );
    if (emptyBackBtn) {
        emptyBackBtn.addEventListener(
            "click",
            function() {
                window.location.href =
                    "index.html";
            }
        );
    }
    updateOrderTotal();
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
        const optionList =
            getOptionList(
                item
            );
        let optionsHTML =
            "";
        if (
            optionList.length > 0
        ) {
            optionsHTML = `
                <div
                    class="checkout-item-options">
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
                <div
                    class="checkout-order-info">
                    <h3>
                        ${escapeHTML(
                            item.name ||
                            "商品"
                        )}
                    </h3>
                    ${optionsHTML}
                    <div
                        class="checkout-order-price">
                        單價 NT$${price}
                    </div>
                </div>
                <div
                    class="checkout-order-actions">
                    <div
                        class="checkout-qty">
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
/* =====================================
   💰 總金額
===================================== */
html += `
    <div
        class="checkout-total-row">
        <span>
            訂單合計
        </span>
        <strong>
            NT$${getCartTotal()}
        </strong>
    </div>
`;
orderList.innerHTML =
    html;
/* =====================================
   ➖ 減少數量
===================================== */
orderList
    .querySelectorAll(
        ".checkout-minus"
    )
    .forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    changeCartQty(
                        Number(
                            this.dataset.index
                        ),
                        -1
                    );
                }
            );
        }
    );
/* =====================================
   ➕ 增加數量
===================================== */
orderList
    .querySelectorAll(
        ".checkout-plus"
    )
    .forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    changeCartQty(
                        Number(
                            this.dataset.index
                        ),
                        1
                    );
                }
            );
        }
    );
/* =====================================
   🗑️ 刪除
===================================== */
orderList
    .querySelectorAll(
        ".checkout-delete"
    )
    .forEach(
        function(button) {
            button.addEventListener(
                "click",
                function() {
                    removeCartItem(
                        Number(
                            this.dataset.index
                        )
                    );
                }
            );
        }
    );
updateOrderTotal();

}

/* =========================================
➕➖ 修改購物車數量
========================================= */

function changeCartQty(
index,
change
) {

if (!cart[index]) {
    return;
}
let newQty =
    Number(
        cart[index].qty || 1
    ) +
    Number(
        change
    );
if (
    newQty <= 0
) {
    removeCartItem(
        index
    );
    return;
}
if (
    newQty > 99
) {
    newQty =
        99;
}
cart[index].qty =
    newQty;
saveCart();
renderOrderList();

}

/* =========================================
🗑️ 刪除商品
========================================= */

function removeCartItem(index) {

if (!cart[index]) {
    return;
}
const productName =
    cart[index].name ||
    "商品";
if (
    !confirm(
        `確定要移除「${productName}」嗎？`
    )
) {
    return;
}
cart.splice(
    index,
    1
);
saveCart();
renderOrderList();

}

/* =========================================
💰 更新訂單總額
========================================= */

function updateOrderTotal() {

const total =
    getCartTotal();
if (orderTotal) {
    orderTotal.textContent =
        total;
}

}

/* =========================================
👤 載入顧客資料
========================================= */

function loadCustomerData() {

let customer = {};
try {
    customer =
        JSON.parse(
            localStorage.getItem(
                "customerInfo"
            )
        ) || {};
} catch (error) {
    customer = {};
}
if (
    customer.name &&
    customerName
) {
    customerName.value =
        customer.name;
}
if (
    customer.phone &&
    customerPhone
) {
    customerPhone.value =
        customer.phone;
}
updateWelcomeCustomer();

}

/* =========================================
👤 更新歡迎文字
========================================= */

function updateWelcomeCustomer() {

if (
    !welcomeCustomer ||
    !welcomeName ||
    !customerName
) {
    return;
}
const name =
    customerName.value.trim();
if (name) {
    welcomeName.textContent =
        name;
    welcomeCustomer.style.display =
        "block";
}
else {
    welcomeCustomer.style.display =
        "none";
}

}

/* =========================================
💾 儲存顧客資料
========================================= */

function saveCustomerData() {

const data = {
    name:
        customerName
            ? customerName.value.trim()
            : "",
    phone:
        customerPhone
            ? customerPhone.value.trim()
            : ""
};
try {
    localStorage.setItem(
        "customerInfo",
        JSON.stringify(
            data
        )
    );
} catch (error) {
    console.error(
        "❌ 顧客資料儲存失敗：",
        error
    );
}

}

/* =========================================
📱 驗證手機
========================================= */

function validatePhone() {

if (!customerPhone) {
    return false;
}
const phone =
    customerPhone.value.trim();
const valid =
    /^09\d{8}$/.test(
        phone
    );
if (phoneError) {
    phoneError.style.display =
        valid
            ? "none"
            : "block";
}
return valid;

}

/* =========================================
🍜 內用 / 外帶
========================================= */

function setupOrderType() {

const orderTypeInputs =
    document.querySelectorAll(
        'input[name="order-type"]'
    );
orderTypeInputs.forEach(
    function(input) {
        input.addEventListener(
            "change",
            function() {
                if (
                    this.value ===
                    "外帶"
                ) {
                    if (
                        takeoutOptions
                    ) {
                        takeoutOptions.style.display =
                            "block";
                    }
                }
                else {
                    if (
                        takeoutOptions
                    ) {
                        takeoutOptions.style.display =
                            "none";
                    }
                }
            }
        );
    }
);
const checked =
    document.querySelector(
        'input[name="order-type"]:checked'
    );
if (
    checked &&
    checked.value ===
    "外帶"
) {
    if (takeoutOptions) {
        takeoutOptions.style.display =
            "block";
    }
}
else {
    if (takeoutOptions) {
        takeoutOptions.style.display =
            "none";
    }
}

}

/* =========================================
⏰ 外帶取餐模式
========================================= */

function setupPickupMode() {

document
    .querySelectorAll(
        'input[name="pickup-mode"]'
    )
    .forEach(
        function(input) {
            input.addEventListener(
                "change",
                function() {
                    if (
                        this.value ===
                        "預約取餐"
                    ) {
                        if (
                            reservationTimeArea
                        ) {
                            reservationTimeArea.style.display =
                                "block";
                        }
                        generatePickupDates();
                        generatePickupTimes();
                    }
                    else {
                        if (
                            reservationTimeArea
                        ) {
                            reservationTimeArea.style.display =
                                "none";
                        }
                    }
                }
            );
        }
    );
const checked =
    document.querySelector(
        'input[name="pickup-mode"]:checked'
    );
if (
    checked &&
    checked.value ===
    "預約取餐"
) {
    if (
        reservationTimeArea
    ) {
        reservationTimeArea.style.display =
            "block";
    }
}
else {
    if (
        reservationTimeArea
    ) {
        reservationTimeArea.style.display =
            "none";
    }
}

}

/* =========================================
📅 產生取餐日期
========================================= */

function generatePickupDates() {

if (!pickupDate) {
    return;
}
pickupDate.innerHTML = `
    <option value="">
        請選擇日期
    </option>
`;
const today =
    new Date();
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
    const value =
        `${year}-${month}-${day}`;
    const label =
        `${month}/${day}`;
    pickupDate.innerHTML += `
        <option
            value="${value}">
            ${label}
        </option>
    `;
}

}

/* =========================================
⏰ 產生取餐時間
========================================= */

function generatePickupTimes() {

if (!pickupTime) {
    return;
}
pickupTime.innerHTML = `
    <option value="">
        請選擇時間
    </option>
`;
for (
    let hour = 11;
    hour <= 20;
    hour++
) {
    const minutes = [
        "00",
        "30"
    ];
    minutes.forEach(
        function(minute) {
            const value =
                `${String(hour).padStart(2, "0")}:${minute}`;
            pickupTime.innerHTML += `
                <option
                    value="${value}">
                    ${value}
                </option>
            `;
        }
    );
}

}

/* =========================================
📲 取得訂單資料
========================================= */

function getOrderData() {

const orderType =
    document.querySelector(
        'input[name="order-type"]:checked'
    );
const pickupMode =
    document.querySelector(
        'input[name="pickup-mode"]:checked'
    );
const tableware =
    document.querySelector(
        'input[name="tableware"]:checked'
    );
return {
    customerName:
        customerName
            ? customerName.value.trim()
            : "",
    customerPhone:
        customerPhone
            ? customerPhone.value.trim()
            : "",
    orderType:
        orderType
            ? orderType.value
            : "內用",
    pickupMode:
        pickupMode
            ? pickupMode.value
            : "",
    pickupDate:
        pickupDate
            ? pickupDate.value
            : "",
    pickupTime:
        pickupTime
            ? pickupTime.value
            : "",
    tableware:
        tableware
            ? tableware.value
            : "",
    note:
        customerNote
            ? customerNote.value.trim()
            : "",
    items:
        cart.map(
            function(item) {
                return {
                    id:
                        item.id || "",
                    name:
                        item.name || "",
                    price:
                        Number(
                            item.price || 0
                        ),
                    qty:
                        Number(
                            item.qty || 1
                        ),
                    type:
                        item.type || "",
                    options:
                        item.options || {}
                };
            }
        ),
    total:
        getCartTotal(),
    createdAt:
        new Date().toISOString()
};

}

/* =========================================
📋 產生成功訂單摘要
========================================= */

function buildOrderSummary(order) {

let html = `
    <div
        class="success-summary-customer">
        <strong>
            ${escapeHTML(
                order.customerName
            )}
        </strong>
        <br>
        ${escapeHTML(
            order.customerPhone
        )}
    </div>
`;
html += `
    <div
        class="success-summary-items">
`;
order.items.forEach(
    function(item) {
        const options =
            getOptionList(
                item
            );
        html += `
            <div
                class="success-summary-item">
                <div>
                    ${escapeHTML(
                        item.name
                    )}
                    × ${Number(
                        item.qty || 1
                    )}
                </div>
                ${
                    options.length > 0
                        ? `
                            <small>
                                ${escapeHTML(
                                    options.join(
                                        " ・ "
                                    )
                                )}
                            </small>
                          `
                        : ""
                }
            </div>
        `;
    }
);
html += `
    </div>
    <div
        class="success-summary-total">
        訂單合計：
        <strong>
            NT$${Number(
                order.total
            )}
        </strong>
    </div>
`;
return html;

}

/* =========================================
🚀 送出訂單
========================================= */

async function submitOrder() {

if (
    cart.length === 0
) {
    alert(
        "購物車目前沒有商品"
    );
    return;
}
if (
    !customerName ||
    !customerName.value.trim()
) {
    alert(
        "請輸入姓名"
    );
    if (customerName) {
        customerName.focus();
    }
    return;
}
if (
    !validatePhone()
) {
    alert(
        "請輸入正確的手機號碼"
    );
    if (customerPhone) {
        customerPhone.focus();
    }
    return;
}
const selectedOrderType =
    document.querySelector(
        'input[name="order-type"]:checked'
    );
const orderType =
    selectedOrderType
        ? selectedOrderType.value
        : "內用";
/* =====================================
   外帶預約驗證
===================================== */
if (
    orderType === "外帶"
) {
    const pickupMode =
        document.querySelector(
            'input[name="pickup-mode"]:checked'
        );
    if (
        pickupMode &&
        pickupMode.value ===
        "預約取餐"
    ) {
        if (
            !pickupDate ||
            !pickupDate.value
        ) {
            alert(
                "請選擇取餐日期"
            );
            return;
        }
        if (
            !pickupTime ||
            !pickupTime.value
        ) {
            alert(
                "請選擇取餐時間"
            );
            return;
        }
    }
}
const order =
    getOrderData();
saveCustomerData();
/* =====================================
   防止重複送單
===================================== */
if (submitOrderBtn) {
    submitOrderBtn.disabled =
        true;
    submitOrderBtn.textContent =
        "📲 訂單送出中...";
}
if (submitResult) {
    submitResult.style.display =
        "block";
    submitResult.textContent =
        "正在送出訂單，請稍候...";
}
try {
    /*
    =====================================
    ⚠️ Google Apps Script URL
    請確認 checkout.html 有：
    <script>
    window.SCRIPT_URL =
    "你的 GAS 網址";
    </script>
    =====================================
    */
    const SCRIPT_URL =
        window.SCRIPT_URL || "";
    if (
        !SCRIPT_URL
    ) {
        throw new Error(
            "尚未設定 SCRIPT_URL"
        );
    }
    await fetch(
        SCRIPT_URL,
        {
            method:
                "POST",
            mode:
                "no-cors",
            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },
            body:
                JSON.stringify(
                    order
                )
        }
    );
    /* =================================
       💾 保存最後訂單
    ================================= */
    localStorage.setItem(
        "lastOrder",
        JSON.stringify(
            order
        )
    );
    /* =================================
       🛒 清空購物車
    ================================= */
    localStorage.removeItem(
        "cart"
    );
    cart = [];
    /* =================================
       🎉 成功
    ================================= */
    if (submitResult) {
        submitResult.textContent =
            "訂單已成功送出！";
    }
    showSuccessModal(
        order
    );
} catch (error) {
    console.error(
        "❌ 訂單送出失敗：",
        error
    );
    if (submitResult) {
        submitResult.textContent =
            "訂單送出失敗，請稍後再試。";
    }
    alert(
        "訂單送出失敗，請確認網路連線或稍後再試。"
    );
    if (submitOrderBtn) {
        submitOrderBtn.disabled =
            false;
        submitOrderBtn.textContent =
            "📲 送出訂單";
    }
}

}

/* =========================================
🎉 顯示成功視窗
========================================= */

function showSuccessModal(order) {

if (
    successOrderSummary
) {
    successOrderSummary.innerHTML =
        buildOrderSummary(
            order
        );
}
if (
    successModal
) {
    successModal.style.display =
        "flex";
    document.body.style.overflow =
        "hidden";
}

}

/* =========================================
❌ 關閉成功視窗
========================================= */

function closeSuccessModal() {

if (
    successModal
) {
    successModal.style.display =
        "none";
}
document.body.style.overflow =
    "";
window.location.href =
    "index.html";

}

/* =========================================
🔙 返回修改餐點
========================================= */

if (
backOrderBtn
) {

backOrderBtn.addEventListener(
    "click",
    function() {
        window.location.href =
            "index.html";
    }
);

}

/* =========================================
📲 送出訂單按鈕
========================================= */

if (
submitOrderBtn
) {

submitOrderBtn.addEventListener(
    "click",
    submitOrder
);

}

/* =========================================
🎉 成功按鈕
========================================= */

if (
successConfirmBtn
) {

successConfirmBtn.addEventListener(
    "click",
    closeSuccessModal
);

}

/* =========================================
📱 手機輸入即時驗證
========================================= */

if (
customerPhone
) {

customerPhone.addEventListener(
    "input",
    function() {
        if (
            phoneError
        ) {
            phoneError.style.display =
                "none";
        }
    }
);

}

/* =========================================
👤 姓名輸入
========================================= */

if (
customerName
) {

customerName.addEventListener(
    "input",
    updateWelcomeCustomer
);

}

/* =========================================
🍜 取餐方式初始化
========================================= */

setupOrderType();

/* =========================================
⏰ 取餐模式初始化
========================================= */

setupPickupMode();

/* =========================================
📅 初始化日期
========================================= */

generatePickupDates();

/* =========================================
⏰ 初始化時間
========================================= */

generatePickupTimes();

/* =========================================
👤 載入顧客資料
========================================= */

loadCustomerData();

/* =========================================
🛒 載入購物車
========================================= */

loadCart();

/* =========================================
🛒 顯示購物車
========================================= */

renderOrderList();

/* =========================================
💰 更新總額
========================================= */

updateOrderTotal();

/* =========================================
🚀 初始化完成
========================================= */

console.log(
“🍜 初萊食麵 checkout.js 已成功載入”
);

console.log(
“目前購物車商品數量：”,
getCartCount()
);

console.log(
“目前購物車內容：”,
cart
);

console.log(
“購物車總金額：”,
getCartTotal()
);