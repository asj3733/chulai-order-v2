/* =========================================
   初萊食麵 v2.0
   點餐系統｜完整 order.js
========================================= */


/* =========================================
   基本設定
========================================= */

const menuArea = document.getElementById("menu");

let cart = [];


/* =========================================
   客製化中的商品
========================================= */

let currentItem = null;

let modalQty = 1;


/* =========================================
   讀取購物車
========================================= */

try {

    const savedCart =
        localStorage.getItem("cart");

    if (savedCart) {

        cart = JSON.parse(savedCart);

    }

} catch (error) {

    console.error(
        "購物車讀取失敗",
        error
    );

    cart = [];

}


/* =========================================
   渲染商品
========================================= */

function renderMenu(category = null) {

    if (!menuArea) return;


    let html = "";


    const categories = category
        ? [category]
        : Object.keys(menu);


    categories.forEach(categoryName => {


        if (!menu[categoryName]) {

            return;

        }


        html += `

            <section
                class="menu-category"
                data-category="${categoryName}">

                <h2>
                    ${categoryName}
                </h2>

        `;


        menu[categoryName].forEach(item => {


            const itemId =
                item.id || item.name;


            html += `

                <div class="menu-item">

                    <div class="menu-info">

                        <h3>
                            ${item.name}
                        </h3>

                        <p>
                            NT$${item.price}
                        </p>

                    </div>


                    <button
                        type="button"
                        onclick="addCartById('${itemId}')">

                        加入

                    </button>

                </div>

            `;

        });


        html += `

            </section>

        `;

    });


    menuArea.innerHTML = html;

}


/* =========================================
   根據 ID 找商品
========================================= */

