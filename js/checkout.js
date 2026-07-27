/* =========================================
   🍜 初萊食麵 V3
   checkout.js
   外帶最快取餐：約20分鐘
   預約取餐：自行選擇日期＋時間
========================================= */


/* =========================================
   V3 API
========================================= */

const V3_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyxDP5-lWYxH7Pk-uZuey05aj5ijqiQ8MUlTKNuNb7gt0PDGJgkbS66bWpkylH6JngunQ/exec";


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
    document.getElementById("order-list");

const orderTotal =
    document.getElementById("order-total");

const nameInput =
    document.getElementById("customer-name");

const phoneInput =
    document.getElementById("customer-phone");

const phoneError =
    document.getElementById("phone-error");

const welcomeCustomer =
    document.getElementById("welcome-customer");

const welcomeName =
    document.getElementById("welcome-name");

const takeoutOptions =
    document.getElementById("takeout-options");

const reservationTimeArea =
    document.getElementById("reservation-time-area");

const pickupDate =
    document.getElementById("pickup-date");

const pickupTime =
    document.getElementById("pickup-time");

const customerNote =
    document.getElementById("customer-note");

const submitBtn =
    document.getElementById("submit-order-btn");

const submitResult =
    document.getElementById("submit-result");

const successModal =
    document.getElementById("success-modal");

const successConfirmBtn =
    document.getElementById("success-confirm-btn");

