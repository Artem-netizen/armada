const forFilter = [
    {
        id: "15",
        value: "Обувь",
        count: "3"
    },
    {
        id: "16",
        value: "Сумки",
        count: "3"
    },
    {
        id: "17",
        value: "Головные уборы",
        count: "3"
    },
    {
        id: "25",
        value: "Часы, бижутерия",
        count: "3"
    },
    {
        id: "26",
        value: "Ювелирные изделия",
        count: "3"
    },
    {
        id: "27",
        value: "Молодежная одежда",
        count: "3"
    },
    {
        id: "28",
        value: "Одежда",
        count: "3"
    },
]

const templateForFilter = ({id, value, count}) => {
    const filterItem = document.createElement('div')
    filterItem.classList.add('filter-sidebar__category-filter', 'category-filter')
    filterItem.insertAdjacentHTML('afterbegin', `
                    <label for="${id}" class="category-filter__label collapsed" data-bs-toggle="collapse" data-bs-target="#collapseExample${id}" aria-expanded="false" aria-controls="collapseExample${id}">
                        <span class="category-filter__title">${value}</span>
                        <span class="category-filter__counter">${count}</span>
                        <img class="category-filter__close" src="src/images/icons/close1.svg" alt="CloseCategory">
                    </label>
                    <input data-category-id="${id}" id="${id}" type="checkbox" class="category-filter__input">
                    <div class="category-filter__collapse-category collapse-category collapse" id="collapseExample${id}">
                    </div>
    `)
    return filterItem
};

const sidebarFilterItems = (arrayForFilter = []) => {
    const container = document.querySelector('.filter-sidebar__list');
    const total = document.createElement('div');
    total.classList.add('filter-sidebar__total');
    total.insertAdjacentHTML('beforeend', `
                    <span class="filter-sidebar__total-title">Все</span>
                    <span class="filter-sidebar__total-counter">${arrayForFilter.length}</span>
    `);
    container.insertAdjacentElement('afterbegin', total)
    arrayForFilter.forEach(item => {
        container.insertAdjacentElement('beforeend', templateForFilter(item))
    })
}

sidebarFilterItems(forFilter)


let firstLvlLayers = L.tileLayer('src/images/img/armada-map_1lvl/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 6,
    continuousWorld: false,
    noWrap: true,
    // crs: L.CRS.Simple,
})
let secondLvlLayers = L.tileLayer('src/images/img/armada-map_2lvl/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 6,
    continuousWorld: false,
    noWrap: true,
    crs: L.CRS.Simple,
})

// INIT функция для выбора этажа
const parsingSelectedShop = (array) => {
    let currentLvl = '1'
    for (let lvl of array) {
        for (let shop of lvl.dataLvl) {
            if (shop.isSelected) {
                currentLvl = lvl.id
                break;
            }
        }
    }
    const buttonFloor = document.querySelector(`[data-changelvl='${currentLvl}']`);
    const inputFloor = buttonFloor.querySelector('input');
    buttonFloor.classList.add('active');
    inputFloor.checked = true

    return currentLvl
}

const changeTitleCurrentFloor = (currentFloor) => {
    const htmlFloor = document.querySelector('.template-list__title').querySelector('span')
    htmlFloor.innerHTML = currentFloor
}

const returnerCurrentLayer = (array) => {
    const currentLVL = parsingSelectedShop(array)
    changeTitleCurrentFloor(currentLVL)
    if (currentLVL === '1') return firstLvlLayers
    if (currentLVL === '2') return secondLvlLayers
}


// const maxBounds = new L.LatLngBounds(
//     fp(0, 16384),
//     fp(16384, 0)
// )

var map = L.map('mapComplex', {
    center: [6.315299, -37.441406],
    layers: returnerCurrentLayer(mapJson.data),
    zoomControl: false,
}).setView([0, 0], 1);

let mapSW = [0, 16384];
mapNE = [16384, 0];


var baseMaps = {
    "firstLvlLayers": firstLvlLayers,
    "secondLvlLayers": secondLvlLayers
};


const layerGroup = L.layerGroup()
layerGroup.addTo(map)
const markerGroup = L.layerGroup()
markerGroup.addTo(map)


document.querySelectorAll('[data-changeLvl]').forEach(lvl => {
    lvl.addEventListener('click', function (e) {
        // console.log(this, 'click this')
        const itemLvl = this.dataset.changelvl
        // console.log(itemLvl, 'itemLvl')

        if (itemLvl === '1') {
            baseMaps.secondLvlLayers.remove()
            baseMaps.firstLvlLayers.addTo(map)

        } else if (itemLvl === '2') {
            baseMaps.firstLvlLayers.remove()
            baseMaps.secondLvlLayers.addTo(map)
        }
        changeTitleCurrentFloor(itemLvl)
        // console.log(map._layers)
    })
})
map.on('baselayerchange', () => {
    // console.log(map.hasLayer(baseMaps.secondLvlLayers))
})


map.createPane('labels')
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

map.setZoom(3)

map.setMaxBounds(new L.LatLngBounds(
    map.unproject(mapSW, map.getMaxZoom()),
    map.unproject(mapNE, map.getMaxZoom())
))


function fp(x, y) {
    let coor = map.unproject([x, y], map.getMaxZoom())
    return [coor.lat, coor.lng]
    // return [`${coor.lat}`, `${coor.lng}`]

    // return `fp(${x},${y})`
}


// console.log(mapJson, 'jsonInScripts')


