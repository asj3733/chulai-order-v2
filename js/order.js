/* =========================================
   🍜 初萊食麵
   order.js｜購物車＋客製化＋回頭客
   完整穩定版
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

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem("cart");

        if (savedCart) {

            const parsedCart =
                JSON.parse(savedCart);

            if (Array.isArray(parsedCart)) {

                cart = parsedCart;

            } else {

                cart = [];

            }

        } else {

            cart = [];

        }

    } catch (error) {

        console.error(
            "購物車讀取失敗：",
            error
        );

        cart = [];

    }

}


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
   取得商品 ID
========================================= */

function getProductId(item) {

    return String(
        item.id ||
        item.name ||
        ""
    );

}


/* =========================================
   找商品
========================================= */

function findMenuItem(itemId) {

    if (
        typeof menu === "undefined" ||
        !menu
    ) {

        console.error(
            "找不到 menu 商品資料"
        );

        return null;

    }


    for (
        const categoryName in menu
    ) {

        const categoryItems =
            menu[categoryName];


        if (
            !Array.isArray(
                categoryItems
            )
        ) {

            continue;

        }


        const found =
            categoryItems.find(
                item =>
                    getProductId(item)
                    ===
                    String(itemId)
            );


        if (found) {

            return found;

        }

    }


    return null;

}


/* =========================================
   顯示商品
========================================= */

