/* ==================================================
   🍜 初萊食麵｜checkout.js V5
   結帳頁完整版本

   功能：
   1. 購物車顯示
   2. 購物車數量增減
   3. 購物車刪除
   4. 商品客製化選項顯示
   5. 顧客資料記憶
   6. 內用 / 外帶切換
   7. 最快取餐 / 預約取餐
   8. 預約日期
   9. 平日 11:30～20:30
   10. 六日 11:30～18:30
   11. 訂單送出 GAS
   12. 保留商品 options 給 LINE
   13. 訂單成功彈窗
================================================== */


/* ==================================================
   🔗 GAS API
================================================== */

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwFD8XzZCmF7AKly_L0LDqA5JoERcg0eex2PzQFU4n_aBWqw9GJsRV-4XcMM_GLET8MLw/exec";


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
        "購物車資料讀取失敗",
        error
    );

    cart = [];

}


/* ==================================================
   DOM
================================================== */

const orderList =
    document.getElementById(
        "order-list"
    );

const orderTotal =
    document.getElementById(
        "order-total"
    );

const customerName =
    document.getElementById(
        "customer-name"
    );

const customerPhone =
    document.getElementById(
        "customer-phone"
    );

const phoneError =
    document.getElementById(
        "phone-error"
    );

const submitBtn =
    document.getElementById(
        "submit-order-btn"
    );

const backBtn =
    document.getElementById(
        "back-order-btn"
    );

const submitResult =
    document.getElementById(
        "submit-result"
    );

const successModal =
    document.getElementById(
        "success-modal"
    );

const successSummary =
    document.getElementById(
        "success-order-summary"
    );

const successConfirmBtn =
    document.getElementById(
        "success-confirm-btn"
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


/* ==================================================
   🧹 HTML 防注入
================================================== */

function escapeHTML(text) {

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

    localStorage.setItem(

        "cart",

        JSON.stringify(
            cart
        )

    );

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
   🍜 取餐方式
================================================== */

function updateOrderTypeUI() {

    const selectedOrderType =
        document.querySelector(
            'input[name="order-type"]:checked'
        );


    if (!selectedOrderType) {

        return;

    }


    if (
        selectedOrderType.value ===
        "外帶"
    ) {

        if (takeoutOptions) {

            takeoutOptions.style.display =
                "block";

        }

    } else {

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
        'input[name="order-type"]'
    )
    .forEach(

        function(input) {

            input.addEventListener(

                "change",

                updateOrderTypeUI

            );

        }

    );


/* ==================================================
   ⏰ 取餐模式
================================================== */

function updatePickupModeUI() {

    const selectedPickupMode =
        document.querySelector(
            'input[name="pickup-mode"]:checked'
        );


    if (!selectedPickupMode) {

        return;

    }


    if (
        selectedPickupMode.value ===
        "預約取餐"
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
        'input[name="pickup-mode"]'
    )
    .forEach(

        function(input) {

            input.addEventListener(

                "change",

                updatePickupModeUI

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

   平日：
   11:30～20:30

   六日：
   11:30～18:30
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

   平日：
   11:30
   12:00
   ...
   20:30

   六日：
   11:30
   12:00
   ...
   18:30
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


        const hourText =
            String(
                hour
            ).padStart(
                2,
                "0"
            );


        const minuteText =
            String(
                minute
            ).padStart(
                2,
                "0"
            );


        const timeValue =

            hourText +

            ":" +

            minuteText;


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


    /*
       如果原本選的時間
       在新的營業時間內
       就保留
    */

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


    const orderType =
        document.querySelector(
            'input[name="order-type"]:checked'
        );


    const pickupMode =
        document.querySelector(
            'input[name="pickup-mode"]:checked'
        );


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
               再次確認時間
               避免前端選到錯誤時間
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

                    "您選擇的日期營業至 " +

                    closingTime +

                    "，請重新選擇取餐時間"

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
            (
                orderType &&
                orderType.value ===
                "外帶" &&
                pickupMode
            )

                ? pickupMode.value

                : "",


        pickupDate:
            (
                orderType &&
                orderType.value ===
                "外帶" &&
                pickupMode &&
                pickupMode.value ===
                "預約取餐" &&
                pickupDate
            )

                ? pickupDate.value

                : "",


        pickupTime:
            (
                orderType &&
                orderType.value ===
                "外帶" &&
                pickupMode &&
                pickupMode.value ===
                "預約取餐" &&
                pickupTime
            )

                ? pickupTime.value

                : "",


        tableware:
            (
                orderType &&
                orderType.value ===
                "外帶" &&
                tableware
            )

                ? tableware.value

                : "",


        note:
            noteElement
                ? noteElement.value.trim()
                : "",


        total:
            getTotal(),


        /*
           重要：
           這裡直接把完整 cart 傳給 GAS

           包含：

           item.name
           item.price
           item.qty
           item.options

           LINE 才能顯示完整客製化
        */

        items:
            cart.map(

                function(item) {

                    return {

                        name:
                            item.name ||
                            "",

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

            "訂單回傳：",

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
   初始化取餐方式
*/

updateOrderTypeUI();


/*
   初始化取餐模式
*/

updatePickupModeUI();


console.log(
    "🍜 初萊食麵 V5 checkout.js 已載入"
);


console.log(
    "購物車：",
    cart
);