var saveAsFile = function (fileName, fileContents) {
    if (typeof (Blob) != 'undefined') { // Alternative 1: using Blob
        var textFileAsBlob = new Blob([fileContents], {type: 'text/plain'});
        var downloadLink = document.createElement("a");
        downloadLink.download = fileName;
        if (window.webkitURL != null) {
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = document.body.removeChild(event.target);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    } else { // Alternative 2: using Data
        var pp = document.createElement('a');
        pp.setAttribute('href', 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(fileContents));
        pp.setAttribute('download', fileName);
        pp.onclick = document.body.removeChild(event.target);
        pp.click();
    }
} // saveAsFile

/* Example */
var jsonObject = {"name": "John", "age": 30, "car": null};


const geoTagIcon = L.icon({
    iconUrl: 'src/images/img/icons/geoTag.png',
    iconSize: [25, 25],
});
const saleMarkerIcon = L.icon({
    iconUrl: 'src/images/img/icons/saleIcon.png',
    iconSize: [25, 25],
});
const stockMarkerIcon = L.icon({
    iconUrl: 'src/images/img/icons/stockIcon.png',
    iconSize: [25, 25],
});
const eventMarkerIcon = L.icon({
    iconUrl: 'src/images/img/icons/eventIcon.png',
    iconSize: [25, 25],
});

const _mapData = {
    data: [
        {
            id: '1',
            dataLvl: [

                {
                    "id": 96,
                    "name": "Четыре лапы",
                    "typeService": "shop",
                    "currentEvents": [5, 6, 7],
                    "shortDesc": "Зоомагазин Четыре лапы",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал", 'Писосик'],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6323, 5734),
                            fp(7683, 5734),
                            fp(7683, 6621),
                            fp(7131, 6621),
                            fp(7131, 6884),
                            fp(6323, 6884)
                        ],
                        "tipCenter": [fp(7484, 6371)],
                        "xySaleMarker": [fp(6806, 6661)],
                        "xyStockMarker": [fp(6731, 6662)],
                        "xyEventMarker": [fp(6649, 6666)],
                        "xyGeoMarker": [fp(6595, 6088)]
                    }

                },

                {
                    "id": 97,
                    "name": "Сбербанк",
                    "typeService": "services",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Банк «Сбербанк»",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(3837, 5734),
                            fp(6288, 5734),
                            fp(6288, 6884),
                            fp(3837, 6884)
                        ],
                        "tipCenter": [fp(5748, 6278)],
                        "xySaleMarker": [fp(5185, 6661)],
                        "xyStockMarker": [fp(5109, 6659)],
                        "xyEventMarker": [fp(5026, 6665)],
                        "xyGeoMarker": [fp(5400, 6674)]
                    }

                },
                {
                    "id": 91,
                    "name": "Сибирский бегемот",
                    "typeService": "services",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Банк «Сбербанк»",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7167, 6654),
                            fp(7686, 6654),
                            fp(7686, 6884),
                            fp(7167, 6884)
                        ],
                        "tipCenter": [fp(7530, 6814)],
                        "xySaleMarker": [fp(7526, 6658)],
                        "xyStockMarker": [fp(7449, 6659)],
                        "xyEventMarker": [fp(7366, 6663)],
                        "xyGeoMarker": [fp(7233, 6659)]
                    }

                },
                {
                    "id": 98,
                    "name": "Точка зрения",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Банк «Сбербанк»",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [15, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7718, 5734),
                            fp(8256, 5734),
                            fp(8256, 6885),
                            fp(7718, 6885)
                        ],
                        "tipCenter": [fp(7991, 6245)],
                        "xySaleMarker": [fp(8066, 6662)],
                        "xyStockMarker": [fp(7990, 6662)],
                        "xyEventMarker": [fp(7908, 6666)],
                        "xyGeoMarker": [fp(7991, 6245)]
                    }

                },
                {
                    "id": 99,
                    "name": "inActive",
                    "typeService": "food",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Банк «Сбербанк»",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8287, 5734),
                            fp(9421, 5734),
                            fp(9421, 6376),
                            fp(8813, 6377),
                            fp(8812, 6885),
                            fp(8288, 6885)
                        ],
                        "tipCenter": [fp(8798, 6115)],
                        "xySaleMarker": [fp(8615, 6662)],
                        "xyStockMarker": [fp(8539, 6660)],
                        "xyEventMarker": [fp(8457, 6665)],
                        "xyGeoMarker": [fp(8798, 6115)]
                    }

                },
                {
                    "id": 100,
                    "name": "Недотрога",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Банк «Сбербанк»",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [17, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8844, 6408),
                            fp(9097, 6408),
                            fp(9097, 6885),
                            fp(8844, 6885)

                        ],
                        "tipCenter": [fp(8963, 6542)],
                        "xySaleMarker": [fp(9048, 6823)],
                        "xyStockMarker": [fp(8972, 6823)],
                        "xyEventMarker": [fp(8890, 6823)],
                        "xyGeoMarker": [fp(8963, 6542)]
                    }

                },
                {
                    "id": 101,
                    "name": "Авангард",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Банк «Авангард»",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9131, 6410),
                            fp(9423, 6410),
                            fp(9423, 6886),
                            fp(9131, 6886),

                        ],
                        "tipCenter": [fp(9336, 6434)],
                        "xySaleMarker": [fp(9361, 6824)],
                        "xyStockMarker": [fp(9286, 6824)],
                        "xyEventMarker": [fp(9204, 6824)],
                        "xyGeoMarker": [fp(9336, 6434)]
                    }

                },
                {
                    "id": 102,
                    "name": "ЭкоЛавка (Без Названия)",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "ЭкоЛавка (Без Названия)",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9827, 6537),
                            fp(10371, 6538),
                            fp(10371, 7428),
                            fp(9827, 6816),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10178, 6823)],
                        "xyStockMarker": [fp(10103, 6823)],
                        "xyEventMarker": [fp(10021, 6823)],
                        "xyGeoMarker": [fp(10188, 7003)]
                    }

                },
                {
                    "id": 103,
                    "name": "Твое",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Твое",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9828, 6002),
                            fp(10165, 6002),
                            fp(10165, 6107),
                            fp(10493, 6107),
                            fp(10493, 6002),
                            fp(11671, 6002),
                            fp(11671, 6577),
                            fp(11515, 6577),
                            fp(11515, 7439),
                            fp(10406, 7439),
                            fp(10406, 6504),
                            fp(9828, 6504),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(11024, 7043)],
                        "xyStockMarker": [fp(10948, 7043)],
                        "xyEventMarker": [fp(10866, 7043)],
                        "xyGeoMarker": [fp(10946, 6311)]
                    }

                },
                {
                    "id": 104,
                    "name": "МТС",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "МТС",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11549, 6613),
                            fp(12012, 6613),
                            fp(12012, 7439),
                            fp(11549, 7439),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(11806, 7042)],
                        "xyStockMarker": [fp(11730, 7042)],
                        "xyEventMarker": [fp(11648, 7042)],
                        "xyGeoMarker": [fp(11733, 7209)]
                    }

                },
                {
                    "id": 105,
                    "name": "BeeLine",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "BeeLine",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12151, 6413),
                            fp(12547, 6413),
                            fp(12547, 7439),
                            fp(12151, 7439),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(12425, 7044)],
                        "xyStockMarker": [fp(12350, 7044)],
                        "xyEventMarker": [fp(12268, 7044)],
                        "xyGeoMarker": [fp(12358, 6798)]
                    }

                },
                {
                    "id": 106,
                    "name": "Адамс",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Адамс",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12569, 6413),
                            fp(12934, 6413),
                            fp(12934, 7439),
                            fp(12569, 7439),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(12831, 7144)],
                        "xyStockMarker": [fp(12755, 7144)],
                        "xyEventMarker": [fp(12672, 7144)],
                        "xyGeoMarker": [fp(12759, 6796)]
                    }

                },

                {
                    "id": 107,
                    "name": "BurgerKing",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "BurgerKing",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12956, 6010),
                            fp(13575, 6003),
                            fp(14302, 7176),
                            fp(14302, 7176),
                            fp(14314, 7202),
                            fp(14325, 7229),
                            fp(14332, 7266),
                            fp(14330, 7307),
                            fp(14312, 7355),
                            fp(14286, 7390),
                            fp(14238, 7424),
                            fp(14174, 7439),
                            fp(12956, 7439),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(14061, 7169)],
                        "xyStockMarker": [fp(13985, 7169)],
                        "xyEventMarker": [fp(13903, 7169)],
                        "xyGeoMarker": [fp(13400, 6311)]
                    }

                },

                {
                    "id": 108,
                    "name": "Подружка",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Подружка",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(13915, 8019),
                            fp(15251, 8019),
                            fp(15346, 8180),
                            fp(15390, 8281),
                            fp(15433, 8405),
                            fp(15469, 8564),
                            fp(15480, 8716),
                            fp(15472, 8829),
                            fp(15456, 8926),
                            fp(15413, 9084),
                            fp(15311, 9304),
                            fp(15161, 9493),
                            fp(14929, 9647),
                            fp(14852, 9545),
                            fp(14982, 9497),
                            fp(15045, 9454),
                            fp(15110, 9376),
                            fp(15139, 9275),
                            fp(15129, 9123),
                            fp(14399, 9123),
                            fp(14399, 8538),
                            fp(13969, 8538),
                            fp(13915, 8236),
                            fp(13915, 8236),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(14843, 8507)],
                        "xyStockMarker": [fp(14767, 8507)],
                        "xyEventMarker": [fp(14685, 8507)],
                        "xyGeoMarker": [fp(14854, 8734)]
                    }

                },


                {
                    "id": 109,
                    "name": "Сигма",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Сигма",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(13475, 8016),
                            fp(13897, 8016),
                            fp(13897, 8252),
                            fp(13475, 8252),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(13773, 8019)],
                        "xyStockMarker": [fp(13697, 8019)],
                        "xyEventMarker": [fp(13614, 8019)],
                        "xyGeoMarker": [fp(13859, 8019)]
                    }

                },

                {
                    "id": 110,
                    "name": "7 Дней",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "7 Дней",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12990, 8011),
                            fp(13454, 8011),
                            fp(13454, 8270),
                            fp(13948, 8270),
                            fp(13948, 8574),
                            fp(14379, 8574),
                            fp(14379, 9161),
                            fp(15096, 9161),
                            fp(15118, 9241),
                            fp(15108, 9324),
                            fp(15052, 9419),
                            fp(14964, 9482),
                            fp(14504, 9596),
                            fp(13264, 9787),
                            fp(13264, 9115),
                            fp(12990, 9115),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(13817, 9144)],
                        "xyStockMarker": [fp(13741, 9144)],
                        "xyEventMarker": [fp(13659, 9144)],
                        "xyGeoMarker": [fp(13601, 8488)]
                    }

                },

                {
                    "id": 111,
                    "name": "Лэтуаль",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Лэтуаль",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12688, 8010),
                            fp(12972, 8010),
                            fp(12972, 9135),
                            fp(13246, 9135),
                            fp(13246, 9788),
                            fp(12130, 9899),
                            fp(12130, 8552),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(12653, 8789)],
                        "xyStockMarker": [fp(12577, 8789)],
                        "xyEventMarker": [fp(12495, 8789)],
                        "xyGeoMarker": [fp(12568, 9074)]
                    }
                },

                {
                    "id": 112,
                    "name": "ДжинсМаркет",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "ДжинсМаркет",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11055, 9107),
                            fp(11865, 9107),
                            fp(11865, 9517),
                            fp(12109, 9518),
                            fp(12109, 9902),
                            fp(11055, 9978),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(11523, 9278)],
                        "xyStockMarker": [fp(11447, 9278)],
                        "xyEventMarker": [fp(11365, 9278)],
                        "xyGeoMarker": [fp(11440, 9813)]
                    }
                },


                {
                    "id": 113,
                    "name": "Связной",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Связной",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10224, 9107),
                            fp(11034, 9107),
                            fp(11034, 9980),
                            fp(10224, 10023),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10668, 9279)],
                        "xyStockMarker": [fp(10592, 9279)],
                        "xyEventMarker": [fp(10510, 9279)],
                        "xyGeoMarker": [fp(10224, 10023)]
                    }
                },

                {
                    "id": 114,
                    "name": "Счастливый взгляд",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Счастливый взгляд",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9828, 9107),
                            fp(10204, 9107),
                            fp(10204, 10024),
                            fp(9828, 10024),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10084, 9919)],
                        "xyStockMarker": [fp(10007, 9919)],
                        "xyEventMarker": [fp(9925, 9919)],
                        "xyGeoMarker": [fp(11381, 9612)]
                    }
                },

                {
                    "id": 115,
                    "name": "Мачо",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Мачо",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8832, 9107),
                            fp(9426, 9107),
                            fp(9426, 10267),
                            fp(8832, 10267),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9169, 9920)],
                        "xyStockMarker": [fp(9093, 9920)],
                        "xyEventMarker": [fp(9011, 9920)],
                        "xyGeoMarker": [fp(9120, 9291)]
                    }
                },

                {
                    "id": 116,
                    "name": "LaWine",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "LaWine",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8283, 9107),
                            fp(8811, 9107),
                            fp(8811, 10267),
                            fp(8283, 10267),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(8604, 9920)],
                        "xyStockMarker": [fp(8528, 9920)],
                        "xyEventMarker": [fp(8446, 9920)],
                        "xyGeoMarker": [fp(8536, 9291)]
                    }
                },


                {
                    "id": 117,
                    "name": "Империя Сумок",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Империя Сумок",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7166, 9107),
                            fp(8261, 9107),
                            fp(8261, 10267),
                            fp(7166, 10267),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(7645, 9920)],
                        "xyStockMarker": [fp(7569, 9920)],
                        "xyEventMarker": [fp(7487, 9920)],
                        "xyGeoMarker": [fp(7703, 9291)]
                    }
                },
                {
                    "id": 118,
                    "name": "Аптека Алоэ",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Аптека Алоэ",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6307, 9367),
                            fp(6621, 9366),
                            fp(6621, 9109),
                            fp(7146, 9109),
                            fp(7146, 10270),
                            fp(6366, 10270),
                            fp(6366, 10218),
                            fp(6307, 10218),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(6703, 9920)],
                        "xyStockMarker": [fp(6627, 9920)],
                        "xyEventMarker": [fp(6545, 9920)],
                        "xyGeoMarker": [fp(6894, 9264)]
                    }
                },

                {
                    "id": 119,
                    "name": "Химчистка София",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Сервис Без названия",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6308, 9113),
                            fp(6602, 9113),
                            fp(6602, 9350),
                            fp(6308, 9349),

                            // fp(6308,9367),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(6553, 9106)],
                        "xyStockMarker": [fp(6477, 9106)],
                        "xyEventMarker": [fp(6395, 9106)],
                        "xyGeoMarker": [fp(6476, 8999)]
                    }

                },
                {
                    "id": 120,
                    "name": "Перектесток",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Перектесток",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [26, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(3831, 6909),
                            fp(6033, 6909),
                            fp(6033, 10214),
                            fp(5494, 10214),
                            fp(5494, 10266),
                            fp(3831, 10266),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(5008, 8988)],
                        "xyStockMarker": [fp(4932, 8988)],
                        "xyEventMarker": [fp(4850, 8988)],
                        "xyGeoMarker": [fp(4940, 8214)]
                    }
                },

                {
                    "id": 121,
                    "name": "Табакерка",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Табакерка",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [27, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6689, 7356),
                            fp(7149, 7356),
                            fp(7149, 7789),
                            fp(6689, 7789),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(7009, 7704)],
                        "xyStockMarker": [fp(6933, 7704)],
                        "xyEventMarker": [fp(6851, 7704)],
                        "xyGeoMarker": [fp(7021, 7450)]
                    }
                },

                {
                    "id": 122,
                    "name": "Bielita",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Bielita",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [25, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6689, 7810),
                            fp(7149, 7810),
                            fp(7149, 8219),
                            fp(6689, 8219),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(7009, 8128)],
                        "xyStockMarker": [fp(6933, 8128)],
                        "xyEventMarker": [fp(6851, 8128)],
                        "xyGeoMarker": [fp(7021, 7926)]
                    }
                },


                {
                    "id": 123,
                    "name": "MyBox",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "MyBox",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6689, 8240),
                            fp(7149, 8240),
                            fp(7149, 8661),
                            fp(6689, 8661),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(7009, 8543)],
                        "xyStockMarker": [fp(6933, 8543)],
                        "xyEventMarker": [fp(6851, 8543)],
                        "xyGeoMarker": [fp(7044, 8320)]
                    }
                },

                {
                    "id": 124,
                    "name": "ЛеЛокль",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "ЛеЛокль",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [17, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7171, 7356),
                            fp(7701, 7356),
                            fp(7701, 7998),
                            fp(7171, 7998),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(7506, 7837)],
                        "xyStockMarker": [fp(7429, 7837)],
                        "xyEventMarker": [fp(7348, 7837)],
                        "xyGeoMarker": [fp(7568, 7484)]
                    }
                },

                {
                    "id": 125,
                    "name": "Ювелирный салон Нефертити",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Ювелирный салон Нефертити",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 16, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7171, 8020),
                            fp(7701, 8020),
                            fp(7701, 8661),
                            fp(7171, 8661),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(7434, 8489)],
                        "xyStockMarker": [fp(7358, 8489)],
                        "xyEventMarker": [fp(7276, 8489)],
                        "xyGeoMarker": [fp(7586, 8485)]
                    }
                },

                {
                    "id": 126,
                    "name": "PETEK",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "PETEK",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [15, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7723, 7356),
                            fp(8252, 7356),
                            fp(8252, 7998),
                            fp(7723, 7998),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(8029, 7837)],
                        "xyStockMarker": [fp(7953, 7837)],
                        "xyEventMarker": [fp(7871, 7837)],
                        "xyGeoMarker": [fp(8089, 7483)]
                    }
                },

                {
                    "id": 127,
                    "name": "KDV",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "KDV",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7723, 8020),
                            fp(8252, 8020),
                            fp(8252, 8661),
                            fp(7723, 8661),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(7971, 8490)],
                        "xyStockMarker": [fp(7896, 8490)],
                        "xyEventMarker": [fp(7814, 8490)],
                        "xyGeoMarker": [fp(8117, 8484)]
                    }
                },

                {
                    "id": 128,
                    "name": "Линии Любви",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Линии Любви",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8273, 7356),
                            fp(8820, 7356),
                            fp(8820, 7998),
                            fp(8273, 7998),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(8616, 7846)],
                        "xyStockMarker": [fp(8540, 7846)],
                        "xyEventMarker": [fp(8458, 7846)],
                        "xyGeoMarker": [fp(8531, 7489)]
                    }
                },

                {
                    "id": 129,
                    "name": "Глобус",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Глобус",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8273, 8020),
                            fp(8820, 8020),
                            fp(8820, 8661),
                            fp(8273, 8661),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(8590, 8490)],
                        "xyStockMarker": [fp(8515, 8490)],
                        "xyEventMarker": [fp(8433, 8490)],
                        "xyGeoMarker": [fp(8531, 8307)]
                    }
                },


                {
                    "id": 130,
                    "name": "Милависта",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Милависта",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8841, 7356),
                            fp(9426, 7356),
                            fp(9426, 7998),
                            fp(8841, 7998),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9205, 7846)],
                        "xyStockMarker": [fp(9129, 7846)],
                        "xyEventMarker": [fp(9047, 7846)],
                        "xyGeoMarker": [fp(9124, 7487)]
                    }
                },

                {
                    "id": 131,
                    "name": "Мегафон",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Мегафон",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": false,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8841, 8020),
                            fp(9426, 8020),
                            fp(9426, 8340),
                            fp(8842, 8340),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9205, 8076)],
                        "xyStockMarker": [fp(9129, 8076)],
                        "xyEventMarker": [fp(9047, 8076)],
                        "xyGeoMarker": [fp(9328, 8243)]
                    }
                },

                {
                    "id": 132,
                    "name": "Теле2",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Теле2",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8842, 8363),
                            fp(9426, 8363),
                            fp(9426, 8661),
                            fp(8842, 8661),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9205, 8410)],
                        "xyStockMarker": [fp(9129, 8410)],
                        "xyEventMarker": [fp(9047, 8410)],
                        "xyGeoMarker": [fp(9328, 8524)]
                    }
                },
                {
                    "id": 133,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6153, 9317),
                            fp(6153, 9128),
                            fp(6284, 9128),
                            fp(6284, 9317),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(6291, 9106)],
                        "xyStockMarker": [fp(6215, 9106)],
                        "xyEventMarker": [fp(6133, 9106)],
                        "xyGeoMarker": [fp(6223, 9265)]
                    }
                },

                {
                    "id": 134,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6382, 8631),
                            fp(6382, 8443),
                            fp(6514, 8443),
                            fp(6514, 8632),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(6525, 8450)],
                        "xyStockMarker": [fp(6449, 8450)],
                        "xyEventMarker": [fp(6367, 8450)],
                        "xyGeoMarker": [fp(6453, 8615)]
                    }
                },

                {
                    "id": 135,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6382, 8293),
                            fp(6382, 8104),
                            fp(6514, 8104),
                            fp(6514, 8293),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(6525, 8106)],
                        "xyStockMarker": [fp(6449, 8106)],
                        "xyEventMarker": [fp(6367, 8106)],
                        "xyGeoMarker": [fp(6453, 8250)]
                    }
                },

                {
                    "id": 136,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6382, 7602),
                            fp(6382, 7413),
                            fp(6514, 7413),
                            fp(6514, 7602),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(6525, 7412)],
                        "xyStockMarker": [fp(6449, 7412)],
                        "xyEventMarker": [fp(6367, 7412)],
                        "xyGeoMarker": [fp(6453, 7551)]
                    }
                },
                {
                    "id": 137,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10101, 8121),
                            fp(10101, 7971),
                            fp(10196, 7971),
                            fp(10196, 8121),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10314, 8040)],
                        "xyStockMarker": [fp(10239, 8040)],
                        "xyEventMarker": [fp(10157, 8040)],
                        "xyGeoMarker": [fp(10404, 8040)]
                    }
                },

                {
                    "id": 138,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10162, 7916),
                            fp(10162, 7766),
                            fp(10427, 7766),
                            fp(10427, 7916),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10406, 7758)],
                        "xyStockMarker": [fp(10330, 7758)],
                        "xyEventMarker": [fp(10247, 7758)],
                        "xyGeoMarker": [fp(10165, 7757)]
                    }
                },

                {
                    "id": 139,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10581, 8320),
                            fp(10581, 8170),
                            fp(10769, 8170),
                            fp(10769, 8320),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10764, 8196)],
                        "xyStockMarker": [fp(10688, 8196)],
                        "xyEventMarker": [fp(10606, 8196)],
                        "xyGeoMarker": [fp(10676, 8337)]
                    }
                },

                {
                    "id": 140,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10790, 7916),
                            fp(10790, 7766),
                            fp(10979, 7766),
                            fp(10979, 7916),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10980, 7758)],
                        "xyStockMarker": [fp(10904, 7758)],
                        "xyEventMarker": [fp(10822, 7758)],
                        "xyGeoMarker": [fp(10740, 7850)]
                    }
                },

                {
                    "id": 141,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11321, 7916),
                            fp(11321, 7766),
                            fp(11586, 7766),
                            fp(11586, 7916),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(11531, 7758)],
                        "xyStockMarker": [fp(11455, 7758)],
                        "xyEventMarker": [fp(11373, 7758)],
                        "xyGeoMarker": [fp(11451, 7919)]
                    }
                },

                {
                    "id": 142,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11731, 7916),
                            fp(11731, 7766),
                            fp(11827, 7766),
                            fp(11827, 7916),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(11858, 7757)],
                        "xyStockMarker": [fp(11782, 7757)],
                        "xyEventMarker": [fp(11700, 7757)],
                        "xyGeoMarker": [fp(11780, 7918)]
                    }
                },
                {
                    "id": 143,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11939, 7916),
                            fp(11939, 7766),
                            fp(12128, 7766),
                            fp(12128, 7916),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(12136, 7758)],
                        "xyStockMarker": [fp(12060, 7758)],
                        "xyEventMarker": [fp(11978, 7758)],
                        "xyGeoMarker": [fp(12220, 7766)]
                    }
                },

                {
                    "id": 144,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11939, 8274),
                            fp(11939, 8123),
                            fp(12128, 8123),
                            fp(12128, 8274),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(12136, 8131)],
                        "xyStockMarker": [fp(12060, 8131)],
                        "xyEventMarker": [fp(11978, 8131)],
                        "xyGeoMarker": [fp(12052, 8268)]
                    }
                },

                {
                    "id": 145,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11983, 8564),
                            fp(12109, 8564),
                            fp(12109, 8760),
                            fp(11983, 8760),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(12136, 8789)],
                        "xyStockMarker": [fp(12060, 8789)],
                        "xyEventMarker": [fp(11978, 8789)],
                        "xyGeoMarker": [fp(12052, 8545)]
                    }
                },

                {
                    "id": 146,
                    "name": "Аквамарин",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Аквамарин",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10883, 8286),
                            fp(11206, 8286),
                            fp(11206, 8742),
                            fp(10884, 8742),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(11144, 8615)],
                        "xyStockMarker": [fp(11068, 8615)],
                        "xyEventMarker": [fp(10986, 8615)],
                        "xyGeoMarker": [fp(11080, 8380)]
                    }
                },

                {
                    "id": 147,
                    "name": "КофеWay",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "КофеWay",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10097, 8231),
                            fp(10362, 8231),
                            fp(10362, 8305),
                            fp(10097, 8305),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10315, 8202)],
                        "xyStockMarker": [fp(10239, 8202)],
                        "xyEventMarker": [fp(10156, 8202)],
                        "xyGeoMarker": [fp(10404, 8209)]
                    }
                },

                {
                    "id": 148,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9983, 8773),
                            fp(10344, 8773),
                            fp(10344, 8866),
                            fp(9983, 8866),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10255, 8896)],
                        "xyStockMarker": [fp(10179, 8896)],
                        "xyEventMarker": [fp(10097, 8896)],
                        "xyGeoMarker": [fp(10024, 8896)]
                    }
                },

                {
                    "id": 149,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10365, 8773),
                            fp(10725, 8773),
                            fp(10725, 8865),
                            fp(10365, 8865),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(10625, 8896)],
                        "xyStockMarker": [fp(10549, 8896)],
                        "xyEventMarker": [fp(10467, 8896)],
                        "xyGeoMarker": [fp(10711, 8896)]
                    }
                },

                {
                    "id": 150,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9809, 7781),
                            fp(9905, 7781),
                            fp(9905, 7932),
                            fp(9809, 7932),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9961, 7757)],
                        "xyStockMarker": [fp(9885, 7757)],
                        "xyEventMarker": [fp(9804, 7757)],
                        "xyGeoMarker": [fp(9743, 7757)]
                    }
                },
                {
                    "id": 151,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9809, 7953),
                            fp(9905, 7953),
                            fp(9905, 8104),
                            fp(9809, 8104),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9961, 8109)],
                        "xyStockMarker": [fp(9885, 8109)],
                        "xyEventMarker": [fp(9802, 8109)],
                        "xyGeoMarker": [fp(9857, 8003)]
                    }
                },

                {
                    "id": 152,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9462, 6701),
                            fp(9593, 6701),
                            fp(9593, 6890),
                            fp(9462, 6890),

                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9648, 6922)],
                        "xyStockMarker": [fp(9572, 6922)],
                        "xyEventMarker": [fp(9490, 6922)],
                        "xyGeoMarker": [fp(9551, 6677)]
                    }
                },
                {
                    "id": 153,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9448, 9108),
                            fp(9542, 9108),
                            fp(9542, 9240),
                            fp(9448, 9240),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9586, 9104)],
                        "xyStockMarker": [fp(9510, 9104)],
                        "xyEventMarker": [fp(9428, 9104)],
                        "xyGeoMarker": [fp(9671, 9104)]
                    }
                },
                {
                    "id": 154,
                    "name": "Остров",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9447, 9358),
                            fp(9579, 9358),
                            fp(9579, 9547),
                            fp(9447, 9547),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9586, 9548)],
                        "xyStockMarker": [fp(9428, 9548)],
                        "xyEventMarker": [fp(9509, 9548)],
                        "xyGeoMarker": [fp(9503, 9386)]
                    }
                },
                {
                    "id": 155,
                    "name": "Администрация",
                    "typeService": "shop",
                    "currentEvents": [1, 2, 3],
                    "shortDesc": "Администрация",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": ["Банк", "Сбербанк", "Деньги", "Терминал"],
                    "additionalTags": ["новости", "снять деньги"],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [65, 13, 64],
                    "isActive": true,
                    "isAdministrative": true,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9454, 7921),
                            fp(9481, 7907),
                            fp(9738, 7907),
                            fp(9766, 7924),
                            fp(9774, 7944),
                            fp(9774, 8198),
                            fp(9766, 8220),
                            fp(9737, 8237),
                            fp(9480, 8237),
                            fp(9456, 8225),
                            fp(9444, 8200),
                            fp(9444, 7944),
                        ],
                        "tipCenter": [null],
                        "xySaleMarker": [fp(9586, 9104)],
                        "xyStockMarker": [fp(9510, 9104)],
                        "xyEventMarker": [fp(9428, 9104)],
                        "xyGeoMarker": [fp(9671, 9104)]
                    }
                },
            ]
        },
        {
            id: "2",
            dataLvl: [
                {
                    "id": 200,
                    "name": "М.Видео",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "М.Видео",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(1431, 6463),
                            fp(3297, 6463),
                            fp(3297, 6097),
                            fp(5989, 6097),
                            fp(5989, 10285),
                            fp(5435, 10286),
                            fp(5435, 10337),
                            fp(1426, 10337),

                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(3670, 8756)
                        ],
                        "xyStockMarker": [
                            fp(3594, 8756)
                        ],
                        "xyEventMarker": [
                            fp(3512, 8756)
                        ],
                        "xyGeoMarker": [
                            fp(3548, 7563)
                        ]
                    }
                },


                {
                    "id": 201,
                    "name": "Zolla",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Zolla",
                    "description": "рюкзаки, поясные сумки, сумки кдля обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6283, 5764),
                            fp(8206, 5764),
                            fp(8206, 5620),
                            fp(8771, 5620),
                            fp(8771, 5558),
                            fp(11040, 5558),
                            fp(11040, 6842),
                            fp(9536, 6842),
                            fp(9536, 7303),
                            fp(8832, 6850),
                            fp(6283, 6852)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(7259, 6246)
                        ],
                        "xyStockMarker": [
                            fp(7183, 6246)
                        ],
                        "xyEventMarker": [
                            fp(7101, 6246)
                        ],
                        "xyGeoMarker": [
                            fp(10039, 6216)
                        ]
                    }
                },


                {
                    "id": 202,
                    "name": "OLIVER",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "OLIVER",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9558, 7317),
                            fp(9558, 6864),
                            fp(9893, 6864),
                            fp(9893, 7533)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(9803, 7405)
                        ],
                        "xyStockMarker": [
                            fp(9727, 7405)
                        ],
                        "xyEventMarker": [
                            fp(9645, 7405)
                        ],
                        "xyGeoMarker": [
                            fp(9814, 6901)
                        ]
                    }
                },

                {
                    "id": 203,
                    "name": "203 Локация",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "203 Локация",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9914, 7546),
                            fp(9914, 6864),
                            fp(10411, 6864),
                            fp(10411, 7644),
                            fp(10067, 7644),
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(10244, 6993)
                        ],
                        "xyStockMarker": [
                            fp(10168, 6993)
                        ],
                        "xyEventMarker": [
                            fp(10086, 6993)
                        ],
                        "xyGeoMarker": [
                            fp(10159, 7518)
                        ]
                    }
                },

                {
                    "id": 204,
                    "name": "Mark Formalle",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Mark Formalle",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10432, 7644),
                            fp(10432, 6864),
                            fp(11062, 6864),
                            fp(11062, 6666),
                            fp(11481, 6666),
                            fp(11481, 7645)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11278, 7504)
                        ],
                        "xyStockMarker": [
                            fp(11202, 7504)
                        ],
                        "xyEventMarker": [
                            fp(11120, 7504)
                        ],
                        "xyGeoMarker": [
                            fp(11232, 6849)
                        ]
                    }
                },

                {
                    "id": 205,
                    "name": "205 Пустая локация",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "205 Пустая локация",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11691, 6666),
                            fp(12153, 6666),
                            fp(12153, 7646),
                            fp(11691, 7646)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(12001, 7503)
                        ],
                        "xyStockMarker": [
                            fp(11925, 7503)
                        ],
                        "xyEventMarker": [
                            fp(11843, 7503)
                        ],
                        "xyGeoMarker": [
                            fp(11917, 7323)
                        ]
                    }
                },

                {
                    "id": 206,
                    "name": "Ташир пицца",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Ташир пицца",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12174, 6666),
                            fp(12416, 6666),
                            fp(12416, 6755),
                            fp(13151, 6755),
                            fp(13151, 7647),
                            fp(12174, 7646),
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(12457, 7503)
                        ],
                        "xyStockMarker": [
                            fp(12382, 7503)
                        ],
                        "xyEventMarker": [
                            fp(12299, 7503)
                        ],
                        "xyGeoMarker": [
                            fp(12295, 6810)
                        ]
                    }
                },

                {
                    "id": 207,
                    "name": "Kari",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Kari",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12188, 6005),
                            fp(12188, 5559),
                            fp(13901, 5559),
                            fp(14386, 6343),
                            fp(14342, 6388),
                            fp(15197, 7759),
                            fp(15519, 8296),
                            fp(15557, 8368),
                            fp(15583, 8427),
                            fp(13162, 8427),
                            fp(13162, 7756),
                            fp(13172, 7756),
                            fp(13172, 6733),
                            fp(13169, 6733),
                            fp(13169, 6526),
                            fp(12956, 6526),
                            fp(12956, 6443),
                            fp(12981, 6443),
                            fp(12981, 6003)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(13825, 6803)
                        ],
                        "xyStockMarker": [
                            fp(13749, 6803)
                        ],
                        "xyEventMarker": [
                            fp(13667, 6803)
                        ],
                        "xyGeoMarker": [
                            fp(14139, 6812)
                        ]
                    }
                },

                {
                    "id": 208,
                    "name": "Gloria Jeans",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Gloria Jeans",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(13163, 8448),
                            fp(15593, 8448),
                            fp(15666, 8613),
                            fp(15673, 8632),
                            fp(15682, 8666),
                            fp(15694, 8713),
                            fp(15707, 8756),
                            fp(15730, 8829),
                            fp(15740, 8854),
                            fp(15755, 8911),
                            fp(15767, 8972),
                            fp(15773, 9027),
                            fp(15776, 9090),
                            fp(15774, 9148),
                            fp(15764, 9229),
                            fp(15754, 9272),
                            fp(15741, 9314),
                            fp(15724, 9359),
                            fp(15703, 9403),
                            fp(15680, 9444),
                            fp(15653, 9485),
                            fp(15628, 9518),
                            fp(15594, 9557),
                            fp(15568, 9585),
                            fp(15519, 9631),
                            fp(15463, 9676),
                            fp(15401, 9720),
                            fp(15355, 9749),
                            fp(15276, 9794),
                            fp(15186, 9838),
                            fp(15122, 9866),
                            fp(14987, 9917),
                            fp(14860, 9958),
                            fp(14695, 10002),
                            fp(14649, 10013),
                            fp(14535, 10038),
                            fp(14232, 10088),
                            fp(14156, 10098),
                            fp(13996, 10126),
                            fp(13786, 10157),
                            fp(13064, 10247),
                            fp(12867, 10269),
                            fp(12492, 10311),
                            fp(12173, 10341),
                            fp(12173, 9563),
                            fp(12149, 9563),
                            fp(12173, 9563),
                            fp(12149, 9254),
                            fp(13163, 9252)

                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(13825, 8634)
                        ],
                        "xyStockMarker": [
                            fp(13749, 8634)
                        ],
                        "xyEventMarker": [
                            fp(13667, 8634)
                        ],
                        "xyGeoMarker": [
                            fp(14139, 8635)
                        ]
                    }
                },

                {
                    "id": 209,
                    "name": "Elis",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Elis",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11339, 10401),
                            fp(11339, 9252),
                            fp(11885, 9252),
                            fp(11886, 9585),
                            fp(12151, 9585),
                            fp(12151, 10343)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11585, 9468)
                        ],
                        "xyStockMarker": [
                            fp(11666, 9468)
                        ],
                        "xyEventMarker": [
                            fp(11744, 9468)
                        ],
                        "xyGeoMarker": [
                            fp(11918, 10136)
                        ]
                    }
                },

                {
                    "id": 210,
                    "name": "МАРГОТ",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "МАРГОТ",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10488, 9252),
                            fp(11317, 9252),
                            fp(11317, 10403),
                            fp(11040, 10420),
                            fp(10488, 10436)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11054, 9488)
                        ],
                        "xyStockMarker": [
                            fp(10978, 9488)
                        ],
                        "xyEventMarker": [
                            fp(10896, 9488)
                        ],
                        "xyGeoMarker": [
                            fp(10945, 10135)
                        ]
                    }
                },

                {
                    "id": 211,
                    "name": "Respect",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Respect",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9356, 9252),
                            fp(10466, 9252),
                            fp(10467, 10437),
                            fp(9926, 10464),
                            fp(9356, 10471)

                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(10010, 9486)
                        ],
                        "xyStockMarker": [
                            fp(9934, 9486)
                        ],
                        "xyEventMarker": [
                            fp(9852, 9486)
                        ],
                        "xyGeoMarker": [
                            fp(9923, 10135)
                        ]
                    }
                },

                {
                    "id": 212,
                    "name": "DNS",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "DNS",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8452, 9252),
                            fp(9334, 9252),
                            fp(9334, 10149),
                            fp(8452, 10149)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(9001, 9488)
                        ],
                        "xyStockMarker": [
                            fp(8925, 9488)
                        ],
                        "xyEventMarker": [
                            fp(8843, 9488)
                        ],
                        "xyGeoMarker": [
                            fp(9180, 9846)
                        ]
                    }
                },

                {
                    "id": 213,
                    "name": "O'Stin",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "O'Stin",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7117, 9252),
                            fp(8430, 9252),
                            fp(8430, 10171),
                            fp(9334, 10171),
                            fp(9334, 10471),
                            fp(7117, 10471)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(7844, 9486)
                        ],
                        "xyStockMarker": [
                            fp(7768, 9486)
                        ],
                        "xyEventMarker": [
                            fp(7686, 9486)
                        ],
                        "xyGeoMarker": [
                            fp(7789, 10196)
                        ]
                    }
                },

                {
                    "id": 214,
                    "name": "Штуки не для скуки",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Штуки не для скуки",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6281, 9252),
                            fp(7095, 9252),
                            fp(7095, 10285),
                            fp(6281, 10285)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(6767, 9488)
                        ],
                        "xyStockMarker": [
                            fp(6691, 9488)
                        ],
                        "xyEventMarker": [
                            fp(6609, 9488)
                        ],
                        "xyGeoMarker": [
                            fp(6653, 10134)
                        ]
                    }
                },

                {
                    "id": 215,
                    "name": "Redberry",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Redberry",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6578, 8035),
                            fp(6578, 7326),
                            fp(7658, 7321),
                            fp(7658, 8035)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(7019, 7502)
                        ],
                        "xyStockMarker": [
                            fp(7101, 7502)
                        ],
                        "xyEventMarker": [
                            fp(7177, 7502)
                        ],
                        "xyGeoMarker": [
                            fp(7094, 7904)
                        ]
                    }
                },

                {
                    "id": 216,
                    "name": "216 - Пустая локация",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "216 - Пустая локация",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7679, 7321),
                            fp(8699, 7317),
                            fp(8699, 8035),
                            fp(7679, 8035)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(7983, 7898)
                        ],
                        "xyStockMarker": [
                            fp(7907, 7898)
                        ],
                        "xyEventMarker": [
                            fp(7825, 7898)
                        ],
                        "xyGeoMarker": [
                            fp(8131, 7681)
                        ]
                    }
                },

                {
                    "id": 217,
                    "name": "ANGEL",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "ANGEL",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8720, 7323),
                            fp(9180, 7629),
                            fp(9180, 8035),
                            fp(8720, 8035)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(9020, 7503)
                        ],
                        "xyStockMarker": [
                            fp(8944, 7503)
                        ],
                        "xyEventMarker": [
                            fp(8861, 7503)
                        ],
                        "xyGeoMarker": [
                            fp(9050, 7740)
                        ]
                    }
                },

                {
                    "id": 218,
                    "name": "218 - Пустая локация",
                    "typeService": "services",
                    "currentEvents": [
                        5,
                        6,
                        7
                    ],
                    "shortDesc": "218 - Пустая локация",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9201, 7643),
                            fp(9754, 8011),
                            fp(9754, 8035),
                            fp(9201, 8035)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(9479, 7748)
                        ],
                        "xyStockMarker": [
                            fp(9403, 7748)
                        ],
                        "xyEventMarker": [
                            fp(9321, 7748)
                        ],
                        "xyGeoMarker": [
                            fp(9577, 7920)
                        ]
                    }
                },

                {
                    "id": 219,
                    "name": "HELMAR",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "HELMAR",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(8467, 8057),
                            fp(9754, 8057),
                            fp(9754, 8776),
                            fp(8467, 8776)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(9020, 8196)
                        ],
                        "xyStockMarker": [
                            fp(8944, 8196)
                        ],
                        "xyEventMarker": [
                            fp(8862, 8196)
                        ],
                        "xyGeoMarker": [
                            fp(8931, 8645)
                        ]
                    }
                },

                {
                    "id": 220,
                    "name": "Endea",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Endea",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7679, 8776),
                            fp(7679, 8057),
                            fp(8445, 8057),
                            fp(8445, 8776)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(7983, 8644)
                        ],
                        "xyStockMarker": [
                            fp(7907, 8644)
                        ],
                        "xyEventMarker": [
                            fp(7825, 8644)
                        ],
                        "xyGeoMarker": [
                            fp(8250, 8644)
                        ]
                    }
                },

                {
                    "id": 221,
                    "name": "Барселона",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Барселона",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(7238, 8775),
                            fp(7238, 8057),
                            fp(7658, 8057),
                            fp(7658, 8776)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(7527, 8771)
                        ],
                        "xyStockMarker": [
                            fp(7451, 8771)
                        ],
                        "xyEventMarker": [
                            fp(7369, 8771)
                        ],
                        "xyGeoMarker": [
                            fp(7553, 8160)
                        ]
                    }
                },

                {
                    "id": 222,
                    "name": "Chic You",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Chic You",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(6578, 8776),
                            fp(6578, 8057),
                            fp(7217, 8057),
                            fp(7217, 8776)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(6973, 8590)
                        ],
                        "xyStockMarker": [
                            fp(6897, 8590)
                        ],
                        "xyEventMarker": [
                            fp(6815, 8590)
                        ],
                        "xyGeoMarker": [
                            fp(6943, 8181)
                        ]
                    }
                },

                {
                    "id": 223,
                    "name": "223 - Остров",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "223 - Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(9518, 8913),
                            fp(9710, 8913),
                            fp(9710, 9066),
                            fp(9518, 9066)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(9684, 9092)
                        ],
                        "xyStockMarker": [
                            fp(9608, 9092)
                        ],
                        "xyEventMarker": [
                            fp(9526, 9092)
                        ],
                        "xyGeoMarker": [
                            fp(9610, 8900)
                        ]
                    }
                },

                {
                    "id": 224,
                    "name": "224 - Остров",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "224 - Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11478, 8878),
                            fp(11669, 8878),
                            fp(11669, 9030),
                            fp(11478, 9030)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11661, 9047)
                        ],
                        "xyStockMarker": [
                            fp(11586, 9047)
                        ],
                        "xyEventMarker": [
                            fp(11504, 9047)
                        ],
                        "xyGeoMarker": [
                            fp(11569, 8888)
                        ]
                    }
                },

                {
                    "id": 225,
                    "name": "225 - Остров",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "225 - Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10200, 8103),
                            fp(10295, 8103),
                            fp(10295, 8469),
                            fp(10200, 8469)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(10329, 8390)
                        ],
                        "xyStockMarker": [
                            fp(10253, 8390)
                        ],
                        "xyEventMarker": [
                            fp(10171, 8390)
                        ],
                        "xyGeoMarker": [
                            fp(10247, 8115)
                        ]
                    }
                },

                {
                    "id": 226,
                    "name": "226 - Остров",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "226 - Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10200, 8490),
                            fp(10295, 8490),
                            fp(10295, 8856),
                            fp(10200, 8856)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(10329, 8829)
                        ],
                        "xyStockMarker": [
                            fp(10253, 8829)
                        ],
                        "xyEventMarker": [
                            fp(10170, 8829)
                        ],
                        "xyGeoMarker": [
                            fp(10248, 8536)
                        ]
                    }
                },

                {
                    "id": 227,
                    "name": "227 - Остров",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "227 - Остров",
                    "description": "рюкзаки, поясные сумки, сумки  для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11187, 7890),
                            fp(11379, 7890),
                            fp(11379, 8043),
                            fp(11187, 8043)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11357, 8042)
                        ],
                        "xyStockMarker": [
                            fp(11281, 8042)
                        ],
                        "xyEventMarker": [
                            fp(11199, 8042)
                        ],
                        "xyGeoMarker": [
                            fp(11274, 7883)
                        ]
                    }
                },

                {
                    "id": 228,
                    "name": "228 - Остров",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "228 - Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11478, 7890),
                            fp(11669, 7890),
                            fp(11669, 8043),
                            fp(11478, 8043)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11662, 8043)
                        ],
                        "xyStockMarker": [
                            fp(11586, 8043)
                        ],
                        "xyEventMarker": [
                            fp(11504, 8043)
                        ],
                        "xyGeoMarker": [
                            fp(11569, 7883)
                        ]
                    }
                },

                {
                    "id": 229,
                    "name": "229 - Остров",
                    "typeService": "services",
                    "currentEvents": [
                        6,
                        4,
                        5
                    ],
                    "shortDesc": "229 - Остров",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11963, 8036),
                            fp(12155, 8036),
                            fp(12155, 8189),
                            fp(11963, 8189)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(12150, 8187)
                        ],
                        "xyStockMarker": [
                            fp(12074, 8187)
                        ],
                        "xyEventMarker": [
                            fp(11992, 8187)
                        ],
                        "xyGeoMarker": [
                            fp(12056, 8038)
                        ]
                    }
                },

                {
                    "id": 230,
                    "name": "Футкорт",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Футкорт",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(12208, 7947),
                            fp(12866, 7947),
                            fp(12866, 9068),
                            fp(12208, 9068)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11357, 8042)
                        ],
                        "xyStockMarker": [
                            fp(11281, 8042)
                        ],
                        "xyEventMarker": [
                            fp(11199, 8042)
                        ],
                        "xyGeoMarker": [
                            fp(11274, 7883)
                        ]
                    }
                },

                {
                    "id": 231,
                    "name": "Лифт",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Лифт",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11869, 9201),
                            fp(11896, 9188),
                            fp(12169, 9188),
                            fp(12196, 9202),
                            fp(12207, 9226),
                            fp(12207, 9499),
                            fp(12196, 9525),
                            fp(12165, 9539),
                            fp(11897, 9539),
                            fp(11870, 9527),
                            fp(11857, 9498),
                            fp(11857, 9228)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11357, 8042)
                        ],
                        "xyStockMarker": [
                            fp(11281, 8042)
                        ],
                        "xyEventMarker": [
                            fp(11199, 8042)
                        ],
                        "xyGeoMarker": [
                            fp(11274, 7883)
                        ]
                    }
                },

                {
                    "id": 232,
                    "name": "Эскалатор",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Эскалатор",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(10878, 8382),
                            fp(10908, 8368),
                            fp(11176, 8368),
                            fp(11210, 8388),
                            fp(11217, 8408),
                            fp(11217, 8678),
                            fp(11209, 8701),
                            fp(11178, 8719),
                            fp(10908, 8719),
                            fp(10883, 8710),
                            fp(10867, 8680),
                            fp(10867, 8409)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11357, 8042)
                        ],
                        "xyStockMarker": [
                            fp(11281, 8042)
                        ],
                        "xyEventMarker": [
                            fp(11199, 8042)
                        ],
                        "xyGeoMarker": [
                            fp(11274, 7883)
                        ]
                    }
                },

                {
                    "id": 233,
                    "name": "Туалет",
                    "typeService": "services",
                    "currentEvents": [
                        1,
                        2,
                        3
                    ],
                    "shortDesc": "Туалет",
                    "description": "рюкзаки, поясные сумки, сумки для обуви",
                    "linkSmallLogo": "src/images/img/logo-category-filtered.png",
                    "mainTags": [
                        "Банк",
                        "Сбербанк",
                        "Деньги",
                        "Терминал"
                    ],
                    "additionalTags": [
                        "новости",
                        "снять деньги"
                    ],
                    "link": "/ajax/get-modal-shop.php?id=85",
                    "categoryId": [
                        65,
                        13,
                        64
                    ],
                    "isActive": true,
                    "isAdministrative": false,
                    "isSelected": false,
                    "map": {
                        "bounds": [
                            fp(11197, 5835),
                            fp(11227, 5821),
                            fp(11495, 5821),
                            fp(11529, 5841),
                            fp(11536, 5861),
                            fp(11536, 6130),
                            fp(11528, 6154),
                            fp(11492, 6172),
                            fp(11227, 6172),
                            fp(11200, 6161),
                            fp(11186, 6133),
                            fp(11186, 5862)
                        ],
                        "tipCenter": [
                            null
                        ],
                        "xySaleMarker": [
                            fp(11357, 8042)
                        ],
                        "xyStockMarker": [
                            fp(11281, 8042)
                        ],
                        "xyEventMarker": [
                            fp(11199, 8042)
                        ],
                        "xyGeoMarker": [
                            fp(11274, 7883)
                        ]
                    }
                },
            ]
        }
    ]
}

