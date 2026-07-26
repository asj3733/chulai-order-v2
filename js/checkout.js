/* =========================================
   🍜 初萊食麵 V3
   checkout.js 正式完整版
   =========================================

   功能：
   1. 購物車顯示
   2. 姓名／電話自動記憶
   3. 電話格式驗證
   4. 內用／外帶
   5. 外帶最快取餐：約 20 分鐘後
   6. 外帶預約取餐：完整營業時間
   7. 取餐日期
   8. 取餐時間
   9. 餐具選項
   10. 備註
   11. Google Apps Script 送單
   12. LINE 通知由後端處理
   13. 訂單成功彈窗
   ========================================= */


/* =========================================
   1. Google Apps Script API
========================================= */

const V3_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyxDP5-lWYxH7Pk-uZuey05aj5ijqiQ8MUlTKNuNb7gt0PDGJgkbS66bWpkylH6JngunQ/exec";


/* =========================================
   2. 基本設定
========================================= */

const TAKEOUT_MINUTES = 20;

/*
   營業時間

   週一～週五
   11:30～20:30

   週六～週日
   11:30～18:30
*/

const BUSINESS_HOURS = {

    weekday: {

        open: "11:30",

        close: "20:30"

    },

    weekend: {

        open: "11:30",

        close: "18:30"

    }

};


/* =========================================
   3. 讀取購物車
========================================= */

const cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


/* =========================================
   4. DOM
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
   5. 顯示訂單
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


            total += subtotal;


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
   6. 歡迎回來／自動帶入資料
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
   7. 儲存顧客資料
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
   8. 電話只允許數字
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
   9. 電話格式驗證
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
   10. 取得今天營業時間
========================================= */

function getBusinessHours(date) {

    const day =
        date.getDay();


    /*
       0 = 星期日
       1 = 星期一
       ...
       6 = 星期六
    */


    if (
        day === 0 ||
        day === 6
    ) {

        return BUSINESS_HOURS.weekend;

    }


    return BUSINESS_HOURS.weekday;

}


/* =========================================
   11. 日期格式 YYYY-MM-DD
========================================= */

function formatDate(date) {

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


    return `${year}-${month}-${day}`;

}


/* =========================================
   12. 日期顯示格式
========================================= */

function formatDateText(date) {

    const weekNames = [

        "日",

        "一",

        "二",

        "三",

        "四",

        "五",

        "六"

    ];


    return (

        `${date.getMonth() + 1}月` +

        `${date.getDate()}日` +

        `（${weekNames[date.getDay()]}）`

    );

}


/* =========================================
   13. 建立指定日期的時間選單
========================================= */

function generateTimesForDate(
    date
) {

    if (!pickupTime) {

        return;

    }


    pickupTime.innerHTML = `

        <option value="">

            請選擇取餐時間

        </option>

    `;


    const hours =
        getBusinessHours(
            date
        );


    const openParts =
        hours.open.split(
            ":"
        );


    const closeParts =
        hours.close.split(
            ":"
        );


    const openTime =
        new Date(date);


    openTime.setHours(

        Number(
            openParts[0]
        ),

        Number(
            openParts[1]
        ),

        0,

        0

    );


    const closeTime =
        new Date(date);


    closeTime.setHours(

        Number(
            closeParts[0]
        ),

        Number(
            closeParts[1]
        ),

        0,

        0

    );


    /*
       如果是今天
       最早取餐時間 = 現在 + 20 分鐘

       再向上取整到 10 分鐘
    */

    const now =
        new Date();


    let firstTime =
        new Date(
            openTime
        );


    if (
        formatDate(date) ===
        formatDate(now)
    ) {

        const earliest =
            new Date(
                now.getTime()
                +
                TAKEOUT_MINUTES *
                60 *
                1000
            );


        const minutes =
            earliest.getMinutes();


        const roundedMinutes =

            Math.ceil(
                minutes / 10
            ) * 10;


        firstTime =
            new Date(
                earliest
            );


        firstTime.setMinutes(

            roundedMinutes,

            0,

            0

        );


        /*
           如果今天已經過營業時間
           就不提供今天時段
        */

        if (
            firstTime >
            closeTime
        ) {

            pickupTime.innerHTML = `

                <option value="">

                    今日已無可預約時段

                </option>

            `;


            return;

        }


        /*
           如果目前時間還沒到營業時間
           從開店時間開始
        */

        if (
            firstTime <
            openTime
        ) {

            firstTime =
                new Date(
                    openTime
                );

        }

    }


    /*
       每 10 分鐘產生一個時段
    */

    let current =
        new Date(
            firstTime
        );


    while (
        current <=
        closeTime
    ) {

        const hour =
            String(
                current.getHours()
            ).padStart(
                2,
                "0"
            );


        const minute =
            String(
                current.getMinutes()
            ).padStart(
                2,
                "0"
            );


        const value =
            `${hour}:${minute}`;


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


        current.setMinutes(

            current.getMinutes()
            +
            10

        );

    }

}


