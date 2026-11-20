/* Порядок каталога и примеры на карточках главного экрана. */
window.BridgeCatalog = {
  groups: {
    reasoning: 'Выражения и логика',
    applied: 'Задачи из жизни',
    numbers: 'Числа и счёт'
  },
  topics: {
    patterns: { title: 'Закономерности', group: 'reasoning', mark: '…', example: '3, 6, 9, 12, …' },
    equations: { title: 'Уравнения', group: 'reasoning', mark: '□', example: '□ + 17 = 42' },
    comparison: { title: 'Сравнение выражений', group: 'reasoning', mark: '≶', example: 'Какой знак поставить между 3 × 4 и 15?' },
    order: { title: 'Порядок действий', group: 'reasoning', mark: '( )', example: '18 − (4 + 5) = ?' },
    geometry: { title: 'Геометрия', group: 'applied', mark: '△', example: 'Найди периметр прямоугольника.' },
    time: { title: 'Часы и время', group: 'applied', mark: '◷', example: 'Сколько минут прошло с 9:45 до 10:20?' },
    money: { title: 'Покупки и сдача', group: 'applied', mark: '₽', example: 'Сколько сдачи дадут со 100 рублей?' },
    units: { title: 'Единицы измерения', group: 'applied', mark: 'см', example: 'Сколько сантиметров в 2 м 7 см?' },
    stories: { title: 'Текстовые задачи', group: 'applied', mark: '✎', example: 'Прочитай условие и найди ответ.' },
    fractions: { title: 'Доли и дроби', group: 'numbers', mark: '½', example: 'Чему равна четверть от 36?' },
    place: { title: 'Разряды числа', group: 'numbers', mark: '321', example: 'Какая цифра стоит в разряде десятков?' },
    small: { title: 'Счёт до 10', group: 'numbers', mark: '±', example: 'Сложение и вычитание до десяти.' },
    tens: { title: 'Круглые десятки', group: 'numbers', mark: '±10', example: 'Складывай и вычитай десятки.' },
    hundred: { title: 'Счёт до 100', group: 'numbers', mark: '100', example: 'Считай без перехода через десяток.' },
    tables: { title: 'Умножение и деление', group: 'numbers', mark: '× ÷', example: 'Таблица умножения и обратные действия.' }
  }
};