// saveAsFile('out.json', JSON.stringify(_mapData, null, 2));


// console.log(_mapData, 'actual1')

const armada = {}

armada.handler = () => {

}

const getIdFilter = (item) => {
    let id = {
        currentItem: 'id',
        searchItem: 'data-id'
    }
    if (!item.hasAttribute('id')) {
        id.currentItem = 'data-id';
        id.searchItem = 'id'
    }
    return id
}

const changeConditionFilter = (firstItem, secondItem, bool) => {
    if (!bool) {
        firstItem.classList.remove('active')
        secondItem.classList.remove('active')
    } else {
        firstItem.classList.add('active')
        secondItem.classList.add('active')
    }
}


const getCheckedFilters = () => {
    let checkedFilters = []
    const allFilters = document.querySelectorAll('[data-map-filter]')
    allFilters.forEach(item => {
        const input = item.querySelector('input')
        if (input.checked) checkedFilters.push(item.dataset.value)

    })
    return [...new Set(checkedFilters)]
}
// Связывает одинаковые фильтры в сайдбаре и плашке с этажами, синхронное переключение
const HandlerFilter = (e) => {
    const firstItem = e.target.closest('label');
    let isChecked = e.target.checked;
    const {currentItem, searchItem} = getIdFilter(firstItem);
    const valueId = firstItem.getAttribute(currentItem);
    let secondItem = document.querySelector(`[${searchItem}=${valueId}]`);
    let secondItemInput = secondItem.querySelector('input')
    secondItemInput.checked = isChecked;
    changeConditionFilter(firstItem, secondItem, isChecked)
    const {checkedLVL, othersLvls} = getLvlsAndCountersMap()
    mainHandlerMap()
}