/* =========================================
   14. 建立預約日期
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


    /*
       顯示未來 7 天
    */

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const date =
            new Date();


        date.setHours(
            0,
            0,
            0,
            0
        );


        date.setDate(

            date.getDate()
            +
            i

        );


        /*
           取得營業時間
        */

        const hours =
            getBusinessHours(
                date
            );


        /*
           如果是今天
           檢查是否還有可預約時間
        */

        if (i === 0) {

            const now =
                new Date();


            const closeParts =
                hours.close.split(
                    ":"
                );


            const closeTime =
                new Date(
                    date
                );


            closeTime.setHours(

                Number(
                    closeParts[0]
                ),

                Number(
                    closeParts[1]
                ),

                0,

                0

            );


            const earliest =
                new Date(

                    now.getTime()
                    +
                    TAKEOUT_MINUTES *
                    60 *
                    1000

                );


            if (
                earliest >
                closeTime
            ) {

                continue;

            }

        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            formatDate(
                date
            );


        option.textContent =

            i === 0

            ?

            `今天 ${formatDateText(date)}`

            :

            formatDateText(date);


        pickupDate.appendChild(
            option
        );

    }

}


/* =========================================
   15. 內用／外帶切換
========================================= */

document.querySelectorAll(

    'input[name="order-type"]'

).forEach(

    radio => {

        radio.addEventListener(

            "change",

            function() {

                if (
                    this.value ===
                    "外帶"

                    &&
                    this.checked
                ) {

                    if (takeoutOptions) {

                        takeoutOptions.style.display =
                            "block";

                    }


                    /*
                       預設為最快取餐
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


                    /*
                       建立日期選單
                    */

                    generatePickupDates();

                }

                else {

                    if (takeoutOptions) {

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
   16. 最快取餐／預約取餐切換
========================================= */

document.querySelectorAll(

    'input[name="pickup-mode"]'

).forEach(

    radio => {

        radio.addEventListener(

            "change",

            function() {

                if (
                    this.value ===
                    "預約取餐"

                    &&
                    this.checked
                ) {

                    /*
                       顯示日期＋時間
                    */

                    if (
                        reservationTimeArea
                    ) {

                        reservationTimeArea.style.display =
                            "block";

                    }


                    /*
                       重新建立日期
                    */

                    generatePickupDates();


                    /*
                       清空舊時間
                    */

                    if (pickupTime) {

                        pickupTime.innerHTML = `

                            <option value="">

                                請選擇時間

                            </option>

                        `;

                    }

                }

                else {

                    /*
                       最快取餐
                       不需要選日期時間
                    */

                    if (
                        reservationTimeArea
                    ) {

                        reservationTimeArea.style.display =
                            "none";

                    }


                    if (pickupDate) {

                        pickupDate.value =
                            "";

                    }


                    if (pickupTime) {

                        pickupTime.innerHTML = `

                            <option value="">

                                請選擇時間

                            </option>

                        `;

                    }

                }

            }

        );

    }

);


/* =========================================
   17. 選擇日期後產生完整時間
========================================= */

if (pickupDate) {

    pickupDate.addEventListener(

        "change",

        function() {

            if (!this.value) {

                if (pickupTime) {

                    pickupTime.innerHTML = `

                        <option value="">

                            請先選擇取餐日期

                        </option>

                    `;

                }


                return;

            }


            /*
               避免時區問題
               使用本地日期建立
            */

            const parts =
                this.value.split(
                    "-"
                );


            const date =
                new Date(

                    Number(
                        parts[0]
                    ),

                    Number(
                        parts[1]
                    ) - 1,

                    Number(
                        parts[2]
                    )

                );


            generateTimesForDate(
                date
            );

        }

    );

}


/* =========================================
   18. 建立訂單商品資料
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
                    item.qty,

                price:
                    item.price,

                subtotal:
                    Number(item.price || 0)
                    *
                    Number(item.qty || 0),

                options:
                    optionText.join(
                        " ・ "
                    )

            };

        }

    );

}


/* =========================================
   19. 取得最快取餐文字
========================================= */

function getFastestPickupText() {

    const now =
        new Date();


    const fastest =
        new Date(

            now.getTime()
            +
            TAKEOUT_MINUTES *
            60 *
            1000

        );


    const hour =
        String(
            fastest.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            fastest.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return (

        `最快取餐（約 ${hour}:${minute}）`

    );

}


/* =========================================
   20. 顯示成功彈窗
========================================= */

function showSuccessModal(
    orderData
) {

    if (!successModal) {

        return;

    }


    if (successOrderSummary) {

        let pickupText =
            "內用";


        if (
            orderData.orderType ===
            "外帶"
        ) {

            if (
                orderData.pickupMode ===
                "最快取餐"
            ) {

                pickupText =
                    getFastestPickupText();

            }

            else {

                pickupText =

                    `${orderData.pickupDate || ""} ` +

                    `${orderData.pickupTime || ""}`;

            }

        }


        successOrderSummary.innerHTML = `

            <div>

                <strong>
                    訂單資訊
                </strong>

            </div>

            <div>
                👤 ${escapeHTML(
                    orderData.name
                )}
            </div>

            <div>
                📱 ${escapeHTML(
                    orderData.phone
                )}
            </div>

            <div>
                🍜 ${escapeHTML(
                    orderData.orderType
                )}
            </div>

            <div>
                ⏰ ${escapeHTML(
                    pickupText
                )}
            </div>

            <div>
                💰 NT$${orderData.total}
            </div>

        `;

    }


    successModal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   21. 關閉成功彈窗
========================================= */

function closeSuccessModal() {

    if (successModal) {

        successModal.style.display =
            "none";

    }


    document.body.style.overflow =
        "";

}


/* =========================================
   22. 成功彈窗按鈕
========================================= */

if (successConfirmBtn) {

    successConfirmBtn.addEventListener(

        "click",

        function() {

            closeSuccessModal();


            /*
               成功後返回首頁
            */

            window.location.href =
                "index.html";

        }

    );

}


/* 點擊遮罩也可以關閉 */

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


/* =========================================
   23. 送出訂單按鈕
========================================= */

if (submitBtn) {

    submitBtn.addEventListener(

        "click",

        submitOrder

    );

}


/* =========================================
   24. 正式送單
========================================= */

async function submitOrder() {

    /*
       防止重複送單
    */

    if (
        submitBtn &&
        submitBtn.disabled
    ) {

        return;

    }


    /*
       購物車
    */

    if (
        cart.length === 0
    ) {

        alert(
            "🛒 購物車目前是空的"
        );


        return;

    }


    /*
       姓名
    */

    const name =
        nameInput.value.trim();


    if (!name) {

        alert(
            "👤 請輸入姓名"
        );


        nameInput.focus();


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
       取餐方式
    */

    const orderType =
        document.querySelector(

            'input[name="order-type"]:checked'

        )?.value
        ||
        "內用";


    /*
       取餐模式
    */

    let pickupMode =
        "";


    let pickupDateValue =
        "";


    let pickupTimeValue =
        "";


    let pickupDisplay =
        "";


    /*
       餐具
    */

    let tableware =
        "";


    /*
       外帶
    */

    if (
        orderType ===
        "外帶"
    ) {

        pickupMode =

            document.querySelector(

                'input[name="pickup-mode"]:checked'

            )?.value
            ||
            "最快取餐";


        /*
           最快取餐
           不要求選擇時間
        */

        if (
            pickupMode ===
            "最快取餐"
        ) {

            pickupDisplay =
                getFastestPickupText();

        }


        /*
           預約取餐
        */

        else {

            pickupDateValue =
                pickupDate?.value
                ||
                "";


            pickupTimeValue =
                pickupTime?.value
                ||
                "";


            if (!pickupDateValue) {

                alert(
                    "📅 請選擇預約取餐日期"
                );


                pickupDate?.focus();


                return;

            }


            if (!pickupTimeValue) {

                alert(
                    "⏰ 請選擇預約取餐時間"
                );


                pickupTime?.focus();


                return;

            }


            pickupDisplay =

                `${pickupDateValue} ${pickupTimeValue}`;

        }


        /*
           餐具
        */

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
        customerNote?.value.trim()
        ||
        "";


    /*
       計算總金額
    */

    const total =
        cart.reduce(

            (sum, item) =>

                sum
                +
                Number(
                    item.price || 0
                )
                *
                Number(
                    item.qty || 0
                ),

            0

        );


    /*
       商品
    */

    const items =
        buildOrderItems();


    /*
       建立訂單
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


        /*
           新版欄位
        */

        pickupMode:
            pickupMode,


        pickupDate:
            pickupDateValue,


        pickupTime:
            pickupTimeValue,


        pickupDisplay:
            pickupDisplay,


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
       儲存客人資料
    */

    saveCustomerData();


    /*
       送單中
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


        const result =
            await response.json();


        console.log(
            "訂單回應：",
            result
        );


        /*
           成功
        */

        if (
            result.success
        ) {

            /*
               記住客人資料
            */

            localStorage.setItem(

                "customerName",

                name

            );


            localStorage.setItem(

                "customerPhone",

                phoneInput.value.trim()

            );


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
               隱藏舊的成功區塊
            */

            if (submitResult) {

                submitResult.style.display =
                    "none";

            }


            /*
               隱藏送單按鈕
            */

            if (submitBtn) {

                submitBtn.style.display =
                    "none";

            }

        }

        else {

            throw new Error(

                result.message
                ||
                "訂單送出失敗"

            );

        }

    }

    catch (error) {

        console.error(

            "訂單送出錯誤：",

            error

        );


        alert(

            "⚠️ 訂單送出失敗，請確認網路後再試一次。"

        );


        if (submitBtn) {

            submitBtn.disabled =
                false;


            submitBtn.textContent =
                "📲 送出訂單";

        }

    }

}


/* =========================================
   25. 返回修改餐點
========================================= */

if (backOrderBtn) {

    backOrderBtn.addEventListener(

        "click",

        function() {

            window.location.href =
                "order.html";

        }

    );

}


/* =========================================
   26. 防止 HTML 注入
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
   27. 初始化
========================================= */

renderOrder();

loadCustomerData();


console.log(

    "🍜 初萊食麵 V3 checkout.js 正式版已載入"

);