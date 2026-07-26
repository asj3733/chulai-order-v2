/* =========================================
   初萊食麵 V3
   checkout.js 正式版
   最快取餐：現在時間 + 20 分鐘
========================================= */
/* =========================================
   V3 API
========================================= */
const V3_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwde83nn5kmPM2zeZZ2mEZLQTBtZPFTYfvoSsqIClwkMV3voJCO4KUgvLquQQ7am1Nl_Q/exec";
/* =========================================
   讀取購物車
========================================= */
let cart = [];
try {
    cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];
    if (!Array.isArray(cart)) {
        cart = [];
    }
} catch (error) {
    console.error(
        "購物車讀取失敗",
        error
    );
    cart = [];
}
/* =========================================
   DOM
========================================= */
const orderList =
    document.getElementById(
        "order-list"
    );
const orderTotal =
    document.getElementById(
        "order-total"
    );
const nameInput =
    document.getElementById(
        "customer-name"
    );
const phoneInput =
    document.getElementById(
        "customer-phone"
    );
const phoneError =
    document.getElementById(
        "phone-error"
    );
const welcomeCustomer =
    document.getElementById(
        "welcome-customer"
    );
const welcomeName =
    document.getElementById(
        "welcome-name"
    );
const takeoutOptions =
    document.getElementById(
        "takeout-options"
    );
const reservationTimeArea =
    document.getElementById(
        "reservation-time-area"
    );
const pickupDate =
    document.getElementById(
        "pickup-date"
    );
const pickupTime =
    document.getElementById(
        "pickup-time"
    );
const customerNote =
    document.getElementById(
        "customer-note"
    );
const submitBtn =
    document.getElementById(
        "submit-order-btn"
    );
const submitResult =
    document.getElementById(
        "submit-result"
    );
const successModal =
    document.getElementById(
        "success-modal"
    );
const successOrderSummary =
    document.getElementById(
        "success-order-summary"
    );
const successConfirmBtn =
    document.getElementById(
        "success-confirm-btn"
    );
const backOrderBtn =
    document.getElementById(
        "back-order-btn"
    );