document.querySelectorAll('[data-map-filter]').forEach(item => {
    item.addEventListener('change', HandlerFilter)
})


//Парсит категории магазинов выбранные пользователем
const getCheckedIdCategory = () => {
    const allCategory = Array.from(document.querySelectorAll('[data-category-id]'))
    return allCategory.filter(item => item.checked).map(item => item.dataset.categoryId)
}

// Парсит этажи с верстки, и отдает объект с отдельной информацией о текущем этаже и массивом остальных
const getLvlsAndCountersMap = () => {
    let obj = {
        checkedLVL: {},
        othersLvls: []
    }
    const mapSwitchers = document.querySelectorAll('[data-changeLvl]')
    mapSwitchers.forEach(item => {
        const inputItem = item.querySelector('input');
        const lvlId = item.dataset.changelvl;
        const elCounter = item.querySelector('.floors-map__counter')
        const lvlObj = {
            id: lvlId,
            elCounter: elCounter
        }
        inputItem.checked ? obj.checkedLVL = lvlObj : obj.othersLvls.push(lvlObj)
    })
    return obj
}


// window.addEventListener("click", ()=>{
//     layerGroup.clearLayers()
// })


//Работает с классами в зависимости от этажа выделяет его, по умолчанию 1 этаж
const handlerFloors = () => {
    const floors = document.querySelectorAll('.floors-map__button')
    floors.forEach(item => {
        const inputItem = item.querySelector('input')
        item.addEventListener('click', () => {
            if (inputItem.checked) {
                item.classList.add('active')
            }
            mainHandlerMap()
            floors.forEach(inActive => {
                if (inActive !== item) inActive.classList.remove('active')
            })

        })
    })
}

