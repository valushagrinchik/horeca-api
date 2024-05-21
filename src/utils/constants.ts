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
	dishes:	'Посуда и кухонные принадлежности',
	cashDesk: 'Прикасса (чипсы, снеки, семечки)',
	instantFoods: 'Продукты быстрого приготовления, лапша',
	fish:	'Рыба и морепродукты',
	fruitsAndVegetables: 'Свежие овощи, фрукты, зелень, грибы',
	cleaningProducts:	'Уборка и чистящие средства',
	bakeryProducts:	'Хлеб, хлебобулочные изделия',
	teeAndCoffee:	'Чай, кофе, какао, заменители'
}


export enum Categories {
    alcoholicDrinks = 'alcoholicDrinks',
    grocerySpicesSeasonings='grocerySpicesSeasonings',
    softDrinks = 'softDrinks',
    readyMeals = 'readyMeals',
    stationery = 'stationery',
	confectionery = 'confectionery',
	cannedFoods = 'cannedFoods',
	dairyProducts = 'dairyProducts',
	iceCream = 'iceCream',
	meat = 'meat',
	lowAlcoholDrinks = 'lowAlcoholDrinks',
	semiFinishedProducts = 'semiFinishedProducts',
	dishes = 'dishes',
	cashDesk = 'cashDesk',
	instantFoods = 'instantFoods',
	fish = 'fish',
	fruitsAndVegetables = 'fruitsAndVegetables',
	cleaningProducts = 'cleaningProducts',
	bakeryProducts = 'bakeryProducts',
	teeAndCoffee = 'teeAndCoffee'
}

export const DeliveryMethodsLabels: Record<DeliveryMethods, string> = {
    selfPickup: 'самовывоз',
    deliveryBySupplier: 'доставка транспортом поставщика',
    sameDayDelivery: 'доставка в день заказа',
    weekends: 'выходные праздничные дни'
}

export enum DeliveryMethods {
    selfPickup = 'selfPickup',
    deliveryBySupplier = 'deliveryBySupplier',
    sameDayDelivery = 'sameDayDelivery',
    weekends = 'weekends'
}