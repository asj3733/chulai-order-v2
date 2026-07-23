/* =========================================
   初萊食麵
   checkout.js
   結帳頁面正式版
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


const reservationTime =
    document.getElementById(
        "reservation-time"
    );


const pickupDate =
    document.getElementById(
        "pickup-date"
    );


const pickupTime =
    document.getElementById(
        "pickup-time"
    );



/* =========================================
   載入上次姓名
========================================= */

if (nameInput) {

    nameInput.value =
        localStorage.getItem(
            "customerName"
        ) || "";

}



/* =========================================
   載入上次電話
========================================= */

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
   顯示客製化內容
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



    /* 沒有客製 */

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
   顯示購物車
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

            <div class="empty-cart">

                <p>
                    🛒 購物車目前是空的
                </p>


                <button
                    type="button"
                    onclick="window.location.href='order.html'"
                >

                    返回點餐

                </button>

            </div>

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



    /* 商品 */

    cart.forEach(

        item => {


            const subtotal =

                item.price *
                item.qty;


            total +=
                subtotal;



            html += `

                <div class="checkout-item">


                    <div class="checkout-item-info">


                        <strong>

                            ${item.name}

                        </strong>


                        ${getOptionText(item)}


                        <div class="checkout-price">

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
   內用／外帶
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


                /* 外帶 */

                if (
                    this.value ===
                    "外帶"
                ) {


                    if (takeoutOptions) {

                        takeoutOptions.style.display =
                            "block";

                    }


                }


                /* 內用 */

                else {


                    if (takeoutOptions) {

                        takeoutOptions.style.display =
                            "none";

                    }


                    if (reservationTime) {

                        reservationTime.style.display =
                            "none";

                    }


                    if (noUtensils) {

                        noUtensils.checked =
                            false;

                    }

                }

            }

        );

    }

);



/* =========================================
   儘快取餐／提前預約
========================================= */

const pickupTimeTypeInputs =

    document.querySelectorAll(

        'input[name="pickupTimeType"]'

    );


pickupTimeTypeInputs.forEach(

    input => {


        input.addEventListener(

            "change",

            function() {


                if (
                    this.value ===
                    "提前預約"
                ) {


                    if (reservationTime) {

                        reservationTime.style.display =
                            "block";

                    }


                    /* 設定最小日期為今天 */

                    if (pickupDate) {

                        const today =
                            new Date();


                        const year =
                            today.getFullYear();


                        const month =
                            String(
                                today.getMonth() + 1
                            ).padStart(
                                2,
                                "0"
                            );


                        const day =
                            String(
                                today.getDate()
                            ).padStart(
                                2,
                                "0"
                            );


                        pickupDate.min =

                            `${year}-${month}-${day}`;

                    }


                }


                else {


                    if (reservationTime) {

                        reservationTime.style.display =
                            "none";

                    }


                    if (pickupDate) {

                        pickupDate.value =
                            "";

                    }


                    if (pickupTime) {

                        pickupTime.value =
                            "";

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
   取得取餐時間
========================================= */

function getPickupTime() {


    const orderType =
        getOrderType();



    /* 內用 */

    if (
        orderType ===
        "內用"
    ) {

        return "";

    }



    const selectedPickupType =

        document.querySelector(

            'input[name="pickupTimeType"]:checked'

        );



    if (
        !selectedPickupType
    ) {

        return "儘快取餐";

    }



    /* 儘快取餐 */

    if (
        selectedPickupType.value ===
        "儘快取餐"
    ) {

        return "儘快取餐";

    }



    /* 提前預約 */

    if (
        selectedPickupType.value ===
        "提前預約"
    ) {


        if (
            !pickupDate.value
            ||
            !pickupTime.value
        ) {

            return null;

        }


        return (

            pickupDate.value
            +
            " "
            +
            pickupTime.value

        );

    }


    return "儘快取餐";

}



/* =========================================
   送出訂單
========================================= */

if (submitOrderBtn) {


    submitOrderBtn.addEventListener(

        "click",

        function() {


            /* 防止重複點擊 */

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

                    "購物車目前是空的，" +
                    "請先加入餐點！"

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



            /* 取餐時間 */

            const pickupTimeValue =
                getPickupTime();



            /* 提前預約但沒有選時間 */

            if (
                orderType === "外帶"
                &&
                pickupTimeValue === null
            ) {

                alert(

                    "請選擇預約的取餐日期與時間！"

                );


                return;

            }



            /* 餐具 */

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



            /* 訂單資料 */

            const orderData = {


                customerName:
                    customerName,


                customerPhone:
                    customerPhone,


                orderType:
                    orderType,


                pickupTime:
                    pickupTimeValue,


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



            /* 測試查看 */

            console.log(

                "🍜 初萊食麵訂單：",

                orderData

            );



            /* 防止重複送出 */

            submitOrderBtn.disabled =
                true;


            submitOrderBtn.textContent =
                "訂單送出中...";



            /*
                目前先模擬送出成功

                下一步接 LINE 通知
            */

            setTimeout(

                function() {


                    let message =

                        "🎉 訂單已成功送出！\n\n";


                    message +=

                        "姓名：" +
                        customerName +
                        "\n";


                    message +=

                        "取餐方式：" +
                        orderType +
                        "\n";



                    /* 外帶才顯示 */

                    if (
                        orderType ===
                        "外帶"
                    ) {


                        message +=

                            "取餐時間：" +
                            pickupTimeValue +
                            "\n";



                        if (
                            noUtensilsValue
                        ) {

                            message +=

                                "餐具：不需要\n";

                        }

                    }



                    message +=

                        "總金額：NT$" +
                        total;



                    alert(
                        message
                    );



                    /* 清空購物車 */

                    localStorage.removeItem(
                        "cart"
                    );



                    /* 回首頁 */

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

    "🍜 初萊食麵 checkout.js 正式版已載入"

);