handlerFloors()
const _globalMap = {}

//Задает цвет зоне в зависимости от типа obj.typeService
const checkTypeShop = (string) => {
    if (string === 'food') return '#5AFEB9'
    else if (string === 'services') return '#F96300'
    else if (string === 'shop') return '#017AFF'
}

//Выделяет зону при hover
const onHoverMapActionPolygon = (polygon, tooltip) => {
    return polygon.on('mouseover', function () {
        this.setStyle({
            opacity: 0.2,
            fillOpacity: 0.6
        });

        // tooltip.openTooltip()
    })
}
//убирает выделение зоны при unHover
const onUnHoverMapActionPolygon = (polygon, tooltip) => {
    return polygon.on('mouseout', function () {
        this.setStyle({
            opacity: 0,
            fillOpacity: 0
        });
        // tooltip.closePopup();
    })
}

const onClickMapActionPolygon = (polygon, url) => {
    return polygon.on('click', function () {
        const clickableTag = document.createElement('div')
        clickableTag.setAttribute('data-modal', '')
        clickableTag.setAttribute('data-src', `https://jsonplaceholder.typicode.com/posts`)
        // clickableTag.setAttributes({'data-modal': '2',
        // // 'data-src': `${url}`,
        // 'data-src': `https://jsonplaceholder.typicode.com/posts`
        // })
        // tooltip.closePopup();
        document.body.insertAdjacentElement('beforeend', clickableTag)
        clickableTag.click()
        clickableTag.remove()
    })
}

