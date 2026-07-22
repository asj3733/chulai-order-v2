/* =========================================
   初萊食麵
   checkout.js 最終正式版
========================================= */


/* =========================================
   讀取購物車
========================================= */

const cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];


/* =========================================
   取得 HTML 元素
========================================= */

const checkoutCart =
    document.getElementById(
        "checkout-cart"
    );

const checkoutTotal =
    document.getElementById(
        "checkout-total"
    );

const nameInput =
    document.getElementById(
        "customer-name"
    );

const phoneInput =
    document.getElementById(
        "customer-phone"
    );

const orderNote =
    document.getElementById(
        "order-note"
    );

const submitOrderBtn =
    document.getElementById(
        "submit-order"
    );

const takeoutOptions =
    document.getElementById(
        "takeout-options"
    );

const noUtensils =
    document.getElementById(
        "no-utensils"
    );


/* =========================================
   載入上次填寫資料
========================================= */

if (nameInput) {

    nameInput.value =
        localStorage.getItem(
            "customerName"
        ) || "";

}


if (phoneInput) {

    phoneInput.value =
        localStorage.getItem(
            "customerPhone"
        ) || "";

}


/* =========================================
   即時儲存姓名
========================================= */

if (nameInput) {

    nameInput.addEventListener(
        "input",
        function() {

            localStorage.setItem(
                "customerName",
                nameInput.value
            );

        }
    );

}


/* =========================================
   即時儲存電話
========================================= */

if (phoneInput) {

    phoneInput.addEventListener(
        "input",
        function() {

            localStorage.setItem(
                "customerPhone",
                phoneInput.value
            );

        }
    );

}


/* =========================================
   顯示客製內容
========================================= */

function getOptionText(item) {


    const options =
        item.options || {};


    const texts = [];


    /* 麵條 */

    if (
        options.noodle
    ) {

        texts.push(
            options.noodle
        );

    }


    /* 辣度 */

    if (
        options.spicy
    ) {

        texts.push(
            options.spicy
        );

    }


    /* 不加菜 */

    if (
        options.vegetable === false
    ) {

        texts.push(
            "不加菜"
        );

    }


    /* 不加蔥 */

    if (
        options.onion === false
    ) {

        texts.push(
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

            texts.push(

                options.sauce.join(
                    "＋"
                )

            );

        }

        else {

            texts.push(
                options.sauce
            );

        }

    }


    if (
        texts.length === 0
    ) {

        return "";

    }


    return `

        <div class="checkout-options">

            ${texts.join(" ・ ")}

        </div>

    `;

}


/* =========================================
   顯示訂單
========================================= */

function renderCheckout() {


    if (!checkoutCart) {

        return;

    }


    /* 購物車空 */

    if (
        cart.length === 0
    ) {


        checkoutCart.innerHTML = `

            <p>
                購物車目前是空的。
            </p>

            <button
                type="button"
                onclick="window.location.href='order.html'">

                返回點餐

            </button>

        `;


        if (checkoutTotal) {

            checkoutTotal.textContent =
                "0";

        }


        if (submitOrderBtn) {

            submitOrderBtn.disabled =
                true;

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


            html += `

                <div class="checkout-item">

                    <div>

                        <strong>

                            ${item.name}

                        </strong>


                        ${getOptionText(item)}


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


    checkoutCart.innerHTML =
        html;


    if (checkoutTotal) {

        checkoutTotal.textContent =
            total;

    }

}


/* =========================================
   內用／外帶切換
========================================= */

const orderTypeInputs =

    document.querySelectorAll(

        'input[name="orderType"]'

    );


orderTypeInputs.forEach(

    input => {


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
                        noUtensils
                    ) {

                        noUtensils.checked =
                            false;

                    }

                }

            }

        );

    }

);


/* =========================================
   取得取餐方式
========================================= */

function getOrderType() {


    const selected =

        document.querySelector(

            'input[name="orderType"]:checked'

        );


    return selected
        ? selected.value
        : "內用";

}


/* =========================================
   送出訂單
========================================= */

if (submitOrderBtn) {


    submitOrderBtn.addEventListener(

        "click",

        function() {


            /* 防止重複送出 */

            if (
                submitOrderBtn.disabled
            ) {

                return;

            }


            /* 購物車檢查 */

            if (
                cart.length === 0
            ) {

                alert(
                    "購物車目前是空的，請先加入餐點！"
                );

                return;

            }


            /* 姓名 */

            const customerName =

                nameInput
                    ? nameInput.value.trim()
                    : "";


            if (
                !customerName
            ) {

                alert(
                    "請輸入您的姓名！"
                );

                if (nameInput) {

                    nameInput.focus();

                }

                return;

            }


            /* 電話 */

            const customerPhone =

                phoneInput
                    ? phoneInput.value.trim()
                    : "";


            if (
                !customerPhone
            ) {

                alert(
                    "請輸入您的電話！"
                );

                if (phoneInput) {

                    phoneInput.focus();

                }

                return;

            }


            /* 取餐方式 */

            const orderType =
                getOrderType();


            /* 不需要餐具 */

            let noUtensilsValue =
                false;


            if (
                orderType === "外帶"
                &&
                noUtensils
                &&
                noUtensils.checked
            ) {

                noUtensilsValue =
                    true;

            }


            /* 備註 */

            const note =

                orderNote
                    ? orderNote.value.trim()
                    : "";


            /* 計算總金額 */

            let total = 0;


            cart.forEach(

                item => {

                    total +=

                        item.price *
                        item.qty;

                }

            );


            /* 建立訂單資料 */

            const orderData = {


                customerName:
                    customerName,


                customerPhone:
                    customerPhone,


                orderType:
                    orderType,


                noUtensils:
                    noUtensilsValue,


                note:
                    note,


                items:
                    cart,


                total:
                    total,


                orderTime:
                    new Date().toISOString()


            };


            console.log(
                "準備送出訂單：",
                orderData
            );


            /*
                暫時顯示訂單資料

                下一步接 Google Apps Script
            */

            submitOrderBtn.disabled =
                true;


            submitOrderBtn.textContent =
                "訂單送出中...";


            /*
                目前先模擬成功

                等接上 GAS 後
                這裡改成 fetch()
            */

            setTimeout(

                function() {


                    alert(

                        "🎉 訂單已成功送出！\n\n" +

                        "姓名：" +
                        customerName +
                        "\n" +

                        "取餐方式：" +
                        orderType +
                        "\n" +

                        "總金額：NT$" +
                        total

                    );


                    /*
                        清空購物車
                    */

                    localStorage.removeItem(
                        "cart"
                    );


                    /*
                        回到首頁
                    */

                    window.location.href =
                        "index.html";


                },

                500

            );

        }

    );

}


/* =========================================
   初始化
========================================= */

renderCheckout();


console.log(
    "🍜 初萊食麵 checkout.js 已載入"
);