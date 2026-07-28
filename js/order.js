/* =========================================
   🍜 初萊食麵
   order.js
   購物車＋商品＋客製化完整正式版
========================================= */


/* =========================================
   全域變數
========================================= */

const menuArea =
    document.getElementById("menu");

let cart = [];

let currentItem = null;

let modalQty = 1;


/* =========================================
   讀取購物車
========================================= */

try {

    const savedCart =
        localStorage.getItem("cart");

    if (savedCart) {

        const parsedCart =
            JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {

            cart = parsedCart;

        }

    }

} catch (error) {

    console.error(
        "購物車讀取失敗：",
        error
    );

    cart = [];

}


/* =========================================
   確保購物車資料格式正常
========================================= */

function normalizeCart() {

    if (!Array.isArray(cart)) {

        cart = [];

        return;

    }


    cart = cart.filter(item => {

        return (

            item &&

            item.productId &&

            item.name &&

            Number(item.price) >= 0 &&

            Number(item.qty) > 0

        );

    });


    cart.forEach(item => {

        item.qty =
            Number(item.qty) || 1;


        item.price =
            Number(item.price) || 0;


        if (!item.options) {

            item.options = {

                noodle: null,

                spicy: null,

                vegetable: true,

                onion: true,

                sauce: null

            };

        }


        if (!item.optionKey) {

            item.optionKey =
                JSON.stringify(
                    item.options
                );

        }

    });

}


normalizeCart();


/* =========================================
   儲存購物車
========================================= */

function saveCart() {

    try {

        localStorage.setItem(

            "cart",

            JSON.stringify(cart)

        );

    } catch (error) {

        console.error(

            "購物車儲存失敗：",

            error

        );

    }

}


/* =========================================
   找商品
========================================= */

function findMenuItem(itemId) {

    if (
        typeof menu === "undefined"
    ) {

        console.error(
            "找不到 menu 商品資料"
        );

        return null;

    }


    for (
        const categoryName in menu
    ) {

        if (
            !Array.isArray(
                menu[categoryName]
            )
        ) {

            continue;

        }


        const found =
            menu[categoryName].find(

                item => {

                    const id =
                        item.id ||
                        item.name;

                    return String(id)
                        ===
                        String(itemId);

                }

            );


        if (found) {

            return found;

        }

    }


    return null;

}


/* =========================================
   渲染商品
========================================= */

function renderMenu(
    selectedCategory = null
) {

    if (!menuArea) {

        console.warn(
            "找不到 #menu"
        );

        return;

    }


    if (
        typeof menu === "undefined"
    ) {

        console.error(
            "menu.js 尚未載入"
        );

        return;

    }


    let html = "";


    const categories =

        selectedCategory

            ? [selectedCategory]

            : Object.keys(menu);


    categories.forEach(

        categoryName => {


            if (
                !menu[categoryName]
            ) {

                return;

            }


            html += `

                <section
                    class="menu-category"
                    data-category="${escapeHTML(
                        categoryName
                    )}">

                    <h2>
                        ${escapeHTML(
                            categoryName
                        )}
                    </h2>

                    <div class="menu-category-list">

            `;


            menu[categoryName].forEach(

                item => {


                    const itemId =

                        item.id ||

                        item.name;


                    html += `

                        <div
                            class="menu-item">

                            <div
                                class="menu-info">

                                <h3>
                                    ${escapeHTML(
                                        item.name
                                    )}
                                </h3>

                                <p>
                                    NT$${Number(
                                        item.price
                                    )}
                                </p>

                            </div>

                            <button
                                type="button"
                                onclick="addCartById('${escapeAttribute(
                                    itemId
                                )}')">

                                加入

                            </button>

                        </div>

                    `;

                }

            );


            html += `

                    </div>

                </section>

            `;

        }

    );


    menuArea.innerHTML =
        html;

}


/* =========================================
   加入商品
========================================= */