function renderMenu(
    selectedCategory = null
) {

    if (!menuArea) {

        return;

    }


    if (
        typeof menu === "undefined"
    ) {

        menuArea.innerHTML = `

            <p>
                ⚠️ 商品資料載入失敗
            </p>

        `;

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

            `;


            menu[categoryName].forEach(
                item => {

                    const itemId =
                        getProductId(item);


                    html += `

                        <div class="menu-item">

                            <div class="menu-info">

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
                                class="add-menu-btn"
                                data-item-id="${escapeHTML(
                                    itemId
                                )}">

                                加入

                            </button>

                        </div>

                    `;

                }
            );


            html += `

                </section>

            `;

        }
    );


    menuArea.innerHTML =
        html;


    /*
        商品加入按鈕
        使用事件綁定
        避免商品名稱特殊符號造成 onclick 錯誤
    */

    menuArea
        .querySelectorAll(
            ".add-menu-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        const itemId =
                            this.dataset.itemId;

                        addCartById(
                            itemId
                        );

                    }
                );

            }
        );

}


/* =========================================
   點擊加入購物車
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
            "⚠️ 找不到這個商品，請重新整理頁面後再試。"
        );

        return;

    }


    /*
        麵類
    */

    if (
        item.type === "noodle"
    ) {

        openCustomModal(item);

        return;

    }


    /*
        米粉
    */

    if (
        item.type === "riceNoodle"
    ) {

        openCustomModal(item);

        return;

    }


    /*
        關東煮
    */

    if (
        item.type === "oden"
    ) {

        openCustomModal(item);

        return;

    }


    /*
        手工大腸
    */

    if (
        item.type === "sauce"
    ) {

        openCustomModal(item);

        return;

    }


    /*
        其他商品
        直接加入購物車
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


    const modalQtyElement =
        document.getElementById(
            "modalQty"
        );


    if (!modal) {

        console.error(
            "找不到 customModal"
        );

        return;

    }


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

    if (modalQtyElement) {

        modalQtyElement.textContent =
            "1";

    }


    /*
        重設麵條
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
        重設辣度
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
        重設不加菜
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
        重設不加蔥
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
        重設醬料
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
        預設全部隱藏
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

function changeModalQty(
    change
) {

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


    /*
        麵類
    */

    if (
        currentItem.type === "noodle"
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


    /*
        米粉
    */

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


    /*
        關東煮／手工大腸
    */

    else if (

        currentItem.type === "oden"

        ||

        currentItem.type === "sauce"

    ) {

        const sauceInputs =
            document.querySelectorAll(
                '#odenOption input[name="sauce"]:checked'
            );


        let sauces =
            Array
                .from(
                    sauceInputs
                )
                .map(
                    input =>
                        input.value
                );


        /*
            都不加
            優先權最高
        */

        if (
            sauces.includes(
                "都不加"
            )
        ) {

            sauces =
                [
                    "都不加"
                ];

        }


        /*
            沒有選擇
            預設醬油膏
        */

        if (
            sauces.length === 0
        ) {

            sauces =
                [
                    "醬油膏"
                ];

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
        關閉
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

    const productId =
        getProductId(item);


    const quantity =
        Number(qty);


    if (
        quantity <= 0
    ) {

        return;

    }


    /*
        客製化識別碼

        相同商品
        ＋
        相同客製化
        會合併數量
    */

    const optionKey =
        JSON.stringify(
            options
        );


    const existingItem =
        cart.find(
            cartItem =>

                String(
                    cartItem.productId
                )
                ===
                String(productId)

                &&

                String(
                    cartItem.optionKey
                )
                ===
                String(optionKey)

        );


    /*
        已有相同商品
    */

    if (
        existingItem
    ) {

        existingItem.qty =
            Number(
                existingItem.qty
            )
            +
            quantity;

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
                quantity,


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
        更新畫面
    */

    updateCart();

}


/* =========================================
   顯示客製化內容
========================================= */

function getOptionText(
    item
) {

    const options =
        item.options ||
        {};


    const texts =
        [];


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
                .join(" ・ ")}

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

        return;

    }


    let html =
        "";


    let total =
        0;


    let totalQty =
        0;


    /*
        購物車空
    */

    if (
        cart.length === 0
    ) {

        cartArea.innerHTML = `

            <div class="empty-cart">

                🛒 尚未加入商品

            </div>

        `;


        updateCartSummary(
            0,
            0
        );


        return;

    }


    /*
        商品
    */

    cart.forEach(

        (item, index) => {

            const price =
                Number(
                    item.price
                )
                ||
                0;


            const qty =
                Number(
                    item.qty
                )
                ||
                0;


            const subtotal =
                price *
                qty;


            total +=
                subtotal;


            totalQty +=
                qty;


            html += `

                <div class="cart-item">

                    <div class="cart-item-info">

                        <strong>
                            ${escapeHTML(
                                item.name
                            )}
                        </strong>

                        ${getOptionText(
                            item
                        )}

                        <div class="cart-price">

                            NT$${price}
                            ×
                            ${qty}
                            =
                            NT$${subtotal}

                        </div>

                    </div>


                    <div class="cart-control">

                        <button
                            type="button"
                            class="cart-minus"
                            data-index="${index}">

                            －

                        </button>


                        <span>

                            ${qty}

                        </span>


                        <button
                            type="button"
                            class="cart-plus"
                            data-index="${index}">

                            ＋

                        </button>


                        <button
                            type="button"
                            class="delete-btn cart-delete"
                            data-index="${index}">

                            ✕

                        </button>

                    </div>

                </div>

            `;

        }

    );


    cartArea.innerHTML =
        html;


    /*
        綁定數量按鈕
    */

    cartArea
        .querySelectorAll(
            ".cart-minus"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        changeQty(

                            Number(
                                this.dataset.index
                            ),

                            -1

                        );

                    }
                );

            }
        );


    cartArea
        .querySelectorAll(
            ".cart-plus"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        changeQty(

                            Number(
                                this.dataset.index
                            ),

                            1

                        );

                    }
                );

            }
        );


    cartArea
        .querySelectorAll(
            ".cart-delete"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        removeItem(

                            Number(
                                this.dataset.index
                            )

                        );

                    }
                );

            }
        );


    /*
        更新金額
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


    const newQty =

        Number(
            cart[index].qty
        )

        +

        Number(change);


    /*
        數量歸零
        直接刪除
    */

    if (
        newQty <= 0
    ) {

        cart.splice(

            index,

            1

        );

    }

    else {

        cart[index].qty =
            newQty;

    }


    saveCart();


    updateCart();

}


/* =========================================
   刪除商品
========================================= */

function removeItem(
    index
) {

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


    if (
        sauceInputs.length === 0
    ) {

        return;

    }


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
                        選擇「都不加」
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
                                    otherInput
                                    !==
                                    this
                                ) {

                                    otherInput.checked =
                                        false;

                                }

                            }

                        );

                    }


                    /*
                        選擇其他醬料
                        取消都不加
                    */

                    else if (

                        this.value
                        !==
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
                        自動恢復醬油膏
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
   一鍵再點
========================================= */

function repeatLastOrder() {

    const savedOrder =
        localStorage.getItem(
            "lastCustomerOrder"
        );


    if (
        !savedOrder
    ) {

        alert(
            "目前沒有找到上次訂單"
        );

        return;

    }


    try {

        const customer =
            JSON.parse(
                savedOrder
            );


        const lastOrder =
            customer.lastOrder;


        if (
            !Array.isArray(
                lastOrder
            )
            ||
            lastOrder.length === 0
        ) {

            alert(
                "目前沒有可以再次訂購的餐點"
            );

            return;

        }


        let addedCount =
            0;


        lastOrder.forEach(

            historyItem => {

                if (
                    !historyItem
                ) {

                    return;

                }


                /*
                    支援：

                    historyItem.text

                    或直接傳文字
                */

                const historyText =

                    typeof historyItem ===
                    "string"

                        ? historyItem

                        : historyItem.text;


                const parsed =
                    parseHistoryOrder(
                        historyText
                    );


                if (
                    !parsed
                ) {

                    return;

                }


                const menuItem =
                    findMenuItem(
                        parsed.name
                    );


                if (
                    !menuItem
                ) {

                    console.warn(

                        "找不到歷史商品：",

                        parsed.name

                    );

                    return;

                }


                addCartDirect(

                    menuItem,

                    parsed.options,

                    parsed.qty

                );


                addedCount +=
                    parsed.qty;

            }

        );


        if (
            addedCount > 0
        ) {

            alert(

                "🔄 已將上次訂單加入購物車！"

            );


            updateCart();


            window.scrollTo({

                top:
                    document.body.scrollHeight,

                behavior:
                    "smooth"

            });

        }

        else {

            alert(

                "上次訂單中的商品目前找不到，請重新選擇餐點。"

            );

        }

    }

    catch (error) {

        console.error(

            "一鍵再點失敗：",

            error

        );


        alert(

            "無法載入上次訂單，請重新選擇餐點。"

        );

    }

}


/* =========================================
   解析歷史訂單
========================================= */

function parseHistoryOrder(
    text
) {

    if (
        !text
    ) {

        return null;

    }


    const value =
        String(
            text
        )
        .trim();


    /*
        範例：

        肉燥乾麵（大） × 1｜粗麵・不辣・不加蔥
    */

    const parts =
        value.split(
            "｜"
        );


    const main =
        parts[0]
        .trim();


    const optionText =
        parts
            .slice(1)
            .join("｜");


    /*
        數量
    */

    const qtyMatch =
        main.match(
            /×\s*(\d+)/
        );


    const qty =
        qtyMatch

            ? Number(
                qtyMatch[1]
            )

            : 1;


    /*
        商品名稱
    */

    const name =
        main

            .replace(
                /×\s*\d+/,
                ""
            )

            .trim();


    const options = {

        noodle: null,

        spicy: null,

        vegetable: true,

        onion: true,

        sauce: null

    };


    /*
        解析客製化
    */

    if (
        optionText
    ) {

        const optionList =
            optionText

                .split("・")

                .map(
                    item =>
                        item.trim()
                )

                .filter(
                    item =>
                        item.length > 0
                );


        optionList.forEach(

            option => {

                /*
                    麵條
                */

                if (

                    option === "細麵"

                    ||

                    option === "粗麵"

                ) {

                    options.noodle =
                        option;

                }


                /*
                    辣度
                */

                else if (

                    option === "不辣"

                    ||

                    option === "小辣"

                    ||

                    option === "中辣"

                    ||

                    option === "大辣"

                ) {

                    options.spicy =
                        option;

                }


                /*
                    不加菜
                */

                else if (
                    option === "不加菜"
                ) {

                    options.vegetable =
                        false;

                }


                /*
                    不加蔥
                */

                else if (
                    option === "不加蔥"
                ) {

                    options.onion =
                        false;

                }


                /*
                    醬料
                */

                else if (

                    option.includes(
                        "醬油膏"
                    )

                    ||

                    option.includes(
                        "番茄醬"
                    )

                    ||

                    option.includes(
                        "辣椒醬"
                    )

                    ||

                    option.includes(
                        "都不加"
                    )

                ) {

                    options.sauce =

                        option

                            .split("＋")

                            .map(
                                sauce =>
                                    sauce.trim()
                            )

                            .filter(
                                sauce =>
                                    sauce.length > 0
                            );

                }

            }

        );

    }


    return {

        name:
            name,

        qty:
            qty,

        options:
            options

    };

}


/* =========================================
   歡迎回來｜查詢客人
========================================= */

const welcomePhone =
    document.getElementById(
        "welcome-phone"
    );


const welcomeSearchBtn =
    document.getElementById(
        "welcome-search-btn"
    );


const welcomeResult =
    document.getElementById(
        "welcome-result"
    );


/* =========================================
   查詢按鈕
========================================= */

if (
    welcomeSearchBtn
) {

    welcomeSearchBtn.addEventListener(

        "click",

        searchWelcomeCustomer

    );

}


/* =========================================
   電話輸入
========================================= */

if (
    welcomePhone
) {

    welcomePhone.addEventListener(

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

        }

    );


    /*
        Enter 查詢
    */

    welcomePhone.addEventListener(

        "keydown",

        function(event) {

            if (
                event.key === "Enter"
            ) {

                searchWelcomeCustomer();

            }

        }

    );

}


/* =========================================
   V3 API
========================================= */

const V3_SCRIPT_URL =

    "https://script.google.com/macros/s/AKfycbz2ZAJ0QOn99o1H6vMafP6Xnf8pzzuYqWPbvFJRHrcYuvBAUUtKn6W5rZKbe4w5PZXm3g/exec";


/* =========================================
   查詢客人
========================================= */

async function searchWelcomeCustomer() {

    if (
        !welcomePhone
        ||
        !welcomeResult
    ) {

        return;

    }


    const phone =
        welcomePhone.value.trim();


    /*
        驗證電話
    */

    if (
        !/^09\d{8}$/.test(
            phone
        )
    ) {

        welcomeResult.style.display =
            "block";


        welcomeResult.innerHTML = `

            <div class="welcome-error">

                📱 請輸入正確的手機號碼

            </div>

        `;

        return;

    }


    /*
        查詢中
    */

    welcomeResult.style.display =
        "block";


    welcomeResult.innerHTML = `

        <div class="welcome-loading">

            🔍 正在查詢您的訂單...

        </div>

    `;


    try {

        const url =

            V3_SCRIPT_URL

            +

            "?action=findCustomer&phone="

            +

            encodeURIComponent(
                phone
            );


        const response =
            await fetch(
                url
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        /*
            找到客人
        */

        if (

            data.success

            &&

            data.found

            &&

            data.customer

        ) {

            const customer =
                data.customer;


            /*
                儲存姓名
            */

            localStorage.setItem(

                "customerName",

                customer.name ||
                ""

            );


            /*
                儲存電話
            */

            localStorage.setItem(

                "customerPhone",

                customer.phone ||
                phone

            );


            /*
                儲存上次訂單
            */

            localStorage.setItem(

                "lastCustomerOrder",

                JSON.stringify(
                    customer
                )

            );


            /*
                顯示歡迎
            */

            welcomeResult.innerHTML = `

                <div class="welcome-success">

                    <h3>

                        👋 歡迎回來，

                        ${escapeHTML(

                            customer.name
                            ||
                            "貴賓"

                        )}

                    </h3>


                    <p>

                        很高興再次為您服務 ❤️

                    </p>


                    <div class="last-order-box">

                        <strong>

                            📋 您上次的訂單

                        </strong>


                        <div class="last-order-text">

                            ${formatLastOrderText(

                                customer.lastOrder

                            )}

                        </div>

                    </div>


                    <button

                        type="button"

                        class="repeat-order-btn"

                        id="repeat-last-order-btn">

                        🔄 一鍵再點上次餐點

                    </button>

                </div>

            `;


            /*
                綁定一鍵再點
            */

            const repeatBtn =
                document.getElementById(
                    "repeat-last-order-btn"
                );


            if (repeatBtn) {

                repeatBtn.addEventListener(

                    "click",

                    repeatLastOrder

                );

            }

        }


        /*
            找不到客人
        */

        else {

            welcomeResult.innerHTML = `

                <div class="welcome-new">

                    <h3>

                        👋 歡迎來到初萊食麵！

                    </h3>


                    <p>

                        這是您第一次使用線上點餐，

                        請開始選擇您喜歡的餐點 🍜

                    </p>

                </div>

            `;

        }

    }

    catch (error) {

        console.error(

            "V3 客戶查詢失敗：",

            error

        );


        welcomeResult.innerHTML = `

            <div class="welcome-error">

                ⚠️ 目前無法連線到點餐系統

                <br>

                請稍後再試

            </div>

        `;

    }

}


/* =========================================
   顯示歷史訂單
========================================= */

function formatLastOrderText(
    order
) {

    if (
        !order
    ) {

        return "目前沒有歷史訂單";

    }


    if (
        Array.isArray(
            order
        )
    ) {

        return order

            .map(

                item => {

                    const text =

                        typeof item ===
                        "string"

                            ? item

                            : item.text;

                    return escapeHTML(
                        text || ""
                    );

                }

            )

            .join(
                "<br>"
            );

    }


    return escapeHTML(

        String(
            order
        )

    )

    .replace(
        /\n/g,
        "<br>"
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

loadCart();

renderMenu();

updateCart();

setupSauceControl();


console.log(

    "🍜 初萊食麵 order.js 完整穩定版已載入"

);