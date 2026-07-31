/* ==================================================
🍜 初萊食麵｜checkout.js V5
結帳頁完整版本

功能：

1. 購物車顯示
2. 購物車數量增減
3. 購物車刪除
4. 客製化選項顯示
5. 姓名／手機記憶
6. 預約取餐日期
7. 平日 11:30～20:30
8. 六日 11:30～18:30
9. 自動依預約日期限制時間
10. 訂單送至 Google Apps Script
11. 成功訂單顯示
    ================================================== */

/* ==================================================
🔗 GAS API
================================================== */

const SCRIPT_URL =
“https://script.google.com/macros/s/AKfycbwFD8XzZCmF7AKly_L0LDqA5JoERcg0eex2PzQFU4n_aBWqw9GJsRV-4XcMM_GLET8MLw/exec”;

/* ==================================================
🛒 購物車
================================================== */

let cart =
JSON.parse(
localStorage.getItem(“cart”)
) || [];

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
    text || ""
)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");

}

/* ==================================================
💰 計算總金額
================================================== */

function getTotal() {

return cart.reduce(
    function(total, item) {
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
🧾 取得客製化選項文字
================================================== */

function getItemOptionsText(item) {

const options =
    item.options || {};
const optionList = [];
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
        options.sauce.forEach(
            function(sauce) {
                if (sauce) {
                    optionList.push(
                        sauce
                    );
                }
            }
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
    function(item, index) {
        const subtotal =
            Number(
                item.price || 0
            ) *
            Number(
                item.qty || 0
            );
        const optionList =
            getItemOptionsText(
                item
            );
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
                            item.name
                        )}
                    </h3>
                    ${optionsHTML}
                    <div class="checkout-item-price">
                        NT$${Number(
                            item.price || 0
                        )}
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
                            ${Number(
                                item.qty || 1
                            )}
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

/* 減少數量 */
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
                            cart[index].qty || 1
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
/* 增加數量 */
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
                    if (
                        Number(
                            cart[index].qty || 1
                        ) < 99
                    ) {
                        cart[index].qty++;
                    }
                    saveCart();
                    renderCheckoutCart();
                }
            );
        }
    );
/* 刪除商品 */
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
                        cart[index].name;
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
💾 儲存購物車
================================================== */