//Кастомная подсказка еще в процессе смотреть доки https://leafletjs.com/reference.html#divicon
const divIconContent = (text) => {
    let span = document.createElement('span')
    span.innerText = text
    return span
}


// const checkingTypeEventsFilters = (events) => {
//     if (events === 1) return saleMarkerIcon;
//     else if (events === 2) return stockMarkerIcon;
//     else if (events === 3) return stockMarkerIcon;
// }

const returnEventMarker = (varMarker, event) => {

    const marker = markersArmada[event]
    return function (marker, varMarker) {

    }
    // if (event === 1){
    //       return markersArmada.saleMarkerIcon()
    // } else if (event === 2){
    //     return markersArmada.stockMarkerIcon()
    // }else if (event === 3){
    //     return markersArmada.eventMarkerIcon()
    // }
}


// Проверяет, есть ли у магазина запрашиваемые фильтры obj.categoryId
const checkingFilters = (checkedFilters = [], filtersFromObj = []) => {
    const obj = {
        rootFilters: false,
        listActiveFilters: []
    }
    if (checkedFilters.length === 0) return obj
    filtersFromObj = filtersFromObj.map(item => item.toString())
    obj.listActiveFilters = [...checkedFilters.filter(item => filtersFromObj.includes(item, 0))]
    if (obj.listActiveFilters.length === 0) return obj
    obj.rootFilters = true
    return obj
}
//Проверяет есть ли выбранные категории, если нет, то объект проходит, если все таки есть, смотрит есть ли совпадения
const checkingCategory = (checkedIdCategory = [], objectCategory = []) => {
    if (checkedIdCategory.length === 0) return false
    for (let i of objectCategory) {
        i = i.toString()
        if (checkedIdCategory.includes(i, 0)) return true
    }
    return false
};


