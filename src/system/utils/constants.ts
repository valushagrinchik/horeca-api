import { Categories, DeliveryMethods } from './enums'

export const CategoryLabels: Record<Categories, string> = {
    alcoholicDrinks: 'Алкогольные напитки',
    grocerySpicesSeasonings: 'Бакалея, специи, приправы',
    softDrinks: 'Безалкогольные напитки, вода, соки',
    readyMeals: 'Готовые блюда',
    stationery: 'Канцтовары',
    confectionery: 'Кондитерские изделия',
    cannedFoods: 'Консервированные продукты',
    dairyProducts: 'Молочные продукты, яйца',
    iceCream: 'Мороженое',
    meat: 'Мясо, субпродукты, колбасные изделия',
    lowAlcoholDrinks: 'Пиво, слабоалкогольные напитки',
    semiFinishedProducts: 'Полуфабрикаты',
    dishes: 'Посуда и кухонные принадлежности',
    cashDesk: 'Прикасса (чипсы, снеки, семечки)',
    instantFoods: 'Продукты быстрого приготовления, лапша',
    fish: 'Рыба и морепродукты',
    fruitsAndVegetables: 'Свежие овощи, фрукты, зелень, грибы',
    cleaningProducts: 'Уборка и чистящие средства',
    bakeryProducts: 'Хлеб, хлебобулочные изделия',
    teeAndCoffee: 'Чай, кофе, какао, заменители',
}

export const DeliveryMethodsLabels: Record<DeliveryMethods, string> = {
    selfPickup: 'самовывоз',
    deliveryBySupplier: 'доставка транспортом поставщика',
    sameDayDelivery: 'доставка в день заказа',
    weekends: 'выходные праздничные дни',
}

export const DB_DATE_FORMAT = 'YYYY-MM-DD'

export const ChatServerMessages = {
    requestCanceled: 'Одна из сторон отменила работу заказа',
}