function findMenuItem(itemId) {


    for (
        const category in menu
    ) {


        const found =
            menu[category].find(

                item =>

                    String(
                        item.id ||
                        item.name
                    )

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
   點擊商品
========================================= */

function addCartById(itemId) {


    const item =
        findMenuItem(itemId);


    if (!item) {

        console.error(
            "找不到商品",
            itemId
        );

        return;

    }


    /*
        需要客製化的商品
    */

    if (

        item.type === "noodle" ||

        item.type === "riceNoodle" ||

        item.type === "oden"

    ) {


        openCustomModal(item);


        return;

    }


    /*
        不需要客製化
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


    currentItem = item;

    modalQty = 1;


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
        數量重設
    */

    const modalQtyElement =
        document.getElementById(
            "modalQty"
        );


    if (modalQtyElement) {

        modalQtyElement.textContent =
            "1";

    }


    /* =====================================
       每次開啟時重設所有選項
    ===================================== */


    /*
        麵條預設粗麵
    */

    document
        .querySelectorAll(
            '#noodleSelectBox input[name="noodle"]'
        )
        .forEach(input => {

            input.checked =
                input.value === "粗麵";

        });


    /*
        辣度預設不辣
    */

    document
        .querySelectorAll(
            '#noodleOption input[name="spicy"]'
        )
        .forEach(input => {

            input.checked =
                input.value === "不辣";

        });


    /*
        不加菜預設不勾
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
        不加蔥預設不勾
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
        關東煮醬料
        預設醬油膏
    */

    document
        .querySelectorAll(
            '#odenOption input[name="sauce"]'
        )
        .forEach(input => {

            input.checked =
                input.value === "醬油膏";

        });


    /* =====================================
       麵類
    ===================================== */

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


        if (odenOption) {

            odenOption.style.display =
                "none";

        }

    }


    /* =====================================
       米粉
    ===================================== */

    else if (
        item.type === "riceNoodle"
    ) {


        /*
            米粉不顯示麵條
        */

        if (noodleOption) {

            noodleOption.style.display =
                "block";

        }


        if (noodleSelectArea) {

            noodleSelectArea.style.display =
                "none";

        }


        if (odenOption) {

            odenOption.style.display =
                "none";

        }

    }


    /* =====================================
       關東煮
    ===================================== */

    else if (
        item.type === "oden"
    ) {


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
   修改客製化數量
========================================= */

function changeModalQty(change) {


    modalQty += change;


    if (
        modalQty < 1
    ) {

        modalQty = 1;

    }


    if (
        modalQty > 99
    ) {

        modalQty = 99;

    }


    const modalQtyElement =
        document.getElementById(
            "modalQty"
        );


    if (modalQtyElement) {

        modalQtyElement.textContent =
            modalQty;

    }

}


/* =========================================
   確認加入購物車
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


    /* =====================================
       麵類
    ===================================== */

    if (
        currentItem.type === "noodle"
    ) {


        const noodle =
            document.querySelector(
                '#noodleSelectBox input[name="noodle"]:checked'
            );


        const spicy =
            document.querySelector(
                '#noodleOption input[name="spicy"]:checked'
            );


        options.noodle =

            noodle

                ? noodle.value

                : "粗麵";


        options.spicy =

            spicy

                ? spicy.value

                : "不辣";


        options.vegetable =

            !document.getElementById(
                "noVegetable"
            ).checked;


        options.onion =

            !document.getElementById(
                "noOnion"
            ).checked;

    }


    /* =====================================
       米粉
    ===================================== */

    else if (
        currentItem.type === "riceNoodle"
    ) {


        const spicy =
            document.querySelector(
                '#noodleOption input[name="spicy"]:checked'
            );


        /*
            米粉不記錄麵條
        */

        options.noodle =
            null;


        options.spicy =

            spicy

                ? spicy.value

                : "不辣";


        options.vegetable =

            !document.getElementById(
                "noVegetable"
            ).checked;


        options.onion =

            !document.getElementById(
                "noOnion"
            ).checked;

    }


    /* =====================================
       關東煮
       醬料可複選
    ===================================== */

    else if (
        currentItem.type === "oden"
    ) {


        const sauceInputs =

            document.querySelectorAll(

                '#odenOption input[name="sauce"]:checked'

            );


        const sauces =

            Array.from(
                sauceInputs
            )

            .map(
                input =>
                    input.value
            );


        /*
            沒有選任何醬料
            預設醬油膏
        */

        if (
            sauces.length === 0
        ) {


            options.sauce = [

                "醬油膏"

            ];

        }


        /*
            選擇都不加
        */

        else if (
            sauces.includes(
                "都不加"
            )
        ) {


            options.sauce = [

                "都不加"

            ];

        }


        /*
            複選醬料
        */

        else {


            options.sauce =
                sauces;

        }

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


    /*
        客製化識別碼

        同商品
        同客製
        自動合併

        不同客製
        分開顯示
    */

    const optionKey =

        JSON.stringify(
            options
        );


    const productId =

        item.id ||
        item.name;


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
        已有相同客製
    */

    if (
        existingItem
    ) {


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

                item.price,


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


    saveCart();

    updateCart();

}


/* =========================================
   儲存購物車
========================================= */

function saveCart() {


    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

}


/* =========================================
   顯示客製內容
========================================= */

function getOptionText(item) {


    const options =
        item.options || {};


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
        關東煮醬料
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
        沒有客製內容
    */

    if (
        texts.length === 0
    ) {


        return "";

    }


    return `

        <div class="cart-options">

            ${texts.join(" ・ ")}

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

            "尚未加入商品";


        const totalElement =
            document.getElementById(
                "total"
            );


        if (totalElement) {

            totalElement.textContent =
                "0";

        }


        const cartCountElement =
            document.getElementById(
                "cart-count"
            );


        if (cartCountElement) {

            cartCountElement.textContent =
                "0";

        }


        return;

    }


    /*
        商品
    */

    cart.forEach(

        (item, index) => {


            const subtotal =

                item.price *
                item.qty;


            total +=
                subtotal;


            totalQty +=
                item.qty;


            html += `

                <div class="cart-item">

                    <div class="cart-item-info">

                        <strong>

                            ${item.name}

                        </strong>


                        ${getOptionText(item)}


                        <div>

                            NT$${item.price}

                            ×

                            ${item.qty}

                            =

                            NT$${subtotal}

                        </div>

                    </div>


                    <div class="cart-control">

                        <button
                            type="button"
                            onclick="changeQty(${index}, -1)">

                            －

                        </button>


                        <span>

                            ${item.qty}

                        </span>


                        <button
                            type="button"
                            onclick="changeQty(${index}, 1)">

                            ＋

                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            onclick="removeItem(${index})">

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


    const totalElement =
        document.getElementById(
            "total"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    const cartCountElement =
        document.getElementById(
            "cart-count"
        );


    if (cartCountElement) {

        cartCountElement.textContent =
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


    cart[index].qty +=
        change;


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
   刪除購物車商品
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
   關東煮醬料複選控制
========================================= */

function setupSauceControls() {


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
                        選擇「都不加」
                        取消其他醬料
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
                        取消「都不加」
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
                        恢復醬油膏
                    */

                    const checkedSauces =

                        document.querySelectorAll(

                            '#odenOption input[name="sauce"]:checked'

                        );


                    if (

                        checkedSauces.length
                        ===
                        0

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

        (button, index) => {


            /*
                如果 HTML 沒有 data-category
                依照順序對應 menu 分類
            */

            if (
                !button.dataset.category
                &&
                menu
            ) {


                const categories =
                    Object.keys(menu);


                if (
                    categories[index]
                ) {


                    button.dataset.category =
                        categories[index];

                }

            }


            button.addEventListener(

                "click",

                function() {


                    const category =

                        this.dataset.category;


                    if (!category) {

                        return;

                    }


                    renderMenu(

                        category

                    );


                    window.scrollTo({

                        top: 0,

                        behavior: "smooth"

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
   初始化
========================================= */

setupSauceControls();

renderMenu();

updateCart();


console.log(

    "🍜 初萊食麵 v2.0 order.js 已載入"

);