//При попадании на страницу карты функция парсит этаж и под этаж выводит зоны
// const firstLoadMap = () => {
//
//     const checkedIdCategory = getCheckedIdCategory()
//     const {checkedLVL, othersLvls} = getLvlsAndCountersMap()
//     const checkedFilters = getCheckedFilters()
//     _mapData.data.forEach(lvl => {
//
//         if (lvl.id === checkedLVL.id){
//             lvl.dataLvl.forEach((item, index) => {
//                 const stockMarker = 'stockMarker' + index;
//                 const eventMarker = 'eventMarker' + index;
//                 const saleMarker = 'saleMarker' + index;
//                 const polygon = 'polygon' + index;
//                 const tooltip = 'tooltip' + index;
//                 const tooltipMarker = 'tooltip' + index;
//                 window[stockMarker] = null;
//                 window[eventMarker] = null;
//                 window[saleMarker] = null;
//                 // window[tooltip] = L.divIcon({
//                 //     className: 'mapTooltip',
//                 //     html: divIconContent(item.shortDesc)
//                 // });
//                 if(item.isActive){
//                     counter[`${lvl}`] += 1
//                     const isCheckedCategory = checkingCategory(checkedIdCategory, item.categoryId)
//                     console.log(item.categoryId);
//                     console.log(isCheckedCategory)
//                     window[polygon] = L.polygon(item.map.bounds, {
//                         color: checkTypeShop(item.typeService),
//                         opacity: (item.isSelected || isCheckedCategory)? 0.6 : 0,
//                         fillOpacity: (item.isSelected || isCheckedCategory)? 0.6 : 0,
//                     }).addTo(layerGroup);
//
//                     onClickMapActionPolygon(window[polygon])
//                     // window[tooltipMarker] = L.marker(window[polygon].getCenter(), {icon: window[tooltip]}).addTo(layerGroup)
//                     // window[tooltip] = L.tooltip({
//                     //     // interactive: true,
//                     //     pane: 'labels',
//                     //     className: 'mapTooltip',
//                     //     offset: L.point(8,10),
//                     //     opacity: 1,
//                     //     direction: 'right',
//                     // });
//                     // window[tooltip].setLatLng(item.map.tipCenter);
//                     // window[tooltip].addTo(layerGroup);
//                     // window[tooltip].setContent(`${item.shortDesc}`);
//                     // tooltip.openPopup(polygon.getCenter())
//
//
//                     if(!item.isSelected && !isCheckedCategory){
//                         onHoverMapActionPolygon(window[polygon], window[tooltip]);
//                         onUnHoverMapActionPolygon(window[polygon], window[tooltip]);
//                     }
//                     window[polygon].bindTooltip(`${item.shortDesc}`,{
//                         // interactive: true,
//                         pane: 'labels',
//                         className: 'mapTooltip',
//                         offset: L.point(7,0),
//                         opacity: 1,
//                         direction: 'right',
//                     })
//                 }
//
//
//
//
//             })
//         }
//     })
// }
// firstLoadMap()


const stockId = '1'
const eventId = '2'
const saleId = '3'