function addCartById(itemId) {

    const item =
        findMenuItem(itemId);


    if (!item) {

        console.error(
            "找不到商品：",
            itemId
        );

        alert(
            "找不到這項商品，請重新整理頁面後再試一次。"
        );

        return;

    }


    /*
        需要客製化的商品

        noodle
        riceNoodle
        oden
        sauce
    */

    if (

        item.type === "noodle"

        ||

        item.type === "riceNoodle"

        ||

        item.type === "oden"

        ||

        item.type === "sauce"

    ) {

        openCustomModal(item);

        return;

    }


    /*
        一般商品
        直接加入
    */

    addCartDirect(

        item,

        {

            noodle: null,

            spicy: null,

            vegetable: true,

            onion: true,

            sauce: null

        },

        1

    );

}


/* =========================================
   開啟客製化視窗
========================================= */

function openCustomModal(item) {

    currentItem =
        item;


    modalQty =
        1;


    const modal =
        document.getElementById(
            "customModal"
        );


    if (!modal) {

        console.error(
            "找不到 #customModal"
        );

        return;

    }


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const noodleOption =
        document.getElementById(
            "noodleOption"
        );


    const noodleSelectArea =
        document.getElementById(
            "noodleSelectArea"
        );


    const odenOption =
        document.getElementById(
            "odenOption"
        );


    /*
        商品名稱
    */

    if (modalTitle) {

        modalTitle.textContent =
            item.name;

    }


    /*
        數量
    */

    const qtyElement =
        document.getElementById(
            "modalQty"
        );


    if (qtyElement) {

        qtyElement.textContent =
            "1";

    }


    /*
        預設粗麵
    */

    document
        .querySelectorAll(
            'input[name="noodle"]'
        )
        .forEach(

            input => {

                input.checked =

                    input.value ===
                    "粗麵";

            }

        );


    /*
        預設不辣
    */

    document
        .querySelectorAll(
            'input[name="spicy"]'
        )
        .forEach(

            input => {

                input.checked =

                    input.value ===
                    "不辣";

            }

        );


    /*
        預設加菜
    */

    const noVegetable =
        document.getElementById(
            "noVegetable"
        );


    if (noVegetable) {

        noVegetable.checked =
            false;

    }


    /*
        預設加蔥
    */

    const noOnion =
        document.getElementById(
            "noOnion"
        );


    if (noOnion) {

        noOnion.checked =
            false;

    }


    /*
        關東煮／手工大腸
        預設醬油膏
    */

    document
        .querySelectorAll(
            '#odenOption input[name="sauce"]'
        )
        .forEach(

            input => {

                input.checked =

                    input.value ===
                    "醬油膏";

            }

        );


    /*
        先全部隱藏
    */

    if (noodleOption) {

        noodleOption.style.display =
            "none";

    }


    if (noodleSelectArea) {

        noodleSelectArea.style.display =
            "none";

    }


    if (odenOption) {

        odenOption.style.display =
            "none";

    }


    /*
        麵類
    */

    if (
        item.type === "noodle"
    ) {

        if (noodleOption) {

            noodleOption.style.display =
                "block";

        }


        if (noodleSelectArea) {

            noodleSelectArea.style.display =
                "block";

        }

    }


    /*
        米粉
    */

    else if (
        item.type === "riceNoodle"
    ) {

        if (noodleOption) {

            noodleOption.style.display =
                "block";

        }


        if (noodleSelectArea) {

            noodleSelectArea.style.display =
                "none";

        }

    }


    /*
        關東煮
    */

    else if (
        item.type === "oden"
    ) {

        if (odenOption) {

            odenOption.style.display =
                "block";

        }

    }


    /*
        手工大腸
    */

    else if (
        item.type === "sauce"
    ) {

        if (odenOption) {

            odenOption.style.display =
                "block";

        }

    }


    /*
        顯示視窗
    */

    modal.style.display =
        "block";


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   客製化數量
========================================= */

function changeModalQty(change) {

    modalQty +=
        Number(change);


    if (
        modalQty < 1
    ) {

        modalQty =
            1;

    }


    if (
        modalQty > 99
    ) {

        modalQty =
            99;

    }


    const qtyElement =
        document.getElementById(
            "modalQty"
        );


    if (qtyElement) {

        qtyElement.textContent =
            modalQty;

    }

}


/* =========================================
   確認客製化
========================================= */

function confirmCustom() {

    if (!currentItem) {

        return;

    }


    let options = {

        noodle: null,

        spicy: null,

        vegetable: true,

        onion: true,

        sauce: null

    };


    /* =========================
       麵類
    ========================= */

    if (
        currentItem.type ===
        "noodle"
    ) {

        const noodle =
            document.querySelector(

                'input[name="noodle"]:checked'

            );


        const spicy =
            document.querySelector(

                'input[name="spicy"]:checked'

            );


        options.noodle =

            noodle

                ? noodle.value

                : "粗麵";


        options.spicy =

            spicy

                ? spicy.value

                : "不辣";


        const noVegetable =
            document.getElementById(
                "noVegetable"
            );


        const noOnion =
            document.getElementById(
                "noOnion"
            );


        options.vegetable =

            noVegetable

                ? !noVegetable.checked

                : true;


        options.onion =

            noOnion

                ? !noOnion.checked

                : true;

    }


    /* =========================
       米粉
    ========================= */

    else if (
        currentItem.type ===
        "riceNoodle"
    ) {

        const spicy =
            document.querySelector(

                'input[name="spicy"]:checked'

            );


        options.noodle =
            null;


        options.spicy =

            spicy

                ? spicy.value

                : "不辣";


        const noVegetable =
            document.getElementById(
                "noVegetable"
            );


        const noOnion =
            document.getElementById(
                "noOnion"
            );


        options.vegetable =

            noVegetable

                ? !noVegetable.checked

                : true;


        options.onion =

            noOnion

                ? !noOnion.checked

                : true;

    }


    /* =========================
       關東煮／手工大腸
    ========================= */

    else if (

        currentItem.type ===
        "oden"

        ||

        currentItem.type ===
        "sauce"

    ) {

        const sauceInputs =

            document.querySelectorAll(

                '#odenOption input[name="sauce"]:checked'

            );


        let sauces =

            Array.from(
                sauceInputs
            )
            .map(

                input =>
                    input.value

            );


        /*
            都不加
            優先
        */

        if (
            sauces.includes(
                "都不加"
            )
        ) {

            sauces =
                ["都不加"];

        }


        /*
            沒有選擇
            預設醬油膏
        */

        if (
            sauces.length === 0
        ) {

            sauces =
                ["醬油膏"];

        }


        options.sauce =
            sauces;

    }


    /*
        加入購物車
    */

    addCartDirect(

        currentItem,

        options,

        modalQty

    );


    /*
        關閉視窗
    */

    closeModal();

}


/* =========================================
   加入購物車
========================================= */

function addCartDirect(

    item,

    options,

    qty

) {

    if (!item) {

        return;

    }


    qty =
        Number(qty) || 1;


    /*
        商品 ID
    */

    const productId =

        item.id ||

        item.name;


    /*
        客製化識別碼

        商品 ID
        ＋
        客製化內容

        相同才合併
    */

    const optionKey =

        JSON.stringify(
            options
        );


    /*
        找相同商品
    */

    const existingItem =

        cart.find(

            cartItem =>

                String(
                    cartItem.productId
                )

                ===

                String(
                    productId
                )

                &&

                cartItem.optionKey
                ===
                optionKey

        );


    /*
        相同商品
        增加數量
    */

    if (existingItem) {

        existingItem.qty +=
            qty;

    }


    /*
        新商品
    */

    else {

        cart.push({

            id:

                Date.now()

                +

                Math.random(),


            productId:

                productId,


            name:

                item.name,


            price:

                Number(
                    item.price
                ),


            qty:

                qty,


            type:

                item.type ||
                null,


            options:

                options,


            optionKey:

                optionKey

        });

    }


    /*
        儲存
    */

    saveCart();


    /*
        更新購物車
    */

    updateCart();


    /*
        顯示加入成功提示
    */

    showAddCartMessage(
        item.name,
        qty
    );

}


/* =========================================
   顯示加入購物車提示
========================================= */

function showAddCartMessage(
    name,
    qty
) {

    /*
        如果頁面沒有提示元素
        使用簡單提示
    */

    const message =
        document.getElementById(
            "cart-message"
        );


    if (message) {

        message.textContent =

            `已加入購物車：${name} × ${qty}`;


        message.style.display =
            "block";


        clearTimeout(
            window.cartMessageTimer
        );


        window.cartMessageTimer =

            setTimeout(

                function() {

                    message.style.display =
                        "none";

                },

                2000

            );


        return;

    }

}


/* =========================================
   取得客製化文字
========================================= */

function getOptionText(item) {

    const options =

        item.options ||

        {};


    const texts = [];


    /*
        麵條
    */

    if (
        options.noodle
    ) {

        texts.push(
            options.noodle
        );

    }


    /*
        辣度
    */

    if (
        options.spicy
    ) {

        texts.push(
            options.spicy
        );

    }


    /*
        不加菜
    */

    if (
        options.vegetable === false
    ) {

        texts.push(
            "不加菜"
        );

    }


    /*
        不加蔥
    */

    if (
        options.onion === false
    ) {

        texts.push(
            "不加蔥"
        );

    }


    /*
        醬料
    */

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


    /*
        沒有客製化
    */

    if (
        texts.length === 0
    ) {

        return "";

    }


    return `

        <div class="cart-options">

            ${texts
                .map(
                    text =>
                        escapeHTML(text)
                )
                .join(
                    " ・ "
                )}

        </div>

    `;

}


/* =========================================
   更新購物車
========================================= */

function updateCart() {

    const cartArea =
        document.getElementById(
            "cart"
        );


    if (!cartArea) {

        console.warn(
            "找不到 #cart"
        );

        return;

    }


    normalizeCart();


    let html = "";

    let total = 0;

    let totalQty = 0;


    /*
        購物車空
    */

    if (
        cart.length === 0
    ) {

        cartArea.innerHTML =

            `

                <div class="empty-cart">

                    尚未加入商品

                </div>

            `;


        updateCartSummary(
            0,
            0
        );


        saveCart();


        return;

    }


    /*
        顯示商品
    */

    cart.forEach(

        (item, index) => {


            const subtotal =

                Number(
                    item.price
                )

                *

                Number(
                    item.qty
                );


            total +=
                subtotal;


            totalQty +=
                Number(
                    item.qty
                );


            html += `

                <div
                    class="cart-item">

                    <div
                        class="cart-item-info">

                        <strong>

                            ${escapeHTML(
                                item.name
                            )}

                        </strong>

                        ${getOptionText(
                            item
                        )}

                        <div>

                            NT$${Number(
                                item.price
                            )}

                            ×

                            ${Number(
                                item.qty
                            )}

                            =

                            NT$${subtotal}

                        </div>

                    </div>


                    <div
                        class="cart-control">

                        <button
                            type="button"
                            onclick="changeQty(
                                ${index},
                                -1
                            )">

                            －

                        </button>


                        <span>

                            ${Number(
                                item.qty
                            )}

                        </span>


                        <button
                            type="button"
                            onclick="changeQty(
                                ${index},
                                1
                            )">

                            ＋

                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            onclick="removeItem(
                                ${index}
                            )">

                            ✕

                        </button>

                    </div>

                </div>

            `;

        }

    );


    /*
        更新畫面
    */

    cartArea.innerHTML =
        html;


    /*
        更新總金額與數量
    */

    updateCartSummary(

        total,

        totalQty

    );

}


/* =========================================
   更新購物車總計
========================================= */

function updateCartSummary(

    total,

    totalQty

) {

    const totalElement =
        document.getElementById(
            "total"
        );


    const countElement =
        document.getElementById(
            "cart-count"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (countElement) {

        countElement.textContent =
            totalQty;

    }

}


/* =========================================
   修改購物車數量
========================================= */

function changeQty(

    index,

    change

) {

    if (
        !cart[index]
    ) {

        return;

    }


    cart[index].qty =

        Number(
            cart[index].qty
        )

        +

        Number(
            change
        );


    /*
        數量小於等於 0
        直接刪除
    */

    if (
        cart[index].qty <= 0
    ) {

        cart.splice(

            index,

            1

        );

    }


    saveCart();


    updateCart();

}


/* =========================================
   刪除商品
========================================= */

function removeItem(index) {

    if (
        !cart[index]
    ) {

        return;

    }


    cart.splice(

        index,

        1

    );


    saveCart();


    updateCart();

}


/* =========================================
   清空購物車
========================================= */

function clearCart() {

    cart = [];


    saveCart();


    updateCart();

}


/* =========================================
   關閉客製化視窗
========================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "customModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    document.body.style.overflow =
        "";


    currentItem =
        null;


    modalQty =
        1;

}


/* =========================================
   點擊視窗外關閉
========================================= */

const customModal =
    document.getElementById(
        "customModal"
    );


if (customModal) {

    customModal.addEventListener(

        "click",

        function(event) {

            if (
                event.target ===
                customModal
            ) {

                closeModal();

            }

        }

    );

}


/* =========================================
   ESC 關閉視窗
========================================= */

document.addEventListener(

    "keydown",

    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeModal();

        }

    }

);