const successOrderSummary =
    document.getElementById("success-order-summary");


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
            orderTotal.textContent = "0";
        }

        return;
    }


    let html = "";
    let total = 0;


    cart.forEach(item => {

        const subtotal =
            Number(item.price) *
            Number(item.qty);


        total += subtotal;


        let optionText = "";


        if (item.options) {

            const options =
                item.options;

            const optionList = [];


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


            if (options.sauce) {

                if (
                    Array.isArray(
                        options.sauce
                    )
                ) {

                    optionList.push(
                        options.sauce.join("＋")
                    );

                } else {

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
                        ${escapeHTML(
                            optionList.join(" ・ ")
                        )}
                    </div>
                `;

            }

        }


        html += `

            <div class="checkout-item">

                <div>

                    <strong>
                        ${escapeHTML(item.name)}
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

    });


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
                .replace(/\D/g, "")
                .slice(0, 10);


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
        /^09\d{8}$/.test(phone);


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
   取得今天日期 YYYY-MM-DD
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


    return `${year}-${month}-${day}`;

}


/* =========================================
   取得最快取餐時間
   現在時間＋20分鐘
========================================= */

function getFastestPickupTime() {

    const now =
        new Date();


    now.setMinutes(
        now.getMinutes() + 20
    );


    const hour =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return `${hour}:${minute}`;

}


/* =========================================
   產生預約日期
   顯示今天起未來 7 天
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
                today.getTime()
                +
                i *
                24 *
                60 *
                60 *
                1000
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


        const text =
            i === 0
                ? `今天 ${month}/${day}`
                : `${month}/${day}`;


        const option =
            document.createElement(
                "option"
            );


        option.value =
            value;


        option.textContent =
            text;


        pickupDate.appendChild(
            option
        );

    }

}


/* =========================================
   產生預約時間
   從現在起未來 7 天
   每 10 分鐘一個選項
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


    /*
        最早預約時間：
        現在＋30分鐘
    */

    now.setMinutes(
        now.getMinutes() + 30
    );


    /*
        整點對齊到10分鐘
    */

    now.setMinutes(

        Math.ceil(
            now.getMinutes() / 10
        ) * 10

    );


    /*
        從 11:30 開始
        到 20:30
        依照營業時間顯示

        如果日期是星期六、日
        則到 18:30
    */

    const selectedDate =
        pickupDate
            ? pickupDate.value
            : "";


    let startHour = 11;
    let startMinute = 30;

    let endHour = 20;
    let endMinute = 30;


    if (selectedDate) {

        const date =
            new Date(
                selectedDate + "T00:00:00"
            );


        const day =
            date.getDay();


        /*
            星期六、日
            營業至18:30
        */

        if (
            day === 0 ||
            day === 6
        ) {

            endHour = 18;
            endMinute = 30;

        }

    }


    for (
        let hour = startHour;
        hour <= endHour;
        hour++
    ) {

        for (
            let minute = 0;
            minute < 60;
            minute += 10
        ) {


            if (
                hour === startHour &&
                minute < startMinute
            ) {

                continue;

            }


            if (
                hour === endHour &&
                minute > endMinute
            ) {

                continue;

            }


            /*
                如果選今天
                過濾已經過去的時間
            */

            if (
                selectedDate ===
                getTodayDate()
            ) {

                const current =
                    new Date();


                const optionTime =
                    new Date();


                optionTime.setHours(
                    hour,
                    minute,
                    0,
                    0
                );


                /*
                    至少保留30分鐘
                */

                const minimum =
                    new Date(
                        current.getTime()
                        +
                        30 *
                        60 *
                        1000
                    );


                if (
                    optionTime < minimum
                ) {

                    continue;

                }

            }


            const value =
                `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;


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

}


/* =========================================
   顯示／隱藏外帶設定
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
                        this.value === "外帶" &&
                        this.checked
                    ) {

                        if (takeoutOptions) {

                            takeoutOptions.style.display =
                                "block";

                        }


                        /*
                            預設選擇最快取餐
                        */

                        const fastestRadio =
                            document.querySelector(
                                'input[name="pickup-mode"][value="最快取餐"]'
                            );


                        if (fastestRadio) {

                            fastestRadio.checked =
                                true;

                        }


                        /*
                            隱藏預約日期時間
                        */

                        if (reservationTimeArea) {

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
   最快／預約取餐切換
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
                        this.value === "最快取餐" &&
                        this.checked
                    ) {

                        if (reservationTimeArea) {

                            reservationTimeArea.style.display =
                                "none";

                        }

                    }


                    /*
                        預約取餐
                    */

                    if (
                        this.value === "預約取餐" &&
                        this.checked
                    ) {

                        if (reservationTimeArea) {

                            reservationTimeArea.style.display =
                                "block";

                        }


                        generatePickupDates();


                        /*
                            預設日期為今天
                        */

                        if (pickupDate) {

                            pickupDate.value =
                                getTodayDate();

                        }


                        generatePickupTimes();

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
   送出訂單
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
        取餐模式
    */

    let pickupMode =
        "";


    let finalPickupDate =
        "";


    let finalPickupTime =
        "";


    /*
        外帶
    */

    if (
        orderType === "外帶"
    ) {


        pickupMode =
            document.querySelector(
                'input[name="pickup-mode"]:checked'
            )?.value
            ||
            "最快取餐";


        /*
            ================================
            最快取餐
            ================================
        */

        if (
            pickupMode === "最快取餐"
        ) {

            finalPickupDate =
                getTodayDate();


            finalPickupTime =
                `最快取餐（約20分鐘）`;

        }


        /*
            ================================
            預約取餐
            ================================
        */

        else if (
            pickupMode === "預約取餐"
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
                Number(item.price)
                *
                Number(item.qty),

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
                    options.vegetable === false
                ) {

                    optionText.push(
                        "不加菜"
                    );

                }


                if (
                    options.onion === false
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
                            options.sauce.join("＋")
                        );

                    } else {

                        optionText.push(
                            options.sauce
                        );

                    }

                }


                return {

                    name:
                        item.name,

                    qty:
                        Number(item.qty),

                    price:
                        Number(item.price),

                    subtotal:
                        Number(item.price)
                        *
                        Number(item.qty),

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
        "送出訂單資料：",
        orderData
    );


    /*
        防止重複送單
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
            取得後端回應
        */

        const result =
            await response.json();


        console.log(
            "後端回應：",
            result
        );


        /*
            送單成功
        */

        if (
            result.success
        ) {


            /*
                儲存客戶資料
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


    /*
        訂單內容摘要
    */

    let itemsHTML =
        "";


    if (
        Array.isArray(
            orderData.items
        )
    ) {


        itemsHTML =
            orderData.items
            .map(
                item => {

                    return `

                        <div class="success-item">

                            <span>

                                ${escapeHTML(
                                    item.name
                                )}

                                ×
                                ${item.qty}

                            </span>

                            <strong>

                                NT$${item.subtotal}

                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

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


    if (successOrderSummary) {

        successOrderSummary.innerHTML = `

            <div class="success-order-info">

                <strong>
                    訂單摘要
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


    /*
        防止背景滾動
    */

    document.body.style.overflow =
        "hidden";

}


/* =========================================
   成功彈窗｜知道了 → 返回首頁
========================================= */

if (successConfirmBtn) {

    successConfirmBtn.addEventListener(
        "click",
        function() {

            /*
                恢復頁面滾動
            */

            document.body.style.overflow =
                "";


            /*
                返回首頁
            */

            window.location.href =
                "index.html";

        }
    );

}

/* =========================================
   點擊背景關閉
========================================= */

if (successModal) {

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

const backOrderBtn =
    document.getElementById(
        "back-order-btn"
    );


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


/* =========================================
   初始化
========================================= */

renderOrder();

loadCustomerData();


console.log(
    "🍜 初萊食麵 V3 checkout.js 已載入"
);