/* =========================================
   初萊食麵 V3
   checkout.js 最終正式版
========================================= */


/* =========================================
   V3 API
========================================= */

const V3_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz2ZAJ0QOn99o1H6vMafP6Xnf8pzzuYqWPbvFJRHrcYuvBAUUtKn6W5rZKbe4w5PZXm3g/exec";


/* =========================================
   讀取購物車
========================================= */

const cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


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


/* =========================================
   顯示訂單
========================================= */

function renderOrder() {


    if (
        !orderList
    ) {

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


    let html = "";

    let total = 0;


    cart.forEach(
        item => {


            const subtotal =
                item.price *
                item.qty;


            total +=
                subtotal;


            let optionText = "";


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


    if (
        nameInput
    ) {

        nameInput.value =
            savedName;

    }


    if (
        phoneInput
    ) {

        phoneInput.value =
            savedPhone;

    }


    if (
        savedName
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


    if (
        nameInput
    ) {

        localStorage.setItem(

            "customerName",

            nameInput.value.trim()

        );

    }


    if (
        phoneInput
    ) {

        localStorage.setItem(

            "customerPhone",

            phoneInput.value.trim()

        );

    }

}


/* =========================================
   電話只允許數字
========================================= */

if (
    phoneInput
) {


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
   電話格式驗證
========================================= */

function validatePhone() {


    const phone =
        phoneInput.value.trim();


    const valid =
        /^09\d{8}$/.test(
            phone
        );


    if (
        !valid
    ) {


        phoneError.style.display =
            "block";


        phoneError.textContent =

            "📱 請輸入正確的手機號碼，例如 0912345678";


        phoneInput.focus();


        return false;

    }


    phoneError.style.display =
        "none";


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


                    takeoutOptions.style.display =
                        "block";


                    generatePickupTimes();


                }


                else {


                    takeoutOptions.style.display =
                        "none";

                }

            }

        );

    }

);


/* =========================================
   產生取餐時間
========================================= */

function generatePickupTimes() {


    if (
        !pickupTime
    ) {

        return;

    }


    pickupTime.innerHTML = `

        <option value="">
            請選擇取餐時間
        </option>

    `;


    const now =
        new Date();


    /*
        從現在起
        最早 30 分鐘後
    */

    now.setMinutes(

        now.getMinutes()
        +
        30

    );


    /*
        以 10 分鐘為單位
    */

    now.setMinutes(

        Math.ceil(
            now.getMinutes()
            /
            10
        )
        *
        10

    );


    /*
        提供未來 3 小時
    */

    for (
        let i = 0;
        i < 18;
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
            value;


        pickupTime.appendChild(
            option
        );

    }

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


    /*
        防止重複點擊
    */

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
        nameInput.value.trim();


    if (
        !name
    ) {


        alert(
            "請輸入姓名"
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
        餐具
    */

    let tableware =
        "";


    /*
        外帶才需要餐具
    */

    if (
        orderType ===
        "外帶"
    ) {


        if (
            !pickupTime.value
        ) {


            alert(
                "請選擇外帶取餐時間"
            );


            pickupTime.focus();


            return;

        }


        tableware =

            document.querySelector(

                'input[name="tableware"]:checked'

            )?.value
            ||
            "需要餐具";

    }


    /*
        備註
        保持客人自己輸入
    */

    const note =
        customerNote.value.trim();


    /*
        計算總金額
    */

    const total =
        cart.reduce(

            (sum, item) =>

                sum
                +
                item.price *
                item.qty,

            0

        );


    /*
        整理訂單商品
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
                        item.price *
                        item.qty,

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
            phoneInput.value.trim(),


        orderType:
            orderType,


        pickupTime:
            orderType ===
            "外帶"

            ?

            pickupTime.value

            :

            "",


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
        顯示送單中
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


        const result =
            await response.json();


        /*
            成功
        */

        if (
            result.success
        ) {


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


            submitResult.style.display =
                "block";


            submitResult.innerHTML = `

                <div class="success-box">

                    <h2>
                        ✅ 訂單已送出！
                    </h2>


                    <p>
                        感謝您選擇初萊食麵 ❤️
                    </p>


                    <p>
                        店家已收到您的訂單。
                    </p>


                    <p>
                        ${orderType === "外帶"
                            ? "請依照您選擇的時間前來取餐。"
                            : "我們會盡快為您準備餐點。"
                        }
                    </p>

                </div>

            `;


            submitBtn.style.display =
                "none";


            window.scrollTo({

                top:
                    document.body.scrollHeight,

                behavior:
                    "smooth"

            });


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


        submitBtn.disabled =
            false;


        submitBtn.textContent =
            "📲 送出訂單";

    }

}


/* =========================================
   返回修改餐點
========================================= */

const backOrderBtn =
    document.getElementById(
        "back-order-btn"
    );


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

    "🍜 初萊食麵 V3 checkout.js 已載入"

);