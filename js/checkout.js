/* =========================================
   🍜 初萊食麵 V3
   checkout.js
   完整正式版
========================================= */


/* =========================================
   V3 Google Apps Script API
========================================= */

const V3_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbza3pmlU-MY4VZWU8gE3dSVxKVqpW3D9jia7ZlH3X7CWPNLtu96f1TE2YNGnCDKKdCD/exec";


/* =========================================
   讀取購物車
========================================= */

let cart = [];

try {

    const savedCart =
        localStorage.getItem("cart");

    if (savedCart) {

        cart =
            JSON.parse(savedCart);

    }

    if (!Array.isArray(cart)) {

        cart = [];

    }

} catch (error) {

    console.error(
        "購物車讀取失敗：",
        error
    );

    cart = [];

}


/* =========================================
   DOM 元素
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


const successConfirmBtn =
    document.getElementById(
        "success-confirm-btn"
    );


const successOrderSummary =
    document.getElementById(
        "success-order-summary"
    );


const backOrderBtn =
    document.getElementById(
        "back-order-btn"
    );


/* =========================================
   取得今天日期
   格式：YYYY-MM-DD
========================================= */

function getTodayDate() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
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


/* =========================================
   格式化日期
   避免時區問題
========================================= */

function createLocalDate(
    dateString
) {

    const parts =
        dateString.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

}


/* =========================================
   判斷是否週末
========================================= */

function isWeekend(
    dateString
) {

    const date =
        createLocalDate(
            dateString
        );

    const day =
        date.getDay();

    return (
        day === 0 ||
        day === 6
    );

}


/* =========================================
   取得營業結束時間
========================================= */

function getBusinessEndMinutes(
    dateString
) {

    /*
        星期六、日
        11:30～18:30
    */

    if (
        isWeekend(
            dateString
        )
    ) {

        return (
            18 * 60 +
            30
        );

    }


    /*
        星期一～星期五
        11:30～20:30
    */

    return (
        20 * 60 +
        30
    );

}


/* =========================================
   取得營業開始時間
========================================= */

function getBusinessStartMinutes() {

    return (
        11 * 60 +
        30
    );

}


/* =========================================
   將分鐘轉成 HH:MM
========================================= */

function minutesToTime(
    minutes
) {

    const hour =
        Math.floor(
            minutes / 60
        );

    const minute =
        minutes % 60;

    return (
        String(hour).padStart(2, "0") +
        ":" +
        String(minute).padStart(2, "0")
    );

}


/* =========================================
   產生預約日期
   今天＋未來 6 天
   共 7 天
========================================= */

function generatePickupDates() {

    if (!pickupDate) {

        return;

    }


    pickupDate.innerHTML = `

        <option value="">
            請選擇取餐日期
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
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + i
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


        let label = "";


        if (i === 0) {

            label =
                "今天 " +
                month +
                "/" +
                day;

        }

        else if (i === 1) {

            label =
                "明天 " +
                month +
                "/" +
                day;

        }

        else {

            label =
                month +
                "/" +
                day;

        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;


        option.textContent =
            label;


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
            請選擇取餐時間
        </option>

    `;


    if (
        !pickupDate ||
        !pickupDate.value
    ) {

        return;

    }


    const selectedDate =
        pickupDate.value;


    const today =
        getTodayDate();


    const businessStart =
        getBusinessStartMinutes();


    const businessEnd =
        getBusinessEndMinutes(
            selectedDate
        );


    /*
        預設最早時間
        營業開始 11:30
    */

    let minimumMinutes =
        businessStart;


    /*
        如果選擇今天
        至少保留 30 分鐘
    */

    if (
        selectedDate ===
        today
    ) {

        const now =
            new Date();


        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes();


        minimumMinutes =
            currentMinutes +
            30;


        /*
            對齊到下一個 10 分鐘
        */

        minimumMinutes =
            Math.ceil(
                minimumMinutes / 10
            ) * 10;


        /*
            不早於營業時間
        */

        minimumMinutes =
            Math.max(
                minimumMinutes,
                businessStart
            );

    }


    /*
        如果今天已經超過營業時間
        顯示提示
    */

    if (
        minimumMinutes >
        businessEnd
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "今日已無可預約時段";


        option.disabled =
            true;


        pickupTime.appendChild(
            option
        );


        return;

    }


    /*
        每 10 分鐘產生一個時間
    */

    for (
        let minutes =
            minimumMinutes;

        minutes <=
            businessEnd;

        minutes += 10
    ) {

        const time =
            minutesToTime(
                minutes
            );


        const option =
            document.createElement(
                "option"
            );


        option.value =
            time;


        option.textContent =
            time;


        pickupTime.appendChild(
            option
        );

    }

}


