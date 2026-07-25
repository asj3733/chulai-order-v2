/* =========================================
   初萊食麵 V3
   checkout.js 最終優化版
   功能：
   1. 歡迎回來自動帶入姓名／電話
   2. 電話格式驗證
   3. 內用／外帶
   4. 外帶取餐時間
   5. 餐具選項
   6. 備註可留白
   7. 保留 V3 API + LINE 通知
   8. 送單成功中央彈窗
   9. 防止重複送單
========================================= */


/* =========================================
   V3 API
   ※ 使用目前已測試正常的網址
========================================= */

const V3_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyxDP5-lWYxH7Pk-uZuey05aj5ijqiQ8MUlTKNuNb7gt0PDGJgkbS66bWpkylH6JngunQ/exec";


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

            <p class="empty-order">

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
                Number(item.price) *
                Number(item.qty);


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

                    <div class="checkout-item-info">

                        <strong>

                            ${escapeHTML(
                                item.name
                            )}

                        </strong>

                        ${optionText}

                        <div class="item-price">

                            NT$${item.price}
                            ×
                            ${item.qty}

                        </div>

                    </div>


                    <strong class="item-subtotal">

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
   載入歡迎回來資料
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
   電話輸入
   只允許數字
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
                    this.value ===
                    "外帶"

                    &&

                    this.checked
                ) {

                    if (takeoutOptions) {

                        takeoutOptions.style.display =
                            "block";

                    }


                    generatePickupTimes();

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
   取得目前營業時間
========================================= */

function getBusinessHours() {

    const day =
        new Date().getDay();


    /*
       0 = 星期日
       1 = 星期一
       2 = 星期二
       3 = 星期三
       4 = 星期四
       5 = 星期五
       6 = 星期六

       平日：
       11:30 - 20:30

       週末：
       11:30 - 18:30
    */


    if (
        day === 0 ||
        day === 6
    ) {

        return {

            open:
                11 * 60 +
                30,

            close:
                18 * 60 +
                30

        };

    }


    return {

        open:
            11 * 60 +
            30,

        close:
            20 * 60 +
            30

    };

}


/* =========================================
   產生外帶取餐時間
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


    const now =
        new Date();


    const businessHours =
        getBusinessHours();


    /*
       最早取餐：
       現在時間 + 30 分鐘

       再往上取整到
       10 分鐘
    */

    let startTime =
        new Date(
            now.getTime()
            +
            30 *
            60 *
            1000
        );


    const remainder =
        startTime.getMinutes()
        %
        10;


    if (remainder !== 0) {

        startTime.setMinutes(

            startTime.getMinutes()
            +
            (
                10 -
                remainder
            )

        );

    }


    startTime.setSeconds(
        0
    );


    startTime.setMilliseconds(
        0
    );


    /*
       今天營業開始時間
    */

    const businessOpen =
        new Date(
            now
        );


    businessOpen.setHours(
        Math.floor(
            businessHours.open
            /
            60
        ),
        businessHours.open
        %
        60,
        0,
        0
    );


    /*
       今天營業結束時間
    */

    const businessClose =
        new Date(
            now
        );


    businessClose.setHours(
        Math.floor(
            businessHours.close
            /
            60
        ),
        businessHours.close
        %
        60,
        0,
        0
    );


    /*
       如果目前還沒開店
       從營業開始後
       至少 30 分鐘開始
    */

    if (
        now <
        businessOpen
    ) {

        startTime =
            new Date(
                businessOpen.getTime()
                +
                30 *
                60 *
                1000
            );

    }


    /*
       如果現在已經接近打烊
       顯示明日可預約
    */

    if (
        startTime >
        businessClose
    ) {

        const tomorrow =
            new Date(
                now
            );


        tomorrow.setDate(

            tomorrow.getDate()
            +
            1

        );


        const tomorrowDay =
            tomorrow.getDay();


        const tomorrowIsWeekend =
            tomorrowDay === 0 ||
            tomorrowDay === 6;


        const tomorrowOpenMinutes =
            11 * 60 +
            30;


        tomorrow.setHours(

            Math.floor(
                tomorrowOpenMinutes
                /
                60
            ),

            tomorrowOpenMinutes
            %
            60,

            0,

            0

        );


        startTime =
            new Date(

                tomorrow.getTime()
                +
                30 *
                60 *
                1000

            );

    }


    /*
       最多顯示未來 3 小時
       或營業結束前
    */

    let count =
        0;


    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const time =
            new Date(

                startTime.getTime()
                +
                i *
                10 *
                60 *
                1000

            );


        /*
           如果是今天
           不能超過營業時間
        */

        if (
            time.toDateString()
            ===
            now.toDateString()

            &&

            time >
            businessClose
        ) {

            break;

        }


        /*
           如果超過 3 小時
           停止
        */

        if (
            i >= 18
        ) {

            break;

        }


        const hour =
            String(
                time.getHours()
            )
            .padStart(
                2,
                "0"
            );


        const minute =
            String(
                time.getMinutes()
            )
            .padStart(
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
            `今天 ${value}`;


        pickupTime.appendChild(
            option
        );


        count++;

    }


    /*
       如果今天沒有時間
       提示明天再來
    */

    if (
        count === 0
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

    }

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
   正式送單
========================================= */

async function submitOrder() {

    /*
       防止重複點擊
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
        cart.length ===
        0
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
       取餐方式
    */

    const orderType =
        document.querySelector(

            'input[name="order-type"]:checked'

        )?.value

        ||

        "內用";


    /*
       餐具
    */

    let tableware =
        "";


    /*
       外帶
    */

    let selectedPickupTime =
        "";


    if (
        orderType ===
        "外帶"
    ) {

        if (
            !pickupTime ||
            !pickupTime.value
        ) {

            alert(
                "⏰ 請選擇外帶取餐時間"
            );


            if (pickupTime) {

                pickupTime.focus();

            }


            return;

        }


        selectedPickupTime =
            pickupTime.value;


        tableware =

            document.querySelector(

                'input[name="tableware"]:checked'

            )?.value

            ||

            "需要餐具";

    }


    /*
       備註
       可以留白
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
                        item.qty,

                    price:
                        item.price,

                    subtotal:
                        Number(
                            item.price
                        )
                        *
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
       訂單資料
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
       儲存顧客資料
    */

    saveCustomerData();


    /*
       送單按鈕鎖定
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


        /*
           送單成功
        */

        if (
            result.success
        ) {

            /*
               儲存顧客資料
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

            showSuccessModal({

                orderType:
                    orderType,

                pickupTime:
                    selectedPickupTime,

                tableware:
                    tableware,

                total:
                    total

            });


            /*
               隱藏原本送單按鈕
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

    catch (
        error
    ) {

        console.error(

            "訂單送出錯誤",

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
   顯示送單成功彈窗
========================================= */

function showSuccessModal(data) {

    /*
       如果已經有舊彈窗
       先移除
    */

    const oldModal =
        document.getElementById(
            "order-success-modal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    const pickupText =

        data.orderType ===
        "外帶"

        ?

        `

            <div class="success-info-row">

                <span>🥡 取餐方式</span>

                <strong>
                    外帶
                </strong>

            </div>


            <div class="success-info-row">

                <span>⏰ 取餐時間</span>

                <strong>
                    ${escapeHTML(
                        data.pickupTime
                    )}
                </strong>

            </div>


            <div class="success-info-row">

                <span>🍴 餐具</span>

                <strong>
                    ${escapeHTML(
                        data.tableware
                    )}
                </strong>

            </div>

        `

        :

        `

            <div class="success-info-row">

                <span>🍜 用餐方式</span>

                <strong>
                    內用
                </strong>

            </div>

        `;


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "order-success-modal";


    modal.className =
        "order-success-modal";


    modal.innerHTML = `

        <div class="success-modal-box">

            <div class="success-icon">

                ✓

            </div>


            <h2>

                訂單已送出！

            </h2>


            <p class="success-message">

                感謝您選擇初萊食麵 ❤️

            </p>


            <div class="success-order-info">

                ${pickupText}


                <div class="success-info-row">

                    <span>💰 訂單金額</span>

                    <strong>
                        NT$${data.total}
                    </strong>

                </div>

            </div>


            <p class="success-store-message">

                店家已收到您的訂單，<br>

                我們會盡快為您準備餐點。

            </p>


            <button
                type="button"
                class="success-close-btn">

                完成

            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /*
       防止背景滾動
    */

    document.body.style.overflow =
        "hidden";


    /*
       完成按鈕
    */

    const closeBtn =
        modal.querySelector(
            ".success-close-btn"
        );


    if (closeBtn) {

        closeBtn.addEventListener(

            "click",

            function() {

                modal.remove();


                document.body.style.overflow =
                    "";

                /*
                   回到首頁
                */

                window.location.href =
                    "index.html";

            }

        );

    }

}


/* =========================================
   返回修改餐點
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


/*
   如果頁面一開始
   已經選擇外帶
   自動產生時間
*/

const selectedOrderType =
    document.querySelector(

        'input[name="order-type"]:checked'

    );


if (
    selectedOrderType &&
    selectedOrderType.value ===
    "外帶"
) {

    if (takeoutOptions) {

        takeoutOptions.style.display =
            "block";

    }


    generatePickupTimes();

}


console.log(

    "🍜 初萊食麵 V3 checkout.js 最終優化版已載入"

);