//Основная функция, запускается при изменении какого либо фильтра
const mainHandlerMap = () => {
    //Создан для счетчика событий у свитчера этажей
    const eventCounters = []
    layerGroup.clearLayers()
    markerGroup.clearLayers()

    const checkedFilters = getCheckedFilters()
    const checkedIdCategory = getCheckedIdCategory()
    const {checkedLVL, othersLvls} = getLvlsAndCountersMap()

    _mapData.data.forEach(lvl => {
        if (lvl.id === checkedLVL.id) {
            const objForCounter = {
                id: `${lvl.id}`,
                count: 0
            }
            lvl.dataLvl.forEach((item, index) => {

                // console.log(checkedFilters)
                const {rootFilters, listActiveFilters} = checkingFilters(checkedFilters, item.currentEvents)
                // console.log(listActiveFilters, 'list')
                const tooltip = L.divIcon({
                    className: 'mapTooltip',
                    html: divIconContent(item.shortDesc)
                });
                const isCheckedCategory = checkingCategory(checkedIdCategory, item.categoryId)
                const polygon = L.polygon(item.map.bounds, {
                    color: checkTypeShop(item.typeService),
                    opacity: (item.isSelected || isCheckedCategory) ? 0.6 : 0,
                    fillOpacity: (item.isSelected || isCheckedCategory) ? 0.6 : 0,
                });

                if (item.isActive && !item.isAdministrative) {
                    const stockMarker = L.marker(item.map.xyStockMarker[0], {icon: stockMarkerIcon});
                    const eventMarker = L.marker(item.map.xyEventMarker[0], {icon: eventMarkerIcon});
                    const saleMarker = L.marker(item.map.xySaleMarker[0], {icon: saleMarkerIcon});
                    //Проверяет для счетчика событий у свитчера этажей
                    let checkedForCounter = false
                    polygon.addTo(layerGroup)

                    onClickMapActionPolygon(polygon)
                    // window[tooltipMarker] = L.marker(window[polygon].getCenter(), {icon: window[tooltip]}).addTo(layerGroup)
                    // window[tooltip] = L.tooltip({
                    //     // interactive: true,
                    //     pane: 'labels',
                    //     className: 'mapTooltip',
                    //     offset: L.point(8,10),
                    //     opacity: 1,
                    //     direction: 'right',
                    // });
                    // window[tooltip].setLatLng(item.map.tipCenter);
                    // window[tooltip].addTo(layerGroup);
                    // window[tooltip].setContent(`${item.shortDesc}`);
                    // tooltip.openPopup(polygon.getCenter())
                    listActiveFilters.forEach(item => {
                        if (item === stockId) {
                            stockMarker.addTo(layerGroup)
                            if (!checkedForCounter) {
                                objForCounter.count += 1
                                checkedForCounter = !checkedForCounter
                            }
                        } else if (item === eventId) {
                            eventMarker.addTo(layerGroup)
                            if (!checkedForCounter) {
                                objForCounter.count += 1
                                checkedForCounter = !checkedForCounter
                            }
                        } else if (item === saleId) {
                            saleMarker.addTo(layerGroup)
                            if (!checkedForCounter) {
                                objForCounter.count += 1
                                checkedForCounter = !checkedForCounter
                            }
                        }
                    })
                    !checkedForCounter ? objForCounter.count += 1 : objForCounter.count = objForCounter.count
                    if (!item.isSelected && !isCheckedCategory) {
                        onHoverMapActionPolygon(polygon, tooltip);
                        onUnHoverMapActionPolygon(polygon, tooltip);
                        if (item.isSelected) {
                            map.setView(polygon.getCenter(), 4)
                        }
                    }
                } else if (item.isAdministrative) {
                    polygon.addTo(layerGroup)
                    onHoverMapActionPolygon(polygon, tooltip);
                    onUnHoverMapActionPolygon(polygon, tooltip);
                }
                polygon.bindTooltip(`${item.shortDesc}`, {
                    // interactive: true,
                    pane: 'labels',
                    className: `mapTooltip mapTooltip--${item.typeService}`,
                    offset: L.point(7, 0),
                    opacity: 1,
                    direction: 'right',
                })
            })

            eventCounters.push(objForCounter)
        } else {
            const objForCounter = {
                id: `${lvl.id}`,
                count: 0
            }
            lvl.dataLvl.forEach((item, index) => {
                //Проверяет для счетчика событий у свитчера этажей
                let checkedForCounter = false
                const {rootFilters, listActiveFilters} = checkingFilters(checkedFilters, item.currentEvents)
                if (item.isActive && !item.isAdministrative) {
                    const isCheckedCategory = checkingCategory(checkedIdCategory, item.categoryId)
                    listActiveFilters.forEach(item => {
                        if (item === stockId) {
                            if (!checkedForCounter) {
                                objForCounter.count += 1
                                checkedForCounter = true
                            }
                        } else if (item === eventId) {
                            if (!checkedForCounter) {
                                objForCounter.count += 1
                                checkedForCounter = true
                            }
                        } else if (item === saleId) {
                            if (!checkedForCounter) {
                                objForCounter.count += 1
                                checkedForCounter = true
                            }
                        }
                    })
                    !checkedForCounter ? objForCounter.count += 1 : objForCounter.count = objForCounter.count
                }
            })


            eventCounters.push(objForCounter)
        }
    })


    // console.log(eventCounters)

    eventCounters.forEach(item => {
        const lvlButtonHTML = document.querySelector(`[data-changelvl="${item.id}"]`);
        const lvlCounterHtml = lvlButtonHTML.querySelector('.floors-map__counter')
        lvlCounterHtml.innerHTML = item.count

    })

}

const listenerCategory = () => {
    document.querySelectorAll('[data-category-id]').forEach(item => {
        item.addEventListener('change', mainHandlerMap)
    })
}
listenerCategory()
mainHandlerMap()


const searchSidebar = {}


searchSidebar.createSideBar = (input) => {
    const searchSidebarWrapper = document.createElement('div')
    searchSidebarWrapper.classList.add('template-list__search-result', 'search-result')

    const searchFormWrapper = document.createElement('div')
    searchFormWrapper.classList.add('search-result__search-form', 'search-sidebar-form')
    searchFormWrapper.insertAdjacentHTML('beforeend', `
    <span data-clear="true" class="search-sidebar-form__close">
                            <svg style="pointer-events: none" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.9998 5.20863L14.7912 4.00006L9.99982 8.79149L5.20839 4.00006L3.99982 5.20863L8.79125 10.0001L3.99982 14.7915L5.20839 16.0001L9.99982 11.2086L14.7912 16.0001L15.9998 14.7915L11.2084 10.0001L15.9998 5.20863Z" fill="#131318"></path>
</svg>
                        </span>
    `)
    searchFormWrapper.insertAdjacentElement('afterbegin', input)
    searchSidebarWrapper.insertAdjacentElement('afterbegin', searchFormWrapper)
    return searchSidebarWrapper
}
searchSidebar.input = () => {
    const inputForm = document.createElement('input')
    inputForm.classList.add('search-sidebar-form__input')
    return inputForm
}


searchSidebar.handler = (options) => {
    const input = searchSidebar.input()
    const sidebar = searchSidebar.createSideBar(input)
    input.value = options.keyword
    let bodySearch = searchSidebar.render(options.keyword, options.mapData)
    sidebar.insertAdjacentElement('beforeend', bodySearch)
    input.addEventListener('keyup', function (e) {
        deferredSearch.setup(e.target.value)
        // console.log(e.target.value)
    })

    const deferredSearch = {
        enterSearch: function (keywords) {
            bodySearch.remove()
            bodySearch = searchSidebar.render(keywords, options.mapData)
            sidebar.insertAdjacentElement('beforeend', bodySearch)
            this.timeoutID = undefined;
        },

        setup: function (keywords) {
            if (typeof this.timeoutID === 'number') {
                this.cancel();
            }

            this.timeoutID = setTimeout(function (keywords) {
                this.enterSearch(keywords);
            }.bind(this), 500, keywords);
        },

        cancel: function () {
            clearTimeout(this.timeoutID);
        }
    };
    // console.log(input)
    window.setTimeout(() => input.focus(), 0);


    return sidebar
}

searchSidebar.remote = (options) => {
    const sidebar = searchSidebar.handler(options)
    document.querySelector('.template-list__wrapper').insertAdjacentElement('afterbegin', sidebar)
    const search = {
        open() {
            sidebar.classList.add('searching')
        },

        close(e) {
            // if (!sidebar.contains(e.target)) {
            //     sidebar.classList.remove('searching')
            //     setTimeout(
            //         function () {
            //             window.removeEventListener('click', search.close)
            //             sidebar.remove();
            //
            //         }, 150)
            // }


                if (e.target.dataset.clear) {
                    sidebar.classList.remove('searching')
                        setTimeout(
                            function () {
                                window.removeEventListener('click', search.close)
                                sidebar.remove();

                            }, 150)
                }

        }
    }
    window.addEventListener('click', search.close)
    return search
}

searchSidebar.render = (keywords = 'string', mapData) => {
    // console.log('req', mapData)
    let isEmpty = true
    const wrapper = document.createElement('div')
    wrapper.classList.add('search-result__list')
    mapData.forEach(lvl => {
        let isRender = false
        const floorWrapper = searchSidebar.renderFloorWrapper(lvl.id)
        floorWrapper.insertAdjacentHTML('beforeend', `
        <div class="search-result__title">Магазины</div>`)
        lvl.dataLvl.forEach(item => {
            if (item.isActive && handlerKeyWords(keywords, item.mainTags)) {
                isRender = true
                isEmpty = false
                const renderLvl = searchSidebar.renderFloorItem(item)
                floorWrapper.insertAdjacentElement('beforeend', renderLvl)
            }
        })
        if (isRender) wrapper.insertAdjacentElement('beforeend', floorWrapper)

    })
    if (isEmpty) {
        wrapper.insertAdjacentHTML('beforeend', `
        <span class="search-result__empty">К сожалению, <br> ничего не найдено</span>
        `)
    }
    return wrapper
}

const handlerKeyWords = (inputWords, shopWords) => {
    // console.log('lvl' ,inputWords, shopWords)
    const lowerKeyword = inputWords.toString().toLowerCase().trim()
    const arrayInputKeyword = lowerKeyword.split(' ')
    const filter = arrayInputKeyword.filter(item => {
        if (item === '') return 'empty'
        for (let i of shopWords) {
            i = i.toLowerCase()
            if (i === item) {
                return item
            }
        }
    })
    // console.log(filter)
    return (filter.length > 0)

}

searchSidebar.renderFloorWrapper = (lvl) => {
    const block = document.createElement('div')
    block.classList.add('search-result__wrapper-floor', 'collapse-category')
    block.insertAdjacentHTML('afterbegin', `
    <div class="search-result__item-floor">
                        <span>${lvl}</span> этаж
                    </div>
    `)
    return block
}

searchSidebar.renderFloorItem = (options) => {
    const shop = document.createElement('a')
    shop.classList.add('collapse-category__item', 'search-result__item')
    shop.setAttribute('data-modal', ``)
    shop.setAttribute('data-src', `${options.link}`)
    shop.insertAdjacentHTML('afterbegin', `
        <div class="collapse-category__img" style="background: url('${options.linkSmallLogo}') center center/contain no-repeat"></div>
        <div class="collapse-category__wrapper">
            <div class="collapse-category__title">${options.name}</div>
            <div class="collapse-category__desc">${options.description}</div>
        </div>
    `)
    return shop
}


// searchSidebar.handler({options: ''})
// document.querySelector('.template-list__wrapper').insertAdjacentElement('afterbegin',
//     searchSidebar.remote({options: '', mapData: _mapData.data}))



const mainInput = document.querySelector('.search-filter__input')

mainInput.addEventListener('keyup', function () {
    deferredSearchMain.setup(this.value)
})


const deferredSearchMain = {
    enterSearch: function (keywords) {
        mainInput.blur()
        mainInput.value = ''
        const sideBar = searchSidebar.remote({keyword: keywords, mapData: _mapData.data})
        sideBar.open()
        this.timeoutID = undefined;
    },

    setup: function (keywords) {
        if (typeof this.timeoutID === 'number') {
            this.cancel();
        }

        this.timeoutID = setTimeout(function (keywords) {
            this.enterSearch(keywords);
        }.bind(this), 500, keywords);
    },

    cancel: function () {
        clearTimeout(this.timeoutID);
    }
};