/* =========================================
   顯示訂單
========================================= */

function renderOrder() {

    if (!orderList) {

        return;

    }


    if (
        cart.length === 0
    ) {

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


    let html =
        "";


    let total =
        0;


    cart.forEach(
        item => {

            const price =
                Number(
                    item.price
                );


            const qty =
                Number(
                    item.qty
                );


            const subtotal =
                price *
                qty;


            total +=
                subtotal;


            let optionText =
                "";


            if (
                item.options
            ) {

                const options =
                    item.options;


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


                if (
                    optionList.length >
                    0
                ) {

                    optionText = `

                        <div class="order-options">

                            ${escapeHTML(
                                optionList.join(
                                    " ・ "
                                )
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

                            NT$${price}

                            ×

                            ${qty}

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
        ) ||
        "";


    const savedPhone =
        localStorage.getItem(
            "customerPhone"
        ) ||
        "";


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
   電話輸入限制
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
   電話驗證
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
   取餐方式切換
========================================= */

document
    .querySelectorAll(
        'input[name="order-type"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
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


                        /*
                            預設最快取餐
                        */

                        const fastestRadio =
                            document.querySelector(
                                'input[name="pickup-mode"][value="最快取餐"]'
                            );


                        if (
                            fastestRadio
                        ) {

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


/* =========================================
   最快取餐／預約取餐切換
========================================= */

document
    .querySelectorAll(
        'input[name="pickup-mode"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                function() {

                    /*
                        最快取餐
                    */

                    if (
                        this.value ===
                        "最快取餐" &&
                        this.checked
                    ) {

                        if (
                            reservationTimeArea
                        ) {

                            reservationTimeArea.style.display =
                                "none";

                        }

                    }


                    /*
                        預約取餐
                    */

                    if (
                        this.value ===
                        "預約取餐" &&
                        this.checked
                    ) {

                        /*
                            先產生日期
                        */

                        generatePickupDates();


                        /*
                            預設今天
                        */

                        if (
                            pickupDate
                        ) {

                            pickupDate.value =
                                getTodayDate();

                        }


                        /*
                            再產生時間
                        */

                        generatePickupTimes();


                        /*
                            最後顯示區域
                        */

                        if (
                            reservationTimeArea
                        ) {

                            reservationTimeArea.style.display =
                                "block";

                        }

                    }

                }
            );

        }
    );


/* =========================================
   日期改變
========================================= */

if (pickupDate) {

    pickupDate.addEventListener(
        "change",
        function() {

            generatePickupTimes();

        }
    );

}


/* =========================================
   備註輸入
========================================= */

if (customerNote) {

    customerNote.addEventListener(
        "input",
        function() {

            /*
                不做特殊處理
                只保留目前內容
            */

        }
    );

}


/* =========================================
   送出訂單按鈕
========================================= */

if (submitBtn) {

    submitBtn.addEventListener(
        "click",
        submitOrder
    );

}


/* =========================================
   正式送出訂單
========================================= */

async function submitOrder() {

    /*
        防止重複送出
    */

    if (
        submitBtn &&
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
            "購物車目前是空的，請先加入餐點！"
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
        取得訂單類型
    */

    const orderType =
        document.querySelector(
            'input[name="order-type"]:checked'
        )?.value ||
        "內用";


    /*
        預設資料
    */

    let pickupMode =
        "";


    let finalPickupDate =
        "";


    let finalPickupTime =
        "";


    let tableware =
        "";


    /*
        外帶處理
    */

    if (
        orderType ===
        "外帶"
    ) {

        pickupMode =
            document.querySelector(
                'input[name="pickup-mode"]:checked'
            )?.value ||
            "最快取餐";


        /*
            最快取餐
        */

        if (
            pickupMode ===
            "最快取餐"
        ) {

            finalPickupDate =
                getTodayDate();


            finalPickupTime =
                "最快取餐（約20分鐘）";

        }


        /*
            預約取餐
        */

        else if (
            pickupMode ===
            "預約取餐"
        ) {

            if (
                !pickupDate ||
                !pickupDate.value
            ) {

                alert(
                    "請選擇預約取餐日期"
                );


                if (pickupDate) {

                    pickupDate.focus();

                }


                return;

            }


            if (
                !pickupTime ||
                !pickupTime.value
            ) {

                alert(
                    "請選擇預約取餐時間"
                );


                if (pickupTime) {

                    pickupTime.focus();

                }


                return;

            }


            finalPickupDate =
                pickupDate.value;


            finalPickupTime =
                pickupTime.value;

        }


        /*
            餐具
        */

        tableware =
            document.querySelector(
                'input[name="tableware"]:checked'
            )?.value ||
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

            (
                sum,
                item
            ) => {

                return (
                    sum +
                    Number(
                        item.price
                    ) *
                    Number(
                        item.qty
                    )
                );

            },

            0

        );


    /*
        整理商品
    */

    const items =
        cart.map(
            item => {

                const options =
                    item.options ||
                    {};


                const optionText =
                    [];


                if (
                    options.noodle
                ) {

                    optionText.push(
                        options.noodle
                    );

                }


                if (
                    options.spicy
                ) {

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


                if (
                    options.sauce
                ) {

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


    /*
        建立訂單資料
    */

    const orderData = {

        action:
            "newOrder",

        name:
            name,

        phone:
            phoneInput
                ? phoneInput.value.trim()
                : "",

        orderType:
            orderType,

        pickupMode:
            pickupMode,

        pickupDate:
            finalPickupDate,

        pickupTime:
            finalPickupTime,

        tableware:
            tableware,

        note:
            note,

        total:
            total,

        items:
            items

    };


    console.log(
        "📦 送出訂單資料：",
        orderData
    );


    /*
        鎖定送單按鈕
    */

    if (submitBtn) {

        submitBtn.disabled =
            true;


        submitBtn.textContent =
            "📲 訂單傳送中...";

    }


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


        /*
            檢查 HTTP 狀態
        */

        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        /*
            讀取後端回應
        */

        const result =
            await response.json();


        console.log(
            "📥 後端回應：",
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
                orderData
            );


            /*
                隱藏送出按鈕
            */

            if (submitBtn) {

                submitBtn.style.display =
                    "none";

            }

        }

        else {

            throw new Error(

                result.message ||
                "訂單送出失敗"

            );

        }

    }

    catch (
        error
    ) {

        console.error(
            "❌ 訂單送出錯誤：",
            error
        );


        alert(
            "⚠️ 訂單送出失敗，請確認網路後再試一次。"
        );


        /*
            恢復按鈕
        */

        if (submitBtn) {

            submitBtn.disabled =
                false;


            submitBtn.textContent =
                "📲 送出訂單";

        }

    }

}


/* =========================================
   成功彈窗
========================================= */

function showSuccessModal(
    orderData
) {

    if (
        !successModal
    ) {

        return;

    }


    let itemsHTML =
        "";


    /*
        訂單商品
    */

    if (
        Array.isArray(
            orderData.items
        )
    ) {

        itemsHTML =
            orderData.items
            .map(
                item => {

                    let optionHTML =
                        "";


                    if (
                        item.options
                    ) {

                        optionHTML = `

                            <div class="success-item-options">

                                ${escapeHTML(
                                    item.options
                                )}

                            </div>

                        `;

                    }


                    return `

                        <div class="success-item">

                            <div>

                                <span>

                                    ${escapeHTML(
                                        item.name
                                    )}

                                    ×
                                    ${item.qty}

                                </span>

                                ${optionHTML}

                            </div>


                            <strong>

                                NT$${item.subtotal}

                            </strong>

                        </div>

                    `;

                }
            )
            .join(
                ""
            );

    }


    /*
        取餐資訊
    */

    let pickupHTML =
        "";


    if (
        orderData.orderType ===
        "外帶"
    ) {

        pickupHTML = `

            <div class="success-pickup">

                <div>

                    🥡 外帶

                </div>


                <div>

                    📅 ${escapeHTML(
                        orderData.pickupDate
                    )}

                </div>


                <div>

                    ⏰ ${escapeHTML(
                        orderData.pickupTime
                    )}

                </div>

            </div>

        `;

    }


    if (
        successOrderSummary
    ) {

        successOrderSummary.innerHTML = `

            <div class="success-order-info">

                <strong>

                    📋 訂單摘要

                </strong>


                ${itemsHTML}


                <div class="success-total">

                    <span>

                        訂單金額

                    </span>


                    <strong>

                        NT$${orderData.total}

                    </strong>

                </div>


                ${pickupHTML}

            </div>

        `;

    }


    successModal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   成功彈窗
   知道了 → 回首頁
========================================= */

if (
    successConfirmBtn
) {

    successConfirmBtn.addEventListener(
        "click",
        function() {

            document.body.style.overflow =
                "";


            window.location.href =
                "index.html";

        }
    );

}


/* =========================================
   成功彈窗背景關閉
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

                successModal.style.display =
                    "none";


                document.body.style.overflow =
                    "";

            }

        }
    );

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
   初始化
========================================= */

renderOrder();

loadCustomerData();


console.log(
    "🍜 初萊食麵 V3 checkout.js 完整版已載入"
);