/* =========================================
   關東煮／手工大腸醬料控制
========================================= */

function setupSauceControl() {

    const sauceInputs =

        document.querySelectorAll(

            '#odenOption input[name="sauce"]'

        );


    sauceInputs.forEach(

        input => {

            input.addEventListener(

                "change",

                function() {


                    const noSauce =

                        document.getElementById(
                            "noSauce"
                        );


                    /*
                        選「都不加」
                    */

                    if (

                        this.value ===
                        "都不加"

                        &&

                        this.checked

                    ) {


                        sauceInputs.forEach(

                            otherInput => {

                                if (
                                    otherInput !==
                                    this
                                ) {

                                    otherInput.checked =
                                        false;

                                }

                            }

                        );

                    }


                    /*
                        選其他醬料
                        取消都不加
                    */

                    else if (

                        this.value !==
                        "都不加"

                        &&

                        this.checked

                    ) {


                        if (noSauce) {

                            noSauce.checked =
                                false;

                        }

                    }


                    /*
                        全部取消
                        恢復醬油膏
                    */

                    const checkedSauces =

                        document.querySelectorAll(

                            '#odenOption input[name="sauce"]:checked'

                        );


                    if (
                        checkedSauces.length === 0
                    ) {


                        const soySauce =

                            document.querySelector(

                                '#odenOption input[value="醬油膏"]'

                            );


                        if (soySauce) {

                            soySauce.checked =
                                true;

                        }

                    }

                }

            );

        }

    );

}