/* =========================================
   顯示訂單
========================================= */
function renderOrder() {
    if (!orderList) {
        return;
    }
    if (cart.length === 0) {
        orderList.innerHTML = `
            <p>
                購物車目前沒有商品
            </p>
        `;
        if (orderTotal) {
            orderTotal.textContent =
                "0";
        }
        return;
    }
    let html = "";
    let total = 0;
    cart.forEach(
        item => {
            const subtotal =
                Number(item.price || 0) *
                Number(item.qty || 0);
            total +=
                subtotal;
            let optionText = "";
            if (item.options) {
                const options =
                    item.options;
                const optionList =
                    [];
                if (options.noodle) {
                    optionList.push(
                        options.noodle
                    );
                }
                if (options.spicy) {
                    optionList.push(
                        options.spicy
                    );
                }
                if (
                    options.vegetable ===
                    false
                ) {
                    optionList.push(
                        "不加菜"
                    );
                }
                if (
                    options.onion ===
                    false
                ) {
                    optionList.push(
                        "不加蔥"
                    );
                }
                if (options.sauce) {
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
                if (
                    optionList.length > 0
                ) {
                    optionText = `
                        <div class="order-options">
                            ${optionList.join(
                                " ・ "
                            )}
                        </div>
                    `;
                }
            }
            html += `
                <div class="checkout-item">
                    <div>
                        <strong>
                            ${escapeHTML(
                                item.name
                            )}
                        </strong>
                        ${optionText}
                        <div>
                            NT$${item.price}
                            ×
                            ${item.qty}
                        </div>
                    </div>
                    <strong>
                        NT$${subtotal}
                    </strong>
                </div>
            `;
        }
    );
    html += `
        <hr>
        <div class="checkout-total-row">
            <strong>
                合計
            </strong>
            <strong>
                NT$${total}
            </strong>
        </div>
    `;
    orderList.innerHTML =
        html;
    if (orderTotal) {
        orderTotal.textContent =
            total;
    }
}
/* =========================================
   載入顧客資料
========================================= */
function loadCustomerData() {
    const savedName =
        localStorage.getItem(
            "customerName"
        ) || "";
    const savedPhone =
        localStorage.getItem(
            "customerPhone"
        ) || "";
    if (nameInput) {
        nameInput.value =
            savedName;
    }
    if (phoneInput) {
        phoneInput.value =
            savedPhone;
    }
    if (
        savedName &&
        welcomeCustomer &&
        welcomeName
    ) {
        welcomeCustomer.style.display =
            "block";
        welcomeName.textContent =
            savedName;
    }
}
/* =========================================
   儲存顧客資料
========================================= */
function saveCustomerData() {
    if (nameInput) {
        localStorage.setItem(
            "customerName",
            nameInput.value.trim()
        );
    }
    if (phoneInput) {
        localStorage.setItem(
            "customerPhone",
            phoneInput.value.trim()
        );
    }
}
/* =========================================
   電話只允許數字
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
            if (phoneError) {
                phoneError.style.display =
                    "none";
            }
        }
    );
}
/* =========================================
   電話格式驗證
========================================= */
function validatePhone() {
    if (!phoneInput) {
        return false;
    }
    const phone =
        phoneInput.value.trim();
    const valid =
        /^09\d{8}$/.test(
            phone
        );
    if (!valid) {
        if (phoneError) {
            phoneError.style.display =
                "block";
            phoneError.textContent =
                "📱 請輸入正確的手機號碼，例如 0912345678";
        }
        phoneInput.focus();
        return false;
    }
    if (phoneError) {
        phoneError.style.display =
            "none";
    }
    return true;
}
/* =========================================
   取得目前選擇的取餐模式
========================================= */
function getPickupMode() {
    const selected =
        document.querySelector(
            'input[name="pickup-mode"]:checked'
        );
    return selected
        ? selected.value
        : "最快取餐";
}
/* =========================================
   格式化日期
========================================= */
function formatDate(date) {
    const year =
        date.getFullYear();
    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );
    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );
    return `${year}-${month}-${day}`;
}
/* =========================================
   格式化時間
========================================= */
function formatTime(date) {
    const hour =
        String(
            date.getHours()
        )
        .padStart(
            2,
            "0"
        );
    const minute =
        String(
            date.getMinutes()
        )
        .padStart(
            2,
            "0"
        );
    return `${hour}:${minute}`;
}
/* =========================================
   最快取餐
   現在時間 + 20 分鐘
========================================= */
function getFastestPickup() {
    const now =
        new Date();
    now.setMinutes(
        now.getMinutes()
        +
        20
    );
    /*
       取餐時間以 10 分鐘為單位
       例如：
       12:03 + 20
       → 12:30
    */
    const minutes =
        now.getMinutes();
    const roundedMinutes =
        Math.ceil(
            minutes / 10
        ) * 10;
    now.setMinutes(
        roundedMinutes
    );
    now.setSeconds(
        0
    );
    now.setMilliseconds(
        0
    );
    return {
        date:
            formatDate(
                now
            ),
        time:
            formatTime(
                now
            )
    };
}
/* =========================================
   產生預約日期
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
    /*
       提供今天～未來 7 天
    */
    for (
        let i = 0;
        i <= 7;
        i++
    ) {
        const date =
            new Date(
                today
            );
        date.setDate(
            today.getDate()
            +
            i
        );
        const value =
            formatDate(
                date
            );
        const option =
            document.createElement(
                "option"
            );
        option.value =
            value;
        option.textContent =
            i === 0
                ?
                `今天 (${value})`
                :
                value;
        pickupDate.appendChild(
            option
        );
    }
}
/* =========================================
   產生預約時間
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
    const now =
        new Date();
    /*
       最早 30 分鐘後
    */
    now.setMinutes(
        now.getMinutes()
        +
        30
    );
    /*
       對齊 10 分鐘
    */
    now.setMinutes(
        Math.ceil(
            now.getMinutes() / 10
        ) * 10
    );
    /*
       提供未來 6 小時
    */
    for (
        let i = 0;
        i < 36;
        i++
    ) {
        const time =
            new Date(
                now.getTime()
                +
                i *
                10 *
                60 *
                1000
            );
        const value =
            formatTime(
                time
            );
        const option =
            document.createElement(
                "option"
            );
        option.value =
            value;
        option.textContent =
            value;
        pickupTime.appendChild(
            option
        );
    }
}
/* =========================================
   內用／外帶
========================================= */
document.querySelectorAll(
    'input[name="order-type"]'
).forEach(
    radio => {
        radio.addEventListener(
            "change",
            function() {
                if (
                    this.checked &&
                    this.value ===
                    "外帶"
                ) {
                    if (takeoutOptions) {
                        takeoutOptions.style.display =
                            "block";
                    }
                    /*
                       預設最快取餐
                    */
                    const fastestRadio =
                        document.querySelector(
                            'input[name="pickup-mode"][value="最快取餐"]'
                        );
                    if (fastestRadio) {
                        fastestRadio.checked =
                            true;
                    }
                    if (
                        reservationTimeArea
                    ) {
                        reservationTimeArea.style.display =
                            "none";
                    }
                }
                else {
                    if (takeoutOptions) {
                        takeoutOptions.style.display =
                            "none";
                    }
                }
            }
        );
    }
);
/* =========================================
   最快／預約切換
========================================= */
document.querySelectorAll(
    'input[name="pickup-mode"]'
).forEach(
    radio => {
        radio.addEventListener(
            "change",
            function() {
                if (!this.checked) {
                    return;
                }
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
/* =========================================
   建立訂單內容文字
========================================= */
function buildOrderItems() {
    return cart.map(
        item => {
            const options =
                item.options ||
                {};
            const optionText =
                [];
            if (options.noodle) {
                optionText.push(
                    options.noodle
                );
            }
            if (options.spicy) {
                optionText.push(
                    options.spicy
                );
            }
            if (
                options.vegetable ===
                false
            ) {
                optionText.push(
                    "不加菜"
                );
            }
            if (
                options.onion ===
                false
            ) {
                optionText.push(
                    "不加蔥"
                );
            }
            if (options.sauce) {
                if (
                    Array.isArray(
                        options.sauce
                    )
                ) {
                    optionText.push(
                        options.sauce.join(
                            "＋"
                        )
                    );
                }
                else {
                    optionText.push(
                        options.sauce
                    );
                }
            }
            return {
                name:
                    item.name,
                qty:
                    Number(
                        item.qty
                    ),
                price:
                    Number(
                        item.price
                    ),
                subtotal:
                    Number(
                        item.price
                    ) *
                    Number(
                        item.qty
                    ),
                options:
                    optionText.join(
                        " ・ "
                    )
            };
        }
    );
}
/* =========================================
   建立成功彈窗內容
========================================= */
function showSuccessModal(
    orderData,
    orderNumber
) {
    if (
        !successModal
    ) {
        return;
    }
    let pickupText =
        "";
    if (
        orderData.orderType ===
        "外帶"
    ) {
        pickupText = `
            <div>
                🥡 取餐方式：
                <strong>
                    ${escapeHTML(
                        orderData.pickupMode ||
                        "最快取餐"
                    )}
                </strong>
            </div>
            <div>
                📅 取餐日期：
                <strong>
                    ${escapeHTML(
                        orderData.pickupDate ||
                        ""
                    )}
                </strong>
            </div>
            <div>
                ⏰ 取餐時間：
                <strong>
                    ${escapeHTML(
                        orderData.pickupTime ||
                        ""
                    )}
                </strong>
            </div>
        `;
    }
    else {
        pickupText = `
            <div>
                🍜 用餐方式：
                <strong>
                    內用
                </strong>
            </div>
        `;
    }
    successOrderSummary.innerHTML = `
        <div class="success-summary-title">
            📋 訂單資訊
        </div>
        ${
            orderNumber
                ?
                `
                <div>
                    🔢 訂單編號：
                    <strong>
                        ${escapeHTML(
                            orderNumber
                        )}
                    </strong>
                </div>
                `
                :
                ""
        }
        ${pickupText}
        <div>
            💰 訂單金額：
            <strong>
                NT$${orderData.total}
            </strong>
        </div>
    `;
    successModal.style.display =
        "flex";
    document.body.style.overflow =
        "hidden";
    setTimeout(
        () => {
            if (successConfirmBtn) {
                successConfirmBtn.focus();
            }
        },
        100
    );
}
/* =========================================
   關閉成功彈窗
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
}
if (
    successConfirmBtn
) {
    successConfirmBtn.addEventListener(
        "click",
        closeSuccessModal
    );
}
/* =========================================
   點擊遮罩不關閉
========================================= */
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
                return;
            }
        }
    );
}
/* =========================================
   送出訂單
========================================= */
if (
    submitBtn
) {
    submitBtn.addEventListener(
        "click",
        submitOrder
    );
}
/* =========================================
   正式送單
========================================= */
async function submitOrder() {
    if (
        submitBtn.disabled
    ) {
        return;
    }
    /*
       購物車檢查
    */
    if (
        cart.length === 0
    ) {
        alert(
            "購物車目前是空的"
        );
        return;
    }
    /*
       姓名
    */
    const name =
        nameInput
            ? nameInput.value.trim()
            : "";
    if (!name) {
        alert(
            "請輸入姓名"
        );
        if (nameInput) {
            nameInput.focus();
        }
        return;
    }
    /*
       電話
    */
    if (
        !validatePhone()
    ) {
        return;
    }
    /*
       用餐方式
    */
    const orderType =
        document.querySelector(
            'input[name="order-type"]:checked'
        )?.value
        ||
        "內用";
    /*
       初始化取餐資料
    */
    let pickupMode =
        "";
    let selectedPickupDate =
        "";
    let selectedPickupTime =
        "";
    /*
       外帶
    */
    if (
        orderType ===
        "外帶"
    ) {
        pickupMode =
            getPickupMode();
        /*
           最快取餐
           自動 +20 分鐘
        */
        if (
            pickupMode ===
            "最快取餐"
        ) {
            const fastest =
                getFastestPickup();
            selectedPickupDate =
                fastest.date;
            selectedPickupTime =
                fastest.time;
        }
        /*
           預約取餐
        */
        else {
            selectedPickupDate =
                pickupDate
                    ? pickupDate.value
                    : "";
            selectedPickupTime =
                pickupTime
                    ? pickupTime.value
                    : "";
            if (
                !selectedPickupDate
            ) {
                alert(
                    "請選擇取餐日期"
                );
                if (pickupDate) {
                    pickupDate.focus();
                }
                return;
            }
            if (
                !selectedPickupTime
            ) {
                alert(
                    "請選擇取餐時間"
                );
                if (pickupTime) {
                    pickupTime.focus();
                }
                return;
            }
        }
    }
    /*
       餐具
    */
    let tableware =
        "";
    if (
        orderType ===
        "外帶"
    ) {
        tableware =
            document.querySelector(
                'input[name="tableware"]:checked'
            )?.value
            ||
            "需要餐具";
    }
    /*
       備註
    */
    const note =
        customerNote
            ? customerNote.value.trim()
            : "";
    /*
       計算總金額
    */
    const total =
        cart.reduce(
            (sum, item) =>
                sum
                +
                Number(
                    item.price
                )
                *
                Number(
                    item.qty
                ),
            0
        );
    /*
       商品
    */
    const items =
        buildOrderItems();
    /*
       建立訂單資料
    */
    const orderData = {
        action:
            "newOrder",
        name:
            name,
        phone:
            phoneInput.value.trim(),
        orderType:
            orderType,
        pickupMode:
            pickupMode,
        pickupDate:
            selectedPickupDate,
        pickupTime:
            selectedPickupTime,
        tableware:
            tableware,
        note:
            note,
        total:
            total,
        items:
            items
    };
    /*
       防止重複送單
    */
    submitBtn.disabled =
        true;
    submitBtn.textContent =
        "📲 訂單傳送中...";
    try {
        const response =
            await fetch(
                V3_SCRIPT_URL,
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
        if (!response.ok) {
            throw new Error(
                "HTTP " +
                response.status
            );
        }
        const result =
            await response.json();
        console.log(
            "送單結果：",
            result
        );
        /*
           成功
        */
        if (
            result.success
        ) {
            /*
               儲存顧客資料
            */
            saveCustomerData();
            /*
               清除購物車
            */
            localStorage.removeItem(
                "cart"
            );
            /*
               顯示成功彈窗
            */
            showSuccessModal(
                orderData,
                result.orderNumber ||
                result.orderId ||
                ""
            );
            /*
               隱藏原本結果
            */
            if (
                submitResult
            ) {
                submitResult.style.display =
                    "none";
            }
            submitBtn.style.display =
                "none";
        }
        else {
            throw new Error(
                result.message
                ||
                "訂單送出失敗"
            );
        }
    }
    catch (
        error
    ) {
        console.error(
            "訂單送出錯誤：",
            error
        );
        alert(
            "⚠️ 訂單送出失敗\n\n" +
            (
                error.message ||
                "請確認網路後再試一次"
            )
        );
        submitBtn.disabled =
            false;
        submitBtn.textContent =
            "📲 送出訂單";
    }
}
/* =========================================
   返回修改餐點
========================================= */
if (
    backOrderBtn
) {
    backOrderBtn.addEventListener(
        "click",
        function() {
            window.location.href =
                "order.html";
        }
    );
}
/* =========================================
   ESC 關閉成功視窗
========================================= */
document.addEventListener(
    "keydown",
    function(event) {
        if (
            event.key ===
            "Escape" &&
            successModal &&
            successModal.style.display ===
            "flex"
        ) {
            closeSuccessModal();
        }
    }
);
/* =========================================
   防止 HTML 注入
========================================= */
function escapeHTML(
    text
) {
    return String(
        text ||
        ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;",
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
   初始化
========================================= */
renderOrder();
loadCustomerData();
console.log(
    "🍜 初萊食麵 V3 checkout.js 正式版已載入"
);