function saveCart() {

localStorage.setItem(
    "cart",
    JSON.stringify(
        cart
    )
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
🍜 取餐方式
================================================== */

document
.querySelectorAll(
‘input[name=“order-type”]’
)
.forEach(

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

/* ==================================================
⏰ 取餐模式
================================================== */

document
.querySelectorAll(
‘input[name=“pickup-mode”]’
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

/* ==================================================
📅 產生預約日期
================================================== */

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
        year +
        "-" +
        month +
        "-" +
        day;
    const week = [
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
        month +
        "/" +
        day +
        "（" +
        week +
        "）";
    pickupDate.appendChild(
        option
    );
}
/*
   先清空時間
   等客人選日期後再依星期產生
*/
if (pickupTime) {
    pickupTime.innerHTML = `
        <option value="">
            請先選擇取餐日期
        </option>
    `;
}

}

/* ==================================================
🕐 取得指定日期營業結束時間
================================================== */

function getBusinessClosingTime(
dateString
) {

/*
   預設平日
*/
if (
    !dateString
) {
    return "20:30";
}
/*
   使用本地日期
   避免時區造成星期錯誤
*/
const parts =
    dateString.split("-");
const date =
    new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
const day =
    date.getDay();
/*
   星期六、日
   18:30 打烊
*/
if (
    day === 0 ||
    day === 6
) {
    return "18:30";
}
/*
   星期一～五
   20:30 打烊
*/
return "20:30";

}

/* ==================================================
⏰ 依日期產生預約時間
================================================== */

function generatePickupTimes() {

if (
    !pickupTime
) {
    return;
}
const selectedDate =
    pickupDate
        ? pickupDate.value
        : "";
/*
   沒選日期
*/
if (
    !selectedDate
) {
    pickupTime.innerHTML = `
        <option value="">
            請先選擇取餐日期
        </option>
    `;
    return;
}
/*
   取得當天營業時間
*/
const closingTime =
    getBusinessClosingTime(
        selectedDate
    );
pickupTime.innerHTML = `
    <option value="">
        請選擇取餐時間
    </option>
`;
/*
   開始營業
   11:30
*/
const startTotal =
    11 * 60 + 30;
/*
   結束時間
   平日 20:30
   六日 18:30
*/
const closingParts =
    closingTime.split(":");
const closeTotal =
    Number(
        closingParts[0]
    ) * 60 +
    Number(
        closingParts[1]
    );
/*
   每 30 分鐘一個選項
*/
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
console.log(
    "📅 預約日期：",
    selectedDate
);
console.log(
    "⏰ 營業至：",
    closingTime
);

}

/* ==================================================
📅 日期變更
================================================== */

if (
pickupDate
) {

pickupDate.addEventListener(
    "change",
    function() {
        /*
           每次日期變更
           重新產生正確時間
        */
        generatePickupTimes();
    }
);

}

/* ==================================================
🔍 驗證資料
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
if (
    !name
) {
    alert(
        "請輸入姓名"
    );
    if (
        customerName
    ) {
        customerName.focus();
    }
    return false;
}
if (
    !/^09\d{8}$/.test(
        phone
    )
) {
    if (
        phoneError
    ) {
        phoneError.style.display =
            "block";
    }
    else {
        alert(
            "請輸入正確的手機號碼"
        );
    }
    if (
        customerPhone
    ) {
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
const orderType =
    document.querySelector(
        'input[name="order-type"]:checked'
    );
const pickupMode =
    document.querySelector(
        'input[name="pickup-mode"]:checked'
    );
/*
   外帶預約檢查
*/
if (
    orderType &&
    orderType.value ===
    "外帶"
) {
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
        /*
           再次確認時間是否符合營業時間
           防止客人用舊頁面或手動修改
        */
        const closingTime =
            getBusinessClosingTime(
                pickupDate.value
            );
        if (
            pickupTime.value >
            closingTime
        ) {
            alert(
                "您選擇的取餐時間已超過當日營業時間，請重新選擇。"
            );
            generatePickupTimes();
            return false;
        }
    }
}
return true;

}

/* ==================================================
📦 建立訂單資料
================================================== */

function buildOrderData() {

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
const noteElement =
    document.getElementById(
        "customer-note"
    );
return {
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
    orderType:
        orderType
            ? orderType.value
            : "內用",
    pickupMode:
        orderType &&
        orderType.value === "外帶" &&
        pickupMode
            ? pickupMode.value
            : "",
    pickupDate:
        orderType &&
        orderType.value === "外帶" &&
        pickupMode &&
        pickupMode.value === "預約取餐" &&
        pickupDate
            ? pickupDate.value
            : "",
    pickupTime:
        orderType &&
        orderType.value === "外帶" &&
        pickupMode &&
        pickupMode.value === "預約取餐" &&
        pickupTime
            ? pickupTime.value
            : "",
    tableware:
        orderType &&
        orderType.value === "外帶" &&
        tableware
            ? tableware.value
            : "",
    note:
        noteElement
            ? noteElement.value.trim()
            : "",
    total:
        getTotal(),
    /*
       完整保留 cart
       包含 item.options
    */
    items:
        cart
};

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
if (
    submitBtn
) {
    submitBtn.disabled =
        true;
    submitBtn.textContent =
        "📲 訂單送出中...";
}
if (
    submitResult
) {
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
        "📦 訂單回傳：",
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
       顯示成功摘要
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
catch (
    error
) {
    console.error(
        "❌ 送出訂單失敗：",
        error
    );
    if (
        submitResult
    ) {
        submitResult.innerHTML = `
            ❌ 訂單送出失敗
            <br>
            ${escapeHTML(
                error.message
            )}
            <br><br>
            請稍後再試一次
        `;
    }
    if (
        submitBtn
    ) {
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
    !successModal
) {
    return;
}
let itemsHTML =
    "";
orderData.items.forEach(
    function(item) {
        const optionList =
            getItemOptionsText(
                item
            );
        let optionHTML =
            "";
        if (
            optionList.length > 0
        ) {
            optionHTML = `
                <small>
                    ${escapeHTML(
                        optionList.join(
                            " ・ "
                        )
                    )}
                </small>
            `;
        }
        itemsHTML += `
            <div class="success-item">
                <span>
                    ${escapeHTML(
                        item.name
                    )}
                    ×
                    ${Number(
                        item.qty || 1
                    )}
                    ${optionHTML}
                </span>
                <strong>
                    NT$${
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.qty || 1
                        )
                    }
                </strong>
            </div>
        `;
    }
);
if (
    successSummary
) {
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
}
successModal.style.display =
    "flex";
document.body.style.overflow =
    "hidden";

}

/* ==================================================
❌ 關閉成功視窗
================================================== */

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

/* ==================================================
🔙 返回修改
================================================== */

if (
backBtn
) {

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

if (
submitBtn
) {

submitBtn.addEventListener(
    "click",
    submitOrder
);

}

/* ==================================================
🎉 成功按鈕
================================================== */

if (
successConfirmBtn
) {

successConfirmBtn.addEventListener(
    "click",
    closeSuccessModal
);

}

/* ==================================================
點擊成功視窗背景
================================================== */

if (
successModal
) {

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

console.log(
“🍜 初萊食麵 V5 checkout.js 已載入”
);

console.log(
“🛒 購物車：”,
cart
);