/* =========================================
   分類按鈕
========================================= */

document
    .querySelectorAll(
        ".category-nav button"
    )
    .forEach(

        button => {

            button.addEventListener(

                "click",

                function() {


                    const category =

                        this.dataset.category;


                    renderMenu(
                        category
                    );


                    window.scrollTo({

                        top: 0,

                        behavior:
                            "smooth"

                    });

                }

            );

        }

    );


/* =========================================
   前往結帳
========================================= */

const checkoutBtn =
    document.getElementById(
        "checkout-btn"
    );


if (checkoutBtn) {

    checkoutBtn.addEventListener(

        "click",

        function() {


            if (
                cart.length === 0
            ) {

                alert(

                    "購物車目前是空的，請先加入餐點！"

                );

                return;

            }


            saveCart();


            window.location.href =
                "checkout.html";

        }

    );

}


/* =========================================
   HTML 防注入
========================================= */

function escapeHTML(text) {

    return String(
        text ?? ""
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
   HTML Attribute 防注入
========================================= */

function escapeAttribute(text) {

    return String(
        text ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /'/g,
        "&#039;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    );

}


/* =========================================
   初始化
========================================= */

setupSauceControl();

renderMenu();

updateCart();


console.log(

    "🍜 初萊食麵 order.js 已載入"

);